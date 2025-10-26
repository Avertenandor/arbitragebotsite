'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import type { Transaction } from '@/lib/api/types';
import { fmtNumber } from '@/utils/format';

// Мок данные для разработки (fallback)
const mockTransactions: Transaction[] = [
  {
    id: '1',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    timestamp: Date.now() - 1000 * 60 * 5,
    blockNumber: 12345678,
    type: 'V2-V3',
    route: ['WBNB', 'USDT', 'WBNB'],
    routeAddresses: ['0x...', '0x...', '0x...'],
    profit: { usd: 12.45, percent: 0.87, bnb: 0.025 },
    gas: { used: 180234, price: '3 Gwei', cost: 0.0054 },
    status: 'success',
  },
  {
    id: '2',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    timestamp: Date.now() - 1000 * 60 * 8,
    blockNumber: 12345670,
    type: 'V3-V3',
    route: ['USDT', 'CAKE', 'USDT'],
    routeAddresses: ['0x...', '0x...', '0x...'],
    profit: { usd: 8.32, percent: 0.54, bnb: 0.017 },
    gas: { used: 195821, price: '3 Gwei', cost: 0.0059 },
    status: 'success',
  },
  {
    id: '3',
    hash: '0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef',
    timestamp: Date.now() - 1000 * 60 * 12,
    blockNumber: 12345665,
    type: 'V2-V2',
    route: ['WBNB', 'BUSD', 'WBNB'],
    routeAddresses: ['0x...', '0x...', '0x...'],
    profit: { usd: -2.15, percent: -0.12, bnb: -0.0044 },
    gas: { used: 172345, price: '3 Gwei', cost: 0.0052 },
    status: 'failed',
  },
  {
    id: '4',
    hash: '0xdef01234567890abcdef01234567890abcdef01234567890abcdef01234567890',
    timestamp: Date.now() - 1000 * 30,
    blockNumber: 12345690,
    type: 'V3-V2',
    route: ['USDT', 'ETH', 'USDT'],
    routeAddresses: ['0x...', '0x...', '0x...'],
    profit: { usd: 0, percent: 0, bnb: 0 },
    gas: { used: 0, price: '3 Gwei', cost: 0 },
    status: 'pending',
  },
];

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}ч ${minutes % 60}м назад`;
  }
  if (minutes > 0) {
    return `${minutes}м ${seconds}с назад`;
  }
  return `${seconds}с назад`;
}

function formatHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const configs = {
    pending: {
      color: 'var(--warning)',
      bg: 'rgba(255, 184, 0, 0.08)',
      border: 'rgba(255, 184, 0, 0.2)',
      text: 'В обработке',
      icon: (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1V3M7 11V13M1 7H3M11 7H13M2.5 2.5L3.9 3.9M10.1 10.1L11.5 11.5M2.5 11.5L3.9 10.1M10.1 3.9L11.5 2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    success: {
      color: 'var(--accent)',
      bg: 'rgba(0, 255, 163, 0.08)',
      border: 'rgba(0, 255, 163, 0.2)',
      text: 'Успешно',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M11.5 4L5.5 10L2.5 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    failed: {
      color: 'var(--danger)',
      bg: 'rgba(255, 77, 106, 0.08)',
      border: 'rgba(255, 77, 106, 0.2)',
      text: 'Отклонено',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M10 4L4 10M4 4L10 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  };

  const config = configs[status];

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}

function TransactionCard({ tx, index }: { tx: Transaction; index: number }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.hash);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.4,
        ease: [0.19, 1, 0.22, 1]
      }}
      whileHover={{ scale: 1.01, y: -2 }}
      className="group glass-elevated rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-[var(--border-color-hover)] hover:shadow-lg cursor-pointer relative overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/0 to-[var(--secondary)]/0 group-hover:from-[var(--primary)]/5 group-hover:to-[var(--secondary)]/5 transition-all duration-500 rounded-2xl" />
      
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left: Transaction Info */}
        <div className="flex-1 space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className="inline-flex px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-mono font-bold"
              >
                {tx.type}
              </motion.span>
              <StatusBadge status={tx.status} />
            </div>
          </div>

          {/* Hash Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[var(--text-secondary)] font-mono tracking-tight">
              {formatHash(tx.hash)}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
              onClick={handleCopy}
            >
              <AnimatePresence mode="wait">
                {isCopied ? (
                  <motion.svg
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-[var(--accent)]"
                  >
                    <path
                      d="M13 4L6 11L3 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 11V3C3 2.44772 3.44772 2 4 2H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href={`https://bscscan.com/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M12 4H8M12 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>
          </div>

          {/* Route Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {tx.route.map((token, i) => (
              <div key={i} className="flex items-center gap-2">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="font-semibold text-[var(--text-primary)] px-2 py-1 rounded bg-[var(--bg-tertiary)]/50"
                >
                  {token}
                </motion.span>
                {i < tx.route.length - 1 && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[var(--primary)] flex-shrink-0">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Meta Row */}
          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] flex-wrap">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1V6L9 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {formatTime(tx.timestamp)}
            </span>
            <span className="text-[var(--border-color)]">•</span>
            <span className="font-mono">Gas: {tx.gas.price}</span>
            <span className="text-[var(--border-color)]">•</span>
            <span className="font-mono">Block #{fmtNumber(tx.blockNumber)}</span>
          </div>
        </div>

        {/* Right: Profit */}
        <div className="flex flex-col items-end justify-center gap-2 min-w-[140px] lg:ml-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`text-3xl font-black tracking-tight ${
              tx.profit.usd > 0
                ? 'text-[var(--accent)]'
                : tx.profit.usd < 0
                ? 'text-[var(--danger)]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            {tx.profit.usd > 0 ? '+' : ''}${fmtNumber(tx.profit.usd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${
              tx.profit.percent > 0
                ? 'text-[var(--accent)]'
                : tx.profit.percent < 0
                ? 'text-[var(--danger)]'
                : 'text-[var(--text-muted)]'
            }`}>
              {tx.profit.percent > 0 ? '+' : ''}{fmtNumber(tx.profit.percent, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              {fmtNumber(tx.profit.bnb, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} BNB
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TransactionWindow() {
  const {
    transactions: realTransactions,
    stats,
    isLoading,
    error,
    isConnected,
    refresh,
  } = useTransactions({
    enableRealtime: true,
    autoFetch: true,
  });

  const useMockData = process.env.NODE_ENV === 'development' && realTransactions.length === 0;
  const transactions = useMockData ? mockTransactions : realTransactions;

  const [clientFilter, setClientFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  
  const filteredTransactions =
    clientFilter === 'all'
      ? transactions
      : transactions.filter((tx) => tx.status === clientFilter);

  const displayStats = stats || {
    totalTransactions: transactions.length,
    successfulTransactions: transactions.filter((tx) => tx.status === 'success').length,
    failedTransactions: transactions.filter((tx) => tx.status === 'failed').length,
    totalProfit: transactions
      .filter((tx) => tx.status === 'success')
      .reduce((sum, tx) => sum + tx.profit.usd, 0),
  };

  const filterButtons = [
    { key: 'all', label: 'Все', count: transactions.length },
    { key: 'success', label: 'Успешные', count: displayStats.successfulTransactions },
    { key: 'failed', label: 'Отклонённые', count: displayStats.failedTransactions },
    { key: 'pending', label: 'В обработке', count: transactions.filter(tx => tx.status === 'pending').length },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 space-y-6"
      >
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient">
            Транзакции в реальном времени
          </h2>
          {isConnected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-elevated border border-[var(--accent)]/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
              </span>
              <span className="text-sm font-bold text-[var(--accent)]">LIVE</span>
            </motion.div>
          )}
        </div>
        
        {useMockData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-elevated border border-[var(--warning)]/20 text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[var(--warning)]">
              <path d="M9 2L2 15H16L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="9" cy="12.5" r="0.5" fill="currentColor" />
            </svg>
            <span className="text-[var(--text-secondary)]">Dev Mode: Используются демо-данные</span>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl glass-elevated border border-[var(--danger)]/20"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[var(--danger)]">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M10 6V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="10" cy="14" r="1" fill="currentColor" />
            </svg>
            <span className="text-[var(--danger)] font-medium">{error}</span>
            <button
              onClick={refresh}
              className="px-3 py-1 rounded-lg bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 text-[var(--danger)] text-sm font-semibold transition-colors"
            >
              Повторить
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Всего', value: displayStats.totalTransactions, gradient: 'from-[var(--primary)] to-[var(--secondary)]' },
          { label: 'Успешно', value: displayStats.successfulTransactions, gradient: 'from-[var(--accent)] to-[var(--primary)]' },
          { label: 'Отклонено', value: displayStats.failedTransactions, gradient: 'from-[var(--danger)] to-[var(--secondary)]' },
          { label: 'Прибыль', value: `+$${fmtNumber(displayStats.totalProfit, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, gradient: 'from-[var(--accent)] to-[var(--accent-light)]' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="glass-elevated rounded-2xl p-5 text-center hover:border-[var(--border-color-hover)] transition-all cursor-default"
          >
            <div className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
              {stat.value}
            </div>
            <div className="text-sm text-[var(--text-tertiary)] font-medium">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar"
      >
        {filterButtons.map(({ key, label, count }) => (
          <motion.button
            key={key}
            onClick={() => setClientFilter(key as any)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              clientFilter === key
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-glow-primary'
                : 'glass-elevated text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--border-color-hover)]'
            }`}
          >
            <span>{label}</span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
              clientFilter === key
                ? 'bg-white/20'
                : 'bg-[var(--bg-tertiary)]'
            }`}>
              {count}
            </span>
          </motion.button>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 px-5 py-3 glass-elevated rounded-xl text-[var(--text-muted)] text-sm">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V4M8 12V14M2 8H4M12 8H14M3.5 3.5L4.9 4.9M11.1 11.1L12.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Загрузка...</span>
          </div>
        )}
      </motion.div>

      {/* Transactions List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx, index) => (
              <TransactionCard key={tx.id} tx={tx} index={index} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-2xl p-16 text-center"
            >
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">
                {isLoading ? 'Загрузка транзакций...' : 'Нет транзакций'}
              </h3>
              <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                {isLoading
                  ? 'Подключаемся к blockchain...'
                  : 'Транзакции с выбранным фильтром не найдены'}
              </p>
              {error && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refresh}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold hover:shadow-glow-primary transition-all"
                >
                  Повторить загрузку
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
