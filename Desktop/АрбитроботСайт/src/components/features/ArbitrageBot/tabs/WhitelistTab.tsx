'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface WhitelistToken {
  address: string;
  symbol: string;
  decimals: number;
  poolV2: string;
  poolV3: string;
  reason: string;
  lastCheckBlock: number;
  status: 'candidate' | 'whitelisted';
}

// Моковые данные популярных токенов BNB Chain
const WHITELIST_DATA: WhitelistToken[] = [
  {
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    symbol: 'WBNB',
    decimals: 18,
    poolV2: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
    poolV3: '0x36696169C63e42cd08ce11f5deeBbCeBae652050',
    reason: 'Native wrapped token, high liquidity',
    lastCheckBlock: 34567890,
    status: 'whitelisted',
  },
  {
    address: '0x55d398326f99059fF775485246999027B3197955',
    symbol: 'USDT',
    decimals: 18,
    poolV2: '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE',
    poolV3: '0x92b7807bF19b7DDdf89b706143896d05228f3121',
    reason: 'Stablecoin, verified contract',
    lastCheckBlock: 34567888,
    status: 'whitelisted',
  },
  {
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    symbol: 'BUSD',
    decimals: 18,
    poolV2: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
    poolV3: '0x36696169C63e42cd08ce11f5deeBbCeBae652050',
    reason: 'Stablecoin, trusted team',
    lastCheckBlock: 34567885,
    status: 'whitelisted',
  },
  {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    symbol: 'USDC',
    decimals: 18,
    poolV2: '0xd99c7F6C65857AC913a8f880A4cb84032AB2FC5b',
    poolV3: '0x1ac1A8FEaAEa1900C4166dEeed0C11cC10669D36',
    reason: 'Stablecoin, high liquidity',
    lastCheckBlock: 34567882,
    status: 'whitelisted',
  },
  {
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    symbol: 'ETH',
    decimals: 18,
    poolV2: '0x74E4716E431f45807DCF19f284c7aA99F18a4fbc',
    poolV3: '0x46Cf1cF8c69595804ba91dFdd8d6b960c9B0a7C4',
    reason: 'Wrapped ETH, verified contract',
    lastCheckBlock: 34567880,
    status: 'whitelisted',
  },
  {
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    symbol: 'BTCB',
    decimals: 18,
    poolV2: '0xF45cd219aEF8618A92BAa7aD848364a158a24F33',
    poolV3: '0x46Cf1cF8c69595804ba91dFdd8d6b960c9B0a7C4',
    reason: 'Wrapped BTC, high TVL',
    lastCheckBlock: 34567878,
    status: 'whitelisted',
  },
  {
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    symbol: 'CAKE',
    decimals: 18,
    poolV2: '0x0eD7e52944161450477ee417DE9Cd3a859b14fD0',
    poolV3: '0x133B3D95bAD5405d14d53473671200e9342896BF',
    reason: 'DEX token, audit passed',
    lastCheckBlock: 34567875,
    status: 'whitelisted',
  },
  {
    address: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',
    symbol: 'XRP',
    decimals: 18,
    poolV2: '0x03F18135c44C64ebFdCBad8297fe5bDafdBbdd86',
    poolV3: '0x4f3126d5DE26413AbDCF6948943FB9D0847d9818',
    reason: 'Wrapped XRP, good liquidity',
    lastCheckBlock: 34567872,
    status: 'candidate',
  },
  {
    address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
    symbol: 'ADA',
    decimals: 18,
    poolV2: '0x28415ff2C35b65B9E5c7de82126b4015ab9d031F',
    poolV3: '0xBb7Dc0a1b8B95b18e04374B17C7DEd38B1aEF8B5',
    reason: 'Wrapped ADA, community trusted',
    lastCheckBlock: 34567870,
    status: 'candidate',
  },
  {
    address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
    symbol: 'DOGE',
    decimals: 8,
    poolV2: '0xac109C8025F272414fd9e2faA805a583708A017f',
    poolV3: '0x3Ee2200Efb3400fAbB9AacF31297cBdD1d435D47',
    reason: 'Wrapped DOGE, verified contract',
    lastCheckBlock: 34567868,
    status: 'candidate',
  },
];

export default function WhitelistTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'candidate' | 'whitelisted'>('all');

  // Фильтрация данных
  const filteredData = useMemo(() => {
    return WHITELIST_DATA.filter((token) => {
      const matchesSearch =
        searchQuery === '' ||
        token.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || token.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Счётчики
  const counters = useMemo(() => {
    const candidates = WHITELIST_DATA.filter((t) => t.status === 'candidate').length;
    const whitelisted = WHITELIST_DATA.filter((t) => t.status === 'whitelisted').length;
    return { candidates, whitelisted, total: WHITELIST_DATA.length };
  }, []);

  // Копирование в буфер обмена
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Скопировано: ${text.substring(0, 10)}...`);
  };

  // Открытие в BSCScan
  const handleOpenBSCScan = (address: string) => {
    window.open(`https://bscscan.com/address/${address}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* ЗАГОЛОВОК */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 flex flex-wrap items-center gap-4"
      >
        <h2 className="text-xl font-bold text-gradient flex-shrink-0">
          ✅ Whitelist - Проверенные токены
        </h2>
        <div className="flex items-center gap-3 ml-auto text-sm">
          <div className="px-3 py-1.5 rounded-lg bg-[var(--success)]/20 text-[var(--success)] font-semibold">
            Всего: {counters.total}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[var(--info)]/20 text-[var(--info)] font-semibold">
            Кандидаты: {counters.candidates}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[var(--success)]/20 text-[var(--success)] font-semibold">
            Одобрено: {counters.whitelisted}
          </div>
        </div>
      </motion.div>

      {/* ПАНЕЛЬ ФИЛЬТРОВ И УПРАВЛЕНИЯ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Поиск по адресу или символу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          >
            <option value="all">Все статусы</option>
            <option value="candidate">Кандидаты</option>
            <option value="whitelisted">Одобренные</option>
          </select>
          <button className="px-4 py-2.5 rounded-lg bg-[var(--success)]/20 text-[var(--success)] font-medium hover:bg-[var(--success)]/30 transition-colors">
            ➕ Добавить
          </button>
          <button className="px-4 py-2.5 rounded-lg bg-[var(--info)]/20 text-[var(--info)] font-medium hover:bg-[var(--info)]/30 transition-colors">
            🔄 Обновить
          </button>
        </div>
      </motion.div>

      {/* ТАБЛИЦА */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Токен
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Символ
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Dec
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Pool V2
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Pool V3
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Причина
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Блок
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl opacity-30">🔍</span>
                      <p className="text-[var(--text-tertiary)] text-sm">
                        Токены не найдены
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((token, index) => (
                  <motion.tr
                    key={token.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleCopy(token.address)}
                        className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-mono text-xs"
                        title={token.address}
                      >
                        {token.address.substring(0, 6)}...
                        {token.address.substring(token.address.length - 4)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)]">
                      {token.symbol}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {token.decimals}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleCopy(token.poolV2)}
                        className="text-[var(--info)] hover:text-[var(--info-hover)] font-mono text-xs"
                        title={token.poolV2}
                      >
                        {token.poolV2.substring(0, 6)}...
                        {token.poolV2.substring(token.poolV2.length - 4)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleCopy(token.poolV3)}
                        className="text-[var(--info)] hover:text-[var(--info-hover)] font-mono text-xs"
                        title={token.poolV3}
                      >
                        {token.poolV3.substring(0, 6)}...
                        {token.poolV3.substring(token.poolV3.length - 4)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {token.reason}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-tertiary)]">
                      {token.lastCheckBlock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          token.status === 'whitelisted'
                            ? 'bg-[var(--success)]/20 text-[var(--success)]'
                            : 'bg-[var(--info)]/20 text-[var(--info)]'
                        }`}
                      >
                        {token.status === 'whitelisted' ? '✅ Одобрен' : '⏳ Кандидат'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="bg-[var(--bg-tertiary)] px-4 py-3 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            💡 Клик на адрес → копирование | Данные обновляются каждые 15 секунд
          </p>
        </div>
      </motion.div>
    </div>
  );
}
