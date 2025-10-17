import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Transaction,
  Stats,
  TransactionFilters,
  TransactionSortBy,
  SortOrder,
} from '../api/types';

/**
 * Transaction Store State
 */
interface TransactionState {
  // Data
  transactions: Transaction[];
  stats: Stats | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Filters and sorting
  filters: TransactionFilters;
  sortBy: TransactionSortBy;
  sortOrder: SortOrder;
  
  // Pagination
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  
  // WebSocket
  isConnected: boolean;
  lastUpdate: number | null;
}

/**
 * Transaction Store Actions
 */
interface TransactionActions {
  // Set data
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setStats: (stats: Stats) => void;
  
  // UI State
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filters
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  
  // Sorting
  setSorting: (sortBy: TransactionSortBy, sortOrder: SortOrder) => void;
  
  // Pagination
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setPaginationMeta: (meta: {
    total: number;
    hasMore: boolean;
  }) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // WebSocket
  setConnected: (isConnected: boolean) => void;
  setLastUpdate: (timestamp: number) => void;
  
  // Reset
  reset: () => void;
}

type TransactionStore = TransactionState & TransactionActions;

/**
 * Initial state
 */
const initialState: TransactionState = {
  transactions: [],
  stats: null,
  isLoading: false,
  error: null,
  filters: { status: 'all', type: 'all' },
  sortBy: 'timestamp',
  sortOrder: 'desc',
  page: 1,
  pageSize: 20,
  total: 0,
  hasMore: false,
  isConnected: false,
  lastUpdate: null,
};

/**
 * Transaction Store
 */
export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Set transactions (replace all)
      setTransactions: (transactions) => {
        set({ transactions, lastUpdate: Date.now() });
      },

      // Add new transaction (prepend)
      addTransaction: (transaction) => {
        set((state) => {
          // Check if transaction already exists
          const exists = state.transactions.some(
            (tx) => tx.id === transaction.id
          );

          if (exists) {
            return state;
          }

          return {
            transactions: [transaction, ...state.transactions],
            total: state.total + 1,
            lastUpdate: Date.now(),
          };
        });
      },

      // Update existing transaction
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
          lastUpdate: Date.now(),
        }));
      },

      // Set stats
      setStats: (stats) => {
        set({ stats });
      },

      // UI State
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      // Filters
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          page: 1, // Reset to first page on filter change
        }));
      },

      clearFilters: () => {
        set({
          filters: { status: 'all', type: 'all' },
          page: 1,
        });
      },

      // Sorting
      setSorting: (sortBy, sortOrder) => {
        set({ sortBy, sortOrder, page: 1 });
      },

      // Pagination
      setPage: (page) => {
        set({ page });
      },

      setPageSize: (pageSize) => {
        set({ pageSize, page: 1 });
      },

      setPaginationMeta: (meta) => {
        set(meta);
      },

      nextPage: () => {
        const { page, hasMore } = get();
        if (hasMore) {
          set({ page: page + 1 });
        }
      },

      prevPage: () => {
        const { page } = get();
        if (page > 1) {
          set({ page: page - 1 });
        }
      },

      // WebSocket
      setConnected: (isConnected) => {
        set({ isConnected });
      },

      setLastUpdate: (timestamp) => {
        set({ lastUpdate: timestamp });
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'arbitrobot-transactions', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        filters: state.filters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        pageSize: state.pageSize,
      }),
    }
  )
);

/**
 * Selectors (for performance optimization)
 */
export const selectFilteredTransactions = (state: TransactionStore) => {
  return state.transactions;
};

export const selectStats = (state: TransactionStore) => {
  return state.stats;
};

export const selectFilters = (state: TransactionStore) => {
  return {
    filters: state.filters,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  };
};

export const selectPagination = (state: TransactionStore) => {
  return {
    page: state.page,
    pageSize: state.pageSize,
    total: state.total,
    hasMore: state.hasMore,
  };
};

export const selectUIState = (state: TransactionStore) => {
  return {
    isLoading: state.isLoading,
    error: state.error,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
  };
};
