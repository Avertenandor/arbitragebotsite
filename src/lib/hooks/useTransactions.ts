import { useEffect, useCallback, useRef } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import { apiClient } from '../api/client';
import {
  getWebSocketClient,
  disconnectWebSocket,
} from '../api/websocket';
import type {
  Transaction,
  Stats,
  TransactionFilters,
  TransactionSortBy,
  SortOrder,
} from '../api/types';

export interface UseTransactionsOptions {
  enableRealtime?: boolean;
  autoFetch?: boolean;
  pollInterval?: number; // Fallback if WebSocket fails
}

export interface UseTransactionsReturn {
  // Data
  transactions: Transaction[];
  stats: Stats | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdate: number | null;
  
  // Filters and sorting
  filters: TransactionFilters;
  sortBy: TransactionSortBy;
  sortOrder: SortOrder;
  
  // Pagination
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  
  // Actions
  fetchTransactions: () => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  setSorting: (
    sortBy: TransactionSortBy,
    sortOrder: SortOrder
  ) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing transactions with real-time updates
 */
export function useTransactions(
  options: UseTransactionsOptions = {}
): UseTransactionsReturn {
  const {
    enableRealtime = true,
    autoFetch = true,
    pollInterval,
  } = options;

  // Store state
  const {
    transactions,
    stats,
    isLoading,
    error,
    filters,
    sortBy,
    sortOrder,
    page,
    pageSize,
    total,
    hasMore,
    isConnected,
    lastUpdate,
    setTransactions,
    addTransaction,
    updateTransaction,
    setStats,
    setLoading,
    setError,
    setFilters,
    clearFilters,
    setSorting,
    setPage,
    setPaginationMeta,
    nextPage: nextPageAction,
    prevPage: prevPageAction,
    setConnected,
    setLastUpdate,
  } = useTransactionStore();

  // WebSocket client ref
  const wsClient = useRef(
    enableRealtime ? getWebSocketClient() : null
  );

  // Poll interval ref
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch transactions from API
   */
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getTransactions(
        filters,
        sortBy,
        sortOrder,
        page,
        pageSize
      );

      setTransactions(response.items);
      setPaginationMeta({
        total: response.total,
        hasMore: response.hasMore,
      });

      setLastUpdate(Date.now());
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [
    filters,
    sortBy,
    sortOrder,
    page,
    pageSize,
    setTransactions,
    setLoading,
    setError,
    setPaginationMeta,
    setLastUpdate,
  ]);

  /**
   * Fetch stats from API
   */
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await apiClient.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [setStats]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchTransactions(), fetchStats()]);
  }, [fetchTransactions, fetchStats]);

  /**
   * Setup WebSocket for real-time updates
   */
  useEffect(() => {
    if (!enableRealtime || !wsClient.current) {
      return;
    }

    const ws = wsClient.current;

    // Set handlers
    ws.setHandlers({
      onNewTransaction: (tx: Transaction) => {
        console.log('New transaction:', tx);
        addTransaction(tx);
        // Also update stats
        fetchStats();
      },
      onTransactionUpdate: (tx: Transaction) => {
        console.log('Transaction updated:', tx);
        updateTransaction(tx.id, tx);
      },
      onStatsUpdate: (statsData: Stats) => {
        console.log('Stats updated');
        setStats(statsData);
      },
      onConnect: () => {
        console.log('WebSocket connected');
        setConnected(true);
        // Refresh data on connect
        refresh();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      },
      onReconnect: (attempt) => {
        console.log(`Reconnecting... (attempt ${attempt})`);
      },
    });

    // Connect
    ws.connect();

    // Subscribe to transactions channel
    ws.subscribe({ channel: 'transactions', filters });

    // Subscribe to stats channel
    ws.subscribe({ channel: 'stats' });

    // Cleanup
    return () => {
      ws.unsubscribe({ channel: 'transactions', filters });
      ws.unsubscribe({ channel: 'stats' });
    };
  }, [
    enableRealtime,
    filters,
    addTransaction,
    updateTransaction,
    setStats,
    setConnected,
    refresh,
    fetchStats,
  ]);

  /**
   * Setup polling as fallback
   */
  useEffect(() => {
    if (!pollInterval || enableRealtime) {
      return;
    }

    pollIntervalRef.current = setInterval(() => {
      refresh();
    }, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollInterval, enableRealtime, refresh]);

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Refetch when filters/sorting/page changes
   */
  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    fetchTransactions();
  }, [filters, sortBy, sortOrder, page, pageSize, fetchTransactions]);

  /**
   * Next page handler
   */
  const nextPage = useCallback(() => {
    nextPageAction();
  }, [nextPageAction]);

  /**
   * Previous page handler
   */
  const prevPage = useCallback(() => {
    prevPageAction();
  }, [prevPageAction]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Disconnect WebSocket if no other components are using it
      // (In production, you might want to keep connection alive)
      if (enableRealtime && wsClient.current) {
        // Optional: disconnectWebSocket();
      }

      // Clear poll interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [enableRealtime]);

  return {
    // Data
    transactions,
    stats,
    
    // UI State
    isLoading,
    error,
    isConnected,
    lastUpdate,
    
    // Filters and sorting
    filters,
    sortBy,
    sortOrder,
    
    // Pagination
    page,
    pageSize,
    total,
    hasMore,
    
    // Actions
    fetchTransactions,
    fetchStats,
    setFilters,
    clearFilters,
    setSorting,
    nextPage,
    prevPage,
    refresh,
  };
}
