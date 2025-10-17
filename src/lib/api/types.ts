/**
 * API Configuration
 */
export const API_CONFIG = {
  // Base URLs
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  
  // Endpoints
  endpoints: {
    transactions: '/api/transactions',
    stats: '/api/stats',
    userStats: '/api/user/stats',
    userTransactions: '/api/user/transactions',
    health: '/api/health',
  },
  
  // Request settings
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  
  // WebSocket settings
  ws: {
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000, // 30 seconds
    messageTimeout: 5000, // 5 seconds
  },
  
  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Transaction types (должны совпадать с типами бота)
 */
export interface Transaction {
  id: string;
  hash: string;
  timestamp: number;
  blockNumber: number;
  
  // Trade info
  type: 'V2-V2' | 'V3-V3' | 'V2-V3' | 'V3-V2';
  route: string[]; // Token symbols
  routeAddresses: string[]; // Token addresses
  
  // Profit
  profit: {
    usd: number;
    percent: number;
    bnb: number;
  };
  
  // Gas
  gas: {
    used: number;
    price: string; // Gwei
    cost: number; // BNB
  };
  
  // Status
  status: 'pending' | 'success' | 'failed';
  error?: string;
  
  // User (if authenticated)
  userId?: string;
  userAddress?: string;
}

export interface Stats {
  // Global stats
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalProfit: number; // USD
  
  // Time-based
  last24h: {
    transactions: number;
    profit: number;
  };
  last7d: {
    transactions: number;
    profit: number;
  };
  last30d: {
    transactions: number;
    profit: number;
  };
  
  // Averages
  avgProfit: number; // USD
  avgGas: number; // BNB
  successRate: number; // %
  
  // Last update
  lastUpdate: number;
}

export interface UserStats {
  userId: string;
  userAddress: string;
  
  // Totals
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalProfit: number; // USD
  
  // Averages
  avgProfit: number;
  successRate: number;
  
  // Rankings (if available)
  rank?: number;
  percentile?: number;
  
  // Activity
  firstTransaction?: number;
  lastTransaction?: number;
  activeDays: number;
}

/**
 * Filter and sort options
 */
export interface TransactionFilters {
  status?: 'pending' | 'success' | 'failed' | 'all';
  type?: 'V2-V2' | 'V3-V3' | 'V2-V3' | 'V3-V2' | 'all';
  minProfit?: number;
  maxProfit?: number;
  startDate?: number;
  endDate?: number;
  tokens?: string[]; // Filter by specific tokens
}

export type TransactionSortBy =
  | 'timestamp'
  | 'profit'
  | 'gas'
  | 'blockNumber';

export type SortOrder = 'asc' | 'desc';

/**
 * WebSocket message types
 */
export enum WSMessageType {
  // Client → Server
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  PING = 'ping',
  
  // Server → Client
  PONG = 'pong',
  NEW_TRANSACTION = 'new_transaction',
  TRANSACTION_UPDATE = 'transaction_update',
  STATS_UPDATE = 'stats_update',
  ERROR = 'error',
}

export interface WSMessage<T = any> {
  type: WSMessageType;
  data?: T;
  timestamp: number;
  id?: string;
}

export interface WSSubscription {
  channel: 'transactions' | 'stats' | 'user';
  filters?: TransactionFilters;
}

/**
 * Error types
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}
