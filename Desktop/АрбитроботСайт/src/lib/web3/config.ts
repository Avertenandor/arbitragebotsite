// Web3 Provider Configuration
export const WEB3_CONFIG = {
  // BSC Mainnet
  chainId: 56,
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    primary: process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
    fallback: 'https://bsc-dataseed1.defibit.io/',
    backup: 'https://bsc-dataseed1.ninicoin.io/',
  },
  blockExplorerUrls: ['https://bscscan.com'],
  
  // Contracts
  contracts: {
    PLEX: process.env.NEXT_PUBLIC_PLEX_TOKEN_ADDRESS || '0x123...abc',
    AUTH: process.env.NEXT_PUBLIC_AUTH_ADDRESS || '0xdef...456',
  },
  
  // Settings
  requiredPlexAmount: '1', // 1 PLEX для входа
  transactionTimeout: 60000, // 60 секунд
  confirmations: 3, // Количество подтверждений
} as const;

// Supported Wallets
export const SUPPORTED_WALLETS = {
  METAMASK: 'metamask',
  WALLETCONNECT: 'walletconnect',
  TRUST: 'trust',
  BINANCE: 'binance',
} as const;

export type SupportedWallet = typeof SUPPORTED_WALLETS[keyof typeof SUPPORTED_WALLETS];

// Error Messages
export const WEB3_ERRORS = {
  NO_PROVIDER: 'Web3 провайдер не найден. Установите MetaMask или другой кошелёк.',
  WRONG_NETWORK: 'Неверная сеть. Переключитесь на BNB Smart Chain (BSC).',
  INSUFFICIENT_PLEX: 'Недостаточно PLEX токенов. Требуется минимум 1 PLEX.',
  USER_REJECTED: 'Вы отклонили запрос.',
  TRANSACTION_FAILED: 'Транзакция не удалась.',
  ALREADY_CONNECTED: 'Кошелёк уже подключен.',
  NOT_CONNECTED: 'Кошелёк не подключен.',
} as const;

// Transaction Status
export enum TxStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// Storage Keys
export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'arbitrobot_wallet_address',
  AUTH_TOKEN: 'arbitrobot_auth_token',
  AUTH_EXPIRY: 'arbitrobot_auth_expiry',
} as const;
