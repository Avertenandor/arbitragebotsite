'use client';

import { motion } from 'framer-motion';
import { useTilt } from '@/lib/hooks/useTilt';
import { useNumberCounter, useCurrencyCounter, usePercentageCounter } from '@/lib/hooks/useCounter';
import type { UserStats } from '@/lib/api/types';

interface StatsOverviewProps {
  stats: UserStats | null;
  isLoading: boolean;
}

export default function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  const tiltRef1 = useTilt<HTMLDivElement>({ max: 10, scale: 1.03, glare: true, maxGlare: 0.2 });
  const tiltRef2 = useTilt<HTMLDivElement>({ max: 10, scale: 1.03, glare: true, maxGlare: 0.2 });
  const tiltRef3 = useTilt<HTMLDivElement>({ max: 10, scale: 1.03, glare: true, maxGlare: 0.2 });
  const tiltRef4 = useTilt<HTMLDivElement>({ max: 10, scale: 1.03, glare: true, maxGlare: 0.2 });

  // Animated counters
  const totalTransactions = useNumberCounter(stats?.totalTransactions || 0);
  const totalProfit = useCurrencyCounter(stats?.totalProfit || 0, '$', 2);
  const avgProfit = useCurrencyCounter(stats?.avgProfit || 0, '$', 2);
  const successRate = usePercentageCounter(stats?.successRate || 0, 1);
  const successfulCount = useNumberCounter(stats?.successfulTransactions || 0);
  const failedCount = useNumberCounter(stats?.failedTransactions || 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass rounded-xl p-6 animate-pulse"
          >
            <div className="h-8 bg-[var(--bg-tertiary)] rounded mb-2" />
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-[var(--text-secondary)]">
          Нет данных для отображения
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Transactions */}
      <motion.div
        ref={tiltRef1}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6 transition-smooth cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-[var(--text-muted)] text-sm font-medium">
            Всего сделок
          </span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[var(--primary)]"
          >
            <path
              d="M20 7L12 3L4 7L12 11L20 7Z"
              fill="currentColor"
              opacity="0.8"
            />
            <path
              d="M4 12L12 16L20 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-[var(--primary)] relative z-10 tabular-nums">
          {totalTransactions}
        </div>
        <div className="mt-2 text-xs text-[var(--text-muted)] relative z-10">
          {stats.activeDays} активных дней
        </div>
      </motion.div>

      {/* Total Profit */}
      <motion.div
        ref={tiltRef2}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6 transition-smooth cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-[var(--text-muted)] text-sm font-medium">
            Общая прибыль
          </span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[var(--accent)]"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              fill="currentColor"
              opacity="0.8"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-[var(--accent)] relative z-10 tabular-nums">
          {totalProfit}
        </div>
        <div className="mt-2 text-xs text-[var(--text-muted)] relative z-10 tabular-nums">
          ~{avgProfit} средняя
        </div>
      </motion.div>

      {/* Success Rate */}
      <motion.div
        ref={tiltRef3}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6 transition-smooth cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-[var(--text-muted)] text-sm font-medium">
            Успешность
          </span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[var(--accent)]"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M8 12L11 15L16 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-[var(--accent)] relative z-10 tabular-nums">
          {successRate}
        </div>
        <div className="mt-2 text-xs text-[var(--text-muted)] relative z-10 tabular-nums">
          {successfulCount} успешных
        </div>
      </motion.div>

      {/* Rank or Failed */}
      <motion.div
        ref={tiltRef4}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6 transition-smooth cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-[var(--text-muted)] text-sm font-medium">
            {stats.rank ? 'Рейтинг' : 'Неудачных'}
          </span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={
              stats.rank ? 'text-[var(--secondary)]' : 'text-[var(--danger)]'
            }
          >
            {stats.rank ? (
              <path
                d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"
                fill="currentColor"
              />
            ) : (
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            )}
          </svg>
        </div>
        <div
          className={`text-3xl sm:text-4xl font-bold relative z-10 tabular-nums ${
            stats.rank
              ? 'text-[var(--secondary)]'
              : 'text-[var(--danger)]'
          }`}
        >
          {stats.rank ? `#${stats.rank}` : failedCount}
        </div>
        <div className="mt-2 text-xs text-[var(--text-muted)] relative z-10">
          {stats.rank
            ? stats.percentile
              ? `Топ ${stats.percentile}%`
              : 'В лидерборде'
            : 'отклонено'}
        </div>
      </motion.div>
    </div>
  );
}
