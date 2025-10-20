'use client';

import { motion } from 'framer-motion';
import type { Transaction } from '@/lib/api/types';

interface UserTransactionsListProps {
  transactions: Transaction[];
  isLoading: boolean;
  page: number;
  hasMore: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export default function UserTransactionsList({
  transactions,
  isLoading,
  page,
  hasMore,
  onNextPage,
  onPrevPage,
}: UserTransactionsListProps) {
  if (isLoading && transactions.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--bg-tertiary)] rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-[var(--text-secondary)]">
          У вас пока нет транзакций
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header (Desktop) */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
        <div className="col-span-2">Время</div>
        <div className="col-span-3">Хэш</div>
        <div className="col-span-2">Тип</div>
        <div className="col-span-2">Маршрут</div>
        <div className="col-span-2">Прибыль</div>
        <div className="col-span-1">Статус</div>
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.01, y: -2 }}
            className="glass rounded-xl p-4 lg:p-6 transition-smooth hover:glow-primary cursor-pointer"
          >
            {/* Mobile Layout */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  {formatTime(tx.timestamp)}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    tx.status === 'success'
                      ? 'bg-[rgba(0,255,163,0.1)] text-[var(--accent)]'
                      : tx.status === 'failed'
                      ? 'bg-[rgba(255,77,106,0.1)] text-[var(--danger)]'
                      : 'bg-[rgba(255,184,0,0.1)] text-[var(--warning)]'
                  }`}
                >
                  {tx.status === 'success'
                    ? 'Успешно'
                    : tx.status === 'failed'
                    ? 'Отклонено'
                    : 'В обработке'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-[var(--text-secondary)]">
                  {formatHash(tx.hash)}
                </span>
                <a
                  href={`https://bscscan.com/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:opacity-80"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M10.5 3.5L3.5 10.5M10.5 3.5H7M10.5 3.5V7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--primary)] font-mono font-semibold text-xs">
                  {tx.type}
                </span>
                <span className="text-[var(--text-secondary)]">
                  {tx.route.join(' → ')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  Gas: {tx.gas.price}
                </span>
                <span
                  className={`text-lg font-bold ${
                    tx.profit.usd > 0
                      ? 'text-[var(--accent)]'
                      : tx.profit.usd < 0
                      ? 'text-[var(--danger)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {tx.profit.usd > 0 ? '+' : ''}
                  ${tx.profit.usd.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
              <div className="col-span-2 text-sm text-[var(--text-secondary)]">
                {formatTime(tx.timestamp)}
              </div>

              <div className="col-span-3 flex items-center gap-2">
                <span className="text-sm font-mono text-[var(--text-secondary)]">
                  {formatHash(tx.hash)}
                </span>
                <a
                  href={`https://bscscan.com/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:opacity-80"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M10.5 3.5L3.5 10.5M10.5 3.5H7M10.5 3.5V7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>

              <div className="col-span-2">
                <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--primary)] font-mono font-semibold text-xs">
                  {tx.type}
                </span>
              </div>

              <div className="col-span-2 text-sm text-[var(--text-secondary)]">
                {tx.route.join(' → ')}
              </div>

              <div className="col-span-2">
                <span
                  className={`text-lg font-bold ${
                    tx.profit.usd > 0
                      ? 'text-[var(--accent)]'
                      : tx.profit.usd < 0
                      ? 'text-[var(--danger)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {tx.profit.usd > 0 ? '+' : ''}
                  ${tx.profit.usd.toFixed(2)}
                </span>
              </div>

              <div className="col-span-1">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                    tx.status === 'success'
                      ? 'bg-[rgba(0,255,163,0.1)] text-[var(--accent)]'
                      : tx.status === 'failed'
                      ? 'bg-[rgba(255,77,106,0.1)] text-[var(--danger)]'
                      : 'bg-[rgba(255,184,0,0.1)] text-[var(--warning)]'
                  }`}
                >
                  {tx.status === 'success'
                    ? '✓'
                    : tx.status === 'failed'
                    ? '✗'
                    : '⏳'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onPrevPage}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-smooth disabled:opacity-50 disabled:cursor-not-allowed glass hover:glow-primary"
        >
          ← Назад
        </button>
        
        <span className="text-sm text-[var(--text-muted)]">
          Страница {page}
        </span>
        
        <button
          onClick={onNextPage}
          disabled={!hasMore}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-smooth disabled:opacity-50 disabled:cursor-not-allowed glass hover:glow-primary"
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
}
