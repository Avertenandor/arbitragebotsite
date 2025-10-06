#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PLEX Auto-Sell (one-file app, dark UI)
- Chain: BNB Smart Chain (Mainnet, chainId=56)
- Pair: PLEX (0xdf179b6c...) / USDT (0x55d3983...)
- Router: PancakeSwap V2
- Path enforced: [PLEX -> USDT] (no BNB hops)
- PLEX has 9 decimals (hard-coded, but verified at runtime)
- Default gas price: 0.1 gwei (can be changed by operator)
- Two backend modes:
    1) Node RPC (HTTP) — e.g., QuickNode endpoint
    2) JSON-RPC Proxy via *Scan-like API keys (module=proxy) — e.g., BscScan/EnterScan
- Features:
    * Approve PLEX to Router
    * One-click "Sell Now"
    * Auto-Sell on price threshold (USDT per 1 PLEX) using on-chain reserves
    * Live balances & price
    * Dark theme

NOTE: This tool signs transactions locally with your private key. Keep it safe.
"""

import sys
import time
import json
import threading
import os
from dataclasses import dataclass
from decimal import Decimal, ROUND_DOWN

# Third-party
# Make sure to install dependencies:
#   pip install web3 requests PyQt5 eth-abi
import requests
from web3 import Web3
from eth_account import Account

# -----------------------------
# Constants & Minimal ABIs
# -----------------------------

# ВКЛЮЧИТЬ строгий режим: Proxy допускает ТОЛЬКО EnterScan
STRICT_ENTERSCAN_ONLY = True

BSC_CHAIN_ID = 56

PLEX = Web3.to_checksum_address('0xdf179b6cadbc61ffd86a3d2e55f6d6e083ade6c1')
USDT = Web3.to_checksum_address('0x55d398326f99059ff775485246999027b3197955')

# ===== БЕЗОПАСНОСТЬ: Лимиты по умолчанию =====
DEFAULT_LIMITS = {
    'max_per_tx_plex': 1000.0,      # Максимум PLEX за одну транзакцию
    'max_daily_plex': 10000.0,      # Максимум PLEX за день
    'max_sales_per_hour': 10,       # Максимум продаж в час
    'max_gas_gwei': 50.0,           # Максимальная цена газа
    'min_gas_gwei': 0.1,            # Минимальная цена газа (безопасный порог для BSC)
    'safety_slippage_bonus': 0.5,   # Дополнительный слиппедж для безопасности (%)
    # ---- P0 Safety thresholds ----
    'max_price_impact_pct': 3.0,
    # --- Новая динамическая модель резервов ---
    # Абсолютные "полы", чтобы не допустить совсем тонкие пулы даже для маленьких сделок:
    'min_pool_reserve_plex_abs': 100.0,   # PLEX
    'min_pool_reserve_usdt_abs': 50.0,    # USDT
    # Динамический порог: x-кратный запас к размеру вашей сделки
    # Для PLEX сверяем с входом (amount_in), для USDT — с ожидаемым выходом (expected_out)
    'reserve_value_multiplier': 30.0
}

# ===== БЕЗОПАСНОСТЬ: Коды ошибок =====
class ErrorCode:
    NETWORK = "NETWORK"
    RPC = "RPC" 
    PROXY = "PROXY"
    ONCHAIN_REVERT = "ONCHAIN_REVERT"
    NONCE = "NONCE"
    GAS = "GAS"
    ALLOWANCE = "ALLOWANCE"
    LIMIT = "LIMIT"
    CONFIG = "CONFIG"
    SAFETY = "SAFETY"

# PLEX/USDT pair (as provided)
PAIR_ADDRESS = Web3.to_checksum_address('0x41d9650faf3341cbf8947fd8063a1fc88dbf1889')

# PancakeSwap V2 Router (BSC mainnet)
PANCAKE_V2_ROUTER = Web3.to_checksum_address('0x10ED43C718714eb63d5aA57B78B54704E256024E')

# ===== БЕЗОПАСНОСТЬ: Whitelist адресов =====
SAFETY_WHITELIST = {
    'PLEX': PLEX.lower(),
    'USDT': USDT.lower(), 
    'ROUTER': PANCAKE_V2_ROUTER.lower(),
    'PAIR': PAIR_ADDRESS.lower()
}

# Minimal ERC-20 ABI
ERC20_ABI = [
    {"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "stateMutability": "view", "type": "function"},
    {"constant": True, "inputs": [], "name": "symbol", "outputs": [{"name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
    {"constant": True, "inputs": [{"name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"constant": True, "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}], "name": "allowance", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"constant": False, "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}
]

# Minimal Pair ABI (getReserves/token0/token1)
PAIR_ABI = [
    {"constant": True, "inputs": [], "name": "getReserves", "outputs": [{"name": "reserve0", "type": "uint112"}, {"name": "reserve1", "type": "uint112"}, {"name": "blockTimestampLast", "type": "uint32"}], "stateMutability": "view", "type": "function"},
    {"constant": True, "inputs": [], "name": "token0", "outputs": [{"name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"constant": True, "inputs": [], "name": "token1", "outputs": [{"name": "", "type": "address"}], "stateMutability": "view", "type": "function"}
]

# Minimal Router ABI — supporting fee-on-transfer tokens
ROUTER_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"}
        ],
        "name": "getAmountsOut",
        "outputs": [
            {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

# -----------------------------
# Helper: Unit conversions
# -----------------------------

def to_wei_gwei(gwei_float: float) -> int:
    return int(Decimal(gwei_float) * Decimal(10**9))

def from_wei_gwei(wei: int) -> float:
    """Конвертирует wei в gwei"""
    return wei / 1_000_000_000

def to_units(amount: Decimal, decimals: int) -> int:
    q = Decimal(10) ** decimals
    return int((amount * q).to_integral_value(rounding=ROUND_DOWN))

def from_units(amount_wei: int, decimals: int) -> Decimal:
    return (Decimal(amount_wei) / (Decimal(10) ** decimals)).quantize(Decimal('0.000000001'))

def fmt_price(d: Decimal, places: int = 6) -> str:
    """Красиво форматирует цену: до N знаков, без хвостовых нулей/точки"""
    s = f"{d:.{places}f}".rstrip('0').rstrip('.')
    return s if s else "0"

# -----------------------------
# Backend Abstraction
# -----------------------------

class RpcMode:
    NODE = 'Node RPC'
    PROXY = 'Proxy (Scan API keys)'

@dataclass
class BackendConfig:
    mode: str = RpcMode.NODE
    node_http: str = ''  # e.g., https://old-patient-butterfly.bsc.quiknode.pro/<key>
    proxy_base_url: str = 'https://api.bscscan.com/api'  # can be EnterScan-like
    proxy_api_keys: list = None

class ProxyClient:
    """
    Very small client for *Scan proxy API (module=proxy).
    Works with BscScan-compatible endpoints or EnterScan equivalents.
    """
    def __init__(self, base_url: str, api_keys: list[str] | None):
        self.base_url = base_url.rstrip('/')
        self.api_keys = api_keys or []
        self._idx = 0
        # ОПТИМИЗАЦИЯ: Session и rate limiting
        self._session = requests.Session()
        self._rate_next_ts = 0.0
        self._min_gap = 0.15  # не чаще 1 запроса / 150 мс

    def _get(self, params: dict) -> dict:
        """GET запрос с session, rate limiting и ротацией ключей только при 429"""
        # ОПТИМИЗАЦИЯ: Локальный ограничитель частоты
        dt = self._min_gap - max(0, time.time() - self._rate_next_ts)
        if dt > 0: 
            time.sleep(dt)
        self._rate_next_ts = time.time()

        if self.api_keys:
            params['apikey'] = self.api_keys[self._idx % len(self.api_keys)]
        try:
            r = self._session.get(self.base_url, params=params, timeout=15)
            if r.status_code in (429, 502, 503, 504):   # ✚ добавили 5xx
                self._idx = (self._idx + 1) % max(1, len(self.api_keys))
                if self.api_keys:
                    params['apikey'] = self.api_keys[self._idx]
                r = self._session.get(self.base_url, params=params, timeout=15)
            r.raise_for_status()
            data = r.json()
            # Форматы *Scan:
            #  OK: {"jsonrpc":"2.0","id":1,"result":"0x..."} ИЛИ {"status":"1","result":"0x..."}
            # BAD: {"status":"0","message":"NOTOK","result":"Invalid API Key ..."}
            if isinstance(data, dict) and data.get("status") == "0":
                res = str(data.get("result", "")).strip()
                # Попробовать следующий ключ, если есть
                if "invalid api key" in res.lower() and self.api_keys and len(self.api_keys) > 1:
                    old = self._idx
                    self._idx = (self._idx + 1) % len(self.api_keys)
                    params['apikey'] = self.api_keys[self._idx]
                    r = self._session.get(self.base_url, params=params, timeout=15)
                    r.raise_for_status()
                    data = r.json()
                    if isinstance(data, dict) and data.get("status") == "0":
                        raise RuntimeError(f"Proxy auth error: {data.get('result')}")
                elif "invalid api key" in res.lower():
                    raise RuntimeError(f"Proxy auth error: {res}")
            return data
        except Exception as e:
            raise RuntimeError(f'Proxy GET failed: {e}')

    def eth_chainId(self):
        """Возвращает chainId (hex) или поднимает осмысленную ошибку"""
        data = self._get({'module':'proxy','action':'eth_chainId'})
        res = data.get('result')
        if isinstance(res, str) and res.startswith('0x'):
            return res
        if isinstance(res, str) and "Invalid API Key" in res:
            raise RuntimeError(f"Proxy auth error: {res}")
        msg = data.get('message') or res or data
        raise RuntimeError(f"Proxy chainId error: {msg}")

    def eth_gasPrice(self) -> int:
        data = self._get({'module':'proxy','action':'eth_gasPrice'})
        res = data.get('result')
        if isinstance(res, str) and res.startswith('0x'):
            return int(res, 16)
        if isinstance(res, str) and "Invalid API Key" in res:
            raise RuntimeError(f"Proxy auth error: {res}")
        msg = data.get('message') or res or data
        raise RuntimeError(f"Proxy gasPrice error: {msg}")

    def eth_getTransactionCount(self, address: str, tag: str='pending') -> int:
        data = self._get({'module':'proxy','action':'eth_getTransactionCount','address':address,'tag':tag})
        res = data.get('result')
        if isinstance(res, str) and res.startswith('0x'):
            return int(res, 16)
        if isinstance(res, str) and "Invalid API Key" in res:
            raise RuntimeError(f"Proxy auth error: {res}")
        raise RuntimeError(f'Proxy eth_getTransactionCount failed: {data}')

    def eth_call(self, to: str, data: str, tag: str='latest') -> str:
        # Etherscan wants "to" and "data" as parameters
        params = {'module':'proxy','action':'eth_call','to':to, 'data':data, 'tag':tag}
        data = self._get(params)
        res = data.get('result')
        if isinstance(res, str) and res.startswith('0x'):
            return res  # hex string "0x..."
        if isinstance(res, str) and "Invalid API Key" in res:
            raise RuntimeError(f"Proxy auth error: {res}")
        raise RuntimeError(f'Proxy eth_call failed: {data}')

    def eth_estimateGas(self, tx: dict) -> int:
        # only a subset is supported, pass fields explicitly
        params = {'module':'proxy','action':'eth_estimateGas'}
        if 'from' in tx: params['from'] = tx['from']
        if 'to' in tx: params['to'] = tx['to']
        if 'data' in tx: params['data'] = tx['data']
        if 'value' in tx and tx['value']: params['value'] = hex(tx['value'])
        data = self._get(params)
        res = data.get('result')
        if isinstance(res, str) and res.startswith('0x'):
            try:
                return int(res, 16)
            except:
                return 300000
        if isinstance(res, str) and "Invalid API Key" in res:
            raise RuntimeError(f"Proxy auth error: {res}")
        return 300000  # безопасный дефолт

    def eth_sendRawTransaction(self, raw_hex: str) -> str:
        data = self._get({'module':'proxy','action':'eth_sendRawTransaction','hex':raw_hex})
        # Etherscan-style returns {"result":"0xTXHASH"} OR {"error": {"message": "..."}}
        if 'result' in data and isinstance(data['result'], str) and data['result'].startswith('0x'):
            return data['result']
        # Fallback parse
        if 'error' in data:
            raise RuntimeError(f"Broadcast error: {data['error']}")
        if data.get('status') == '0':
            raise RuntimeError(f"Broadcast failed: {data.get('message')} | {data.get('result')}")
        raise RuntimeError(f"Broadcast failed: {data}")
    
    def eth_getTransactionReceipt(self, tx_hash: str) -> dict:
        """Получает квитанцию транзакции"""
        data = self._get({'module':'proxy','action':'eth_getTransactionReceipt','txhash':tx_hash})
        if 'result' in data and data['result']:
            return data['result']
        return None

# -----------------------------
# On-chain helpers (work in both modes)
# -----------------------------

def build_contract_encoder():
    """A tiny encoder using Web3's ABI tools (offline)."""
    w3 = Web3()  # offline instance for encodeABI usage
    erc20 = w3.eth.contract(address=PLEX, abi=ERC20_ABI)  # address not used for encoding itself
    router = w3.eth.contract(address=PANCAKE_V2_ROUTER, abi=ROUTER_ABI)
    return w3, erc20, router

_w3_encoder, _erc20_encoder, _router_encoder = build_contract_encoder()

def encode_approve(spender: str, amount: int) -> str:
    return _w3_encoder.eth.contract(abi=ERC20_ABI).encodeABI(fn_name='approve', args=[spender, amount])

def encode_swap_exact_tokens_supporting(amount_in: int, amount_out_min: int, path: list[str], to: str, deadline: int) -> str:
    return _w3_encoder.eth.contract(abi=ROUTER_ABI).encodeABI(
        fn_name='swapExactTokensForTokensSupportingFeeOnTransferTokens',
        args=[amount_in, amount_out_min, path, to, deadline]
    )

def encode_call_sig(sig4: str) -> str:
    # helper for simple constant calls with only selector
    return sig4

def pad32_hex(value_hex_no0x: str) -> str:
    return value_hex_no0x.rjust(64, '0')

def selector(sig: str) -> str:
    # return first 4 bytes of keccak('functionSignature(...)')
    from eth_utils import keccak
    h = keccak(text=sig).hex()
    return '0x' + h[:8]

# Precomputed selectors for pair and erc20
SEL_GETRESERVES = '0x0902f1ac'
SEL_TOKEN0      = '0x0dfe1681'
SEL_TOKEN1      = '0xd21220a7'
SEL_DECIMALS    = '0x313ce567'
SEL_SYMBOL      = '0x95d89b41'
SEL_BALANCEOF   = '0x70a08231'
SEL_ALLOWANCE   = '0xdd62ed3e'

def eth_call_balance_of(client_call, token: str, address: str) -> int:
    data = SEL_BALANCEOF + pad32_hex(address.lower().replace('0x',''))
    out = client_call(token, data)
    return int(out, 16) if out and out != '0x' else 0

def eth_call_decimals(client_call, token: str) -> int:
    try:
        out = client_call(token, SEL_DECIMALS)
        return int(out, 16) if out and out != '0x' else 18
    except:
        return 18

def eth_call_allowance(client_call, token: str, owner: str, spender: str) -> int:
    data = SEL_ALLOWANCE + pad32_hex(owner.lower().replace('0x','')) + pad32_hex(spender.lower().replace('0x',''))
    out = client_call(token, data)
    return int(out, 16) if out and out != '0x' else 0

def eth_call_pair_reserves(client_call, pair: str) -> tuple[int,int]:
    out = client_call(pair, SEL_GETRESERVES)
    if not out or out == '0x':
        raise RuntimeError('getReserves call failed')
    # decode three 32-byte words; take first two
    data = bytes.fromhex(out[2:])
    r0 = int.from_bytes(data[0:32], 'big')
    r1 = int.from_bytes(data[32:64], 'big')
    return r0, r1

def eth_call_pair_tokens(client_call, pair: str) -> tuple[str,str]:
    t0 = client_call(pair, SEL_TOKEN0)
    t1 = client_call(pair, SEL_TOKEN1)
    # last 20 bytes each
    a0 = '0x' + t0[-40:]
    a1 = '0x' + t1[-40:]
    return Web3.to_checksum_address(a0), Web3.to_checksum_address(a1)

def uni_v2_amount_out(amount_in: int, reserve_in: int, reserve_out: int, fee_bps: int = 25) -> int:
    # Pancake V2 fee ~0.25% => 25 bps (0.0025), so multiplier is 10000 - 25 = 9975
    fee_factor = 10000 - fee_bps
    amount_in_with_fee = amount_in * fee_factor
    numerator = amount_in_with_fee * reserve_out
    denominator = (reserve_in * 10000) + amount_in_with_fee
    return numerator // denominator if denominator > 0 else 0

def get_amounts_out(core, amount_in: int, path: list) -> int:
    """Получает ожидаемый выход через getAmountsOut с фоллбэком на резервы"""
    try:
        if core.mode == RpcMode.NODE:
            # ОПТИМИЗАЦИЯ: Читаем через read-RPC/кэш вместо QuickNode
            data = _router_encoder.encodeABI(fn_name='getAmountsOut', args=[amount_in, path])
            hexres = core._client_call(PANCAKE_V2_ROUTER, data)  # уйдет на read_w3 с кэшем
            from eth_abi import decode as abi_decode
            (amounts,) = abi_decode(['uint256[]'], bytes.fromhex(hexres[2:]))
            return int(amounts[-1])
        else:
            # Proxy режим: eth_call через ABI-энкодер
            return core.proxy_get_amounts_out(amount_in, path)
    except Exception as e:
        # Фоллбэк на резервы (без safety-бонуса - он применится в safe_sell_now)
        core.log(f"⚠️ getAmountsOut недоступен, используем резервы: {e}")
        price, r_plex, r_usdt, _ = core.get_price_and_reserves()
        est_out = uni_v2_amount_out(amount_in, r_plex, r_usdt, 25)
        # Возвращаем "сырую" оценку - safety применится в safe_sell_now
        return int(est_out)

# Удалена неиспользуемая функция encode_get_amounts_out - заменена на ABI-энкодер

# -----------------------------
# Trading Core
# -----------------------------

MAX_UINT256 = (1 << 256) - 1

class TradingCore:
    def __init__(self, cfg: BackendConfig, log_fn=print):
        self.cfg = cfg
        self.log = log_fn
        self.mode = cfg.mode
        self.node_w3 = None
        self.proxy = None
        
        # БЕЗОПАСНОСТЬ: Менеджеры
        self.nonce_manager = NonceManager()
        self.limits_manager = LimitsManager()
        
        # БЕЗОПАСНОСТЬ: Offline-устойчивость
        self.is_offline = False
        self.backoff_seconds = 1
        self.max_backoff = 60
        self.retry_count = 0
        self.max_retries = 5
        
        # Список RPC/Proxy для ротации
        self.rpc_urls = [
            "https://bsc-dataseed1.binance.org",
            "https://bsc-dataseed2.binance.org", 
            "https://bsc-dataseed3.binance.org",
            "https://bsc-dataseed4.binance.org"
        ]
        # БЕЗОПАСНОСТЬ: Получаем настройки Proxy из конфигурации
        self.proxy_base_url = self.cfg.proxy_base_url
        self.proxy_api_keys = self.cfg.proxy_api_keys[:] if self.cfg.proxy_api_keys else ["YourApiKeyToken"]
        self.current_rpc_index = 0
        self.current_proxy_index = 0
        
        # ОПТИМИЗАЦИЯ: Кэш для снижения запросов к QuickNode
        self._cache = {
            'is_plex_token0': None,      # навсегда
            'usdt_decimals': None,       # навсегда (18)
            'gas_price': (0, 0),         # (value, ts) TTL 15s
            'reserves': (None, 0),       # ( (r_plex,r_usdt), ts ) TTL 2s
            'bnb_balance': ({}, 0),      # {address->int}, ts
            'allowance': ({}, 0),        # {(owner,spender)->int}, ts
        }
        
        # ОПТИМИЗАЦИЯ: Единый кэш для всех eth_call с коалесингом
        self._call_cache = {}   # key=(to.lower(), data) -> (hex_result, ts)
        self._call_ttl_s = 1.0  # общий TTL для коалесинга одинаковых вызовов
        self._call_cache_max = 200  # ✚ мягкий потолок на размер кэша
        self._ttl_bnb_s = 10
        self._ttl_allowance_s = 10
        
        # ОПТИМИЗАЦИЯ: Статистика запросов (унифицированные ключи)
        self.stats = getattr(self, "stats", {}) or {}
        # totals / метрики: поддерживаем и 'call' на всякий случай
        self.stats.setdefault("calls", 0)     # общее число READ-вызовов
        self.stats.setdefault("call", 0)      # старый ключ (будем копить тоже)
        self.stats.setdefault("balance", 0)   # вызовы балансов
        self.stats.setdefault("send", 0)      # отправки raw TX
        self.stats.setdefault("receipt", 0)   # опросы квитанций
        self.stats.setdefault("gas", 0)       # вызовы gasPrice
        self.stats.setdefault("429", 0)       # лимиты
        self.stats.setdefault("5xx", 0)       # ошибки прокси
        self._last_stats_log = 0
        # ---- P1 Adaptive proxy rate-limit ----
        self.proxy_min_gap_ms = 150
        self.proxy_max_gap_ms = 1000
        self._proxy_last_call_ts = 0.0
        self._proxy_error_window = []  # timestamps of recent 429/5xx
        
        # Газ-политика: минимальный "пол" газа (лесенка 0.1→0.2→0.1)
        self.gas_floor_wei = to_wei_gwei(DEFAULT_LIMITS['min_gas_gwei'])
        self.offline_only = False  # управляется из UI

    def _cache_get(self, key, ttl_s=None):
        """Получает значение из кэша с проверкой TTL"""
        v = self._cache.get(key)
        if v is None: 
            return None
        if ttl_s is None: 
            return v
        val, ts = v
        return val if (time.time() - ts) < ttl_s else None

    def _cache_set(self, key, value):
        """Устанавливает значение в кэш с временной меткой"""
        if key in ('gas_price', 'reserves'):
            self._cache[key] = (value, time.time())
        else:
            self._cache[key] = value

    def _purge_call_cache(self):
        """Очищает протухшие ключи из коалесинг-кэша"""
        now = time.time()
        ttl = self._call_ttl_s
        dead = [k for k, (_, ts) in self._call_cache.items() if now - ts >= ttl]
        for k in dead:
            self._call_cache.pop(k, None)
        # ✚ мягкий потолок
        if len(self._call_cache) > self._call_cache_max:
            # удалить самые старые записи
            for k, (_, ts) in sorted(self._call_cache.items(), key=lambda x: x[1][1])[:len(self._call_cache)-self._call_cache_max]:
                self._call_cache.pop(k, None)

    def _log_stats(self):
        """Логирует статистику запросов каждую минуту"""
        now = int(time.time())
        if now % 60 == 0 and now != self._last_stats_log:  # раз в минуту
            self._purge_call_cache()  # ✚ очищаем протухшие ключи
            total_calls = self.stats.get('calls', 0) + self.stats.get('call', 0)
            self.log(
                "📊 RPC stats: "
                f"calls={total_calls} "
                f"balance={self.stats.get('balance',0)} "
                f"gas={self.stats.get('gas',0)} "
                f"send={self.stats.get('send',0)} "
                f"receipt={self.stats.get('receipt',0)}"
            )
            self._last_stats_log = now

    # ---- P1 Adaptive proxy helpers ----
    def _proxy_sleep_before_call(self):
        gap = max(0, (self.proxy_min_gap_ms / 1000.0) - (time.time() - self._proxy_last_call_ts))
        if gap > 0:
            time.sleep(gap)
        self._proxy_last_call_ts = time.time()

    def _proxy_backoff(self, success: bool):
        now = time.time()
        # чистим окно старше 60с
        self._proxy_error_window = [t for t in self._proxy_error_window if now - t < 60]
        if success:
            # плавное снижение раз в ~10 успешных вызовов
            if self.proxy_min_gap_ms > 150:
                self.proxy_min_gap_ms = max(150, int(self.proxy_min_gap_ms * 0.8))
        else:
            self._proxy_error_window.append(now)
            if len(self._proxy_error_window) >= 3:
                self.proxy_min_gap_ms = min(self.proxy_max_gap_ms, int(self.proxy_min_gap_ms * 1.5))

    def connect(self):
        if self.mode == RpcMode.NODE:
            if not self.cfg.node_http:
                raise RuntimeError('Node RPC URL is empty')
            self.node_w3 = Web3(Web3.HTTPProvider(self.cfg.node_http, request_kwargs={'timeout': 20}))
            if not self.node_w3.is_connected():
                raise RuntimeError('Failed to connect to Node RPC')
            # ОПТИМИЗАЦИЯ: Легкий провайдер для READ операций (BSC dataseed)
            self.read_w3 = Web3(Web3.HTTPProvider(self.rpc_urls[0], request_kwargs={'timeout': 10}))
            chain_id = self.node_w3.eth.chain_id
            if chain_id != BSC_CHAIN_ID:
                self.log(f'⚠ Connected chainId={chain_id}, expected {BSC_CHAIN_ID}. Proceed with caution.')
            return 'Node'
        else:
            if not self.cfg.proxy_base_url:
                raise RuntimeError('Proxy base URL is empty')
            self.proxy = ProxyClient(self.cfg.proxy_base_url, self.cfg.proxy_api_keys or [])
            # cheap ping
            _ = self.proxy.eth_gasPrice()
            return 'Proxy'

    # ---------- Common calls via abstract "client_call" ----------
    def _client_call(self, to: str, data: str) -> str:
        """READ операции с кэшированием и коалесингом"""
        # ОПТИМИЗАЦИЯ: Проверяем кэш для коалесинга одинаковых вызовов
        key = (to.lower(), data)
        now = time.time()
        cached = self._call_cache.get(key)
        if cached and now - cached[1] < self._call_ttl_s:
            return cached[0]

        # считаем READ-вызовы в унифицированный счётчик
        self.stats['calls'] = self.stats.get('calls', 0) + 1
        
        # READ пытаемся через лёгкий провайдер (если есть), иначе основной
        try:
            if self.mode == RpcMode.NODE and hasattr(self, 'read_w3') and self.read_w3 is not None:
                res = self.read_w3.eth.call({'to': to, 'data': data}, 'latest')
                out = res.hex()
            else:
                raise RuntimeError("fallback to primary")
        except Exception:
            if self.mode == RpcMode.NODE:
                out = self.node_w3.eth.call({'to': to, 'data': data}, 'latest').hex()
            else:
                out = self.proxy.eth_call(to, data, 'latest')

        # ОПТИМИЗАЦИЯ: Кэшируем результат
        self._call_cache[key] = (out, now)
        return out

    def proxy_get_amounts_out(self, amount_in: int, path: list[str]) -> int:
        try:
            data = _router_encoder.encodeABI(fn_name='getAmountsOut', args=[amount_in, path])
            hexres = self.proxy.eth_call(PANCAKE_V2_ROUTER, data)  # "0x..."
            from eth_abi import decode as abi_decode
            (amounts,) = abi_decode(['uint256[]'], bytes.fromhex(hexres[2:]))
            return int(amounts[-1])  # финальное количество для последнего токена пути
        except Exception as e:
            self.log(f"⚠ getAmountsOut via proxy failed, fallback used: {e}")
            # мягкий фоллбэк на резервы пары (PLEX/USDT)
            t0, t1 = eth_call_pair_tokens(self._client_call, PAIR_ADDRESS)
            r0, r1 = eth_call_pair_reserves(self._client_call, PAIR_ADDRESS)
            src = Web3.to_checksum_address(path[0]).lower()
            if src == t0.lower():
                reserve_in, reserve_out = r0, r1
            else:
                reserve_in, reserve_out = r1, r0
            est = uni_v2_amount_out(amount_in, reserve_in, reserve_out, 25)
            return int(est)

    def get_balances(self, address: str) -> tuple[int,int,int,int]:
        """Получает балансы с кэшированием decimals"""
        self.stats['balance'] += 1
        # returns (plex_raw, usdt_raw, plex_decimals, usdt_decimals)
        plex_dec = 9  # enforced (без дополнительных eth_call)
        
        # ОПТИМИЗАЦИЯ: Кэшируем USDT decimals (неизменяемо)
        usdt_dec = self._cache_get('usdt_decimals')
        if usdt_dec is None:
            try:
                usdt_dec = eth_call_decimals(self._client_call, USDT)
            except:
                usdt_dec = 18
            self._cache_set('usdt_decimals', usdt_dec)
        
        plex_bal = eth_call_balance_of(self._client_call, PLEX, address)
        usdt_bal = eth_call_balance_of(self._client_call, USDT, address)
        return plex_bal, usdt_bal, plex_dec, usdt_dec

    def get_bnb_balance(self, address: str) -> int:
        """Получает баланс BNB в wei с TTL кэшированием"""
        # ОПТИМИЗАЦИЯ: Проверяем TTL кэш для BNB баланса
        mp, ts = self._cache.get('bnb_balance', ({}, 0))
        if time.time() - ts < self._ttl_bnb_s and address in mp:
            return mp[address]
            
        self.stats['balance'] += 1
        try:
            if self.mode == RpcMode.NODE:
                # ОПТИМИЗАЦИЯ: Сначала пробуем через read_w3 (BSC dataseed)
                if hasattr(self, 'read_w3'):
                    try:
                        val = self.read_w3.eth.get_balance(address)
                    except Exception:
                        # Fallback на основной провайдер
                        val = self.node_w3.eth.get_balance(address)
                else:
                    val = self.node_w3.eth.get_balance(address)
            else:
                # Для proxy режима используем eth_getBalance
                params = {'module':'proxy','action':'eth_getBalance','address':address,'tag':'latest'}
                data = self.proxy._get(params)
                result = data.get('result')
                if not result:
                    val = 0
                else:
                    val = int(result, 16)
            
            # ОПТИМИЗАЦИЯ: Кэшируем результат
            mp[address] = int(val)
            self._cache['bnb_balance'] = (mp, time.time())
            return mp[address]
        except Exception as e:
            self.log(f'⚠ Ошибка получения баланса BNB: {e}')
            return 0

    def get_allowance_cached(self, owner: str, spender: str) -> int:
        """Получает allowance с TTL кэшированием для UI-обновлений"""
        # ОПТИМИЗАЦИЯ: Проверяем TTL кэш для allowance
        mp, ts = self._cache.get('allowance', ({}, 0))
        key = (owner.lower(), spender.lower())
        if time.time() - ts < self._ttl_allowance_s and key in mp:
            return mp[key]
            
        val = eth_call_allowance(self._client_call, PLEX, owner, spender)
        mp[key] = val
        self._cache['allowance'] = (mp, time.time())
        return val

    def get_decimals(self, token_addr: str) -> int:
        """Получает decimals токена через eth_call"""
        try:
            out = self._client_call(token_addr, SEL_DECIMALS)
            return int(out, 16) if out and out != '0x' else 18
        except Exception as e:
            self.log(f"⚠️ Ошибка получения decimals для {token_addr}: {e}")
            return 18

    def get_price_and_reserves(self) -> tuple[Decimal, int, int, bool]:
        """Получает цену и резервы пары с offline-устойчивостью"""
        if self.is_offline:
            raise Exception(f"{ErrorCode.NETWORK}: Offline режим, нет соединения")
        
        try:
            return self._safe_network_call(
                "get_price_and_reserves",
                self._get_price_and_reserves_internal
            )
        except Exception as e:
            self.log(f"❌ Ошибка получения цены: {e}")
            raise e
    
    def _get_price_and_reserves_internal(self) -> tuple[Decimal, int, int, bool]:
        """Внутренний метод получения цены и резервов с кэшированием"""
        # ОПТИМИЗАЦИЯ: Кэшируем порядок токенов (неизменяемо)
        is_plex_token0 = self._cache_get('is_plex_token0')
        if is_plex_token0 is None:
            t0, t1 = eth_call_pair_tokens(self._client_call, PAIR_ADDRESS)
            is_plex_token0 = (t0.lower() == PLEX.lower())
            self._cache_set('is_plex_token0', is_plex_token0)
        
        # ОПТИМИЗАЦИЯ: Кэшируем резервы с TTL 2 секунды
        cached_reserves = self._cache_get('reserves', ttl_s=2)
        if cached_reserves:
            r_plex, r_usdt = cached_reserves
        else:
            r0, r1 = eth_call_pair_reserves(self._client_call, PAIR_ADDRESS)
            r_plex, r_usdt = (r0, r1) if is_plex_token0 else (r1, r0)
            self._cache_set('reserves', (r_plex, r_usdt))
        
        if r_plex == 0:
            return Decimal('0'), r_plex, r_usdt, is_plex_token0
        
        # Нормализация цены с учетом decimals: PLEX=9, USDT=18
        # Цена (USDT/PLEX) = (reserveUSDT / 10^18) / (reservePLEX / 10^9)
        # Эквивалентно: reserveUSDT / reservePLEX * 10^(9-18) = reserveUSDT / reservePLEX * 10^(-9)
        price = Decimal(r_usdt) / Decimal(r_plex) * Decimal(10) ** Decimal(-9)
        
        # ОПТИМИЗАЦИЯ: Логируем статистику
        self._log_stats()
        
        return price, r_plex, r_usdt, is_plex_token0

    def current_gas_price(self, default_wei: int, use_network_gas: bool = True) -> int:
        """Получает текущую цену газа с учетом лимитов и кэшированием"""
        try:
            user_gas = default_wei
            floor = max(self.gas_floor_wei, to_wei_gwei(DEFAULT_LIMITS['min_gas_gwei']))
            
            if use_network_gas:
                # Кэшируем сетевой газ с TTL 15 секунд
                network_gas = None
                cached_gas = self._cache_get('gas_price', ttl_s=15)
                if cached_gas is not None:
                    network_gas = cached_gas
                else:
                    self.stats['gas'] = self.stats.get('gas', 0) + 1
                    if self.mode == RpcMode.NODE:
                        network_gas = int(self.node_w3.eth.gas_price)
                    else:
                        try:
                            self._proxy_sleep_before_call()
                            network_gas = int(self.proxy.eth_gasPrice())
                            self._proxy_backoff(success=True)
                        except Exception as e:
                            msg = str(e).lower()
                            if "429" in msg:
                                self.stats["429"] = self.stats.get("429", 0) + 1
                                self._proxy_backoff(success=False)
                            elif "50" in msg or "5xx" in msg:
                                self.stats["5xx"] = self.stats.get("5xx", 0) + 1
                                self._proxy_backoff(success=False)
                            raise
                    # кэш и для Node, и для Proxy
                    self._cache_set('gas_price', network_gas)
                
                # Используем максимум из пользовательского, сетевого газа и пола
                final_gas = max(user_gas, network_gas, floor)
            else:
                # Используем максимум из пользовательского газа и пола
                final_gas = max(user_gas, floor)
            
            # БЕЗОПАСНОСТЬ: Применяем лимиты газа
            min_gas = to_wei_gwei(DEFAULT_LIMITS['min_gas_gwei'])
            max_gas = to_wei_gwei(DEFAULT_LIMITS['max_gas_gwei'])
            
            # Ограничиваем лимитами
            final_gas = max(min_gas, min(final_gas, max_gas))
            
            if final_gas != user_gas:
                self.log(f"⛽ Газ скорректирован: {from_wei_gwei(user_gas):.3f} → {from_wei_gwei(final_gas):.3f} gwei")
            
            return final_gas
            
        except Exception as e:
            self.log(f'⚠ Ошибка получения цены газа: {e}')
            return default_wei
    
    # (удалено) adjust_gas_for_replacement — не используется

    def get_nonce(self, address: str) -> int:
        if self.mode == RpcMode.NODE:
            return int(self.node_w3.eth.get_transaction_count(address, 'pending'))
        else:
            return int(self.proxy.eth_getTransactionCount(address, 'pending'))

    def estimate_gas(self, tx: dict, default: int=300000) -> int:
        try:
            if self.mode == RpcMode.NODE:
                return int(self.node_w3.eth.estimate_gas(tx))
            else:
                return int(self.proxy.eth_estimateGas(tx))
        except Exception as e:
            self.log(f'⚠ Gas estimate failed, using default {default}: {e}')
            return default

    # ---------- ПРЕДВАРИТЕЛЬНАЯ ПРОВЕРКА (без симуляций) ----------
    def precheck_summary(self, owner: str, amount_in_raw: int, gas_price_wei: int,
                         user_slippage_pct: float, deadline_min: int, limits: dict) -> dict:
        """
        READ-only префлайт: собирает статусы без отправки/симуляции транзакций.
        Возвращает словарь с ключами: network, balance_plex, allowance, bnb_gas,
        min_out, limits, pair_ok (+ полезные поля для UI).
        """
        summary = {
            "network": {"ok": not self.is_offline, "msg": "OK" if not self.is_offline else "Offline"},
            "balance_plex": {"ok": False, "have": 0, "need": amount_in_raw, "msg": ""},
            "allowance": {"ok": False, "have": 0, "need": amount_in_raw, "msg": ""},
            "bnb_gas": {"ok": False, "have": 0, "need": 0, "est_units": 0, "msg": ""},
            "min_out": {"ok": False, "expected": 0, "min_out": 0, "msg": ""},
            "limits": {"ok": True, "msg": "OK"},
            "pair_ok": {"ok": True, "msg": "OK"},
            "impact": {"ok": True, "pct": 0.0, "msg": "OK"},
            "reserves": {"ok": True, "plex": 0.0, "usdt": 0.0, "msg": "OK"},
        }
        try:
            # Баланс PLEX
            bal_plex = eth_call_balance_of(self._client_call, PLEX, owner)
            summary["balance_plex"]["have"] = bal_plex
            summary["balance_plex"]["ok"] = bal_plex >= amount_in_raw
            summary["balance_plex"]["msg"] = "OK" if summary["balance_plex"]["ok"] else "Недостаточно PLEX"

            # Allowance
            allow = eth_call_allowance(self._client_call, PLEX, owner, PANCAKE_V2_ROUTER)
            summary["allowance"]["have"] = allow
            summary["allowance"]["ok"] = allow >= amount_in_raw
            summary["allowance"]["msg"] = "OK" if summary["allowance"]["ok"] else "Потребуется approve"

            # Резервы и ожидаемый выход (safe: публичный метод ядра)
            price, rplex, rusdt, _ = self.get_price_and_reserves()
            expected_out = get_amounts_out(self, amount_in_raw, [PLEX, USDT]) if amount_in_raw > 0 else 0
            safety = DEFAULT_LIMITS['safety_slippage_bonus'] / 100.0
            user = max(0.0, float(user_slippage_pct)) / 100.0
            min_out = max(int(expected_out * (1 - user - safety)), 1) if expected_out > 0 else 0
            summary["min_out"]["expected"] = expected_out
            summary["min_out"]["min_out"] = min_out
            summary["min_out"]["ok"] = expected_out > 0 and min_out > 0
            summary["min_out"]["msg"] = "OK" if summary["min_out"]["ok"] else "Нет ликвидности/резервов"

            # Динамические минимумы резервов
            plex_res = float(from_units(rplex, 9))
            usdt_res = float(from_units(rusdt, 18))
            amt_in_plex = float(from_units(amount_in_raw, 9))
            exp_out_usdt = float(from_units(expected_out, 18))
            mult = float(DEFAULT_LIMITS['reserve_value_multiplier'])
            min_plex_dyn = max(float(DEFAULT_LIMITS['min_pool_reserve_plex_abs']), amt_in_plex * mult)
            min_usdt_dyn = max(float(DEFAULT_LIMITS['min_pool_reserve_usdt_abs']), exp_out_usdt * mult)
            summary["reserves"].update({
                "plex": plex_res, "usdt": usdt_res,
                "min_plex": min_plex_dyn, "min_usdt": min_usdt_dyn
            })
            res_ok = (plex_res >= min_plex_dyn) and (usdt_res >= min_usdt_dyn)
            summary["reserves"]["ok"] = res_ok
            summary["reserves"]["msg"] = "OK" if res_ok else "Резервы ниже минимума"
            # линейный теоретический выход без слippage:
            theo_out = 0
            if amount_in_raw > 0 and rplex > 0:
                theo_out = int((amount_in_raw * rusdt) // rplex)
            impact_pct = 0.0
            if theo_out > 0 and expected_out > 0:
                impact_pct = max(0.0, 100.0 * (1.0 - (expected_out / theo_out)))
            summary["impact"]["pct"] = impact_pct
            imp_ok = impact_pct <= float(DEFAULT_LIMITS['max_price_impact_pct'])
            summary["impact"]["ok"] = imp_ok
            summary["impact"]["msg"] = "OK" if imp_ok else f"Impact {impact_pct:.2f}% > {DEFAULT_LIMITS['max_price_impact_pct']}%"

            # Gas budget (approve + swap, с буфером 20%)
            deadline_ts = int(time.time()) + deadline_min * 60
            gas_units = 0
            # approve (если надо)
            if allow < amount_in_raw:
                approve_tx = {'to': PLEX, 'data': encode_approve(PANCAKE_V2_ROUTER, amount_in_raw), 'from': owner}
                gas_units += self.estimate_gas(approve_tx, default=50000)
            # swap (всегда оцениваем)
            swap_tx = {'to': PANCAKE_V2_ROUTER,
                       'data': encode_swap_exact_tokens_supporting(amount_in_raw, 0, [PLEX, USDT], owner, deadline_ts),
                       'from': owner}
            gas_units += self.estimate_gas(swap_tx, default=200000)
            gas_units = int(gas_units * 1.2)
            gas_need_wei = gas_units * max(gas_price_wei, to_wei_gwei(DEFAULT_LIMITS['min_gas_gwei']))
            bal_bnb = self.get_bnb_balance(owner)
            summary["bnb_gas"].update({"have": bal_bnb, "need": gas_need_wei, "est_units": gas_units})
            summary["bnb_gas"]["ok"] = bal_bnb >= gas_need_wei
            summary["bnb_gas"]["msg"] = "OK" if summary["bnb_gas"]["ok"] else "Недостаточно BNB на газ"

            # Лимиты
            can_sell, reason = self.limits_manager.can_sell(
                amount_plex=float(amount_in_raw) / (10 ** 9),
                max_per_tx=limits.get('max_per_tx_plex', DEFAULT_LIMITS['max_per_tx_plex']),
                max_daily=limits.get('max_daily_plex', DEFAULT_LIMITS['max_daily_plex']),
                max_hourly=limits.get('max_sales_per_hour', DEFAULT_LIMITS['max_sales_per_hour'])
            )
            summary["limits"]["ok"] = bool(can_sell)
            summary["limits"]["msg"] = "OK" if can_sell else reason

            # Whitelist пары
            t0, t1 = eth_call_pair_tokens(self._client_call, PAIR_ADDRESS)
            pair_tokens = {t0.lower(), t1.lower()}
            expected = {SAFETY_WHITELIST['PLEX'], SAFETY_WHITELIST['USDT']}
            good = pair_tokens == expected
            summary["pair_ok"]["ok"] = good
            summary["pair_ok"]["msg"] = "OK" if good else "Неожиданные токены в паре"
        except Exception as e:
            summary["network"] = {"ok": False, "msg": str(e)}
        return summary

    def send_raw(self, signed: bytes) -> str:
        """Отправляет транзакцию с учётом offline_only"""
        if self.offline_only and self.mode != RpcMode.NODE:
            raise RuntimeError("Режим 'Только оффлайн-подпись': отправка доступна только через Node RPC")
        try:
            # учитываем попытку отправки
            self.stats["send"] = self.stats.get("send", 0) + 1
            if self.mode == RpcMode.NODE:
                txh = self.node_w3.eth.send_raw_transaction(signed)
                return txh.hex()
            # Proxy
            self._proxy_sleep_before_call()
            h = self.proxy.eth_sendRawTransaction(Web3.to_hex(signed))
            self._proxy_backoff(success=True)
            return h
        except Exception as e:
            msg = str(e).lower()
            if "429" in msg:
                self.stats["429"] = self.stats.get("429", 0) + 1
                self._proxy_backoff(success=False)
            elif "50" in msg or "5xx" in msg:
                self.stats["5xx"] = self.stats.get("5xx", 0) + 1
                self._proxy_backoff(success=False)
            raise

    # Возвращает активный индекс ключа прокси (если есть)
    def proxy_active_index(self):
        return getattr(self, "proxy_key_index",
               getattr(self, "current_proxy_index",
               getattr(self, "_idx", None)))

    # ---------- БЕЗОПАСНОСТЬ: Безопасный approve ----------
    def safe_approve(self, owner: str, pk: str, amount_needed: int, gas_price_wei: int) -> str:
        """Безопасный approve: 0 → amount → 0"""
        try:
            # Проверяем текущий allowance
            allowance = eth_call_allowance(self._client_call, PLEX, owner, PANCAKE_V2_ROUTER)
            self.log(f'🔍 Текущий allowance: {from_units(allowance, 9)} PLEX, '
                     f'требуется: {from_units(amount_needed, 9)} PLEX')
            
            # БЕЗОПАСНОСТЬ: Если allowance не равен нужному - приводим к нулю, затем к нужному
            if allowance != amount_needed:
                if allowance > 0:
                    self.log(f'⚠️ Allowance не равен нужному ({from_units(allowance, 9)} != {from_units(amount_needed, 9)} PLEX), обнуляем...')
                    revoke_tx = self._send_approve_tx(owner, pk, 0, gas_price_wei)
                    self.log(f'✅ Revoke транзакция отправлена: {revoke_tx}')
                    # БЕЗОПАСНОСТЬ: Ждем подтверждения revoke
                    self.wait_receipt(revoke_tx, timeout=60)
                    self.log(f'✅ Revoke подтвержден')
                    # Проверяем, что revoke прошел
                    allowance = eth_call_allowance(self._client_call, PLEX, owner, PANCAKE_V2_ROUTER)
                    if allowance > 0:
                        raise Exception(f"{ErrorCode.ALLOWANCE}: Revoke не сработал, allowance: {allowance}")
                
                # Теперь approve на нужную сумму
                self.log(f'📝 Approve на {from_units(amount_needed, 9)} PLEX...')
                approve_tx = self._send_approve_tx(owner, pk, amount_needed, gas_price_wei)
                self.log(f'✅ Approve транзакция отправлена: {approve_tx}')
                # БЕЗОПАСНОСТЬ: Ждем подтверждения approve
                self.wait_receipt(approve_tx, timeout=60)
                self.log(f'✅ Approve подтвержден')
                return approve_tx
            
            self.log(f'✅ Allowance уже равен нужному: {allowance}')
            return None  # Уже достаточно
            
        except Exception as e:
            self.log(f'❌ Ошибка безопасного approve: {e}')
            raise Exception(f"{ErrorCode.ALLOWANCE}: {e}")
    
    def safe_revoke(self, owner: str, pk: str, gas_price_wei: int) -> str:
        """Безопасный revoke: approve(0)"""
        try:
            allowance = eth_call_allowance(self._client_call, PLEX, owner, PANCAKE_V2_ROUTER)
            if allowance == 0:
                self.log(f'ℹ️ Allowance уже нулевой')
                return None
            
            self.log(f'🔒 Revoke allowance ({from_units(allowance, 9)} PLEX)...')
            revoke_tx = self._send_approve_tx(owner, pk, 0, gas_price_wei)
            self.log(f'✅ Revoke транзакция отправлена: {revoke_tx}')
            # БЕЗОПАСНОСТЬ: Ждем подтверждения revoke
            self.wait_receipt(revoke_tx, timeout=60)
            self.log(f'✅ Revoke подтвержден')
            return revoke_tx
            
        except Exception as e:
            self.log(f'❌ Ошибка revoke: {e}')
            raise Exception(f"{ErrorCode.ALLOWANCE}: {e}")
    
    def _send_approve_tx(self, owner: str, pk: str, amount: int, gas_price_wei: int) -> str:
        """Вспомогательный метод для отправки approve транзакции"""
        nonce = self.nonce_manager.reserve_nonce(self.nonce_manager.get_nonce(self, owner))
        try:
            data = encode_approve(PANCAKE_V2_ROUTER, amount)
            tx = {
                'to': PLEX,
                'value': 0,
                'data': data,
                'chainId': BSC_CHAIN_ID,
                'gasPrice': gas_price_wei,
                'nonce': nonce
            }
            gas = self.estimate_gas({'from': owner, **tx})
            tx['gas'] = gas
            signed = Account.from_key(pk).sign_transaction(tx)
            txh = self.send_raw(signed.rawTransaction)
            self.nonce_manager.record_sent_tx(nonce, gas_price_wei, txh)
            self.nonce_manager.release_nonce(True)
            self.log(f"✅ Approve tx sent: {txh}")
            return txh
        except Exception as e:
            self.nonce_manager.release_nonce(False)
            self.log(f"❌ Approve broadcast failed: {e}")
            raise
    
    def _get_w3(self):
        """Получает Web3 экземпляр для nonce manager"""
        if self.mode == RpcMode.NODE:
            return self.node_w3
        else:
            # Для proxy режима создаем временный Web3
            return Web3()
    
    def wait_receipt(self, tx_hash: str, timeout: int = 120) -> dict:
        """Ждет подтверждения транзакции с экономным backoff"""
        t0 = time.time()
        backoff = 2.0
        
        while True:
            if time.time() - t0 > timeout:
                raise TimeoutError(f"Таймаут ожидания подтверждения {tx_hash}")
            try:
                self.stats['receipt'] = self.stats.get('receipt', 0) + 1   # ✚ считаем каждый опрос
                if self.mode == RpcMode.NODE:
                    receipt = self.node_w3.eth.get_transaction_receipt(tx_hash)
                else:
                    receipt = self.proxy.eth_getTransactionReceipt(tx_hash)
                if receipt:
                    return receipt
            except Exception as e:
                self.log(f"⏳ Ожидание подтверждения {tx_hash}: {e}")
            time.sleep(backoff)
            backoff = min(backoff * 1.7, 15.0)  # старт 2с → потолок 15с
    
    def _handle_network_error(self, error: Exception, operation: str) -> bool:
        """Обрабатывает сетевые ошибки с backoff и ротацией"""
        self.retry_count += 1
        
        if "timeout" in str(error).lower() or "connection" in str(error).lower():
            self.is_offline = True
            self.log(f"🌐 Сетевая ошибка в {operation}: {error}")
            self.log(f"🌐 Переход в offline-режим, retry {self.retry_count}/{self.max_retries}")
            
            if self.retry_count >= self.max_retries:
                self.log(f"❌ Превышено максимальное количество попыток для {operation}")
                return False
                
            # Exponential backoff
            time.sleep(self.backoff_seconds)
            self.backoff_seconds = min(self.backoff_seconds * 2, self.max_backoff)
            
            # Ротация RPC/Proxy
            self._rotate_connection()
            return True
            
        return False
    
    def _rotate_connection(self):
        """Ротирует RPC/Proxy соединения"""
        try:
            if self.mode == RpcMode.NODE:
                self.current_rpc_index = (self.current_rpc_index + 1) % len(self.rpc_urls)
                new_url = self.rpc_urls[self.current_rpc_index]
                self.log(f"🔄 Ротация READ RPC (индекс {self.current_rpc_index}): {new_url}")
                # ВАЖНО: node_w3 НЕ трогаем — это QuickNode для WRITE
                # читаем через лёгкий провайдер
                self.read_w3 = Web3(Web3.HTTPProvider(new_url, request_kwargs={'timeout': 10}))
            else:
                self.current_proxy_index = (self.current_proxy_index + 1) % len(self.proxy_api_keys)
                new_key = self.proxy_api_keys[self.current_proxy_index]
                self.log(f"🔄 Ротация Proxy ключа (индекс {self.current_proxy_index})")
                # БЕЗОПАСНОСТЬ: Создаем ProxyClient с base_url и списком ключей
                self.proxy = ProxyClient(self.proxy_base_url, [new_key])
        except Exception as e:
            self.log(f"❌ Ошибка ротации соединения: {e}")
    
    def _reset_offline_state(self):
        """Сбрасывает offline состояние при успешном соединении"""
        if self.is_offline:
            self.is_offline = False
            self.backoff_seconds = 1
            self.retry_count = 0
            self.log("✅ Восстановлено соединение, выход из offline-режима")
    
    
    # (удалено) _encode_swap_data — заменено на encode_swap_exact_tokens_supporting()
    
    def _safe_network_call(self, operation_name: str, func, *args, **kwargs):
        """Безопасный вызов сетевых операций с обработкой ошибок"""
        try:
            result = func(*args, **kwargs)
            self._reset_offline_state()
            return result
        except Exception as e:
            if self._handle_network_error(e, operation_name):
                # Повторная попытка
                return self._safe_network_call(operation_name, func, *args, **kwargs)
            else:
                raise e

    def safe_sell_now(self, owner: str, pk: str, amount_in_raw: int, min_out_raw: int, 
                     gas_price_wei: int, limits: dict, deadline_min: int = 20) -> str:
        """Безопасная продажа с политикой повторов (5 попыток, 5 сек пауза)"""
        # БЕЗОПАСНОСТЬ: Общий префлайт (газ/лимиты/резервы/балансы/whitelist)
        self._preflight_checks(owner, amount_in_raw, gas_price_wei, limits, deadline_min)
            
        # 1) approve ровно на сумму (как у вас уже есть)
        self._safe_approve_exact(owner, pk, amount_in_raw, gas_price_wei)

        attempts = 0
        last_error = None
        while attempts < 5:
            attempts += 1
            try:
                # 2) отправляем swap (если tx-hash вернулся — считаем, что ушла)
                deadline_ts = int(time.time()) + deadline_min * 60
                nonce = self.nonce_manager.reserve_nonce(self.nonce_manager.get_nonce(self, owner))
                txh = self._send_swap_tx(owner, pk, amount_in_raw, min_out_raw, deadline_ts, gas_price_wei, nonce)
                self.log(f"✅ Swap tx sent (attempt {attempts}/5): {txh}")

                # ЗАПИСАТЬ и ОСВОБОДИТЬ nonce (успешная отправка)
                self.nonce_manager.record_sent_tx(nonce, gas_price_wei, txh)
                self.nonce_manager.release_nonce(success=True)

                # 3) ждём квитанцию (ВАЖНО: без gas-бампа)
                try:
                    self.wait_receipt(txh, timeout=deadline_min * 60)
                    self.log("✅ Swap confirmed")
                    
                    # ✚ записываем факт продажи в лимиты (PLEX = 9 decimals)
                    amount_plex = float(Decimal(amount_in_raw) / Decimal(10**9))
                    self.limits_manager.record_sale(amount_plex)
                    
                    # 4) revoke(0) после успеха (как и было)
                    self._safe_revoke(owner, pk, gas_price_wei)
                    return txh
                except TimeoutError as te:
                    last_error = te
                    self.log(f"⏳ No receipt (attempt {attempts}/5): {te}")
                    # Повтор НЕ отправляем — nonce занят. Прерываемся и уведомляем.
                    break

            except Exception as e:
                # Ошибка отправки — tx НЕ ушла → можно повторить через 5 сек
                last_error = e
                self.log(f"❌ Broadcast failed (attempt {attempts}/5): {e}")
                # На всякий случай убедимся, что nonce не зарезервирован
                if hasattr(self, "nonce_manager") and self.nonce_manager.has_pending():
                    self.nonce_manager.release_nonce(success=False)
                if attempts < 5:
                    self.log(f"🔁 Повтор отправки через 5 сек... (попытка {attempts}/5)")
                    time.sleep(5)
                    continue
                else:
                    break

        # 5) Пять неудачных попыток → уведомляем и пробуем аккуратно закрыть allowance
        self.log(f"🛑 Could not complete sell after {attempts} attempts: {last_error}")
        try:
            # БЕЗОПАСНОСТЬ: Не ревокаем сразу после таймаута свопа
            last_nonce, _, last_tx = self.nonce_manager.get_last_sent_data()
            if last_tx is None:
                # своп реально не отправлялся — можем revoke
                self._safe_revoke(owner, pk, gas_price_wei)
        except Exception as rev_e:
            self.log(f"⚠ Revoke after failures failed: {rev_e}")


        raise RuntimeError(f"Sell loop failed after {attempts} attempts: {last_error}")
    
    def _safe_approve_exact(self, owner: str, pk: str, amount_in_raw: int, gas_price_wei: int) -> str:
        """Алиас для safe_approve"""
        return self.safe_approve(owner, pk, amount_in_raw, gas_price_wei)
    
    def _safe_revoke(self, owner: str, pk: str, gas_price_wei: int) -> str:
        """Алиас для safe_revoke"""
        return self.safe_revoke(owner, pk, gas_price_wei)
    
    def _preflight_checks(self, owner: str, amount_in_raw: int, gas_price_wei: int, limits: dict, deadline_min: int = 20):
        """Preflight проверки перед продажей"""
        # БЕЗОПАСНОСТЬ: Вычисляем deadline_ts локально
        deadline_ts = int(time.time()) + deadline_min * 60
        
        # 1. Проверка баланса PLEX
        balance_plex = eth_call_balance_of(self._client_call, PLEX, owner)
        if balance_plex < amount_in_raw:
            raise Exception(f"{ErrorCode.LIMIT}: Недостаточно PLEX: {balance_plex} < {amount_in_raw}")
        
        # 2. Проверка баланса BNB для газа
        balance_bnb = self.get_bnb_balance(owner)
        
        # БЕЗОПАСНОСТЬ: Точная оценка бюджета газа
        try:
            # Оцениваем газ для возможных операций: revoke(0) + approve(amount) + swap
            gas_estimate = 0
            
            # Проверяем, нужен ли revoke
            current_allowance = eth_call_allowance(self._client_call, PLEX, owner, PANCAKE_V2_ROUTER)
            if current_allowance > 0 and current_allowance != amount_in_raw:
                # Оцениваем газ для revoke
                revoke_tx = {
                    'to': PLEX,
                    'data': encode_approve(PANCAKE_V2_ROUTER, 0),
                    'from': owner
                }
                try:
                    gas_estimate += self.estimate_gas(revoke_tx)
                except:
                    gas_estimate += 50000  # Fallback для revoke
            
            # Оцениваем газ для approve
            approve_tx = {
                'to': PLEX,
                'data': encode_approve(PANCAKE_V2_ROUTER, amount_in_raw),
                'from': owner
            }
            try:
                gas_estimate += self.estimate_gas(approve_tx)
            except:
                gas_estimate += 50000  # Fallback для approve
            
            # Оцениваем газ для swap
            swap_tx = {
                'to': PANCAKE_V2_ROUTER,
                # используем готовый оффлайн-энкодер, как в реальном свопе
                'data': encode_swap_exact_tokens_supporting(amount_in_raw, 0, [PLEX, USDT], owner, deadline_ts),
                'from': owner
            }
            try:
                gas_estimate += self.estimate_gas(swap_tx)
            except:
                gas_estimate += 200000  # Fallback для swap
            
            # Добавляем 20% буфер
            gas_estimate = int(gas_estimate * 1.2)
            estimated_gas_cost = gas_price_wei * gas_estimate
            
            # Логируем итоговую оценку газа
            self.log(f"🧮 Gas budget: estGas={gas_estimate} units, price≈{from_wei_gwei(gas_price_wei):.3f} gwei, "
                     f"cost≈{from_units(estimated_gas_cost,18)} BNB")
            
            if balance_bnb < estimated_gas_cost:
                self.log(f'⚠️ Недостаточно BNB для газа:')
                self.log(f'⚠️ Требуется: {from_units(estimated_gas_cost, 18)} BNB')
                self.log(f'⚠️ Доступно: {from_units(balance_bnb, 18)} BNB')
                self.log(f'⚠️ Не хватает: {from_units(estimated_gas_cost - balance_bnb, 18)} BNB')
                raise Exception(f"{ErrorCode.GAS}: Недостаточно BNB для газа: {from_units(balance_bnb, 18)} < {from_units(estimated_gas_cost, 18)}")
                
        except Exception as gas_error:
            # Fallback на константную оценку
            estimated_gas_cost = gas_price_wei * 300000
            if balance_bnb < estimated_gas_cost:
                raise Exception(f"{ErrorCode.GAS}: Недостаточно BNB для газа: {from_units(balance_bnb, 18)} < {from_units(estimated_gas_cost, 18)}")
        
        # 3. Проверка резервов пула
        price, r_plex, r_usdt, _ = self.get_price_and_reserves()
        if r_plex == 0 or r_usdt == 0:
            raise Exception(f"{ErrorCode.SAFETY}: Пустые резервы пула")
        
        # 4. Проверка лимитов
        amount_plex = float(Decimal(amount_in_raw) / Decimal(10**9))
        can_sell, reason = self.limits_manager.can_sell(
            amount_plex, 
            limits.get('max_per_tx_plex', DEFAULT_LIMITS['max_per_tx_plex']),
            limits.get('max_daily_plex', DEFAULT_LIMITS['max_daily_plex']),
            limits.get('max_sales_per_hour', DEFAULT_LIMITS['max_sales_per_hour'])
        )
        if not can_sell:
            raise Exception(f"{ErrorCode.LIMIT}: {reason}")
        
        # 5. Проверка whitelist адресов (без привязки к порядку)
        t0, t1 = eth_call_pair_tokens(self._client_call, PAIR_ADDRESS)
        pair_tokens = {t0.lower(), t1.lower()}
        expected_tokens = {SAFETY_WHITELIST['PLEX'], SAFETY_WHITELIST['USDT']}
        if pair_tokens != expected_tokens:
            raise Exception(f"{ErrorCode.SAFETY}: Неверные токены в паре: {t0}, {t1}. Ожидались: PLEX, USDT")
        
        self.log(f'✅ Все preflight проверки пройдены')
    
    def _send_swap_tx(self, owner: str, pk: str, amount_in_raw: int, min_out_raw: int, 
                     deadline_ts: int, gas_price_wei: int, nonce: int) -> str:
        """Отправка swap транзакции"""
        path = [PLEX, USDT]
        data = encode_swap_exact_tokens_supporting(amount_in_raw, min_out_raw, path, owner, deadline_ts)
        tx = {
            'to': PANCAKE_V2_ROUTER,
            'value': 0,
            'data': data,
            'chainId': BSC_CHAIN_ID,
            'gasPrice': gas_price_wei,
            'nonce': nonce
        }
        gas = self.estimate_gas({'from': owner, **tx})
        tx['gas'] = gas
        signed = Account.from_key(pk).sign_transaction(tx)
        txh = self.send_raw(signed.rawTransaction)
        self.log(f"✅ Swap tx sent: {txh}")
        return txh

# -----------------------------
# UI (PyQt5)
# -----------------------------

from PyQt5 import QtCore, QtGui, QtWidgets

DARK_QSS = """
* { font-family: "Segoe UI", "Inter", Arial; }
QWidget { background-color: #0f1115; color: #e6e6e6; }
QLineEdit, QComboBox, QSpinBox, QDoubleSpinBox, QTextEdit, QPlainTextEdit {
    background: #151923; border: 1px solid #262b36; padding: 6px; border-radius: 10px; color: #e6e6e6;
}
QPushButton {
    background-color: #2a3242; border: 1px solid #394257; padding: 8px 12px; border-radius: 12px; color: #e6e6e6;
}
QPushButton:hover { background-color: #354058; }
QPushButton:pressed { background-color: #1e2430; }
QGroupBox { border: 1px solid #1e2430; border-radius: 12px; margin-top: 12px; }
QGroupBox::title { subcontrol-origin: margin; left: 8px; padding: 0 6px; color: #8ab4ff; }
QTabWidget::pane { border: 1px solid #232838; border-radius: 12px; }
QTabBar::tab { background: #151923; padding: 8px 12px; border: 1px solid #232838; border-bottom: none; border-top-left-radius: 10px; border-top-right-radius: 10px; }
QTabBar::tab:selected { background: #1a1f2b; color: #ffffff; }
QLabel[accent="true"] { color: #8ab4ff; }
/* ---- Chips for status bar ---- */
QLabel[chip="true"] {
    padding: 2px 8px; border-radius: 10px; font-weight: 600;
    border: 1px solid #2a3242; color: #e6e6e6; background: #1a1f2b;
}
QLabel[chip="true"][level="ok"]   { background: #143d2a; border-color:#1e8746; color:#a5e5c2; }
QLabel[chip="true"][level="warn"] { background: #3d2f14; border-color:#b8891e; color:#ffd691; }
QLabel[chip="true"][level="err"]  { background: #3d1414; border-color:#d33;    color:#ffb3b3; }
QLabel[chip="true"][level="muted"]{ background: #1a1f2b; border-color:#2a3242; color:#9aa4b2; }
"""

def human(ts: int) -> str:
    return time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(ts))


# ===== БЕЗОПАСНОСТЬ: Менеджер nonce =====
class NonceManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._current_nonce = None
        self._pending_tx = None
        self._last_sent_nonce = None
        self._last_sent_gas_price = None
        self._last_tx_hash = None
        
    def get_nonce(self, core, address):
        """Получает актуальный nonce с учетом pending транзакций"""
        with self._lock:
            try:
                # Получаем nonce в зависимости от режима
                if core.mode == RpcMode.NODE:
                    network_nonce = core.node_w3.eth.get_transaction_count(address, 'pending')
                else:
                    network_nonce = core.proxy.eth_getTransactionCount(address, 'pending')
                
                if self._current_nonce is None or network_nonce > self._current_nonce:
                    self._current_nonce = network_nonce
                return self._current_nonce
            except Exception as e:
                raise Exception(f"Ошибка получения nonce: {e}")
    
    def reserve_nonce(self, nonce):
        """Резервирует nonce для транзакции"""
        with self._lock:
            if self._pending_tx is not None:
                raise Exception("Уже есть активная транзакция")
            self._pending_tx = nonce
            return nonce
    
    def release_nonce(self, success: bool = True):
        """Освобождает зарезервированный nonce"""
        with self._lock:
            self._pending_tx = None
            # Инкрементируем локальный nonce только если транзакция реально отправлена
            if success and self._current_nonce is not None:
                self._current_nonce += 1
    
    def has_pending(self):
        """Проверяет, есть ли активная транзакция"""
        with self._lock:
            return self._pending_tx is not None
    
    def record_sent_tx(self, nonce, gas_price, tx_hash):
        """Записывает данные отправленной транзакции"""
        with self._lock:
            self._last_sent_nonce = nonce
            self._last_sent_gas_price = gas_price
            self._last_tx_hash = tx_hash
    
    def get_last_sent_data(self):
        """Получает данные последней отправленной транзакции"""
        with self._lock:
            return self._last_sent_nonce, self._last_sent_gas_price, self._last_tx_hash

# ===== БЕЗОПАСНОСТЬ: Авто-поток с offline-устойчивостью =====
class AutoSellerThread(QtCore.QThread):
    status = QtCore.pyqtSignal(str)
    tick = QtCore.pyqtSignal(dict)
    gas = QtCore.pyqtSignal(int)  # Сигнал для обновления газа в статус-баре
    alert = QtCore.pyqtSignal(str, str)  # Сигнал для показа модалок (заголовок, текст)
    sold  = QtCore.pyqtSignal()  # ✚ сигнал «продажа завершена» для авто-обновления балансов

    def __init__(self, core, address, pk, 
                 use_target_price: bool, target_price: Decimal,
                 interval_sec: int, amount_per_sell: Decimal, max_sells: int, catch_up: bool,
                 slippage_pct: float, deadline_min: int, gas_gwei: float,
                 price_check_interval_sec: int, cooldown_between_sells_sec: int, slow_tick_interval: int, ui=None):
        super().__init__()
        self.core = core
        self.address = address
        self.pk = pk
        self.use_target = use_target_price
        self.target_price = target_price
        self.interval_sec = max(5, interval_sec)
        self.amount_per_sell = amount_per_sell
        self.max_sells = max_sells
        self.catch_up = catch_up
        self.slippage_pct = slippage_pct
        self.deadline_min = deadline_min
        self.gas_gwei = gas_gwei
        self.price_check_interval_sec = max(2, price_check_interval_sec)
        self.cooldown_between_sells_sec = cooldown_between_sells_sec
        self.slow_tick_interval = slow_tick_interval
        self.ui = ui  # Ссылка на UI для получения лимитов
        
        # Таймеры для интервалов
        self.last_price_check_ts = 0
        self._next_sell_ts = 0
        self._done = 0
        self.last_successful_sell_ts = 0
        self.paused = False
        self.stop_after_next = False
        self._stop_flag = False
        self.ui_active = True  # ОПТИМИЗАЦИЯ: Флаг активности UI
        self.auto_on = False   # ОПТИМИЗАЦИЯ: Флаг авто-режима
        self.paused = False    # АВТОПАУЗА: Флаг паузы после модалки
        # ---- P0 Autopause counters ----
        self._fail_streak = 0
        self._last_autopause_reason = ""

    @QtCore.pyqtSlot()
    def resume(self):
        """Возобновляет автопродажу после паузы"""
        self.paused = False
        self.status.emit("▶ Автопродажа возобновлена")

    def pause(self, reason: str = ""):
        """Ставит автопродажу на паузу"""
        self.paused = True
        if reason:
            self.status.emit(f"⏸ Автопродажа на паузе: {reason}")

    def run(self):
        """Основной цикл авто-продажи с двумя режимами"""
        mode = "Smart (target price)" if self.use_target else "Interval"
        self.status.emit(f"▶ Автопродажа запущена в режиме {mode}. Проверка каждые {self.price_check_interval_sec} сек")
        
        while not self._stop_flag:
            try:
                # Проверяем флаг остановки в начале каждой итерации
                if self._stop_flag:
                    break
                    
                # Пауза — «заморозка» цикла с мягким слипом
                if self.paused:
                    time.sleep(0.25)
                    continue
                
                # ОПТИМИЗАЦИЯ: Не дергаем сеть в фоне еще экономнее
                if not self.ui_active and not self.auto_on:
                    time.sleep(max(1, self.slow_tick_interval))
                    continue
                
                now = int(time.time())
                
                # Баланс/цена/резервы — показываем в UI
                try:
                    price, rplex, rusdt, _ = self.core.get_price_and_reserves()
                    self.tick.emit({'price': str(price), 'rplex': rplex, 'rusdt': rusdt})
                except Exception as e:
                    self.status.emit(f"⚠ price/reserves error: {e}")
                    time.sleep(5)
                    continue
                
                # Общий кулдаун для обоих режимов
                if self.cooldown_between_sells_sec > 0:
                    since = now - self.last_successful_sell_ts
                    if self.last_successful_sell_ts and since < self.cooldown_between_sells_sec:
                        leftover = max(0, self.cooldown_between_sells_sec - since)
                        # Обратный отсчёт кулдауна в статус
                        self.status.emit(f"⏳ Cooldown: {leftover}s")
                        time.sleep(min(leftover, self.price_check_interval_sec, 1))
                        continue
                
                # ---- P0: auto pre-check to decide pause/sell
                try:
                    owner = self.address
                    amt_raw = to_units(Decimal(str(self.amount_per_sell if not self.use_target else self.amount_plex)), 9) if hasattr(self, 'amount_per_sell') else 0
                    gas_wei = self.core.current_gas_price(self.core.gas_floor_wei, True)
                    limits = getattr(self, 'limits', DEFAULT_LIMITS)
                    pc = self.core.precheck_summary(owner, int(amt_raw), gas_wei,
                                                    user_slippage_pct=float(getattr(self, 'slippage_pct', 0.5)),
                                                    deadline_min=int(getattr(self, 'deadline_min', 20)),
                                                    limits=limits)
                    hard_block = (not pc["min_out"]["ok"]) or (not pc["bnb_gas"]["ok"]) or (not pc["pair_ok"]["ok"]) \
                                 or (not pc["limits"]["ok"]) or (not pc["impact"]["ok"]) or (not pc["reserves"]["ok"])
                    if hard_block:
                        self._fail_streak += 1
                        # детальное объяснение причины
                        if not pc["min_out"]["ok"]:
                            reason = "нет ликвидности (minOut=0)"
                        elif not pc["bnb_gas"]["ok"]:
                            reason = "BNB на газ"
                        elif not pc["pair_ok"]["ok"]:
                            reason = "неверная пара"
                        elif not pc["limits"]["ok"]:
                            reason = f"лимиты: {pc['limits']['msg']}"
                        elif not pc["impact"]["ok"]:
                            reason = f"impact {pc['impact']['pct']:.2f}% > {DEFAULT_LIMITS['max_price_impact_pct']}%"
                        else:
                            rs = pc.get('reserves', {})
                            reason = ("низкие резервы "
                                      f"(PLEX {rs.get('plex',0):.3f}/{rs.get('min_plex',0):.3f}, "
                                      f"USDT {rs.get('usdt',0):.3f}/{rs.get('min_usdt',0):.3f})")
                        if self._fail_streak >= 2:
                            self.paused = True
                            self._last_autopause_reason = reason
                            self.status.emit(f"⏸ Автопауза: {reason}")
                            # подробный лог для оператора
                            try:
                                self.core.log(f"🛑 AutoPause | {reason} | "
                                              f"allow={pc['allowance']['ok']} "
                                              f"bnb_ok={pc['bnb_gas']['ok']} "
                                              f"impact={pc['impact']['pct']:.2f}% "
                                              f"res={pc.get('reserves',{})}")
                            except Exception:
                                pass
                            self.alert.emit("Автопауза", f"Причина: {reason}\nПровалов подряд: {self._fail_streak}")
                            continue
                    else:
                        self._fail_streak = 0
                except Exception:
                    pass
                
                if self.use_target:
                    # SMART: продаём только если цена достигла цели
                    if price and self.target_price and price >= self.target_price:
                        self.status.emit(f"🎯 Цена достигла цели: {price} >= {self.target_price}")
                        self._execute_one_sell(self.amount_per_sell)
                    else:
                        self.status.emit(f"⏳ Ожидание цены: {price} < {self.target_price}")
                else:
                    # INTERVAL: продаём по таймеру
                    if self._should_sell_by_interval(now):
                        self.status.emit(f"⏰ Интервал достигнут, продаем {self.amount_per_sell} PLEX")
                        self._execute_one_sell(self.amount_per_sell)
                    else:
                        next_sell = self._next_sell_ts - now if self._next_sell_ts > 0 else self.interval_sec
                        self.status.emit(f"⏳ Следующая продажа через {next_sell} сек")
                
                # лимит количества продаж
                if self.max_sells > 0 and self._done >= self.max_sells:
                    self.status.emit("✅ Interval limit reached. Auto stopped.")
                    break
                
                # ОПТИМИЗАЦИЯ: Адаптивная частота опроса
                base_poll = max(2, self.price_check_interval_sec)
                # Используем настраиваемый интервал для медленного тика (из снимка)
                slow = (self.slow_tick_interval if (not self.ui_active and not self.auto_on) else base_poll)
                time.sleep(slow)
                
            except Exception as e:
                self.status.emit(f"❌ Auto error: {e}")
                time.sleep(5)
        
        self.status.emit("⏹ Автопродажа остановлена")
    
    def stop(self):
        """Останавливает авто-поток"""
        self._stop_flag = True

    def _should_sell_by_interval(self, now: int) -> bool:
        """Проверяет, нужно ли продавать по интервалу"""
        if self._next_sell_ts == 0:
            self._next_sell_ts = now + self.interval_sec
            return False
        if now >= self._next_sell_ts:
            # планировать следующую
            if self.catch_up:
                # шагами по interval_sec (чтобы «догонять»)
                while self._next_sell_ts <= now:
                    self._next_sell_ts += self.interval_sec
            else:
                self._next_sell_ts = now + self.interval_sec
            return True
        return False

    def _execute_one_sell(self, amount_plex: Decimal):
        """Выполняет одну продажу с безопасными проверками"""
        if amount_plex <= 0:
            self.status.emit("⚠ Skip: amount ≤ 0")
            return
        
        try:
            # 1) расчёт amount_in_raw
            plex_raw = to_units(amount_plex, 9)
            
            # 2) оценка выхода и minOut (через getAmountsOut, фоллбэк — резервы)
            try:
                expected_out = get_amounts_out(self.core, plex_raw, [PLEX, USDT])
            except Exception as e:
                self.status.emit(f"⚠ getAmountsOut fail, fallback: {e}")
                price, rplex, rusdt, is_t0 = self.core.get_price_and_reserves()
                expected_out = uni_v2_amount_out(plex_raw, rplex, rusdt, 25)
            
            # БЕЗОПАСНОСТЬ: Добавляем safety_slippage_bonus как в ручной продаже
            safety = Decimal(DEFAULT_LIMITS['safety_slippage_bonus']) / Decimal(100)
            final_min_out = max(int(Decimal(expected_out) * (Decimal(1) - Decimal(self.slippage_pct/100) - safety)), 1)
            
            # 3) дедлайн и газ
            deadline = int(time.time()) + self.deadline_min * 60
            use_net = getattr(self, "use_network_gas", True)  # Потокобезопасно из снимка
            gas_price = self.core.current_gas_price(
                to_wei_gwei(self.gas_gwei),
                use_network_gas=use_net
            )
            
            # Потокобезопасное обновление статус-бара через сигнал
            self.gas.emit(gas_price)
            
            # 4) безопасная продажа через core
            self.status.emit(f"▶ selling {amount_plex} PLEX, minOut={final_min_out}")
            
            # Получаем лимиты из снимка (потокобезопасно)
            limits = getattr(self, "limits", {})
            
            # Выполняем безопасную продажу
            txh = self.core.safe_sell_now(
                self.address, self.pk, plex_raw, final_min_out, gas_price, 
                limits, self.deadline_min
            )
            
            self.status.emit(f"✅ sold: {txh}")
            self._done += 1
            self.last_successful_sell_ts = int(time.time())
            # ✚ уведомляем UI об успешной продаже — обновить балансы
            self.sold.emit()
            
            # Если запрошен "стоп после следующей" — выходим из цикла
            if self.stop_after_next:
                self.auto_on = False
                self.status.emit("⏹ Авто: остановлено после следующей продажи")
                return
            
            # ОПТИМИЗАЦИЯ: Помечаем балансы как "грязные" для ленивой перерисовки
            if hasattr(self, 'ui') and self.ui:
                self.ui._dirty_balances = True
            
        except Exception as e:
            self.status.emit(f"❌ Sell failed: {e}")
            self.alert.emit("Продажа не выполнена",
                          "Сделка не прошла после 5 попыток.\n"
                          "Проверьте соединение/газ и при необходимости отмените застрявшую TX.")
            self.pause("ожидание действия оператора")  # ✚ ставим на паузу

# ===== UI АРХИТЕКТУРА: Константы и настройки =====
LAYOUT_VERSION = 1
DEFAULT_UI_SCALE = 1.0
MIN_UI_SCALE = 0.5
MAX_UI_SCALE = 3.0
UI_SCALE_STEP = 0.1

# Брейкпоинты для адаптивности
BREAKPOINT_WIDE = 1200  # Широкие экраны - две колонки
BREAKPOINT_NARROW = 900  # Узкие экраны - табы и скроллы

# ===== ПОТОКОБЕЗОПАСНЫЙ ЛОГГЕР =====
class UiLogger(QtCore.QObject):
    """Потокобезопасный логгер для UI"""
    sig_log = QtCore.pyqtSignal(str)
    
    def __init__(self, text_widget=None):
        super().__init__()
        self.text_widget = text_widget
    
    def write(self, message: str):
        """Всегда шлём сообщение сигналом, UI добавляет текст в главном потоке"""
        timestamp = time.strftime('%H:%M:%S')
        formatted_message = f"[{timestamp}] {message}"
        # если нет подписчика (на всякий случай) — дублируем в stdout
        try:
            self.sig_log.emit(formatted_message)
        except Exception:
            print(formatted_message)

# ---- Кликабельная метка (для копирования) ----
class ClickableLabel(QtWidgets.QLabel):
    clicked = QtCore.pyqtSignal()
    rightClicked = QtCore.pyqtSignal(QtCore.QPoint)
    def mouseReleaseEvent(self, e: QtGui.QMouseEvent):
        if e.button() == QtCore.Qt.LeftButton:
            self.clicked.emit()
        super().mouseReleaseEvent(e)
    def contextMenuEvent(self, e: QtGui.QContextMenuEvent):
        self.rightClicked.emit(e.globalPos())
        super().contextMenuEvent(e)

# ===== БЕЗОПАСНОСТЬ: Система лимитов =====
class LimitsManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._daily_plex = 0.0
        self._hourly_sales = 0
        self._last_reset_daily = time.time()
        self._last_reset_hourly = time.time()
        
    def reset_if_needed(self):
        """Сбрасывает лимиты при необходимости"""
        with self._lock:
            now = time.time()
            
            # Сброс дневного лимита
            if now - self._last_reset_daily >= 86400:  # 24 часа
                self._daily_plex = 0.0
                self._last_reset_daily = now
            
            # Сброс часового лимита
            if now - self._last_reset_hourly >= 3600:  # 1 час
                self._hourly_sales = 0
                self._last_reset_hourly = now
    
    def can_sell(self, amount_plex, max_per_tx, max_daily, max_hourly):
        """Проверяет, можно ли выполнить продажу"""
        self.reset_if_needed()
        
        with self._lock:
            # Проверка лимита за транзакцию
            if amount_plex > max_per_tx:
                return False, f"Превышен лимит за транзакцию: {amount_plex} > {max_per_tx}"
            
            # Проверка дневного лимита
            if self._daily_plex + amount_plex > max_daily:
                return False, f"Превышен дневной лимит: {self._daily_plex + amount_plex} > {max_daily}"
            
            # Проверка часового лимита
            if self._hourly_sales >= max_hourly:
                return False, f"Превышен часовой лимит продаж: {self._hourly_sales} >= {max_hourly}"
            
            return True, "OK"
    
    def record_sale(self, amount_plex):
        """Записывает выполненную продажу"""
        with self._lock:
            self._daily_plex += amount_plex
            self._hourly_sales += 1


class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("PLEX Автопродажа — Адаптивный UI")
        
        # UI масштабирование
        self.ui_scale = DEFAULT_UI_SCALE
        self.base_point_size = QtWidgets.QApplication.font().pointSizeF()
        self.current_breakpoint = None
        
        # ОПТИМИЗАЦИЯ: Настройки для медленного тика в фоне
        self.settings = QtCore.QSettings("PLEX", "AutoSell")
        self.slow_tick_interval = self.settings.value("slow_tick_interval", 15, type=int)
        
        # Потокобезопасный логгер (создаем ДО восстановления настроек)
        # Временно создаем пустой логгер, инициализируем после создания виджетов
        self.ui_logger = None
        
        # Статус-бар
        self.status_network = None
        self.status_gas = None
        self.status_price = None
        self.status_auto = None
        # Запоминаем последние значения для компактного режима
        self._last_net = "Не подключено"
        self._last_gas = None
        self._last_price = None
        self._last_auto = False
        self.compact_status = False
        # Последний результат предварительной проверки (для экспорта)
        self._last_precheck: dict | None = None
        
        # Настройка размера окна (80% экрана)
        screen = QtWidgets.QApplication.primaryScreen().availableGeometry()
        self.resize(int(screen.width() * 0.8), int(screen.height() * 0.8))
        
        self.setStyleSheet(DARK_QSS)
        
        # Включаем nested docks
        self.setDockNestingEnabled(True)

        self.core: TradingCore | None = None
        self.addr: str | None = None
        self.pk: str | None = None
        self.autoseller: AutoSellerThread | None = None
        
        # Состояние профилей (инициализируем после создания UI)
        self._profiles = {}

        # Создаем современную архитектуру UI
        self._create_dock_widgets()
        self._create_central_area()
        self._create_status_bar()
        self._create_menu_bar()
        self._setup_shortcuts()
        # Таймер автопроверки (дебаунс)
        self.precheck_timer = QtCore.QTimer(self)
        self.precheck_timer.setSingleShot(True)
        self.precheck_timer.timeout.connect(self._auto_precheck)
        
        # Инициализируем логгер после создания виджетов
        self.ui_logger = UiLogger(self.logger)
        # Все логи в UI — только через сигнал:
        self.ui_logger.sig_log.connect(self._on_log_message)
        
        # Таймер для RPC-статистики
        self.rpc_timer = QtCore.QTimer(self)
        self.rpc_timer.timeout.connect(self._refresh_rpc_stats)
        self.rpc_timer.start(2000)
        
        # Теперь можно безопасно восстановить настройки (виджеты уже есть)
        self._restore_settings()
        
        # Восстанавливаем сохраненную раскладку
        self._restore_layout()

        # Загружаем профили после создания UI
        self._profiles_load_all()

        # Pre-fill defaults
        self._fill_defaults()
        
        # Настраиваем обработчики для переключения режимов
        self._setup_mode_handlers()
        # Автопроверка при изменении ключевых полей
        self._wire_precheck_triggers()
        
        # ОПТИМИЗАЦИЯ: Throttling для UI обновлений
        self._last_refresh_ts = 0
        self._last_balances_ts = 0
        self._dirty_balances = True  # Ленивая перерисовка балансов
        
        # ОПТИМИЗАЦИЯ: Адаптивная частота опроса
        self.installEventFilter(self)
        # Первая автопроверка (если уже есть соединение)
        self._schedule_precheck(10)
        # Если есть сохранённые размеры центральной панели — восстановим
        self._restore_center_columns()

    def _create_dock_widgets(self):
        """Создает все док-виджеты для панелей"""
        # Левые доки (операционные панели)
        self._create_connection_dock()
        self._create_wallet_dock()
        self._create_balances_dock()
        
        # Правые доки (торговые панели)
        self._create_trading_dock()
        self._create_precheck_dock()   # ✚ новый док: Предварительная проверка сделки
        self._create_safety_dock()
        self._create_live_info_dock()
        
        # Нижние доки (логи и информация)
        self._create_logs_dock()
        self._create_operator_log_dock()
        
        # RPC-статистика док
        self._create_rpc_stats_dock()

    def _create_connection_dock(self):
        """Создает док для панели подключения"""
        self.connection_dock = QtWidgets.QDockWidget("Подключение", self)
        self.connection_dock.setObjectName("connection_dock")
        self.connection_dock.setAllowedAreas(QtCore.Qt.LeftDockWidgetArea | QtCore.Qt.RightDockWidgetArea)
        self.connection_dock.setFeatures(QtWidgets.QDockWidget.DockWidgetMovable | 
                                       QtWidgets.QDockWidget.DockWidgetFloatable | 
                                       QtWidgets.QDockWidget.DockWidgetClosable)
        
        # Создаем содержимое панели подключения
        connection_widget = QtWidgets.QWidget()
        layout = QtWidgets.QGridLayout(connection_widget)

        # Backend choice
        self.mode_node = QtWidgets.QRadioButton("Node RPC")
        self.mode_proxy = QtWidgets.QRadioButton("EnterScan (Multichain API)")
        self.mode_node.setToolTip("Прямое подключение к HTTP RPC узлу (WRITE/READ). READ-пулы дублируются через BSC dataseed.")
        self.mode_proxy.setToolTip("Прокси JSON-RPC через *Scan API (module=proxy): экономит WRITE, годится для READ и отправки raw TX.")
        layout.addWidget(self.mode_node, 0, 0)
        layout.addWidget(self.mode_proxy, 0, 1)

        self.node_url = QtWidgets.QLineEdit()
        self.node_url.setPlaceholderText("Node HTTP RPC URL (например, QuickNode HTTP)")
        self.node_url.setToolTip("Ваш приватный HTTP RPC endpoint. Используется для отправки транзакций (WRITE).")
        layout.addWidget(QtWidgets.QLabel("Node HTTP:"), 1, 0)
        layout.addWidget(self.node_url, 1, 1, 1, 3)

        self.proxy_url = QtWidgets.QLineEdit()
        self.proxy_url.setPlaceholderText("EnterScan API URL")
        self.proxy_url.setToolTip("BscScan/EnterScan-совместимый endpoint, например: https://api.bscscan.com/api")
        layout.addWidget(QtWidgets.QLabel("EnterScan API URL:"), 2, 0)
        layout.addWidget(self.proxy_url, 2, 1, 1, 3)

        self.proxy_keys = QtWidgets.QLineEdit()
        self.proxy_keys.setPlaceholderText("EnterScan API ключи (через запятую)")
        self.proxy_keys.setToolTip("Ключи API через запятую; будут ротироваться при 429/5xx.")
        layout.addWidget(QtWidgets.QLabel("EnterScan API ключи:"), 3, 0)
        layout.addWidget(self.proxy_keys, 3, 1, 1, 3)
        
        # Профили подключений
        prof_layout = QtWidgets.QHBoxLayout()
        self.profile_combo = QtWidgets.QComboBox()
        self.profile_name = QtWidgets.QLineEdit()
        self.profile_name.setPlaceholderText("Имя профиля")
        btn_prof_save = QtWidgets.QPushButton("Сохранить")
        btn_prof_del  = QtWidgets.QPushButton("Удалить")
        btn_prof_load = QtWidgets.QPushButton("Загрузить")
        btn_prof_save.clicked.connect(self._profile_save_current)
        btn_prof_del.clicked.connect(self._profile_delete_current)
        btn_prof_load.clicked.connect(lambda: self._profile_apply(self.profile_combo.currentText()))
        prof_layout.addWidget(self.profile_combo)
        prof_layout.addWidget(self.profile_name)
        prof_layout.addWidget(btn_prof_save)
        prof_layout.addWidget(btn_prof_del)
        prof_layout.addWidget(btn_prof_load)
        layout.addLayout(prof_layout, 4, 0, 1, 4)
        
        self.connection_dock.setWidget(connection_widget)
        self.addDockWidget(QtCore.Qt.LeftDockWidgetArea, self.connection_dock)

    def _create_wallet_dock(self):
        """Создает док для панели кошелька"""
        self.wallet_dock = QtWidgets.QDockWidget("Кошелек", self)
        self.wallet_dock.setObjectName("wallet_dock")
        self.wallet_dock.setAllowedAreas(QtCore.Qt.LeftDockWidgetArea | QtCore.Qt.RightDockWidgetArea)
        self.wallet_dock.setFeatures(QtWidgets.QDockWidget.DockWidgetMovable | 
                                   QtWidgets.QDockWidget.DockWidgetFloatable | 
                                   QtWidgets.QDockWidget.DockWidgetClosable)
        
        wallet_widget = QtWidgets.QWidget()
        layout = QtWidgets.QGridLayout(wallet_widget)
        
        self.pk_input = QtWidgets.QLineEdit()
        self.pk_input.setEchoMode(QtWidgets.QLineEdit.Password)
        self.pk_input.setPlaceholderText("Приватный ключ (0x...) или seed-фраза (12/24 слова)")
        self.pk_input.setToolTip("Вводится локально. Используйте 0x-ключ либо сид-фразу (12/24 слов). Ничего не отправляется в сеть.")
        layout.addWidget(QtWidgets.QLabel("Секретный ключ:"), 0, 0)
        layout.addWidget(self.pk_input, 0, 1, 1, 3)

        self.path_input = QtWidgets.QLineEdit("m/44'/60'/0'/0/0")
        self.path_input.setToolTip("BIP-44 путь деривации. По умолчанию m/44'/60'/0'/0/0")
        layout.addWidget(QtWidgets.QLabel("Путь деривации:"), 1, 0)
        layout.addWidget(self.path_input, 1, 1)

        self.addr_label = ClickableLabel("Адрес: —")
        self.addr_label.setProperty("accent", True)
        self.addr_label.setToolTip("Нажмите, чтобы скопировать адрес")
        self.addr_label.clicked.connect(lambda: self._copy(self.addr or "", "Адрес скопирован"))
        self.addr_label.rightClicked.connect(self._address_context_menu)
        # Сжимаем span и добавляем кнопку ⧉
        layout.addWidget(self.addr_label, 1, 2, 1, 1)
        self.addr_copy_btn = self._copy_button(lambda: self._copy(self.addr or "", "Адрес скопирован"))
        layout.addWidget(self.addr_copy_btn, 1, 3)

        self.btn_connect = QtWidgets.QPushButton("Подключить")
        self.btn_connect.clicked.connect(self.on_connect)
        self.btn_connect.setToolTip("Подключить кошелёк и сеть, выполнить стартовые проверки безопасности.")
        # ✚ кнопка самопроверки связи
        self.btn_selftest = QtWidgets.QPushButton("Тест связи")
        self.btn_selftest.setToolTip("ChainId, ping узлов, decimals, резервы пары — быстрый self-test")
        self.btn_selftest.clicked.connect(self.on_self_test)
        # ✚ кнопка обновления балансов
        self.btn_refresh = QtWidgets.QPushButton("Обновить")
        self.btn_refresh.clicked.connect(self.on_refresh)
        self.btn_refresh.setToolTip("Обновить PLEX/USDT/BNB и текущую цену/резервы.")
        layout.addWidget(self.btn_connect, 2, 1)
        layout.addWidget(self.btn_selftest, 2, 2)
        layout.addWidget(self.btn_refresh, 2, 3)
        
        # Оффлайн-режим и очистка секрета
        self.offline_only_cb = QtWidgets.QCheckBox("Только оффлайн-подпись")
        self.offline_only_cb.toggled.connect(self._on_offline_only_toggled)
        self.offline_only_cb.setToolTip("Запрещает отправку транзакций через Proxy. Только Node RPC.")
        layout.addWidget(self.offline_only_cb, 3, 0, 1, 2)
        
        btn_clear_secret = QtWidgets.QPushButton("Очистить секрет")
        btn_clear_secret.clicked.connect(self.pk_input.clear)
        btn_clear_secret.setToolTip("Очищает поле секретного ключа для безопасности.")
        layout.addWidget(btn_clear_secret, 3, 2, 1, 1)
        # ✚ Watch-only (только чтение)
        self.watch_only_cb = QtWidgets.QCheckBox("Watch-only (только чтение)")
        self.watch_only_cb.setToolTip("Подключение только адреса без секрета. Доступны READ/пред-проверки, продажи и approve недоступны.")
        layout.addWidget(self.watch_only_cb, 3, 3, 1, 1)
        
        self.wallet_dock.setWidget(wallet_widget)
        self.addDockWidget(QtCore.Qt.LeftDockWidgetArea, self.wallet_dock)

    def _create_balances_dock(self):
        """Создает док для панели балансов"""
        self.balances_dock = QtWidgets.QDockWidget("Балансы", self)
        self.balances_dock.setObjectName("balances_dock")
        self.balances_dock.setAllowedAreas(QtCore.Qt.LeftDockWidgetArea | QtCore.Qt.RightDockWidgetArea)
        self.balances_dock.setFeatures(QtWidgets.QDockWidget.DockWidgetMovable | 
                                     QtWidgets.QDockWidget.DockWidgetFloatable | 
                                     QtWidgets.QDockWidget.DockWidgetClosable)
        
        balance_widget = QtWidgets.QWidget()
        layout = QtWidgets.QGridLayout(balance_widget)
        
        self.balance_plex = QtWidgets.QLabel("PLEX: —")
        self.balance_usdt = QtWidgets.QLabel("USDT: —")
        self.balance_bnb = QtWidgets.QLabel("BNB: —")
        self.balance_plex.setProperty("accent", True)
        self.balance_usdt.setProperty("accent", True)
        self.balance_bnb.setProperty("accent", True)
        
        layout.addWidget(self.balance_plex, 0, 0)
        layout.addWidget(self.balance_usdt, 0, 1)
        layout.addWidget(self.balance_bnb, 0, 2)
        
        self.btn_refresh_balances = QtWidgets.QPushButton("Обновить все балансы")
        self.btn_refresh_balances.clicked.connect(self.on_refresh_all_balances)
        layout.addWidget(self.btn_refresh_balances, 1, 0, 1, 3)
        
        self.balances_dock.setWidget(balance_widget)
        self.addDockWidget(QtCore.Qt.LeftDockWidgetArea, self.balances_dock)

    def _create_trading_dock(self):
        """Создает док для панели торговли"""
        self.trading_dock = QtWidgets.QDockWidget("Параметры торговли", self)
        self.trading_dock.setObjectName("trading_dock")
        self.trading_dock.setAllowedAreas(QtCore.Qt.LeftDockWidgetArea | QtCore.Qt.RightDockWidgetArea)
        self.trading_dock.setFeatures(QtWidgets.QDockWidget.DockWidgetMovable | 
                                    QtWidgets.QDockWidget.DockWidgetFloatable | 
                                    QtWidgets.QDockWidget.DockWidgetClosable)
        
        # Создаем скроллируемую область для торговых параметров
        scroll_area = QtWidgets.QScrollArea()
        scroll_area.setWidgetResizable(True)
        # В доке оставим как было (резайзится внутри дока). В центральной панели
        # позже заберём ВНУТРЕННИЙ виджет без скролла.
        scroll_area.setHorizontalScrollBarPolicy(QtCore.Qt.ScrollBarAlwaysOff)
        scroll_area.setVerticalScrollBarPolicy(QtCore.Qt.ScrollBarAsNeeded)
        
        trading_widget = QtWidgets.QWidget()
        layout = QtWidgets.QGridLayout(trading_widget)

        # Trade params
        self.amount_plex = QtWidgets.QDoubleSpinBox()
        self.amount_plex.setDecimals(9)
        self.amount_plex.setMaximum(1_000_000_000)
        self.amount_plex.setMinimum(0.0)
        self.amount_plex.setToolTip("Сколько PLEX продать при ручной продаже или в Smart-режиме.")
        self.slippage = QtWidgets.QDoubleSpinBox()
        self.slippage.setDecimals(2)
        self.slippage.setSuffix(" %")
        self.slippage.setRange(0.0, 99.0)
        self.slippage.setToolTip("Слиппедж для РУЧНОЙ продажи (кнопка «Продать сейчас»).")
        self.gas_gwei = QtWidgets.QDoubleSpinBox()
        self.gas_gwei.setDecimals(3)
        self.gas_gwei.setRange(0.1, 1000.0)
        self.gas_gwei.setSuffix(" gwei")
        self.gas_gwei.setToolTip("Базовая цена газа. Если включён «Использовать сетевой газ», берётся максимум(ваше, сетевое) в пределах MIN/MAX.")
        
        # БЕЗОПАСНОСТЬ: Отдельное поле deadline
        self.deadline_min = QtWidgets.QSpinBox()
        self.deadline_min.setRange(1, 60)
        self.deadline_min.setSuffix(" мин")
        self.deadline_min.setValue(20)
        self.deadline_min.setToolTip("Время жизни сделки. По умолчанию 20 минут.")
        
        # БЕЗОПАСНОСТЬ: Отдельное поле slippage для безопасной продажи
        self.slippage_pct = QtWidgets.QDoubleSpinBox()
        self.slippage_pct.setDecimals(2)
        self.slippage_pct.setSuffix(" %")
        self.slippage_pct.setRange(0.1, 50.0)
        self.slippage_pct.setValue(0.5)
        self.slippage_pct.setToolTip("Слиппедж для АВТО-режима. Не влияет на ручную продажу.")
        
        # БЕЗОПАСНОСТЬ: Чекбокс "Использовать сетевой газ"
        self.use_network_gas = QtWidgets.QCheckBox("Использовать сетевой газ")
        self.use_network_gas.setChecked(True)
        self.use_network_gas.setToolTip("Взять актуальную цену газа из сети (с кэшем 15с) и применить к ней MIN/MAX лимиты.")
        
        # БЕЗОПАСНОСТЬ: Параметры авто-потока
        self.target_price = QtWidgets.QDoubleSpinBox()
        self.target_price.setDecimals(6)
        self.target_price.setRange(0.0, 1000.0)
        self.target_price.setSuffix(" USDT")
        self.target_price.setToolTip("Smart-режим: цена USDT за 1 PLEX, при достижении — продаём.")
        
        self.price_check_interval_sec = QtWidgets.QSpinBox()
        self.price_check_interval_sec.setRange(1, 300)
        self.price_check_interval_sec.setSuffix(" сек")
        self.price_check_interval_sec.setValue(5)
        self.price_check_interval_sec.setToolTip("Как часто опрашивать цену/резервы в авто-режиме.")
        
        self.cooldown_between_sales_sec = QtWidgets.QSpinBox()
        self.cooldown_between_sales_sec.setRange(0, 3600)
        self.cooldown_between_sales_sec.setSuffix(" сек")
        self.cooldown_between_sales_sec.setValue(0)
        self.cooldown_between_sales_sec.setToolTip("Пауза после успешной продажи. 0 = без паузы.")
        
        # ДВА РЕЖИМА АВТОПРОДАЖИ
        self.use_target_price = QtWidgets.QCheckBox("Использовать целевую цену (умный режим)")
        self.use_target_price.setChecked(True)  # по умолчанию включен умный режим
        self.use_target_price.setToolTip("ВКЛ: продавать при достижении целевой цены. ВЫКЛ: продавать по интервалу.")
        
        # Interval-режим параметры
        self.interval_sec = QtWidgets.QSpinBox()
        self.interval_sec.setRange(5, 86400)
        self.interval_sec.setValue(300)
        self.interval_sec.setSuffix(" сек")
        self.interval_sec.setToolTip("Интервал между продажами в Interval-режиме.")
        
        self.amount_per_sell = QtWidgets.QDoubleSpinBox()
        self.amount_per_sell.setDecimals(9)
        self.amount_per_sell.setRange(0.000000001, 1_000_000_000)
        self.amount_per_sell.setValue(1.0)
        self.amount_per_sell.setSuffix(" PLEX")
        self.amount_per_sell.setToolTip("Сколько PLEX продавать в каждую итерацию Interval-режима.")
        
        self.max_sells = QtWidgets.QSpinBox()
        self.max_sells.setRange(0, 1_000_000)
        self.max_sells.setValue(0)  # 0 = бесконечно
        self.max_sells.setSuffix(" продаж")
        self.max_sells.setToolTip("Лимит количества продаж (0 = без лимита).")
        
        self.catch_up = QtWidgets.QCheckBox("Догонять пропущенные интервалы")
        self.catch_up.setChecked(False)
        self.catch_up.setToolTip("Если приложение было неактивно — «догонять» пропущенные продажи шагами интервала.")
        
        # Добавляем поля в layout с objectName для надежного переключения режимов
        lbl_amount = QtWidgets.QLabel("Количество PLEX:"); lbl_amount.setObjectName("lbl_amount")
        layout.addWidget(lbl_amount, 0, 0)
        layout.addWidget(self.amount_plex, 0, 1)
        layout.addWidget(QtWidgets.QLabel("Слиппедж (%):"), 1, 0)
        layout.addWidget(self.slippage, 1, 1)
        layout.addWidget(self._info_button("Слиппедж для РУЧНОЙ продажи (кнопка «Продать сейчас»). Чем выше — тем легче пройдёт сделка, но выше риск проскальзывания."), 1, 2)
        layout.addWidget(QtWidgets.QLabel("Газ (gwei):"), 2, 0)
        layout.addWidget(self.gas_gwei, 2, 1)
        layout.addWidget(self._info_button("Базовая цена газа. При включённом «Использовать сетевой газ» берётся максимум(ваше, сетевое) в рамках MIN/MAX."), 2, 2)
        layout.addWidget(QtWidgets.QLabel("Дедлайн (мин):"), 3, 0)
        layout.addWidget(self.deadline_min, 3, 1)
        layout.addWidget(self._info_button("Время жизни сделки. Истёк дедлайн — своп отклонится."), 3, 2)
        layout.addWidget(QtWidgets.QLabel("Слиппедж для авто (%):"), 4, 0)
        layout.addWidget(self.slippage_pct, 4, 1)
        layout.addWidget(self._info_button("Слиппедж для АВТО-режима. Не влияет на кнопку «Продать сейчас»."), 4, 2)
        layout.addWidget(self.use_network_gas, 5, 0, 1, 2)
        # сохраняем ссылки на ярлыки, чтобы управлять видимостью без обхода грида
        self.lbl_target = QtWidgets.QLabel("Целевая цена (USDT):"); self.lbl_target.setObjectName("lbl_target")
        layout.addWidget(self.lbl_target, 6, 0)
        layout.addWidget(self.target_price, 6, 1)
        self.info_target = self._info_button("SMART-режим: при достижении этой цены (USDT за 1 PLEX) выполняется продажа.")
        self.info_target.setObjectName("info_target")
        layout.addWidget(self.info_target, 6, 2)
        layout.addWidget(QtWidgets.QLabel("Интервал проверки (сек):"), 7, 0)
        layout.addWidget(self.price_check_interval_sec, 7, 1)
        layout.addWidget(self._info_button("Как часто опрашивать цену/резервы в авто-режиме."), 7, 2)
        layout.addWidget(QtWidgets.QLabel("Кулдаун между продажами (сек):"), 8, 0)
        layout.addWidget(self.cooldown_between_sales_sec, 8, 1)
        layout.addWidget(self._info_button("Пауза после успешной продажи. 0 = без паузы."), 8, 2)
        
        # Разделитель для режимов автопродажи
        separator = QtWidgets.QFrame()
        separator.setFrameShape(QtWidgets.QFrame.HLine)
        separator.setFrameShadow(QtWidgets.QFrame.Sunken)
        layout.addWidget(separator, 9, 0, 1, 2)
        
        # Режимы автопродажи
        layout.addWidget(self.use_target_price, 10, 0, 1, 2)
        self.lbl_interval = QtWidgets.QLabel("Интервал (сек):"); self.lbl_interval.setObjectName("lbl_interval")
        layout.addWidget(self.lbl_interval, 11, 0)
        layout.addWidget(self.interval_sec, 11, 1)
        self.info_interval = self._info_button("INTERVAL-режим: продавать с заданной периодичностью.")
        self.info_interval.setObjectName("info_interval")
        layout.addWidget(self.info_interval, 11, 2)
        self.lbl_amount_per_sell = QtWidgets.QLabel("Количество за продажу (PLEX):"); self.lbl_amount_per_sell.setObjectName("lbl_amount_per_sell")
        layout.addWidget(self.lbl_amount_per_sell, 12, 0)
        layout.addWidget(self.amount_per_sell, 12, 1)
        self.info_amount_per_sell = self._info_button("INTERVAL-режим: объём PLEX в одной продаже.")
        self.info_amount_per_sell.setObjectName("info_amount_per_sell")
        layout.addWidget(self.info_amount_per_sell, 12, 2)
        self.lbl_max_sells = QtWidgets.QLabel("Макс. продаж:"); self.lbl_max_sells.setObjectName("lbl_max_sells")
        layout.addWidget(self.lbl_max_sells, 13, 0)
        layout.addWidget(self.max_sells, 13, 1)
        self.info_max_sells = self._info_button("INTERVAL-режим: ограничение количества продаж (0 = без лимита).")
        self.info_max_sells.setObjectName("info_max_sells")
        layout.addWidget(self.info_max_sells, 13, 2)
        layout.addWidget(self.catch_up, 14, 0, 1, 2)

        # ✚ Кнопка сброса параметров к безопасным значениям
        self.btn_trade_reset = QtWidgets.QPushButton("Сбросить параметры")
        self.btn_trade_reset.setToolTip("Вернуть безопасные значения: газ 0.1 gwei, слиппедж 1%, дедлайн 20 мин и т. п.")
        self.btn_trade_reset.clicked.connect(self._reset_trade_params_defaults)
        layout.addWidget(self.btn_trade_reset, 15, 0, 1, 2)
        
        scroll_area.setWidget(trading_widget)
        self.trading_dock.setWidget(scroll_area)
        self.addDockWidget(QtCore.Qt.RightDockWidgetArea, self.trading_dock)  # будет скрыта после «пересадки»

    # ---------- ПРЕДВАРИТЕЛЬНАЯ ПРОВЕРКА (UI) ----------
    def _create_precheck_dock(self):
        """Док справа: Предварительная проверка (без симуляций)"""
        self.precheck_dock = QtWidgets.QDockWidget("Предварительная проверка", self)
        self.precheck_dock.setObjectName("precheck_dock")
        self.precheck_dock.setAllowedAreas(QtCore.Qt.LeftDockWidgetArea | QtCore.Qt.RightDockWidgetArea)
        self.precheck_dock.setFeatures(QtWidgets.QDockWidget.DockWidgetMovable |
                                       QtWidgets.QDockWidget.DockWidgetFloatable |
                                       QtWidgets.QDockWidget.DockWidgetClosable)
        w = QtWidgets.QWidget()
        g = QtWidgets.QGridLayout(w)

        # Кнопка проверки
        self.btn_precheck = QtWidgets.QPushButton("Проверить сделку")
        self.btn_precheck.setToolTip("READ-проверки: баланс, allowance, газ-бюджет, резервы, лимиты, пара")
        self.btn_precheck.clicked.connect(self.on_precheck)
        g.addWidget(self.btn_precheck, 0, 0, 1, 2)
        # ✚ Кнопка экспорта результата проверки в буфер
        self.btn_precheck_copy = QtWidgets.QPushButton("Скопировать результат")
        self.btn_precheck_copy.setEnabled(False)
        self.btn_precheck_copy.setToolTip("Скопировать сводку пред-проверки в буфер обмена")
        self.btn_precheck_copy.clicked.connect(self._export_precheck)
        g.addWidget(self.btn_precheck_copy, 0, 2, 1, 1)

        # Чипы статусов
        self.pf_net = QtWidgets.QLabel("Сеть: —");      self.pf_net.setProperty("chip", True); self.pf_net.setProperty("level","muted")
        self.pf_bal = QtWidgets.QLabel("PLEX: —");      self.pf_bal.setProperty("chip", True); self.pf_bal.setProperty("level","muted")
        self.pf_allow = QtWidgets.QLabel("Allowance: —"); self.pf_allow.setProperty("chip", True); self.pf_allow.setProperty("level","muted")
        self.pf_gas = QtWidgets.QLabel("BNB на газ: —");  self.pf_gas.setProperty("chip", True); self.pf_gas.setProperty("level","muted")
        self.pf_min = QtWidgets.QLabel("Мин.выход: —");   self.pf_min.setProperty("chip", True); self.pf_min.setProperty("level","muted")
        self.pf_res = QtWidgets.QLabel("Резервы: —");     self.pf_res.setProperty("chip", True); self.pf_res.setProperty("level","muted")
        self.pf_lim = QtWidgets.QLabel("Лимиты: —");      self.pf_lim.setProperty("chip", True); self.pf_lim.setProperty("level","muted")
        self.pf_pair = QtWidgets.QLabel("Пара: —");       self.pf_pair.setProperty("chip", True); self.pf_pair.setProperty("level","muted")

        g.addWidget(self.pf_net,   1, 0, 1, 3)
        g.addWidget(self.pf_bal,   2, 0, 1, 3)
        g.addWidget(self.pf_allow, 3, 0, 1, 3)
        g.addWidget(self.pf_gas,   4, 0, 1, 3)
        g.addWidget(self.pf_min,   5, 0, 1, 3)
        g.addWidget(self.pf_res,   6, 0, 1, 3)
        g.addWidget(self.pf_lim,   7, 0, 1, 3)
        g.addWidget(self.pf_pair,  8, 0, 1, 3)

        self.precheck_dock.setWidget(w)
        self.addDockWidget(QtCore.Qt.RightDockWidgetArea, self.precheck_dock)  # будет скрыт после «пересадки»

    def _create_safety_dock(self):
        """Создает док для панели безопасности"""
        self.safety_dock = QtWidgets.QDockWidget("Безопасность и лимиты", self)
        self.safety_dock.setObjectName("safety_dock")
        self.safety_dock.setAllowedAreas(QtCore.Qt.LeftDockWidgetArea | QtCore.Qt.RightDockWidgetArea)
        self.safety_dock.setFeatures(QtWidgets.QDockWidget.DockWidgetMovable | 
                                   QtWidgets.QDockWidget.DockWidgetFloatable | 
                                   QtWidgets.QDockWidget.DockWidgetClosable)
        
        # Создаем скроллируемую область для параметров безопасности
        scroll_area = QtWidgets.QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(QtCore.Qt.ScrollBarAlwaysOff)
        scroll_area.setVerticalScrollBarPolicy(QtCore.Qt.ScrollBarAsNeeded)
        
        safety_widget = QtWidgets.QWidget()
        layout = QtWidgets.QGridLayout(safety_widget)
        
        # БЕЗОПАСНОСТЬ: Лимиты
        self.max_per_tx_plex = QtWidgets.QDoubleSpinBox()
        self.max_per_tx_plex.setDecimals(9)
        self.max_per_tx_plex.setRange(0.0, 1_000_000_000)
        self.max_per_tx_plex.setValue(DEFAULT_LIMITS['max_per_tx_plex'])
        
        self.max_daily_plex = QtWidgets.QDoubleSpinBox()
        self.max_daily_plex.setDecimals(9)
        self.max_daily_plex.setRange(0.0, 10_000_000_000)
        self.max_daily_plex.setValue(DEFAULT_LIMITS['max_daily_plex'])
        
        self.max_sales_per_hour = QtWidgets.QSpinBox()
        self.max_sales_per_hour.setRange(0, 1000)
        self.max_sales_per_hour.setValue(DEFAULT_LIMITS['max_sales_per_hour'])
        
        # UX: Настройка медленного тика в фоне
        self.slow_tick_spinbox = QtWidgets.QSpinBox()
        self.slow_tick_spinbox.setRange(5, 300)  # от 5 до 300 секунд
        self.slow_tick_spinbox.setValue(self.slow_tick_interval)
        self.slow_tick_spinbox.setSuffix(" сек")
        self.slow_tick_spinbox.valueChanged.connect(self._on_slow_tick_changed)
        
        # Добавляем поля в layout
        layout.addWidget(QtWidgets.QLabel("Макс. за транзакцию (PLEX):"), 0, 0)
        layout.addWidget(self.max_per_tx_plex, 0, 1)
        layout.addWidget(QtWidgets.QLabel("Макс. в день (PLEX):"), 1, 0)
        layout.addWidget(self.max_daily_plex, 1, 1)
        layout.addWidget(QtWidgets.QLabel("Макс. продаж в час:"), 2, 0)
        layout.addWidget(self.max_sales_per_hour, 2, 1)
        layout.addWidget(QtWidgets.QLabel("Медленный тик в фоне:"), 3, 0)
        layout.addWidget(self.slow_tick_spinbox, 3, 1)
        
        scroll_area.setWidget(safety_widget)
        self.safety_dock.setWidget(scroll_area)
        self.addDockWidget(QtCore.Qt.RightDockWidgetArea, self.safety_dock)  # будет скрыта после «пересадки»

    def _create_live_info_dock(self):
        """Создает док для живой информации"""
        self.live_info_dock = QtWidgets.QDockWidget("Живая информация", self)
        self.live_info_dock.setObjectName("live_info_dock")
        self.live_info_dock.setAllowedAreas(QtCore.Qt.LeftDockWidgetArea | QtCore.Qt.RightDockWidgetArea | QtCore.Qt.BottomDockWidgetArea)
        self.live_info_dock.setFeatures(QtWidgets.QDockWidget.DockWidgetMovable | 
                                      QtWidgets.QDockWidget.DockWidgetFloatable | 
                                      QtWidgets.QDockWidget.DockWidgetClosable)
        
        live_widget = QtWidgets.QWidget()
        layout = QtWidgets.QGridLayout(live_widget)
        
        self.price_label = QtWidgets.QLabel("Цена: —")
        self.reserves_label = QtWidgets.QLabel("Резервы: —")
        self.price_label.setProperty("accent", True)
        self.reserves_label.setProperty("accent", True)
        self.price_label.setToolTip("Текущая цена: USDT за 1 PLEX (из резервов пары).")
        self.reserves_label.setToolTip("Резервы пары PLEX/USDT, нормализованы: PLEX=9 dec, USDT=18 dec.")
        
        layout.addWidget(self.price_label, 0, 0)
        layout.addWidget(self.reserves_label, 0, 1)

        # ✚ Быстрые ссылки в обозревателе
        self.btn_pair = QtWidgets.QToolButton(); self.btn_pair.setText("🔗 Пара")
        self.btn_pair.setToolTip("Открыть пару PLEX/USDT в обозревателе")
        self.btn_pair.clicked.connect(lambda: self._open_in_explorer("address", PAIR_ADDRESS))
        self.btn_plex = QtWidgets.QToolButton(); self.btn_plex.setText("🔗 PLEX")
        self.btn_plex.setToolTip("Открыть токен PLEX в обозревателе")
        self.btn_plex.clicked.connect(lambda: self._open_in_explorer("token", PLEX))
        self.btn_usdt = QtWidgets.QToolButton(); self.btn_usdt.setText("🔗 USDT")
        self.btn_usdt.setToolTip("Открыть токен USDT в обозревателе")
        self.btn_usdt.clicked.connect(lambda: self._open_in_explorer("token", USDT))
        self.btn_router = QtWidgets.QToolButton(); self.btn_router.setText("🔗 Router")
        self.btn_router.setToolTip("Открыть Pancake Router в обозревателе")
        self.btn_router.clicked.connect(lambda: self._open_in_explorer("address", PANCAKE_V2_ROUTER))
        # ряд ссылок
        layout.addWidget(self.btn_pair,   1, 0)
        layout.addWidget(self.btn_plex,   1, 1)
        layout.addWidget(self.btn_usdt,   1, 2)
        layout.addWidget(self.btn_router, 1, 3)
        # ряд «копировать»
        self.btn_pair_copy   = self._copy_button(lambda: self._copy(PAIR_ADDRESS,  "Адрес пары скопирован"),   "Копировать адрес пары")
        self.btn_plex_copy   = self._copy_button(lambda: self._copy(PLEX,         "Адрес PLEX скопирован"),   "Копировать адрес PLEX")
        self.btn_usdt_copy   = self._copy_button(lambda: self._copy(USDT,         "Адрес USDT скопирован"),   "Копировать адрес USDT")
        self.btn_router_copy = self._copy_button(lambda: self._copy(PANCAKE_V2_ROUTER, "Адрес Router скопирован"), "Копировать адрес Router")
        layout.addWidget(self.btn_pair_copy,   2, 0)
        layout.addWidget(self.btn_plex_copy,   2, 1)
        layout.addWidget(self.btn_usdt_copy,   2, 2)
        layout.addWidget(self.btn_router_copy, 2, 3)
        
        self.live_info_dock.setWidget(live_widget)
        self.addDockWidget(QtCore.Qt.RightDockWidgetArea, self.live_info_dock)

    def _create_logs_dock(self):
        """Создает док для основного лога"""
        self.logs_dock = QtWidgets.QDockWidget("Системный лог", self)
        self.logs_dock.setObjectName("logs_dock")
        self.logs_dock.setAllowedAreas(QtCore.Qt.BottomDockWidgetArea)
        self.logs_dock.setFeatures(QtWidgets.QDockWidget.DockWidgetMovable | 
                                QtWidgets.QDockWidget.DockWidgetFloatable | 
                                QtWidgets.QDockWidget.DockWidgetClosable)
        
        self.logger = QtWidgets.QPlainTextEdit()
        self.logger.setReadOnly(True)
        
        self.logs_dock.setWidget(self.logger)
        self.addDockWidget(QtCore.Qt.BottomDockWidgetArea, self.logs_dock)

    def _create_operator_log_dock(self):
        """Создает док для лога оператора"""
        self.operator_log_dock = QtWidgets.QDockWidget("Логи оператора", self)
        self.operator_log_dock.setObjectName("operator_log_dock")
        self.operator_log_dock.setAllowedAreas(QtCore.Qt.BottomDockWidgetArea)
        self.operator_log_dock.setFeatures(QtWidgets.QDockWidget.DockWidgetMovable | 
                                         QtWidgets.QDockWidget.DockWidgetFloatable | 
                                         QtWidgets.QDockWidget.DockWidgetClosable)
        
        self.operator_log = QtWidgets.QPlainTextEdit()
        self.operator_log.setReadOnly(True)
        
        self.operator_log_dock.setWidget(self.operator_log)
        self.addDockWidget(QtCore.Qt.BottomDockWidgetArea, self.operator_log_dock)


    def _create_central_area(self):
        """Создает центральную область с кнопками управления"""
        central_widget = QtWidgets.QWidget()
        self.setCentralWidget(central_widget)
        # сохраняем layout как поле — будем добавлять центральную панель
        layout = QtWidgets.QVBoxLayout(central_widget)
        self.main_layout = layout
        
        # Кнопки управления
        buttons_layout = QtWidgets.QHBoxLayout()
        
        self.btn_sell = QtWidgets.QPushButton("Продать сейчас")
        self.btn_sell.clicked.connect(self.on_sell)
        self.btn_sell.setToolTip("Однократная безопасная продажа PLEX → USDT с защитным minOut.")
        self.btn_approve = QtWidgets.QPushButton("Разрешить PLEX")
        self.btn_approve.clicked.connect(self.on_approve)
        self.btn_approve.setToolTip("Выдать Pancake Router'у allowance на точную сумму PLEX.")
        self.btn_revoke = QtWidgets.QPushButton("Отозвать разрешение")
        self.btn_revoke.clicked.connect(self.on_revoke)
        self.btn_revoke.setToolTip("Обнулить allowance (approve(0)).")
        self.btn_cancel_pending = QtWidgets.QPushButton("Отменить застрявшую TX")
        self.btn_cancel_pending.clicked.connect(self.on_cancel_pending)
        self.btn_cancel_pending.setToolTip("Отправить замену (speed-up/cancel) той же nonce с небольшим gas-bump.")
        self.btn_cancel_pending.setStyleSheet("background:#4a1f1f; border:1px solid #6a2a2a;")
        
        buttons_layout.addWidget(self.btn_sell)
        # Чип-индикатор готовности продажи
        self.sell_hint = QtWidgets.QLabel("Продажа: —")
        self.sell_hint.setProperty("chip", True)
        self.sell_hint.setProperty("level","muted")
        self.sell_hint.setToolTip("Готовность ручной продажи")
        buttons_layout.addWidget(self.sell_hint)
        buttons_layout.addWidget(self.btn_approve)
        # Чип-индикатор необходимости approve
        self.approve_hint = QtWidgets.QLabel("Approve: —")
        self.approve_hint.setProperty("chip", True)
        self.approve_hint.setProperty("level","muted")
        self.approve_hint.setToolTip("Нужно ли делать approve на текущую сумму")
        buttons_layout.addWidget(self.approve_hint)
        buttons_layout.addWidget(self.btn_revoke)
        buttons_layout.addWidget(self.btn_cancel_pending)
        buttons_layout.addStretch()
        
        # Авто-продажа
        auto_layout = QtWidgets.QHBoxLayout()
        
        self.btn_auto_start = QtWidgets.QPushButton("Запустить авто-продажу")
        self.btn_auto_start.clicked.connect(self.on_auto_start)
        self.btn_auto_stop = QtWidgets.QPushButton("Остановить авто-продажу")
        self.btn_auto_stop.clicked.connect(self.on_auto_stop)
        
        auto_layout.addWidget(self.btn_auto_start)
        auto_layout.addWidget(self.btn_auto_stop)
        auto_layout.addStretch()
        
        layout.addLayout(buttons_layout)
        layout.addLayout(auto_layout)
        # ✚ монтируем центральную панель из 3 колонок (торговля / лимиты / пред-проверка)
        self._mount_center_params_panel()
        layout.addStretch()

    def _create_status_bar(self):
        """Создает статус-бар"""
        self.status_bar = self.statusBar()
        self.status_bar.showMessage("Готов к работе")
        
        # Создаем виджеты для статус-бара
        self.status_network = QtWidgets.QLabel("Сеть: Не подключено"); self.status_network.setProperty("chip", True); self.status_network.setProperty("level","muted"); self.status_network.setToolTip("Текущее подключение: Node RPC или Proxy.")
        self.status_gas = QtWidgets.QLabel("Газ: -- gwei");           self.status_gas.setProperty("chip", True);     self.status_gas.setProperty("level","muted");     self.status_gas.setToolTip("Текущая цена газа в gwei (с учётом лимитов).")
        self.status_price = QtWidgets.QLabel("Цена: -- USDT/PLEX");   self.status_price.setProperty("chip", True);   self.status_price.setProperty("level","muted");   self.status_price.setToolTip("USDT за 1 PLEX.")
        self.status_auto = QtWidgets.QLabel("Авто: ВЫКЛ");            self.status_auto.setProperty("chip", True);    self.status_auto.setProperty("level","muted");    self.status_auto.setToolTip("Состояние автопродажи.")
        
        # Кнопка "Продолжить авто" для возобновления после паузы
        self.btn_auto_resume = QtWidgets.QPushButton("Продолжить авто")
        self.btn_auto_resume.setEnabled(False)
        self.btn_auto_resume.clicked.connect(lambda: self.autoseller and self.autoseller.resume())
        
        # Кнопки управления авто-режимом
        self.btn_auto_pause = QtWidgets.QPushButton("Пауза")
        self.btn_auto_pause.clicked.connect(self._on_auto_pause_toggle)
        self.btn_auto_stop_after = QtWidgets.QPushButton("Стоп после следующей")
        self.btn_auto_stop_after.clicked.connect(self._on_auto_stop_after)
        
        
        # Добавляем виджеты в статус-бар
        self.status_bar.addPermanentWidget(self.status_network)
        self.status_bar.addPermanentWidget(self.status_gas)
        self.status_bar.addPermanentWidget(self.status_price)
        self.status_bar.addPermanentWidget(self.status_auto)
        self.status_bar.addPermanentWidget(self.btn_auto_pause)
        self.status_bar.addPermanentWidget(self.btn_auto_stop_after)
        # Новый «чип» со статусом последней TX (кликабелен для копирования)
        self.status_tx = ClickableLabel("TX: —")
        self.status_tx.setProperty("chip", True)
        self.status_tx.setProperty("level", "muted")
        self.status_tx.setToolTip("Нажмите, чтобы скопировать последний хэш транзакции")
        self.status_tx.clicked.connect(lambda: self._copy(getattr(self, "_last_tx", "") or "", "TxHash скопирован"))
        self.status_tx.rightClicked.connect(self._tx_context_menu)
        self.status_bar.addPermanentWidget(self.status_tx)
        self.status_bar.addPermanentWidget(self.btn_auto_resume)
        
        # Индикаторы статуса (уже созданы выше)
        # self.network_status, self.gas_status, self.price_status, self.auto_status уже добавлены

    def _create_menu_bar(self):
        """Создает меню-бар"""
        menubar = self.menuBar()
        
        # Меню "Вид"
        view_menu = menubar.addMenu("Вид")
        
        # Показать/скрыть доки (без «торговля/безопасность/пред-проверка» — они теперь в центре)
        view_menu.addAction(self.connection_dock.toggleViewAction())
        view_menu.addAction(self.wallet_dock.toggleViewAction())
        view_menu.addAction(self.balances_dock.toggleViewAction())
        view_menu.addAction(self.live_info_dock.toggleViewAction())
        view_menu.addAction(self.logs_dock.toggleViewAction())
        view_menu.addAction(self.operator_log_dock.toggleViewAction())
        
        view_menu.addSeparator()
        
        # Сброс раскладки
        reset_layout_action = QtWidgets.QAction("Сбросить раскладку", self)
        reset_layout_action.triggered.connect(self._reset_layout)
        view_menu.addAction(reset_layout_action)
        
        # Полноэкран
        fullscreen_action = QtWidgets.QAction("Полноэкран", self)
        fullscreen_action.setShortcut("F11")
        fullscreen_action.triggered.connect(self._toggle_fullscreen)
        view_menu.addAction(fullscreen_action)
        # Компактный статус-бар
        compact_action = QtWidgets.QAction("Компактный статус-бар", self, checkable=True)
        compact_action.setChecked(self.compact_status)
        compact_action.toggled.connect(self._toggle_compact_status)
        view_menu.addAction(compact_action)
        # ✚ Центральная панель параметров — показать/скрыть
        toggle_center = QtWidgets.QAction("Параметры (по центру)", self, checkable=True)
        toggle_center.setChecked(True)
        toggle_center.toggled.connect(lambda v: getattr(self, "right_splitter", None) and self.right_splitter.setVisible(v))
        view_menu.addAction(toggle_center)
        # ✚ Сброс ширин колонок
        reset_cols = QtWidgets.QAction("Выровнять колонки параметров", self)
        reset_cols.triggered.connect(self._reset_center_columns)
        view_menu.addAction(reset_cols)

        # Меню "Сервис" — действия с логами оператора
        tools_menu = menubar.addMenu("Сервис")
        act_save_logs = QtWidgets.QAction("Сохранить логи оператора", self)
        act_save_logs.triggered.connect(self.on_save_logs)
        act_clear_logs = QtWidgets.QAction("Очистить логи оператора", self)
        act_clear_logs.triggered.connect(self.on_clear_logs)
        tools_menu.addAction(act_save_logs)
        tools_menu.addAction(act_clear_logs)
        # Пресеты перенесены из статус-бара в меню "Сервис"
        act_save_preset = QtWidgets.QAction("Сохранить пресет", self)
        act_save_preset.triggered.connect(self._save_preset)
        act_load_preset = QtWidgets.QAction("Загрузить пресет", self)
        act_load_preset.triggered.connect(self._load_preset)
        tools_menu.addSeparator()
        tools_menu.addAction(act_save_preset)
        tools_menu.addAction(act_load_preset)

    def _setup_shortcuts(self):
        """Настраивает горячие клавиши"""
        # Масштабирование UI
        zoom_in_action = QtWidgets.QAction(self)
        zoom_in_action.setShortcut("Ctrl++")
        zoom_in_action.triggered.connect(self._zoom_in)
        self.addAction(zoom_in_action)
        
        zoom_out_action = QtWidgets.QAction(self)
        zoom_out_action.setShortcut("Ctrl+-")
        zoom_out_action.triggered.connect(self._zoom_out)
        self.addAction(zoom_out_action)
        
        zoom_reset_action = QtWidgets.QAction(self)
        zoom_reset_action.setShortcut("Ctrl+0")
        zoom_reset_action.triggered.connect(self._zoom_reset)
        self.addAction(zoom_reset_action)
        
        # Максимизация
        maximize_action = QtWidgets.QAction(self)
        maximize_action.setShortcut("Ctrl+M")
        maximize_action.triggered.connect(self._toggle_maximize)
        self.addAction(maximize_action)
        # Доп. хоткеи оператора
        act_refresh = QtWidgets.QAction(self); act_refresh.setShortcut("F5");  act_refresh.triggered.connect(self.on_refresh)
        act_refresh_all = QtWidgets.QAction(self); act_refresh_all.setShortcut("F6"); act_refresh_all.triggered.connect(self.on_refresh_all_balances)
        act_auto_start = QtWidgets.QAction(self); act_auto_start.setShortcut("F9"); act_auto_start.triggered.connect(self.on_auto_start)
        act_auto_stop  = QtWidgets.QAction(self); act_auto_stop.setShortcut("F10"); act_auto_stop.triggered.connect(self.on_auto_stop)
        self.addAction(act_refresh); self.addAction(act_refresh_all); self.addAction(act_auto_start); self.addAction(act_auto_stop)
        # Enter в поле секрета = Подключить
        self.pk_input.returnPressed.connect(self.on_connect)
        # Ctrl+Enter в поле секрета = Подключить (на всякий)
        act_connect = QtWidgets.QAction(self); act_connect.setShortcut("Ctrl+Return"); act_connect.triggered.connect(self.on_connect)
        self.addAction(act_connect)

    def _fill_defaults(self):
        """Заполняет значения по умолчанию"""
        self.node_url.setText(os.environ.get("NODE_HTTP_URL", ""))
        # В строгом режиме не заполняем BscScan по умолчанию — оператор введёт EnterScan URL
        self.proxy_url.setText(os.environ.get("ENTERSCAN_API_URL", ""))
        self.proxy_keys.setText("RF1Q8SCFHFD1EVAP5A4WCMIM4DREA7UNUH,U89HXHR9Y26CHMWAA9JUZ17YK2AAXS65CZ,RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1")
        self.gas_gwei.setValue(0.1)
        self.slippage.setValue(1.0)
        self.amount_plex.setValue(0.0)
        self.target_price.setValue(0.0)
        self.price_check_interval_sec.setValue(5)
        self.cooldown_between_sales_sec.setValue(0)
        self.mode_node.setChecked(True)

    def _zoom_in(self):
        """Увеличивает масштаб UI"""
        self.ui_scale = min(self.ui_scale + UI_SCALE_STEP, MAX_UI_SCALE)
        self._apply_ui_scale()

    def _zoom_out(self):
        """Уменьшает масштаб UI"""
        self.ui_scale = max(self.ui_scale - UI_SCALE_STEP, MIN_UI_SCALE)
        self._apply_ui_scale()

    def _zoom_reset(self):
        """Сбрасывает масштаб UI"""
        self.ui_scale = DEFAULT_UI_SCALE
        self._apply_ui_scale()

    # (удалено) дубликат _apply_ui_scale — используем единую реализацию ниже
    
    def _on_log_message(self, message: str):
        """Потокобезопасная обработка логов"""
        self.logger.appendPlainText(message)
    
    def _update_status_bar(self, net: str | None=None, gas_wei: int | None=None,
                           price: str | None=None, auto: bool | None=None):
        """Обновляет статус-бар"""
        def _restyle(lbl: QtWidgets.QLabel):
            lbl.style().unpolish(lbl); lbl.style().polish(lbl); lbl.update()
        if net is not None:
            self._last_net = net
            self.status_network.setText(self._fmt_status_network())
            self.status_network.setProperty("level", "ok"); _restyle(self.status_network)
        if gas_wei is not None:
            try:
                g = from_wei_gwei(gas_wei)
                self._last_gas = g
                self.status_gas.setText(self._fmt_status_gas())
                level = "ok" if g <= 3.0 else ("warn" if g <= 10.0 else "err")
                self.status_gas.setProperty("level", level); _restyle(self.status_gas)
            except Exception:
                self.status_gas.setText("Газ: — gwei")
                self.status_gas.setProperty("level", "muted"); _restyle(self.status_gas)
        if price is not None:
            self._last_price = price
            self.status_price.setText(self._fmt_status_price())
            self.status_price.setProperty("level", "ok"); _restyle(self.status_price)
        if auto is not None:
            self._last_auto = bool(auto)
            self.status_auto.setText(self._fmt_status_auto())
            self.status_auto.setProperty("level", "ok" if auto else "muted"); _restyle(self.status_auto)

    def _toggle_fullscreen(self):
        """Переключает полноэкранный режим"""
        if self.isFullScreen():
            self.showNormal()
        else:
            self.showFullScreen()

    def _toggle_maximize(self):
        """Переключает максимизацию окна"""
        if self.isMaximized():
            self.showNormal()
        else:
            self.showMaximized()

    def _reset_layout(self):
        """Сбрасывает раскладку к умолчанию"""
        # Показываем все доки
        self.connection_dock.show()
        self.wallet_dock.show()
        self.balances_dock.show()
        self.live_info_dock.show()
        self.logs_dock.show()
        self.operator_log_dock.show()
        
        # Размещаем доки в стандартных позициях (правые три — уже в центре)
        self.addDockWidget(QtCore.Qt.LeftDockWidgetArea, self.connection_dock)
        self.addDockWidget(QtCore.Qt.LeftDockWidgetArea, self.wallet_dock)
        self.addDockWidget(QtCore.Qt.LeftDockWidgetArea, self.balances_dock)
        self.addDockWidget(QtCore.Qt.RightDockWidgetArea, self.live_info_dock)
        self.addDockWidget(QtCore.Qt.BottomDockWidgetArea, self.logs_dock)
        self.addDockWidget(QtCore.Qt.BottomDockWidgetArea, self.operator_log_dock)
        
        # Табифицируем нижние доки
        self.tabifyDockWidget(self.logs_dock, self.operator_log_dock)
        # Скрываем пустые правые доки
        self.trading_dock.hide()
        self.safety_dock.hide()
        self.precheck_dock.hide()
        try: self.rpc_stats_dock.hide()
        except Exception: pass
        if hasattr(self, "right_splitter") and self.right_splitter:
            self.right_splitter.setVisible(True)

    # (удалено) дубликат _save_layout с иным namespace — используем единую версию ниже

    # (удалено) дубликат _restore_layout с иным namespace — используем единую версию ниже

    def resizeEvent(self, event):
        """Обрабатывает изменение размера окна для брейкпоинтов"""
        super().resizeEvent(event)
        self._handle_breakpoints()

    def _handle_breakpoints(self):
        """Обрабатывает брейкпоинты для адаптивности"""
        width = self.width()
        
        if width < BREAKPOINT_NARROW:
            # Узкие экраны - все в табы
            if self.current_breakpoint != "narrow":
                self._apply_narrow_layout()
                self.current_breakpoint = "narrow"
        elif width < BREAKPOINT_WIDE:
            # Средние экраны - две колонки
            if self.current_breakpoint != "medium":
                self._apply_medium_layout()
                self.current_breakpoint = "medium"
        else:
            # Широкие экраны - полная раскладка
            if self.current_breakpoint != "wide":
                self._apply_wide_layout()
                self.current_breakpoint = "wide"

    def _apply_narrow_layout(self):
        """Применяет раскладку для узких экранов"""
        # Табифицируем все доки в нижней области
        self.tabifyDockWidget(self.logs_dock, self.operator_log_dock)
        self.tabifyDockWidget(self.operator_log_dock, self.live_info_dock)
        # ✚ Precheck в ту же «пачку» вкладок, чтобы не терялся на узких окнах
        try:
            self.tabifyDockWidget(self.live_info_dock, self.precheck_dock)
        except Exception:
            pass
        
        # Скрываем некоторые доки для экономии места
        self.safety_dock.hide()
        self.trading_dock.hide()
        self.precheck_dock.hide()
        try: self.rpc_stats_dock.hide()
        except Exception: pass

    def _apply_medium_layout(self):
        """Применяет раскладку для средних экранов"""
        # Показываем все доки
        self.connection_dock.show()
        self.wallet_dock.show()
        self.balances_dock.show()
        self.trading_dock.show()
        self.safety_dock.show()
        self.live_info_dock.show()
        self.logs_dock.show()
        self.operator_log_dock.show()
        
        # Табифицируем нижние доки
        self.tabifyDockWidget(self.logs_dock, self.operator_log_dock)

    def _apply_wide_layout(self):
        """Применяет раскладку для широких экранов"""
        # Показываем базовые доки
        self.connection_dock.show()
        self.wallet_dock.show()
        self.balances_dock.show()
        self.live_info_dock.show()
        self.logs_dock.show()
        self.operator_log_dock.show()
        
        # Размещаем доки в стандартных позициях (три правых блока уже пересажены в центр)
        self.addDockWidget(QtCore.Qt.LeftDockWidgetArea, self.connection_dock)
        self.addDockWidget(QtCore.Qt.LeftDockWidgetArea, self.wallet_dock)
        self.addDockWidget(QtCore.Qt.LeftDockWidgetArea, self.balances_dock)
        self.addDockWidget(QtCore.Qt.RightDockWidgetArea, self.live_info_dock)
        self.addDockWidget(QtCore.Qt.BottomDockWidgetArea, self.logs_dock)
        self.addDockWidget(QtCore.Qt.BottomDockWidgetArea, self.operator_log_dock)
        # и скрываем пустые правые доки (их содержимое пересажено в центр)
        self.trading_dock.hide()
        self.safety_dock.hide()
        self.precheck_dock.hide()
        try: self.rpc_stats_dock.hide()
        except Exception: pass
        # центральная панель — видима
        if hasattr(self, "right_splitter") and self.right_splitter:
            self.right_splitter.setVisible(True)

    def closeEvent(self, event):
        """Обрабатывает закрытие окна"""
        self._save_layout()
        self._on_close_event(event)
        super().closeEvent(event)

    def _build_main_panel(self):
        """Создает единую панель со всем функционалом (устаревший метод)"""
        # Этот метод больше не используется в новой архитектуре
        pass


    # --------------- Event handlers ---------------

    def _cfg(self) -> BackendConfig:
        mode = RpcMode.NODE if self.mode_node.isChecked() else RpcMode.PROXY
        keys = [k.strip() for k in self.proxy_keys.text().split(',') if k.strip()]
        return BackendConfig(
            mode=mode,
            node_http=self.node_url.text().strip(),
            proxy_base_url=self.proxy_url.text().strip(),
            proxy_api_keys=keys
        )

    def _secret_to_account(self) -> tuple[str,str]:
        secret = self.pk_input.text().strip()
        path = self.path_input.text().strip() or "m/44'/60'/0'/0/0"
        if not secret:
            raise RuntimeError('Укажите приватный ключ или SID фразу.')
        if secret.startswith('0x') and len(secret) > 60:
            acc = Account.from_key(secret)
            return acc.address, secret
        # try mnemonic/SID phrase (requires eth-account >=0.9)
        try:
            # БЕЗОПАСНОСТЬ: Включаем поддержку HD wallet для некоторых версий eth-account
            try:
                Account.enable_unaudited_hdwallet_features()
            except:
                pass  # Игнорируем если уже включено или не поддерживается
            
            acc = Account.from_mnemonic(secret, account_path=path)
            return acc.address, acc.key.hex()
        except Exception as e:
            raise RuntimeError('Неверный приватный ключ или SID фраза: ' + str(e))

    def on_connect(self):
        """Подключение с поддержкой Watch-only и строгим Proxy: только EnterScan"""
        try:
            # Watch-only: допускаем подключение без секрета
            if self.watch_only_cb.isChecked() and not self.pk_input.text().strip():
                if not self.addr:
                    raise RuntimeError("Watch-only: укажите адрес (или введите секрет для извлечения адреса).")
                address = self.addr
                pk = None
            else:
                address, pk = self._secret_to_account()
            self.addr = Web3.to_checksum_address(address)
            self.pk = pk
            self.addr_label.setText(f"Адрес: {self.addr}")
            # Снимаем возможную подсветку
            try: self.node_url.setStyleSheet("")
            except Exception: pass
            try: self.proxy_url.setStyleSheet("")
            except Exception: pass
            try: self.proxy_keys.setStyleSheet("")
            except Exception: pass

            # Готовим конфиг и делаем мягкую проверку режима
            cfg = self._cfg()
            if cfg.mode == RpcMode.NODE and not (cfg.node_http or "").strip():
                # Node пуст. Разрешаем мягкий fallback только в Watch-only и только если задан Proxy URL
                can_fallback_to_proxy = bool(self.proxy_url.text().strip())
                if self.watch_only_cb.isChecked() and can_fallback_to_proxy:
                    self.ui_logger.write("ℹ Node HTTP пуст — переключаюсь на Proxy.")
                    self.mode_proxy.setChecked(True)
                    cfg = self._cfg()
                else:
                    try: self.node_url.setStyleSheet("border:1px solid #d33;")
                    except Exception: pass
                    self._show_small_modal(
                        "Требуется Node RPC URL",
                        "Поле «Node HTTP» пусто.\n"
                        "Укажите HTTP RPC URL (например, QuickNode),\n"
                        "или переключитесь на «EnterScan (Multichain API)»."
                    )
                    return

            # Строгая проверка: Proxy допускается только EnterScan
            if STRICT_ENTERSCAN_ONLY and cfg.mode == RpcMode.PROXY:
                prov = self._proxy_provider()
                if prov != "enterscan":
                    try:
                        self.proxy_url.setStyleSheet("border:1px solid #d33;")
                    except Exception:
                        pass
                    self._show_small_modal(
                        "Нужен EnterScan API",
                        "В строгом режиме Proxy допускается только EnterScan.\n"
                        "Проверьте URL (должен содержать «enterscan»)\n"
                        "и используйте ключи EnterScan."
                    )
                    return

            # Подключаемся с окончательным конфигом
            self.core = TradingCore(cfg, log_fn=self.ui_logger.write)
            mode_used = self.core.connect()
            self.ui_logger.write(f"✅ Подключено через {mode_used}.")

            # Проверка decimals токенов
            plex_dec = self.core.get_decimals(PLEX)
            usdt_dec = self.core.get_decimals(USDT)
            if plex_dec != 9 or usdt_dec != 18:
                raise RuntimeError(f"Неподдерживаемые decimals: PLEX={plex_dec}, USDT={usdt_dec}. Ожидалось 9/18.")
            self.ui_logger.write(f"✅ Decimals проверены: PLEX={plex_dec}, USDT={usdt_dec}")

            # Статусы/первый газ
            self._update_status_bar(
                net=mode_used,
                gas_wei=self.core.current_gas_price(
                    to_wei_gwei(float(self.gas_gwei.value())),
                    use_network_gas=self.use_network_gas.isChecked()
                ),
                auto=self.autoseller is not None
            )
            # Стартовые проверки и первый батч обновлений
            self._startup_safety_checks()
            self.on_refresh_all_balances()
            self._schedule_precheck(50)

            # Watch-only: отключаем опасные действия
            wo = self.watch_only_cb.isChecked() or (self.pk is None)
            for w in (self.btn_sell, self.btn_approve, self.btn_revoke, self.btn_cancel_pending):
                w.setEnabled(not wo)
        except Exception as e:
            msg = str(e)
            # Дружелюбная подсветка при проблеме с Proxy-ключами/URL
            if "Proxy auth error" in msg or "Invalid API Key" in msg:
                try:
                    self.proxy_keys.setStyleSheet("border:1px solid #d33;")
                    self.proxy_url.setStyleSheet("border:1px solid #d33;")
                except Exception:
                    pass
                self._show_small_modal(
                    "Провайдер API ключей",
                    "Похоже, ключи не подходят для выбранного API.\n\n"
                    "• Для EnterScan укажите их API-URL и EnterScan-ключ.\n"
                    "Можно ввести несколько ключей через запятую — клиент попробует следующий."
                )
            self.ui_logger.write(f"❌ Ошибка подключения: {msg}")
    
    def _startup_safety_checks(self):
        """Стартовые проверки безопасности"""
        try:
            # 1. Проверка allowance
            allowance = eth_call_allowance(self.core._client_call, PLEX, self.addr, PANCAKE_V2_ROUTER)
            if allowance > 0:
                self.ui_logger.write("🚨 ВНИМАНИЕ: Открыт allowance!")
                self.ui_logger.write(f"🚨 Allowance: {from_units(allowance, 9)} PLEX")
                self.ui_logger.write("🚨 Рекомендуется немедленно нажать 'Revoke Now'")
                # Делаем кнопку Revoke активной и выделенной
                self.btn_revoke.setStyleSheet("background-color: #ff4444; font-weight: bold;")
            
            # 2. Проверка баланса BNB для газа
            bnb_balance = self.core.get_bnb_balance(self.addr)
            
            # БЕЗОПАСНОСТЬ: Точная оценка бюджета газа через current_gas_price
            try:
                gas_price_wei = self.core.current_gas_price(
                    to_wei_gwei(float(self.gas_gwei.value())),
                    use_network_gas=self.use_network_gas.isChecked()
                )
                # Оцениваем газ для базовых операций
                gas_estimate = 50000 + 50000 + 200000  # revoke + approve + swap
                gas_estimate = int(gas_estimate * 1.2)  # +20% буфер
                estimated_gas_cost = gas_price_wei * gas_estimate
                
                if bnb_balance < estimated_gas_cost:
                    self.ui_logger.write("⚠️ ВНИМАНИЕ: Недостаточно BNB для газа!")
                    self.ui_logger.write(f"⚠️ BNB: {from_units(bnb_balance, 18)}")
                    self.ui_logger.write(f"⚠️ Требуется: {from_units(estimated_gas_cost, 18)}")
                    self.ui_logger.write(f"⚠️ Не хватает: {from_units(estimated_gas_cost - bnb_balance, 18)}")
            except Exception as e:
                # Fallback на константную оценку
                estimated_gas_cost = to_wei_gwei(float(self.gas_gwei.value())) * 300000
                if bnb_balance < estimated_gas_cost:
                    self.ui_logger.write("⚠️ ВНИМАНИЕ: Недостаточно BNB для газа!")
                    self.ui_logger.write(f"⚠️ BNB: {from_units(bnb_balance, 18)}")
                    self.ui_logger.write(f"⚠️ Требуется: {from_units(estimated_gas_cost, 18)}")
            
            # 3. Проверка whitelist пары
            try:
                t0, t1 = eth_call_pair_tokens(self.core._client_call, PAIR_ADDRESS)
                pair_tokens = {t0.lower(), t1.lower()}
                expected_tokens = {SAFETY_WHITELIST['PLEX'], SAFETY_WHITELIST['USDT']}
                if pair_tokens != expected_tokens:
                    self.ui_logger.write("🚨 КРИТИЧНО: Неверные токены в паре!")
                    self.ui_logger.write(f"🚨 Токены: {t0}, {t1}")
                    self.ui_logger.write("🚨 Ожидались: PLEX, USDT")
            except Exception as e:
                self.ui_logger.write(f"⚠️ Не удалось проверить пару: {e}")
                
        except Exception as e:
            self.ui_logger.write(f"⚠️ Ошибка проверок безопасности: {e}")

    def on_refresh(self):
        # ОПТИМИЗАЦИЯ: Throttling 2 секунды для предотвращения дублей
        if not self._throttled('_last_refresh_ts', 2):
            return
            
        try:
            if not self.core or not self.addr:
                self.ui_logger.write("ℹ Сначала подключитесь.")
                return
            plex_raw, usdt_raw, plex_dec, usdt_dec = self.core.get_balances(self.addr)
            price, rplex, rusdt, is_t0 = self.core.get_price_and_reserves()
            self.balance_plex.setText(f"PLEX: {from_units(plex_raw, plex_dec)}")
            self.balance_usdt.setText(f"USDT: {from_units(usdt_raw, usdt_dec)}")
            self.price_label.setText(f"Цена: {fmt_price(price)} USDT / 1 PLEX")
            self.reserves_label.setText(f"Резервы: PLEX={from_units(rplex, 9)} USDT={from_units(rusdt, 18)}")
            
            # Обновляем статус-бар
            self._update_status_bar(price=str(price))
        except Exception as e:
            self.ui_logger.write(f"❌ Ошибка обновления: {e}")

    def on_approve(self):
        try:
            if not self.core or not self.addr or not self.pk:
                self.ui_logger.write("ℹ Сначала подключитесь.")
                return
            amt = Decimal(str(self.amount_plex.value()))
            if amt <= 0:
                self.ui_logger.write("⚠ Установите количество PLEX > 0")
                return
            plex_raw = to_units(amt, 9)
            # БЕЗОПАСНОСТЬ: Применяем чекбокс "Использовать сетевой газ"
            use_network_gas = self.use_network_gas.isChecked()
            gas = self.core.current_gas_price(
                to_wei_gwei(float(self.gas_gwei.value())), 
                use_network_gas=use_network_gas
            )
            self._update_status_bar(gas_wei=gas)
            
            # БЕЗОПАСНОСТЬ: Используем safe_approve на точную сумму
            txh = self.core.safe_approve(self.addr, self.pk, plex_raw, gas)
            if txh:
                self.ui_logger.write(f"✅ Approve на {amt} PLEX отправлен: {txh}")
                self._update_last_tx(txh)
                self._note_tx_success()
                # safe_approve() уже ожидает квитанцию; дополнительных ожиданий не требуется
                
                # UX: Обновляем цену после approve (из кэша/TTL)
                try:
                    price, rplex, rusdt, _ = self.core.get_price_and_reserves()
                    self.price_label.setText(f"Цена: {fmt_price(price)} USDT / 1 PLEX")
                    self.reserves_label.setText(f"Резервы: PLEX={from_units(rplex, 9)} USDT={from_units(rusdt, 18)}")
                    self._update_status_bar(price=str(price))
                except Exception as e:
                    self.ui_logger.write(f"⚠️ Ошибка обновления цены: {e}")
            else:
                self.ui_logger.write("ℹ Allowance уже достаточен")
        except Exception as e:
            self.ui_logger.write(f"❌ Ошибка approve: {e}")
            self._note_tx_fail()

    def on_sell(self):
        try:
            if not self.core or not self.addr or not self.pk:
                self.ui_logger.write("ℹ Сначала подключитесь.")
                return
            amt = Decimal(str(self.amount_plex.value()))
            if amt <= 0:
                self.ui_logger.write("⚠ Установите количество PLEX > 0")
                return
            
            # БЕЗОПАСНОСТЬ: лимиты, amount и газ (нужны для префлайта)
            limits = self._get_limits()
            plex_raw = to_units(amt, 9)
            use_network_gas = self.use_network_gas.isChecked()
            gas = self.core.current_gas_price(to_wei_gwei(float(self.gas_gwei.value())), use_network_gas=use_network_gas)
            self._update_status_bar(gas_wei=gas)

            # ✚ ПРЕДВАРИТЕЛЬНАЯ ПРОВЕРКА (READ-only, без симуляций)
            pre = self.core.precheck_summary(
                owner=self.addr,
                amount_in_raw=plex_raw,
                gas_price_wei=gas,
                user_slippage_pct=float(self.slippage.value()),
                deadline_min=int(self.deadline_min.value()),
                limits=limits
            )
            blockers = []
            if not pre["network"]["ok"]:        blockers.append(f"Сеть: {pre['network']['msg']}")
            if not pre["pair_ok"]["ok"]:        blockers.append("Пара: неверные токены")
            if not pre["balance_plex"]["ok"]:   blockers.append("Недостаточно PLEX")
            if not pre["bnb_gas"]["ok"]:        blockers.append("Недостаточно BNB на газ")
            if not pre["limits"]["ok"]:         blockers.append(f"Лимиты: {pre['limits']['msg']}")
            if not pre["min_out"]["ok"]:        blockers.append("Нет ликвидности / minOut = 0")
            # ✚ дополнительные блокировки безопасности
            if not pre.get("impact", {}).get("ok", True):
                blockers.append(f"Велик impact ({pre['impact']['pct']:.2f}%)")
            if not pre.get("reserves", {}).get("ok", True):
                blockers.append("Резервы ниже минимума")
            # Allowance — не блокер (safe_approve справится), но покажем предупреждение
            warn_allow = (not pre["allowance"]["ok"])
            if blockers:
                text = "Перед продажей устраните:\n• " + "\n• ".join(blockers)
                if warn_allow:
                    text += "\n\nДополнительно: потребуется Approve."
                self._show_small_modal("Проверка не пройдена", text)
                return

            # БЕЗОПАСНОСТЬ: используем рассчитанный minOut из префлайта
            expected_out = pre["min_out"]["expected"]
            safety = DEFAULT_LIMITS['safety_slippage_bonus'] / 100.0
            user = float(self.slippage.value()) / 100.0
            min_out = max(int(expected_out * (1 - user - safety)), 1)
            
            # БЕЗОПАСНОСТЬ: Используем безопасную продажу с рассчитанным minOut
            txh = self.core.safe_sell_now(self.addr, self.pk, plex_raw, min_out, gas, limits, int(self.deadline_min.value()))
            self.ui_logger.write(f"💸 Безопасная продажа отправлена: {txh}")
            self._update_last_tx(txh)
            self._note_tx_success()
            
            # UX: Обновляем статус газа и цены после успешной отправки
            gas_updated = self.core.current_gas_price(
                to_wei_gwei(float(self.gas_gwei.value())),
                use_network_gas=self.use_network_gas.isChecked()
            )
            self._update_status_bar(gas_wei=gas_updated)
            
            # Краткий лог для операторов (газ и цена)
            try:
                price, rplex, rusdt, _ = self.core.get_price_and_reserves()
                self._update_status_bar(price=str(price))
                self.ui_logger.write(f"📊 Газ: {from_wei_gwei(gas_updated):.3f} gwei | Цена: {fmt_price(price)} USDT | Резервы: PLEX={rplex} USDT={rusdt}")
            except Exception as e:
                self.ui_logger.write(f"📊 Газ: {from_wei_gwei(gas_updated):.3f} gwei | Ошибка обновления цены: {e}")
            
        except Exception as e:
            self.ui_logger.write(f"❌ Ошибка безопасной продажи: {e}")
            self._note_tx_fail()
            # UX: Контекстный текст модалки
            err = str(e)
            if "Sell loop failed after" in err:
                self.ui_logger.write("🧯 Политика: без повышения газа; выполнено 5 попыток по 5 секунд.")
                subtitle = "Сделка не прошла после 5 попыток.\nПроверьте соединение/газ и при необходимости отмените застрявшую TX."
            else:
                subtitle = f"Ошибка: {err}\nПроверьте параметры сделки и баланс газа."
            self._show_small_modal("Продажа не выполнена", subtitle)
            # БЕЗОПАСНОСТЬ: При ошибке пытаемся revoke
            try:
                if self.core and self.addr and self.pk:
                    use_network_gas = self.use_network_gas.isChecked()
                    gas = self.core.current_gas_price(
                        to_wei_gwei(float(self.gas_gwei.value())), 
                        use_network_gas=use_network_gas
                    )
                    self.core.safe_revoke(self.addr, self.pk, gas)
            except:
                pass

    def on_auto_start(self):
        try:
            if not self.core or not self.addr or not self.pk:
                self.ui_logger.write("ℹ Сначала подключитесь.")
                return
            
            # Проверяем, не запущен ли уже поток
            if self.autoseller and self.autoseller.isRunning():
                self.ui_logger.write("⚠ Автопродажа уже запущена. Сначала остановите текущую.")
                return
            
            # Валидация в зависимости от режима
            if self.use_target_price.isChecked():
                # Smart-режим: проверяем целевую цену
                target = Decimal(str(self.target_price.value()))
                if target <= 0:
                    self.ui_logger.write("⚠ Установите целевую цену > 0")
                    return
                amt = Decimal(str(self.amount_plex.value()))
                if amt <= 0:
                    self.ui_logger.write("⚠ Установите количество PLEX > 0")
                    return
            else:
                # Interval-режим: проверяем параметры интервала
                interval_sec = int(self.interval_sec.value())
                if interval_sec < 5:
                    self.ui_logger.write("⚠ Интервал должен быть не менее 5 секунд")
                    return
                amount_per_sell = Decimal(str(self.amount_per_sell.value()))
                if amount_per_sell <= 0:
                    self.ui_logger.write("⚠ Установите количество PLEX для продажи > 0")
                    return
                
            # Подготавливаем параметры в зависимости от режима
            if self.use_target_price.isChecked():
                # Smart-режим
                target_price = Decimal(str(self.target_price.value()))
                amount_per_sell = Decimal(str(self.amount_plex.value()))
            else:
                # Interval-режим
                target_price = Decimal('0')  # Не используется в interval режиме
                amount_per_sell = Decimal(str(self.amount_per_sell.value()))
            
            # Создаем снимок лимитов и настроек для потокобезопасности
            limits_snapshot = self._get_limits()
            use_network_gas_snapshot = self.use_network_gas.isChecked()
            slow_tick_snapshot = self.slow_tick_interval
                
            self.autoseller = AutoSellerThread(
                core=self.core,
                address=self.addr,
                pk=self.pk,
                # Smart-режим:
                use_target_price=self.use_target_price.isChecked(),
                target_price=target_price,
                # Interval-режим:
                interval_sec=int(self.interval_sec.value()),
                amount_per_sell=amount_per_sell,
                max_sells=int(self.max_sells.value()),
                catch_up=self.catch_up.isChecked(),
                # Общее:
                slippage_pct=float(self.slippage_pct.value()),    # именно поле для авто
                deadline_min=int(self.deadline_min.value()),      # НЕ sell_interval
                gas_gwei=float(self.gas_gwei.value()),
                price_check_interval_sec=int(self.price_check_interval_sec.value()),
                cooldown_between_sells_sec=int(self.cooldown_between_sales_sec.value()),
                slow_tick_interval=slow_tick_snapshot,
                ui=None  # Больше не передаем UI в поток
            )
            
            # Передаем снимки параметров в поток
            self.autoseller.limits = limits_snapshot
            self.autoseller.use_network_gas = use_network_gas_snapshot
            
            # ОПТИМИЗАЦИЯ: Устанавливаем флаги для адаптивной частоты
            self.autoseller.auto_on = True
            
            self.autoseller.status.connect(self.ui_logger.write)
            self.autoseller.tick.connect(lambda d: self.price_label.setText(f"Цена: {fmt_price(Decimal(d['price']))} USDT / 1 PLEX"))
            self.autoseller.tick.connect(lambda d: self.reserves_label.setText(f"Резервы: PLEX={from_units(d['rplex'], 9)} USDT={from_units(d['rusdt'], 18)}"))
            self.autoseller.tick.connect(lambda d: self._update_status_bar(price=d['price'], auto=True))
            self.autoseller.gas.connect(lambda g: self._update_status_bar(gas_wei=g))
            # ✚ после успешной продажи — мягко обновить все балансы
            self.autoseller.sold.connect(self.on_refresh_all_balances)
            self.autoseller.alert.connect(self._show_small_modal, QtCore.Qt.QueuedConnection)
            # Управление кнопкой "Продолжить авто" по сигналам
            self.autoseller.alert.connect(lambda *_: self.btn_auto_resume.setEnabled(True))
            self.autoseller.status.connect(
                lambda s: self.btn_auto_resume.setEnabled(False) if ("возобновлена" in s or "остановлена" in s) else None
            )
            self.autoseller.start()
            self.ui_logger.write("▶ Автопродажа запущена.")
            # ✚ Блокируем правую панель и ручные кнопки на время авто-продажи
            self._toggle_trade_controls(True)
            self.btn_sell.setEnabled(False)
            self.btn_approve.setEnabled(False)
            
            # Управление кнопкой "Продолжить авто"
            self.btn_auto_resume.setEnabled(False)
            
            # Обновляем статус-бар
            self._update_status_bar(auto=True)
        except Exception as e:
            self.ui_logger.write(f"❌ Ошибка запуска авто: {e}")

    def on_auto_stop(self):
        try:
            if self.autoseller and self.autoseller.isRunning():
                self.ui_logger.write("⏹ Останавливаю автопродажу...")
                self.autoseller.stop()
                # ОПТИМИЗАЦИЯ: Сбрасываем флаг авто-режима
                if self.autoseller:
                    self.autoseller.auto_on = False
                # Ждем завершения потока
                if self.autoseller.wait(5000):  # 5 секунд максимум
                    self.ui_logger.write("⏹ Автопродажа остановлена.")
                else:
                    self.ui_logger.write("⚠ Автопродажа принудительно завершена.")
                self.autoseller = None
                # Управление кнопкой "Продолжить авто"
                self.btn_auto_resume.setEnabled(False)
                # Обновляем статус-бар
                self._update_status_bar(auto=False)
                # ✚ Возвращаем управление правой панелью и ручными кнопками
                self._toggle_trade_controls(False)
                self.btn_sell.setEnabled(True)
                self.btn_approve.setEnabled(True)
            else:
                self.ui_logger.write("ℹ Автопродажа не запущена.")
        except Exception as e:
            self.ui_logger.write(f"❌ Ошибка остановки авто: {e}")
            # Принудительно сбрасываем ссылку на поток
            self.autoseller = None
            self._update_status_bar(auto=False)
    
    def on_stop_auto(self):
        """Останавливает авто-поток (альтернативная кнопка)"""
        self.on_auto_stop()

    # --------------- Operator panel handlers ---------------
    
    def on_refresh_all_balances(self):
        """Обновляет все балансы с ленивой перерисовкой и throttling"""
        # ОПТИМИЗАЦИЯ: Throttling 5 секунд и только если есть повод
        now = time.time()
        if now - self._last_balances_ts < 5 and not self._dirty_balances:
            return
        self._last_balances_ts = now
        self._dirty_balances = False
            
        try:
            if not self.core or not self.addr:
                self.operator_log.appendPlainText("ℹ Сначала подключитесь к кошельку")
                return
            
            # Получаем балансы PLEX и USDT
            plex_raw, usdt_raw, plex_dec, usdt_dec = self.core.get_balances(self.addr)
            
            # Получаем баланс BNB
            bnb_raw = self.core.get_bnb_balance(self.addr)
            
            # ОПТИМИЗАЦИЯ: Получаем цену и резервы (через кэшируемый метод)
            try:
                price, rplex, rusdt, is_t0 = self.core.get_price_and_reserves()
                self.price_label.setText(f"Цена: {fmt_price(price)} USDT / 1 PLEX")
                self.reserves_label.setText(f"Резервы: PLEX={from_units(rplex, 9)} USDT={from_units(rusdt, 18)}")
                # UX: Обновляем цену в статус-баре при батч-обновлении
                self._update_status_bar(price=str(price))
            except Exception as e:
                self.operator_log.appendPlainText(f"⚠️ Ошибка получения цены: {e}")
            
            # Обновляем отображение
            self.balance_plex.setText(f"PLEX: {from_units(plex_raw, plex_dec)}")
            self.balance_usdt.setText(f"USDT: {from_units(usdt_raw, usdt_dec)}")
            self.balance_bnb.setText(f"BNB: {from_units(bnb_raw, 18)}")
            
            # Логируем в панель оператора
            timestamp = time.strftime('%H:%M:%S')
            self.operator_log.appendPlainText(f"[{timestamp}] ✅ Балансы обновлены:")
            self.operator_log.appendPlainText(f"[{timestamp}] PLEX: {from_units(plex_raw, plex_dec)}")
            self.operator_log.appendPlainText(f"[{timestamp}] USDT: {from_units(usdt_raw, usdt_dec)}")
            self.operator_log.appendPlainText(f"[{timestamp}] BNB: {from_units(bnb_raw, 18)}")
            
        except Exception as e:
            self.operator_log.appendPlainText(f"❌ Ошибка обновления балансов: {e}")


    def on_clear_logs(self):
        """Очищает логи оператора"""
        self.operator_log.clear()
        timestamp = time.strftime('%H:%M:%S')
        self.operator_log.appendPlainText(f"[{timestamp}] Логи очищены")

    def on_save_logs(self):
        """Сохраняет логи оператора в файл"""
        try:
            timestamp = time.strftime('%Y%m%d_%H%M%S')
            filename = f"operator_logs_{timestamp}.txt"
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(self.operator_log.toPlainText())
            
            self.operator_log.appendPlainText(f"✅ Логи сохранены в файл: {filename}")
        except Exception as e:
            self.operator_log.appendPlainText(f"❌ Ошибка сохранения логов: {e}")

    def on_revoke(self):
        """Ручной revoke allowance"""
        try:
            if not self.core or not self.addr or not self.pk:
                self.ui_logger.write("⚠️ Сначала подключите кошелек")
                return
            
            # БЕЗОПАСНОСТЬ: Применяем чекбокс "Использовать сетевой газ"
            use_network_gas = self.use_network_gas.isChecked()
            gas_price = self.core.current_gas_price(
                to_wei_gwei(float(self.gas_gwei.value())), 
                use_network_gas=use_network_gas
            )
            
            txh = self.core.safe_revoke(self.addr, self.pk, gas_price)
            if txh:
                self.ui_logger.write(f"🔒 Revoke транзакция отправлена: {txh}")
                self._update_last_tx(txh)
                self._note_tx_success()
            else:
                self.ui_logger.write("ℹ️ Allowance уже нулевой")
                
        except Exception as e:
            self.ui_logger.write(f"❌ Ошибка revoke: {e}")
            self._note_tx_fail()
        
        # UX: Обновляем статус газа и сети
        self._update_status_bar(
            gas_wei=self.core.current_gas_price(
                to_wei_gwei(float(self.gas_gwei.value())),
                use_network_gas=self.use_network_gas.isChecked()
            )
        )

    def on_cancel_pending(self):
        """Отмена застрявшей транзакции"""
        try:
            if not self.core or not self.addr or not self.pk:
                self.ui_logger.write("⚠️ Сначала подключите кошелек")
                return
            
            # БЕЗОПАСНОСТЬ: Получаем данные последней отправленной транзакции
            last_nonce, last_gas_price, last_tx_hash = self.core.nonce_manager.get_last_sent_data()
            
            if last_nonce is None:
                self.ui_logger.write("⚠️ Нет данных о последней транзакции для отмены")
                return
            
            # БЕЗОПАСНОСТЬ: Используем current_gas_price без повышения (политика "газ не повышаем")
            base_gas = self.core.current_gas_price(
                to_wei_gwei(float(self.gas_gwei.value())),
                use_network_gas=self.use_network_gas.isChecked()
            )
            # минимальный bump для замены pending TX
            max_gas_limit = to_wei_gwei(DEFAULT_LIMITS['max_gas_gwei'])
            if last_gas_price:
                bumped = int(max(base_gas, int(last_gas_price * 1.10)))
            else:
                # Бампаем до "пола" 0.2 gwei или +0.05 gwei для мягкого bump
                floor_02 = to_wei_gwei(0.2)
                bumped = int(max(base_gas, floor_02, base_gas + to_wei_gwei(0.05)))
            gas_price = min(bumped, max_gas_limit)
            
            tx = {
                'to': self.addr,  # Отправляем себе
                'value': 0,
                'data': '0x',
                'chainId': BSC_CHAIN_ID,
                'gasPrice': gas_price,
                'nonce': last_nonce,  # Используем nonce последней транзакции
                'gas': 21000
            }
            
            signed = Account.from_key(self.pk).sign_transaction(tx)
            txh = self.core.send_raw(signed.rawTransaction)
            
            # ✚ зафиксировать cancel как «последнюю» tx в менеджере
            self.core.nonce_manager.record_sent_tx(last_nonce, gas_price, txh)
            
            self.ui_logger.write(f"❌ Cancel транзакция отправлена: {txh}")
            self.ui_logger.write(f"⚠️ Заменяет транзакцию {last_tx_hash} с nonce {last_nonce}")
            self.ui_logger.write(f"⚠️ Cancel отправлен тем же nonce {last_nonce} с газом {from_wei_gwei(gas_price):.3f} gwei (c bump)")
            self._update_last_tx(txh)
            
            # БЕЗОПАСНОСТЬ: Ждем подтверждения cancel
            try:
                receipt = self.core.wait_receipt(txh, timeout=120)
                self.ui_logger.write(f"✅ Cancel подтвержден — транзакция заменена")
                self._note_tx_success()
                # UX: Отключаем кнопку "Продолжить авто" после успешного cancel
                self.btn_auto_resume.setEnabled(False)
            except Exception as e:
                self.ui_logger.write(f"⚠️ Ошибка подтверждения cancel: {e}")
                self._note_tx_fail()
            
        except Exception as e:
            self.ui_logger.write(f"❌ Ошибка отмены транзакции: {e}")
            self._note_tx_fail()
        
        # UX: Обновляем статус газа и сети
        self._update_status_bar(
            gas_wei=self.core.current_gas_price(
                to_wei_gwei(float(self.gas_gwei.value())),
                use_network_gas=self.use_network_gas.isChecked()
            )
        )

    def _setup_mode_handlers(self):
        """Настраивает обработчики для переключения режимов автопродажи"""
        # Подключаем обработчик переключения режима
        self.use_target_price.toggled.connect(self._on_mode_changed)
        
        # Изначально скрываем поля интервального режима
        self._update_mode_visibility()
    
    def _on_mode_changed(self, checked):
        """Обработчик переключения режима автопродажи"""
        self._update_mode_visibility()
        mode = "Smart (target price)" if checked else "Interval"
        self.ui_logger.write(f"🔄 Режим автопродажи изменен на: {mode}")
        # ✚ Перезапуск дебаунса пред-проверки при смене режима
        self._schedule_precheck(200)
    
    def _update_mode_visibility(self):
        """Устойчивое переключение Smart/Interval без обхода грида (после пересадки панелей)"""
        is_smart = self.use_target_price.isChecked()
        # Smart-элементы
        for w in (self.lbl_target, self.target_price, getattr(self, "info_target", None)):
            if w: w.setVisible(is_smart)
        # Interval-элементы
        for w in (
            self.lbl_interval, self.interval_sec, getattr(self, "info_interval", None),
            self.lbl_amount_per_sell, self.amount_per_sell, getattr(self, "info_amount_per_sell", None),
            self.lbl_max_sells, self.max_sells, getattr(self, "info_max_sells", None),
            self.catch_up
        ):
            if w: w.setVisible(not is_smart)

    def _show_small_modal(self, title: str, message: str):
        """Показывает компактную модалку (10-15% окна)"""
        dlg = QtWidgets.QDialog(self)
        dlg.setWindowTitle(title)
        dlg.setModal(True)
        w = max(320, int(self.width() * 0.15))
        h = max(160, int(self.height() * 0.15))
        dlg.resize(w, h)

        lay = QtWidgets.QVBoxLayout(dlg)
        lbl = QtWidgets.QLabel(message)
        lbl.setWordWrap(True)
        lay.addWidget(lbl)
        btn = QtWidgets.QPushButton("OK")
        btn.clicked.connect(dlg.accept)
        lay.addWidget(btn, alignment=QtCore.Qt.AlignRight)
        dlg.exec_()

    # ---------- Вспомогательные методы UI ----------
    def _copy(self, text: str, hint: str = "Скопировано"):
        """Копирует текст в буфер обмена и показывает короткое уведомление"""
        try:
            QtWidgets.QApplication.clipboard().setText(text or "")
            self.status_bar.showMessage(f"📋 {hint}", 1500)
        except Exception as e:
            self.ui_logger.write(f"⚠️ Не удалось скопировать: {e}")

    def _update_last_tx(self, txh: str):
        """Обновляет чип последней транзакции в статус-баре"""
        self._last_tx = txh
        short = f"{txh[:10]}…{txh[-8:]}" if isinstance(txh, str) and len(txh) > 24 else (txh or "—")
        self.status_tx.setText(f"TX: {short}")
        self.status_tx.setToolTip(f"Последняя транзакция:\n{txh}\n\nНажмите, чтобы скопировать.")
        # Подсветка «ok»
        self.status_tx.setProperty("level", "ok")
        # Перерисовать стиль «чипа»
        self.status_tx.style().unpolish(self.status_tx); self.status_tx.style().polish(self.status_tx); self.status_tx.update()

    def _info_button(self, tip: str) -> QtWidgets.QToolButton:
        """Создаёт мини-иконку ℹ с подсказкой"""
        btn = QtWidgets.QToolButton()
        btn.setText("ℹ")
        btn.setCursor(QtCore.Qt.WhatsThisCursor)
        btn.setToolTip(tip)
        btn.setStyleSheet("QToolButton { border: none; padding: 0 4px; color: #9aa4b2; } QToolButton:hover { color: #d0d6e1; }")
        return btn

    def _copy_button(self, on_click, tip: str = "Копировать") -> QtWidgets.QToolButton:
        """Крошечная кнопка ⧉ для копирования рядом с полями"""
        btn = QtWidgets.QToolButton()
        btn.setText("⧉")
        btn.setCursor(QtCore.Qt.PointingHandCursor)
        btn.setToolTip(tip)
        btn.setStyleSheet("QToolButton { border: none; padding: 0 6px; color: #9aa4b2; } QToolButton:hover { color: #d0d6e1; }")
        btn.clicked.connect(on_click)
        return btn

    def _proxy_provider(self) -> str:
        """Определяет провайдера по URL: enterscan|bscscan|unknown"""
        base = (self.proxy_url.text() or "").lower()
        if "enterscan" in base:
            return "enterscan"
        if "bscscan" in base:
            return "bscscan"
        return "unknown"

    def _explorer_base(self) -> str:
        """Базовый обозреватель: EnterScan всегда по умолчанию; BscScan только если явно выбран"""
        prov = self._proxy_provider()
        if prov == "enterscan":
            return "https://enterscan.io"
        if prov == "bscscan":
            return "https://bscscan.com"
        # fallback: считаем EnterScan базой
        return "https://enterscan.io"

    def _open_in_explorer(self, kind: str, value: str):
        """Открывает ссылку в системном браузере"""
        if not value:
            return
        base = self._explorer_base()
        if kind == "tx":
            url = f"{base}/tx/{value}"
        elif kind == "address":
            url = f"{base}/address/{value}"
        elif kind == "token":
            url = f"{base}/token/{value}"
        else:
            url = base
        QtGui.QDesktopServices.openUrl(QtCore.QUrl(url))

    def _tx_context_menu(self, global_pos: QtCore.QPoint):
        """Контекст-меню для чипа TX в статус-баре"""
        txh = getattr(self, "_last_tx", "") or ""
        menu = QtWidgets.QMenu(self)
        act_open = menu.addAction("🔗 Открыть в обозревателе")
        act_copy = menu.addAction("⧉ Копировать TxHash")
        act_copy_link = menu.addAction("⧉ Копировать ссылку")
        # Дизейблим при отсутствии tx
        for a in (act_open, act_copy, act_copy_link):
            a.setEnabled(bool(txh))
        chosen = menu.exec_(global_pos)
        if not chosen or not txh:
            return
        if chosen is act_open:
            self._open_in_explorer("tx", txh)
        elif chosen is act_copy:
            self._copy(txh, "TxHash скопирован")
        elif chosen is act_copy_link:
            link = f"{self._explorer_base()}/tx/{txh}"
            self._copy(link, "Ссылка скопирована")

    def _address_context_menu(self, global_pos: QtCore.QPoint):
        """Контекст-меню для адреса кошелька"""
        addr = self.addr or ""
        menu = QtWidgets.QMenu(self)
        act_open = menu.addAction("🔗 Открыть в обозревателе")
        act_copy = menu.addAction("⧉ Копировать адрес")
        for a in (act_open, act_copy):
            a.setEnabled(bool(addr))
        chosen = menu.exec_(global_pos)
        if not chosen or not addr:
            return
        if chosen is act_open:
            self._open_in_explorer("address", addr)
        elif chosen is act_copy:
            self._copy(addr, "Адрес скопирован")

    def eventFilter(self, obj, ev):
        """Обработчик событий для адаптивной частоты опроса"""
        if ev.type() in (QtCore.QEvent.WindowActivate, QtCore.QEvent.WindowDeactivate):
            if self.autoseller:
                self.autoseller.ui_active = (ev.type() == QtCore.QEvent.WindowActivate)
        return super().eventFilter(obj, ev)

    def _throttled(self, key, interval_s=2):
        """Проверяет throttling для предотвращения дублирующих вызовов"""
        now = time.time()
        last = getattr(self, key, 0)
        if now - last < interval_s:
            return False
        setattr(self, key, now)
        return True

    def _get_limits(self) -> dict:
        """Получает настройки лимитов из UI"""
        return {
            'max_per_tx_plex': float(self.max_per_tx_plex.value()),
            'max_daily_plex': float(self.max_daily_plex.value()),
            'max_sales_per_hour': int(self.max_sales_per_hour.value())
        }

    def _restore_settings(self):
        """Восстанавливает настройки из QSettings"""
        try:
            # Восстанавливаем ключевые настройки
            self.use_network_gas.setChecked(self.settings.value("use_network_gas", True, type=bool))
            self.deadline_min.setValue(self.settings.value("deadline_min", 20, type=int))
            self.slippage_pct.setValue(self.settings.value("slippage_pct", 0.5, type=float))
            self.price_check_interval_sec.setValue(self.settings.value("price_check_interval_sec", 5, type=int))
            self.gas_gwei.setValue(self.settings.value("gas_gwei", 0.1, type=float))
            self.cooldown_between_sales_sec.setValue(self.settings.value("cooldown_between_sales_sec", 0, type=int))
            
            # Лимиты безопасности
            self.max_per_tx_plex.setValue(self.settings.value("max_per_tx_plex", DEFAULT_LIMITS['max_per_tx_plex'], type=float))
            self.max_daily_plex.setValue(self.settings.value("max_daily_plex", DEFAULT_LIMITS['max_daily_plex'], type=float))
            self.max_sales_per_hour.setValue(self.settings.value("max_sales_per_hour", DEFAULT_LIMITS['max_sales_per_hour'], type=int))
            
            # Настройки режимов
            self.use_target_price.setChecked(self.settings.value("mode_smart", True, type=bool))
            self.target_price.setValue(self.settings.value("target_price", 0.0, type=float))
            self.interval_sec.setValue(self.settings.value("interval_sec", 300, type=int))
            self.amount_per_sell.setValue(self.settings.value("amount_per_sell", 1.0, type=float))
            self.max_sells.setValue(self.settings.value("max_sells", 0, type=int))
            self.catch_up.setChecked(self.settings.value("catch_up", False, type=bool))
            
            # Подключаем сохранение при изменении
            self.use_network_gas.toggled.connect(lambda v: self.settings.setValue("use_network_gas", v))
            self.deadline_min.valueChanged.connect(lambda v: self.settings.setValue("deadline_min", v))
            self.slippage_pct.valueChanged.connect(lambda v: self.settings.setValue("slippage_pct", float(v)))
            self.price_check_interval_sec.valueChanged.connect(lambda v: self.settings.setValue("price_check_interval_sec", v))
            self.gas_gwei.valueChanged.connect(lambda v: self.settings.setValue("gas_gwei", float(v)))
            self.cooldown_between_sales_sec.valueChanged.connect(lambda v: self.settings.setValue("cooldown_between_sales_sec", v))
            
            # Привязки для лимитов безопасности
            self.max_per_tx_plex.valueChanged.connect(lambda v: self.settings.setValue("max_per_tx_plex", float(v)))
            self.max_daily_plex.valueChanged.connect(lambda v: self.settings.setValue("max_daily_plex", float(v)))
            self.max_sales_per_hour.valueChanged.connect(lambda v: self.settings.setValue("max_sales_per_hour", int(v)))
            
            self.use_target_price.toggled.connect(lambda v: self.settings.setValue("mode_smart", v))
            self.target_price.valueChanged.connect(lambda v: self.settings.setValue("target_price", float(v)))
            self.interval_sec.valueChanged.connect(lambda v: self.settings.setValue("interval_sec", v))
            self.amount_per_sell.valueChanged.connect(lambda v: self.settings.setValue("amount_per_sell", float(v)))
            self.max_sells.valueChanged.connect(lambda v: self.settings.setValue("max_sells", v))
            self.catch_up.toggled.connect(lambda v: self.settings.setValue("catch_up", v))
            
        except Exception as e:
            self.ui_logger.write(f"⚠️ Ошибка восстановления настроек: {e}")

    def _on_slow_tick_changed(self, value):
        """Обрабатывает изменение настройки медленного тика"""
        self.slow_tick_interval = value
        self.settings.setValue("slow_tick_interval", value)
        self.ui_logger.write(f"⚙️ Медленный тик в фоне установлен: {value} сек")

    def _snapshot_params(self) -> dict:
        """Создает снимок текущих параметров"""
        return {
            "mode_smart": self.use_target_price.isChecked(),
            "target_price": float(self.target_price.value()),
            "interval_sec": int(self.interval_sec.value()),
            "amount_per_sell": float(self.amount_per_sell.value()),
            "max_sells": int(self.max_sells.value()),
            "catch_up": self.catch_up.isChecked(),
            "slippage_pct": float(self.slippage_pct.value()),
            "deadline_min": int(self.deadline_min.value()),
            "gas_gwei": float(self.gas_gwei.value()),
            "price_check_interval_sec": int(self.price_check_interval_sec.value()),
            "use_network_gas": self.use_network_gas.isChecked(),
        }

    def _apply_params(self, p: dict):
        """Применяет параметры из снимка"""
        self.use_target_price.setChecked(p.get("mode_smart", True))
        self.target_price.setValue(p.get("target_price", 0.0))
        self.interval_sec.setValue(p.get("interval_sec", 300))
        self.amount_per_sell.setValue(p.get("amount_per_sell", 1.0))
        self.max_sells.setValue(p.get("max_sells", 0))
        self.catch_up.setChecked(p.get("catch_up", False))
        self.slippage_pct.setValue(p.get("slippage_pct", 0.5))
        self.deadline_min.setValue(p.get("deadline_min", 20))
        self.gas_gwei.setValue(p.get("gas_gwei", 0.1))
        self.price_check_interval_sec.setValue(p.get("price_check_interval_sec", 5))
        self.use_network_gas.setChecked(p.get("use_network_gas", True))

    def _save_preset(self):
        """Сохраняет текущие параметры как пресет"""
        import json
        name, ok = QtWidgets.QInputDialog.getText(self, "Сохранить пресет", "Имя пресета:")
        if not ok or not name.strip(): 
            return
        try:
            params = self._snapshot_params()
            self.settings.setValue(f"preset/{name.strip()}", json.dumps(params))
            self.ui_logger.write(f"💾 Пресет «{name}» сохранён")
        except Exception as e:
            self._show_small_modal("Ошибка сохранения", f"Не удалось сохранить пресет: {e}")

    def _load_preset(self):
        """Загружает пресет"""
        import json
        try:
            # Получаем список пресетов
            all_keys = [k for k in self.settings.allKeys() if k.startswith("preset/")]
            if not all_keys:
                self._show_small_modal("Пресеты", "Пресеты пока не сохранены.")
                return
            
            # Показываем диалог выбора
            preset_names = [k.replace("preset/", "") for k in all_keys]
            name, ok = QtWidgets.QInputDialog.getItem(self, "Загрузить пресет", "Выберите:", preset_names, 0, False)
            if not ok: 
                return
            
            # Загружаем и применяем
            raw = self.settings.value(f"preset/{name}", "")
            params = json.loads(raw)
            self._apply_params(params)
            self.ui_logger.write(f"📥 Пресет «{name}» загружен")
        except Exception as e:
            self._show_small_modal("Ошибка загрузки", f"Не удалось загрузить пресет: {e}")

    def _on_close_event(self, event):
        """Сохраняет настройки при закрытии приложения"""
        self.settings.setValue("slow_tick_interval", self.slow_tick_interval)

    # ---------- Авто-режим ----------
    def _on_auto_pause_toggle(self):
        if not self.autoseller: return
        self.autoseller.paused = not self.autoseller.paused
        self.btn_auto_pause.setText("Продолжить" if self.autoseller.paused else "Пауза")
        self.status_bar.showMessage("⏸ Пауза" if self.autoseller.paused else "▶ Продолжено", 1000)

    def _on_auto_stop_after(self):
        if not self.autoseller: return
        self.autoseller.stop_after_next = True
        self.status_bar.showMessage("⏹ Остановить после следующей продажи", 1500)

    # ---------- Газ-политика: лесенка 0.1→0.2→0.1 ----------
    def _note_tx_success(self):
        if self.core:
            self.core.gas_floor_wei = to_wei_gwei(0.1)
            self.status_bar.showMessage("✅ TX подтверждён — пол газа: 0.1 gwei", 1200)

    def _note_tx_fail(self):
        if self.core:
            self.core.gas_floor_wei = to_wei_gwei(0.2)
            self.status_bar.showMessage("⚠️ Проблемы с TX — следующий пол газа: 0.2 gwei", 1500)

    def _on_offline_only_toggled(self, checked: bool):
        if self.core:
            self.core.offline_only = checked
        if checked and self.mode_proxy.isChecked():
            self._show_small_modal("Оффлайн-подпись", "В режиме «Только оффлайн-подпись» отправка через Proxy запрещена. Переключаюсь на Node RPC.")
            self.mode_node.setChecked(True)

    # ---------- Профили ----------
    def _settings(self) -> QtCore.QSettings:
        """Единая точка доступа к настройкам"""
        return QtCore.QSettings("PLEX","AutoSell")

    def _profiles_load_all(self):
        s = self._settings()
        self._profiles = {}
        size = int(s.value("profiles/_count", 0))
        for i in range(size):
            name = s.value(f"profiles/{i}/name", "")
            if not name: continue
            self._profiles[name] = {
                "node":  s.value(f"profiles/{i}/node",""),
                "proxy": s.value(f"profiles/{i}/proxy",""),
                "keys":  s.value(f"profiles/{i}/keys","")
            }
        # Обновляем combo только если он уже создан
        if hasattr(self, 'profile_combo'):
            self.profile_combo.blockSignals(True)
            self.profile_combo.clear()
            self.profile_combo.addItems(sorted(self._profiles.keys()))
            self.profile_combo.blockSignals(False)

    def _profile_save_current(self):
        name = self.profile_name.text().strip()
        if not name:
            self._show_small_modal("Профили","Введите имя профиля")
            return
        # в память
        self._profiles[name] = {
            "node":  self.node_url.text(),
            "proxy": self.proxy_url.text(),
            "keys":  self.proxy_keys.text()
        }
        # в QSettings
        s = self._settings()
        names = sorted(self._profiles.keys())
        s.setValue("profiles/_count", len(names))
        for i,n in enumerate(names):
            p = self._profiles[n]
            s.setValue(f"profiles/{i}/name", n)
            s.setValue(f"profiles/{i}/node", p["node"])
            s.setValue(f"profiles/{i}/proxy", p["proxy"])
            s.setValue(f"profiles/{i}/keys", p["keys"])
        self._profiles_load_all()
        self.status_bar.showMessage("💾 Профиль сохранён", 1500)

    def _profile_delete_current(self):
        name = self.profile_combo.currentText()
        if not name: return
        self._profiles.pop(name, None)
        s = self._settings()
        names = sorted(self._profiles.keys())
        s.setValue("profiles/_count", len(names))
        for i,n in enumerate(names):
            p = self._profiles[n]
            s.setValue(f"profiles/{i}/name", n)
            s.setValue(f"profiles/{i}/node", p["node"])
            s.setValue(f"profiles/{i}/proxy", p["proxy"])
            s.setValue(f"profiles/{i}/keys", p["keys"])
        self._profiles_load_all()
        self.status_bar.showMessage("🗑 Профиль удалён", 1500)

    def _profile_apply(self, name: str):
        p = self._profiles.get(name)
        if not p: return
        self.node_url.setText(p["node"])
        self.proxy_url.setText(p["proxy"])
        self.proxy_keys.setText(p["keys"])
        self.status_bar.showMessage(f"🔁 Профиль «{name}» загружен", 1500)

    def _create_rpc_stats_dock(self):
        dock = QtWidgets.QDockWidget("RPC-статистика", self)
        dock.setObjectName("rpc_stats_dock")
        w = QtWidgets.QWidget()
        g = QtWidgets.QGridLayout(w)
        # Метрики оформляем как «чипы», чтобы совпадало со стилем правых панелей
        self.lbl_calls   = QtWidgets.QLabel("Вызовы: —");      self.lbl_calls.setProperty("chip", True);   self.lbl_calls.setProperty("level","muted")
        self.lbl_gasreq  = QtWidgets.QLabel("gasPrice calls: —"); self.lbl_gasreq.setProperty("chip", True); self.lbl_gasreq.setProperty("level","muted")
        self.lbl_429     = QtWidgets.QLabel("429: —");         self.lbl_429.setProperty("chip", True);     self.lbl_429.setProperty("level","muted")
        self.lbl_5xx     = QtWidgets.QLabel("5xx: —");         self.lbl_5xx.setProperty("chip", True);     self.lbl_5xx.setProperty("level","muted")
        self.lbl_base    = QtWidgets.QLabel("База: —");        self.lbl_base.setProperty("chip", True);    self.lbl_base.setProperty("level","muted")
        self.lbl_key     = QtWidgets.QLabel("Ключ: —");        self.lbl_key.setProperty("chip", True);     self.lbl_key.setProperty("level","muted")
        g.addWidget(self.lbl_calls,  0,0,1,2)
        g.addWidget(self.lbl_gasreq, 1,0,1,2)
        g.addWidget(self.lbl_429,    2,0,1,1); g.addWidget(self.lbl_5xx,2,1,1,1)
        g.addWidget(self.lbl_base,   3,0,1,2)
        g.addWidget(self.lbl_key,    4,0,1,2)
        # Кнопка ручного обновления (для единообразия с «Предварительной проверкой»)
        self.btn_rpc_refresh = QtWidgets.QPushButton("Обновить сейчас")
        self.btn_rpc_refresh.setToolTip("Принудительно обновить значения RPC-метрик")
        self.btn_rpc_refresh.clicked.connect(self._refresh_rpc_stats)
        g.addWidget(self.btn_rpc_refresh, 5,0,1,2)
        dock.setWidget(w)
        self.addDockWidget(QtCore.Qt.RightDockWidgetArea, dock)
        self.rpc_stats_dock = dock

    def _refresh_rpc_stats(self):
        if not self.core:
            return
        st = getattr(self.core, "stats", {}) or {}
        # поддерживаем оба варианта ключа ('call' и 'calls') на всякий случай
        self.lbl_calls.setText(f"Вызовы: {st.get('calls', st.get('call', '—'))}")
        self.lbl_gasreq.setText(f"gasPrice calls: {st.get('gas', '—')}")
        self.lbl_429.setText(f"429: {st.get('429','—')}")
        self.lbl_5xx.setText(f"5xx: {st.get('5xx','—')}")
        base = getattr(self, "_explorer_base", lambda: "")()
        self.lbl_base.setText(f"База: {base or '—'}")
        keyi = None
        try:
            keyi = self.core.proxy_active_index()
        except Exception:
            keyi = getattr(self.core, 'proxy_key_index', None)
        self.lbl_key.setText(f"Ключ: #{keyi if keyi is not None else '—'}")

    def _save_layout(self):
        """Сохраняет текущую раскладку (единый namespace настроек)"""
        settings = self._settings()
        settings.setValue("layout/geometry", self.saveGeometry())
        settings.setValue("layout/windowState", self.saveState(1))  # LAYOUT_VERSION
        settings.setValue("layout/uiScale", self.ui_scale)
        # ✚ запоминаем ширины колонок центральной панели
        try:
            if hasattr(self, "right_splitter") and self.right_splitter:
                settings.setValue("center/sizes", self.right_splitter.sizes())
        except Exception:
            pass

    def _restore_layout(self):
        """Восстанавливает сохраненную раскладку (единый namespace настроек)"""
        settings = self._settings()
        # Восстанавливаем геометрию
        geometry = settings.value("layout/geometry")
        if geometry:
            self.restoreGeometry(geometry)
        
        # Восстанавливаем состояние доков
        window_state = settings.value("layout/windowState")
        if window_state:
            self.restoreState(window_state, 1)  # LAYOUT_VERSION
        
        # Восстанавливаем масштаб
        ui_scale = settings.value("layout/uiScale", 1.0, type=float)  # DEFAULT_UI_SCALE
        self.ui_scale = ui_scale
        self._apply_ui_scale()
        # Восстановим ширины колонок после раскладки
        self._restore_center_columns()

    def _apply_ui_scale(self):
        """Применяет масштаб к UI (исправлено: больше не заглушка)"""
        font = QtWidgets.QApplication.font()
        # Базовый размер шрифта сохраняем при старте — если вдруг его нет, восстановим
        try:
            base = self.base_point_size
        except AttributeError:
            self.base_point_size = QtWidgets.QApplication.font().pointSizeF()
            base = self.base_point_size
        font.setPointSizeF(base * self.ui_scale)
        QtWidgets.QApplication.setFont(font)
        self.update()

    # --- Компактный статус-бар ---
    def _toggle_compact_status(self, checked: bool):
        self.compact_status = checked
        # Перерисовываем все четыре чипа согласно последним значениям
        self.status_network.setText(self._fmt_status_network())
        self.status_gas.setText(self._fmt_status_gas() if self._last_gas is not None else "⛽ —")
        self.status_price.setText(self._fmt_status_price() if self._last_price is not None else "💱 —")
        self.status_auto.setText(self._fmt_status_auto())

    def _fmt_status_network(self) -> str:
        return (f"🌐 {self._last_net}") if self.compact_status else (f"Сеть: {self._last_net}")
    def _fmt_status_gas(self) -> str:
        return (f"⛽ {self._last_gas:.3f}") if self.compact_status else (f"Газ: {self._last_gas:.3f} gwei")
    def _fmt_status_price(self) -> str:
        return (f"💱 {self._last_price}") if self.compact_status else (f"Цена: {self._last_price} USDT/PLEX")
    def _fmt_status_auto(self) -> str:
        return (f"🤖 {'ВКЛ' if self._last_auto else 'ВЫКЛ'}") if self.compact_status else (f"Авто: {'ВКЛ' if self._last_auto else 'ВЫКЛ'}")

    def _set_chip(self, lbl: QtWidgets.QLabel, text: str, level: str):
        lbl.setText(text)
        lbl.setProperty("level", level)
        lbl.style().unpolish(lbl); lbl.style().polish(lbl); lbl.update()

    def on_precheck(self):
        """Запуск READ-проверок на основе текущих полей UI"""
        try:
            if not self.core or not self.addr:
                self.ui_logger.write("⚠️ Сначала подключите кошелёк")
                return
            # Считываем входы
            # Кол-во PLEX — берём из ручного поля, если 0 → из Interval-режима
            amt = Decimal(self.amount_plex.value())
            if amt <= 0:
                amt = Decimal(self.amount_per_sell.value())
            amount_in_raw = int(amt * (10 ** 9))

            gas_price_wei = self.core.current_gas_price(
                to_wei_gwei(float(self.gas_gwei.value())),
                use_network_gas=self.use_network_gas.isChecked()
            )
            limits = {
                'max_per_tx_plex': float(self.max_per_tx_plex.value()),
                'max_daily_plex': float(self.max_daily_plex.value()),
                'max_sales_per_hour': int(self.max_sales_per_hour.value())
            }
            user_slip = float(self.slippage.value())  # ручной слиппедж (%)
            deadline_min = int(self.deadline_min.value())

            s = self.core.precheck_summary(self.addr, amount_in_raw, gas_price_wei, user_slip, deadline_min, limits)
            # ✚ запоминаем последний результат и разрешаем экспорт
            self._last_precheck = s
            self.btn_precheck_copy.setEnabled(True)

            # Обновляем чипы
            self._set_chip(self.pf_net,   f"Сеть: {'OK' if s['network']['ok'] else s['network']['msg']}", "ok" if s['network']['ok'] else "err")
            bal_text = f"PLEX: {from_units(s['balance_plex']['have'],9)} / нужно {from_units(s['balance_plex']['need'],9)}"
            self._set_chip(self.pf_bal,   bal_text, "ok" if s['balance_plex']['ok'] else "err")
            alw_text = f"Allowance: {from_units(s['allowance']['have'],9)} / нужно {from_units(s['allowance']['need'],9)}"
            self._set_chip(self.pf_allow, alw_text, "ok" if s['allowance']['ok'] else "warn")
            gas_need = s['bnb_gas']['need']; gas_have = s['bnb_gas']['have']
            gas_text = f"BNB на газ: {gas_have / (10**18):.6f} / нужно {gas_need / (10**18):.6f} (≈{s['bnb_gas']['est_units']}u)"
            self._set_chip(self.pf_gas,   gas_text, "ok" if s['bnb_gas']['ok'] else "err")
            mo = s['min_out']['min_out']; exp = s['min_out']['expected']
            self._set_chip(self.pf_min,   f"Мин.выход: {from_units(mo,18)} (ожид. {from_units(exp,18)})", "ok" if s['min_out']['ok'] else "warn")
            self._set_chip(self.pf_lim,   f"Лимиты: {s['limits']['msg']}", "ok" if s['limits']['ok'] else "err")
            self._set_chip(self.pf_pair,  f"Пара: {s['pair_ok']['msg']}", "ok" if s['pair_ok']['ok'] else "err")
            # Резервы с показом динамических порогов
            rs = s.get('reserves', {})
            if rs:
                res_text = (f"Резервы: PLEX={rs.get('plex',0):.6f} (min {rs.get('min_plex',0):.6f}) | "
                            f"USDT={rs.get('usdt',0):.6f} (min {rs.get('min_usdt',0):.6f})")
                self._set_chip(self.pf_res, res_text, "ok" if rs.get('ok') else "err")
            # ✚ Обновляем подсказки у кнопок действий
            self._update_action_hints(s)

        except Exception as e:
            self.ui_logger.write(f"❌ Ошибка предварительной проверки: {e}")

    # ---------- Экспорт результата пред-проверки ----------
    def _precheck_to_text(self, s: dict) -> str:
        def yn(ok): return "OK" if ok else "FAIL"
        lines = []
        lines.append(f"Сеть: {yn(s['network']['ok'])} {s['network'].get('msg','')}")
        lines.append(f"PLEX баланс: {from_units(s['balance_plex']['have'],9)} / нужно {from_units(s['balance_plex']['need'],9)} — {yn(s['balance_plex']['ok'])}")
        lines.append(f"Allowance: {from_units(s['allowance']['have'],9)} / нужно {from_units(s['allowance']['need'],9)} — {yn(s['allowance']['ok'])}")
        lines.append(f"BNB на газ: {s['bnb_gas']['have']/(10**18):.6f} / нужно {s['bnb_gas']['need']/(10**18):.6f} (≈{s['bnb_gas']['est_units']}u) — {yn(s['bnb_gas']['ok'])}")
        lines.append(f"Мин.выход: {from_units(s['min_out']['min_out'],18)} (ожид. {from_units(s['min_out']['expected'],18)}) — {yn(s['min_out']['ok'])}")
        lines.append(f"Лимиты: {s['limits']['msg']} — {yn(s['limits']['ok'])}")
        lines.append(f"Пара: {s['pair_ok']['msg']} — {yn(s['pair_ok']['ok'])}")
        # Общий вердикт
        blockers = []
        if not s['network']['ok']: blockers.append("сеть")
        if not s['pair_ok']['ok']: blockers.append("пара")
        if not s['balance_plex']['ok']: blockers.append("PLEX")
        if not s['bnb_gas']['ok']: blockers.append("BNB")
        if not s['limits']['ok']: blockers.append("лимиты")
        if not s['min_out']['ok']: blockers.append("мин.выход")
        allow_warn = (not s['allowance']['ok'])
        verdict = "ГОТОВО" if (not blockers and not allow_warn) else ("НУЖЕН APPROVE" if (not blockers and allow_warn) else f"НЕТ: {', '.join(blockers)}")
        lines.append(f"\nВердикт: {verdict}")
        return "\n".join(lines)

    def _export_precheck(self):
        """Копирует сводку пред-проверки в буфер обмена"""
        if not self._last_precheck:
            self.status_bar.showMessage("ℹ Нет данных пред-проверки", 1500)
            return
        try:
            text = self._precheck_to_text(self._last_precheck)
            QtWidgets.QApplication.clipboard().setText(text)
            self.status_bar.showMessage("📋 Результат пред-проверки скопирован", 1500)
        except Exception as e:
            self.ui_logger.write(f"⚠️ Не удалось скопировать сводку: {e}")

    # ---------- Помощники правой панели ----------
    def _reset_trade_params_defaults(self):
        """Сбрасывает торговые параметры к безопасным значениям"""
        try:
            self.gas_gwei.setValue(0.1)
            self.slippage.setValue(1.0)
            self.slippage_pct.setValue(0.5)
            self.deadline_min.setValue(20)
            self.use_network_gas.setChecked(True)
            self.target_price.setValue(0.0)
            self.price_check_interval_sec.setValue(5)
            self.cooldown_between_sales_sec.setValue(0)
            self.interval_sec.setValue(300)
            self.amount_per_sell.setValue(1.0)
            self.max_sells.setValue(0)
            self.catch_up.setChecked(False)
            self.ui_logger.write("↩ Параметры сброшены к безопасным значениям")
        except Exception as e:
            self.ui_logger.write(f"⚠️ Не удалось сбросить параметры: {e}")

    def _toggle_trade_controls(self, disabled: bool):
        """Блокирует/разблокирует правую панель и связанные элементы при авто-режиме"""
        widgets = [
            self.amount_plex, self.slippage, self.gas_gwei, self.deadline_min,
            self.slippage_pct, self.use_network_gas, self.target_price,
            self.price_check_interval_sec, self.cooldown_between_sales_sec,
            self.use_target_price, self.interval_sec, self.amount_per_sell,
            self.max_sells, self.catch_up, self.btn_precheck, self.btn_trade_reset
        ]
        for w in widgets:
            w.setEnabled(not disabled)

    # ---------- Автопроверка и подсказки ----------
    def _wire_precheck_triggers(self):
        """Подключает триггеры автопроверки к основным полям"""
        for w in (
            self.amount_plex, self.slippage, self.gas_gwei, self.deadline_min,
            self.use_network_gas, self.amount_per_sell, self.interval_sec,
            self.target_price, self.slippage_pct  # ✚ реагируем и на параметры Smart/Auto
        ):
            try:
                if isinstance(w, QtWidgets.QAbstractSpinBox):
                    w.valueChanged.connect(lambda *_: self._schedule_precheck())
                else:
                    # QCheckBox / др.
                    w.toggled.connect(lambda *_: self._schedule_precheck())
            except Exception:
                pass
        # ✚ Переключение режима Smart/Interval тоже триггерит пред-проверку
        try:
            self.use_target_price.toggled.connect(lambda *_: self._schedule_precheck())
        except Exception:
            pass

    def _schedule_precheck(self, delay_ms: int = 600):
        """Запускает отсчёт дебаунса для автопроверки"""
        if not (self.core and self.addr):
            return
        # Не дёргаем в момент активного авто-режима с блокировкой контролов
        if self.autoseller and self.autoseller.isRunning():
            return
        self.precheck_timer.start(max(50, delay_ms))

    def _auto_precheck(self):
        """Выполняет тихую автопроверку без модалок"""
        try:
            # используем уже существующий on_precheck (он не показывает модалки)
            self.on_precheck()
        except Exception:
            pass

    def _update_action_hints(self, s: dict):
        """Обновляет чипы у кнопок действий по результатам precheck"""
        # Блокеры для продажи
        blockers = []
        if not s["network"]["ok"]:      blockers.append(f"Сеть: {s['network']['msg']}")
        if not s["pair_ok"]["ok"]:      blockers.append("Пара: неверные токены")
        if not s["balance_plex"]["ok"]: blockers.append("Недостаточно PLEX")
        if not s["bnb_gas"]["ok"]:      blockers.append("Недостаточно BNB на газ")
        if not s["limits"]["ok"]:       blockers.append(f"Лимиты: {s['limits']['msg']}")
        if not s["min_out"]["ok"]:      blockers.append("Мин.выход = 0 / нет ликвидности")
        if not s["reserves"]["ok"]:
            rs = s['reserves']
            blockers.append(f"Резервы ниже минимума "
                            f"(PLEX {rs.get('plex',0):.3f}/{rs.get('min_plex',0):.3f}, "
                            f"USDT {rs.get('usdt',0):.3f}/{rs.get('min_usdt',0):.3f})")
        warn_allow = not s["allowance"]["ok"]

        # Продажа
        if not blockers and not warn_allow:
            self._set_chip(self.sell_hint, "Продажа: OK", "ok")
            self.sell_hint.setToolTip("Все проверки пройдены")
        elif not blockers and warn_allow:
            self._set_chip(self.sell_hint, "Продажа: требуется approve", "warn")
            self.sell_hint.setToolTip("Approve на текущую сумму обязателен перед продажей")
        else:
            self._set_chip(self.sell_hint, "Продажа: требуется внимание", "err")
            self.sell_hint.setToolTip("• " + "\n• ".join(blockers))

        # Approve
        if warn_allow:
            self._set_chip(self.approve_hint, "Approve: требуется", "warn")
            need = s["allowance"]["need"]; have = s["allowance"]["have"]
            self.approve_hint.setToolTip(f"Allowance: {from_units(have,9)} / нужно {from_units(need,9)}")
        else:
            self._set_chip(self.approve_hint, "Approve: не требуется", "muted")
            self.approve_hint.setToolTip("Allowance достаточен")

    # ---------- Центральная панель из 3 колонок ----------
    def _mount_center_params_panel(self):
        """Пересаживает содержимое 3 правых доков в центральный горизонтальный сплиттер"""
        try:
            # Если уже существует — не дублируем
            if hasattr(self, "right_splitter") and self.right_splitter:
                self.right_splitter.setVisible(True)
                return
            self.right_splitter = QtWidgets.QSplitter(QtCore.Qt.Horizontal)
            self.right_splitter.setObjectName("center_params_splitter")
            self.right_splitter.setChildrenCollapsible(False)
            self.right_splitter.setHandleWidth(8)
            self.right_splitter.setMinimumHeight(360)  # повыше, чтобы всё влезало без скроллов

            def adopt(dock: QtWidgets.QDockWidget) -> QtWidgets.QGroupBox:
                """
                Переносим именно ВНУТРЕННИЙ виджет с формой (без рамки скролла).
                Если в доке стоит QScrollArea — берём её .widget()/.takeWidget().
                Если обычный QWidget — переносим его напрямую.
                """
                src = dock.widget()
                inner = None
                if isinstance(src, QtWidgets.QScrollArea):
                    inner = src.takeWidget() or src.widget()
                    src.setWidget(None)
                else:
                    inner = src
                if inner is None:
                    inner = QtWidgets.QWidget()
                # важно: отвязываем источник от дока, чтобы виджет был виден в новом контейнере
                dock.setWidget(None)

                # GroupBox-обёртка с корректными политиками размеров
                box = QtWidgets.QGroupBox(dock.windowTitle())
                v = QtWidgets.QVBoxLayout(box)
                v.setContentsMargins(8, 8, 8, 8)
                v.setSpacing(6)
                inner.setParent(box)
                inner.setMinimumWidth(280)
                inner.setSizePolicy(QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Expanding)
                box.setSizePolicy(QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Expanding)
                inner.show()  # <-- гарантируем, что контент видим
                v.addWidget(inner)
                dock.hide()
                return box

            col_trade = adopt(self.trading_dock)
            col_safe  = adopt(self.safety_dock)
            col_pre   = adopt(self.precheck_dock)
            # ✚ Переносим RPC-статистику как четвёртую колонку
            try:
                col_rpc = adopt(self.rpc_stats_dock)
            except Exception:
                col_rpc = None

            self.right_splitter.addWidget(col_trade)
            self.right_splitter.addWidget(col_safe)
            self.right_splitter.addWidget(col_pre)
            if col_rpc is not None:
                self.right_splitter.addWidget(col_rpc)
            # Пропорции по умолчанию (можно менять вручную)
            self.right_splitter.setStretchFactor(0, 4)  # торговля — шире
            self.right_splitter.setStretchFactor(1, 3)
            self.right_splitter.setStretchFactor(2, 3)
            if col_rpc is not None:
                self.right_splitter.setStretchFactor(3, 2)
            # И сразу зададим стартовые ширины
            self._reset_center_columns(initial=True)

            # вставляем в центральный layout
            if hasattr(self, "main_layout"):
                self.main_layout.addWidget(self.right_splitter)
        except Exception as e:
            # не критично: просто оставим доки как есть
            try:
                self.ui_logger.write(f"⚠️ Не удалось собрать центральную панель: {e}")
            except Exception:
                pass

    def _reset_center_columns(self, initial: bool=False):
        """Выровнять ширины колонок центральной панели"""
        if not hasattr(self, "right_splitter") or not self.right_splitter:
            return
        total = max(1000, self.width())
        count = self.right_splitter.count()
        if count >= 4:
            # 4 колонки: Торговля / Лимиты / Предпроверка / RPC
            s0 = int(total * 0.30)
            s1 = int(total * 0.25)
            s2 = int(total * 0.25)
            s3 = max(240, total - s0 - s1 - s2)
            self.right_splitter.setSizes([s0, s1, s2, s3])
        else:
            # 3 колонки (fallback)
            s0 = int(total * 0.34)
            s1 = int(total * 0.33)
            s2 = total - s0 - s1
            self.right_splitter.setSizes([s0, s1, s2])
        if not initial:
            self.status_bar.showMessage("↔ Колонки параметров выровнены", 1200)

    def _restore_center_columns(self):
        """Восстанавливает сохранённые ширины колонок из QSettings"""
        try:
            if not hasattr(self, "right_splitter") or not self.right_splitter:
                return
            s = self._settings()
            sizes = s.value("center/sizes")
            # Поддерживаем разные форматы QSettings: [int], [str], QStringList, строка "a,b,c"
            ints = None
            if isinstance(sizes, (list, tuple)):
                try:
                    ints = [int(x) for x in sizes if str(x).strip() != ""]
                except Exception:
                    ints = None
            elif isinstance(sizes, str):
                parts = [p.strip() for p in sizes.strip("[]()").split(",")]
                if parts:
                    try:
                        ints = [int(p) for p in parts if p]
                    except Exception:
                        ints = None
            if ints and all(isinstance(v, int) and v > 0 for v in ints):
                self.right_splitter.setSizes(ints)
        except Exception:
            pass

    # ---- P0: Self-test соединения ----
    def on_self_test(self):
        try:
            t0 = time.time()
            mode = "Node" if self.mode_node.isChecked() else "Proxy"
            # chainId + ping
            if mode == "Node":
                cid = self.core.node_w3.eth.chain_id
            else:
                self.core._proxy_sleep_before_call()
                cid_hex = self.core.proxy.eth_chainId()
                cid = int(cid_hex, 16) if (isinstance(cid_hex, str) and cid_hex.startswith('0x')) else int(cid_hex)
            t_ping = (time.time() - t0) * 1000.0
            # decimals
            plex_dec = self.core.get_decimals(PLEX)
            usdt_dec = self.core.get_decimals(USDT)
            # резервы/цена
            price, rplex, rusdt, _ = self.core.get_price_and_reserves()
            ok = (cid == 56) and plex_dec == 9 and usdt_dec == 18 and rplex > 0 and rusdt > 0
            verdict = "OK" if ok else "⚠️ Проверьте сеть/пару/decimals"
            prov = self._proxy_provider() if mode == "Proxy" else "-"
            text = [
                f"Режим: {mode}",
                f"Provider: {prov}",
                f"chainId: {cid}",
                f"Ping: {t_ping:.1f} ms",
                f"decimals: PLEX={plex_dec}, USDT={usdt_dec}",
                f"Резервы: PLEX={from_units(rplex,9)}, USDT={from_units(rusdt,18)}",
                f"Цена: {fmt_price(price)} USDT / 1 PLEX",
                f"\nВердикт: {verdict}"
            ]
            lvl = "ok" if ok else "warn"
            self._show_small_modal("Тест связи", "\n".join(text))
            self.status_bar.showMessage(f"🧪 Self-test: {verdict}", 2000)
        except Exception as e:
            msg = str(e)
            if "Proxy auth error" in msg or "Invalid API Key" in msg:
                try:
                    self.proxy_keys.setStyleSheet("border:1px solid #d33;")
                    self.proxy_url.setStyleSheet("border:1px solid #d33;")
                except Exception:
                    pass
            self._show_small_modal("Тест связи", f"⛔ Ошибка: {msg}")

def main():
    # Включаем поддержку HiDPI
    QtCore.QCoreApplication.setAttribute(QtCore.Qt.AA_EnableHighDpiScaling, True)
    QtCore.QCoreApplication.setAttribute(QtCore.Qt.AA_UseHighDpiPixmaps, True)
    
    app = QtWidgets.QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()
