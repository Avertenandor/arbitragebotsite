'use client';

import { motion } from 'framer-motion';
import { useUserStats } from '@/lib/hooks/useUserStats';
import StatsOverview from '@/components/features/Dashboard/StatsOverview';
import UserTransactionsList from '@/components/features/Dashboard/UserTransactionsList';

/**
 * Dashboard Page - панель управления и статистика
 */
export default function DashboardPage() {
  const {
    stats,
    transactions,
    isLoading,
    error,
    page,
    hasMore,
    nextPage,
    prevPage,
    refresh,
  } = useUserStats({
    autoFetch: true,
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-2">
              Панель управления
            </h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Мониторинг и статистика ArbitroBot
            </p>
          </div>

          <button
            onClick={refresh}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium transition-smooth hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-start sm:self-auto"
          >
            <svg
              className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLoading ? 'Обновление...' : 'Обновить'}
          </button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 glass rounded-xl p-6 border-l-4 border-[var(--danger)]"
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-[var(--danger)] flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-[var(--danger)] font-medium">
                Ошибка загрузки данных
              </p>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-gradient">📊 Статистика</span>
        </h2>
        <StatsOverview stats={stats} isLoading={isLoading} />
      </motion.div>

      {/* Achievements / Milestones (Optional) */}
      {stats && stats.totalProfit > 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 glass rounded-xl p-6 border-l-4 border-[var(--accent)]"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div>
              <h3 className="text-lg font-bold text-[var(--accent)]">
                Поздравляем!
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">
                Вы заработали более $100 с помощью ArbitroBot!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-gradient">📜 История транзакций</span>
          {transactions.length > 0 && (
            <span className="text-sm font-normal text-[var(--text-muted)]">
              ({transactions.length} на странице)
            </span>
          )}
        </h2>
        <UserTransactionsList
          transactions={transactions}
          isLoading={isLoading}
          page={page}
          hasMore={hasMore}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      </motion.div>

      {/* Tips / Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="glass rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="text-lg font-bold text-[var(--primary)] mb-2">
                Как увеличить прибыль?
              </h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                <li>• Следите за успешными маршрутами</li>
                <li>• Увеличивайте объем капитала</li>
                <li>• Мониторьте лучшие временные интервалы</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔔</div>
            <div>
              <h3 className="text-lg font-bold text-[var(--primary)] mb-2">
                Настройте уведомления
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Получайте оповещения о новых прибыльных сделках в Telegram.
              </p>
              <button
                className="text-sm text-[var(--primary)] hover:underline"
                onClick={() => alert('Функция уведомлений в разработке')}
              >
                Настроить →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
