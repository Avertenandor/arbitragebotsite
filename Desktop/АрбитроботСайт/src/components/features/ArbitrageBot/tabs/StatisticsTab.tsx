'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fmtNumber, formatters } from '@/utils/format';
import { useIsClient } from '@/hooks/useIsClient';

interface Statistics {
  blocksProcessed: number;
  opportunities: number;
  successTrades: number;
  failedTrades: number;
  totalProfitUSD: number;
  successRate: number;
}

interface Trade {
  timestamp: string;
  route: string;
  profit: number;
  gas: number;
  status: 'success' | 'failed';
  txHash: string;
}

// Генерация детерминированного хэша транзакции на основе индекса
const generateTxHash = (index: number) => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  // Используем индекс для детерминированной генерации
  for (let i = 0; i < 64; i++) {
    hash += chars[(index * 7 + i * 3) % chars.length];
  }
  return hash;
};

export default function StatisticsTab() {
  const isClient = useIsClient();

  const [statistics] = useState<Statistics>({
    blocksProcessed: 1245678,
    opportunities: 8543,
    successTrades: 7821,
    failedTrades: 722,
    totalProfitUSD: 45678.92,
    successRate: 91.5,
  });

  // Инициализируем пустым массивом для SSR
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

  // Заполняем данные на клиенте
  useEffect(() => {
    if (isClient && recentTrades.length === 0) {
      const mockTrades: Trade[] = [
        {
          timestamp: formatters.time(new Date(Date.now() - 300000)),
          route: 'PancakeSwap V2 → BiSwap',
          profit: 12.45,
          gas: 0.0012,
          status: 'success',
          txHash: generateTxHash(0),
        },
        {
          timestamp: formatters.time(new Date(Date.now() - 600000)),
          route: 'ApeSwap → BakerySwap',
          profit: 8.32,
          gas: 0.0015,
          status: 'success',
          txHash: generateTxHash(1),
        },
        {
          timestamp: formatters.time(new Date(Date.now() - 900000)),
          route: 'PancakeSwap V3 → MDEX',
          profit: -2.15,
          gas: 0.0018,
          status: 'failed',
          txHash: generateTxHash(2),
        },
        {
          timestamp: formatters.time(new Date(Date.now() - 1200000)),
          route: 'BiSwap → PancakeSwap V2',
          profit: 15.67,
          gas: 0.0011,
          status: 'success',
          txHash: generateTxHash(3),
        },
        {
          timestamp: formatters.time(new Date(Date.now() - 1500000)),
          route: 'BakerySwap → ApeSwap',
          profit: 6.89,
          gas: 0.0013,
          status: 'success',
          txHash: generateTxHash(4),
        },
      ];
      setRecentTrades(mockTrades);
    }
  }, [isClient, recentTrades.length]);

  // Данные для графика прибыли (моковые)
  const [profitHistory] = useState([
    { day: 'Mon', profit: 1200 },
    { day: 'Tue', profit: 1850 },
    { day: 'Wed', profit: 1400 },
    { day: 'Thu', profit: 2100 },
    { day: 'Fri', profit: 1750 },
    { day: 'Sat', profit: 2300 },
    { day: 'Sun', profit: 1900 },
  ]);

  // Получение цвета для success rate
  const getSuccessRateColor = () => {
    if (statistics.successRate >= 90) return 'success';
    if (statistics.successRate >= 75) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-4">
      {/* БЛОК 1: ЗАГОЛОВОК */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4"
      >
        <h2 className="text-xl font-bold text-gradient">
          📊 Статистика
        </h2>
      </motion.div>

      {/* БЛОК 2: ОСНОВНЫЕ МЕТРИКИ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <MetricCard
          icon="📦"
          title="Blocks Processed"
          value={fmtNumber(statistics.blocksProcessed)}
          color="info"
        />
        <MetricCard
          icon="🎯"
          title="Opportunities"
          value={fmtNumber(statistics.opportunities)}
          color="warning"
        />
        <MetricCard
          icon="✅"
          title="Success Trades"
          value={fmtNumber(statistics.successTrades)}
          color="success"
        />
        <MetricCard
          icon="❌"
          title="Failed Trades"
          value={fmtNumber(statistics.failedTrades)}
          color="danger"
        />
        <MetricCard
          icon="💰"
          title="Total Profit"
          value={formatters.currency(statistics.totalProfitUSD)}
          color="success"
        />
        <MetricCard
          icon="📈"
          title="Success Rate"
          value={`${fmtNumber(statistics.successRate)}%`}
          color={getSuccessRateColor() as any}
        />
      </motion.div>

      {/* БЛОК 3: ГРАФИК ПРИБЫЛИ (PLACEHOLDER) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="bg-[var(--bg-tertiary)] px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-bold flex items-center gap-2">
            📈 Weekly Profit Chart
          </h3>
        </div>

        <div className="p-6">
          {/* График placeholder */}
          <div className="relative h-64 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] flex items-end justify-around p-6 gap-2">
            {profitHistory.map((point, index) => {
              const maxProfit = Math.max(...profitHistory.map(p => p.profit));
              const heightPercent = (point.profit / maxProfit) * 100;

              return (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="text-xs text-[var(--success)] font-bold mb-1">
                    ${point.profit}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-[var(--success)] to-[var(--success)]/50 rounded-t-lg min-h-[20px]"
                    title={`${point.day}: $${point.profit}`}
                  />
                  <p className="text-xs text-[var(--text-tertiary)] font-semibold">
                    {point.day}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-[var(--text-tertiary)]">
              Данные за последние 7 дней
            </p>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 4: ТАБЛИЦА НЕДАВНИХ СДЕЛОК */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="bg-[var(--bg-tertiary)] px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-bold flex items-center gap-2">
            📜 Recent Trades
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Profit USD
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Gas BNB
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  TX Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((trade, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors ${
                    trade.status === 'success'
                      ? 'bg-[var(--success)]/5'
                      : 'bg-[var(--danger)]/5'
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)] font-mono">
                    {trade.timestamp}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {trade.route}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`font-bold ${
                        trade.profit > 0
                          ? 'text-[var(--success)]'
                          : 'text-[var(--danger)]'
                      }`}
                    >
                      {trade.profit > 0 ? '+' : ''}${fmtNumber(trade.profit, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-mono">
                    {fmtNumber(trade.gas, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        trade.status === 'success'
                          ? 'bg-[var(--success)]/20 text-[var(--success)]'
                          : 'bg-[var(--danger)]/20 text-[var(--danger)]'
                      }`}
                    >
                      {trade.status === 'success' ? '✅ Success' : '❌ Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={`https://bscscan.com/tx/${trade.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-mono text-xs"
                      title={trade.txHash}
                    >
                      {trade.txHash.substring(0, 8)}...
                      {trade.txHash.substring(trade.txHash.length - 6)}
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

// Компонент карточки метрики
interface MetricCardProps {
  icon: string;
  title: string;
  value: string;
  color: 'primary' | 'success' | 'danger' | 'warning' | 'info';
}

function MetricCard({ icon, title, value, color }: MetricCardProps) {
  const colorClasses = {
    primary: 'text-[var(--primary)]',
    success: 'text-[var(--success)]',
    danger: 'text-[var(--danger)]',
    warning: 'text-[var(--warning)]',
    info: 'text-[var(--info)]',
  };

  return (
    <div className="glass rounded-xl p-5 hover:border-[var(--border-color-hover)] transition-all group">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
            {title}
          </p>
          <p className={`text-2xl font-bold ${colorClasses[color]} truncate`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
