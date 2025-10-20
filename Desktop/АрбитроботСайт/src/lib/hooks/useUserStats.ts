import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { apiClient } from '../api/client';
import type { UserStats, Transaction, PaginatedResponse } from '../api/types';

export interface UseUserStatsOptions {
  autoFetch?: boolean;
}

export interface UseUserStatsReturn {
  // User stats
  stats: UserStats | null;
  transactions: Transaction[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  
  // Actions
  fetchStats: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing user-specific stats and transactions
 */
export function useUserStats(
  options: UseUserStatsOptions = {}
): UseUserStatsReturn {
  const { autoFetch = true } = options;
  const { address, isConnected } = useWallet();

  // State
  const [stats, setStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  /**
   * Fetch user statistics
   */
  const fetchStats = useCallback(async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const userStats = await apiClient.getUserStats(address);
      setStats(userStats);
    } catch (err: any) {
      console.error('Failed to fetch user stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  /**
   * Fetch user transactions
   */
  const fetchTransactions = useCallback(async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response: PaginatedResponse<Transaction> =
        await apiClient.getUserTransactions(
          address,
          { status: 'all' },
          page,
          pageSize
        );

      setTransactions(response.items);
      setTotal(response.total);
      setHasMore(response.hasMore);
    } catch (err: any) {
      console.error('Failed to fetch user transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [address, page, pageSize]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchStats(), fetchTransactions()]);
  }, [fetchStats, fetchTransactions]);

  /**
   * Next page
   */
  const nextPage = useCallback(() => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  /**
   * Previous page
   */
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  /**
   * Auto-fetch on mount and when address changes
   */
  useEffect(() => {
    if (autoFetch && address && isConnected) {
      refresh();
    }
  }, [address, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Refetch transactions when page changes
   */
  useEffect(() => {
    if (autoFetch && address && isConnected && page > 1) {
      fetchTransactions();
    }
  }, [page, autoFetch, address, isConnected, fetchTransactions]);

  return {
    // Data
    stats,
    transactions,
    
    // UI State
    isLoading,
    error,
    
    // Pagination
    page,
    pageSize,
    total,
    hasMore,
    
    // Actions
    fetchStats,
    fetchTransactions,
    nextPage,
    prevPage,
    refresh,
  };
}
