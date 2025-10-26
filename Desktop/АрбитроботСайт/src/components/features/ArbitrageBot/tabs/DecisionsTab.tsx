'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface DecisionStats {
  total: number;
  go: number;
  noGo: number;
}

interface DecisionReason {
  reason: string;
  count: number;
  percentage: number;
}

interface Decision {
  timestamp: string;
  decision: 'GO' | 'NO_GO';
  tokenPair: string;
  reason: string;
  profitEst: number;
  gasEst: number;
}

// Генерация случайной пары токенов
const generateTokenPair = () => {
  const tokens = ['WBNB', 'USDT', 'BUSD', 'CAKE', 'ETH', 'BTCB', 'DAI', 'ADA', 'DOT'];
  const token1 = tokens[Math.floor(Math.random() * tokens.length)];
  let token2 = tokens[Math.floor(Math.random() * tokens.length)];
  while (token2 === token1) {
    token2 = tokens[Math.floor(Math.random() * tokens.length)];
  }
  return `${token1}/${token2}`;
};

export default function DecisionsTab() {
  const [filter, setFilter] = useState<'all' | 'GO' | 'NO_GO'>('all');

  const [stats] = useState<DecisionStats>({
    total: 8543,
    go: 7821,
    noGo: 722,
  });

  const [reasons] = useState<DecisionReason[]>([
    { reason: 'Low Profit', count: 320, percentage: 44.3 },
    { reason: 'High Gas', count: 215, percentage: 29.8 },
    { reason: 'Low Liquidity', count: 125, percentage: 17.3 },
    { reason: 'Blacklisted', count: 62, percentage: 8.6 },
  ]);

  const [decisions] = useState<Decision[]>([
    {
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString('ru-RU'),
      decision: 'GO',
      tokenPair: 'WBNB/USDT',
      reason: 'Profitable opportunity',
      profitEst: 12.45,
      gasEst: 0.0012,
    },
    {
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString('ru-RU'),
      decision: 'NO_GO',
      tokenPair: 'CAKE/BUSD',
      reason: 'Low Profit',
      profitEst: 2.15,
      gasEst: 0.0015,
    },
    {
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString('ru-RU'),
      decision: 'GO',
      tokenPair: 'ETH/USDT',
      reason: 'Profitable opportunity',
      profitEst: 18.32,
      gasEst: 0.0011,
    },
    {
      timestamp: new Date(Date.now() - 240000).toLocaleTimeString('ru-RU'),
      decision: 'NO_GO',
      tokenPair: 'BTCB/WBNB',
      reason: 'High Gas',
      profitEst: 8.50,
      gasEst: 0.0025,
    },
    {
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString('ru-RU'),
      decision: 'GO',
      tokenPair: 'DAI/BUSD',
      reason: 'Profitable opportunity',
      profitEst: 6.89,
      gasEst: 0.0013,
    },
    {
      timestamp: new Date(Date.now() - 360000).toLocaleTimeString('ru-RU'),
      decision: 'NO_GO',
      tokenPair: 'ADA/USDT',
      reason: 'Low Liquidity',
      profitEst: 5.20,
      gasEst: 0.0014,
    },
    {
      timestamp: new Date(Date.now() - 420000).toLocaleTimeString('ru-RU'),
      decision: 'GO',
      tokenPair: 'DOT/WBNB',
      reason: 'Profitable opportunity',
      profitEst: 15.67,
      gasEst: 0.0010,
    },
    {
      timestamp: new Date(Date.now() - 480000).toLocaleTimeString('ru-RU'),
      decision: 'NO_GO',
      tokenPair: generateTokenPair(),
      reason: 'Blacklisted',
      profitEst: 0,
      gasEst: 0,
    },
  ]);

  // Фильтрация решений
  const filteredDecisions = decisions.filter((d) => {
    if (filter === 'all') return true;
    return d.decision === filter;
  });

  // Процент успеха
  const successRate = ((stats.go / stats.total) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* БЛОК 1: ЗАГОЛОВОК */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4"
      >
        <h2 className="text-xl font-bold text-gradient">
          🎯 Decisions Log
        </h2>
      </motion.div>

      {/* БЛОК 2: СЧЕТЧИКИ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <MetricCard
          icon="📊"
          title="Total Decisions"
          value={stats.total.toLocaleString()}
          color="info"
        />
        <MetricCard
          icon="✅"
          title="GO Decisions"
          value={stats.go.toLocaleString()}
          color="success"
        />
        <MetricCard
          icon="❌"
          title="NO_GO Decisions"
          value={stats.noGo.toLocaleString()}
          color="danger"
        />
      </motion.div>

      {/* БЛОК 3: SUCCESS RATE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            📈 Success Rate
          </h3>
          <span className="text-2xl font-bold text-[var(--success)]">
            {successRate}%
          </span>
        </div>

        {/* Прогресс-бар */}
        <div className="relative h-8 bg-[var(--bg-tertiary)] rounded-lg overflow-hidden border border-[var(--border-color)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${successRate}%` }}
            transition={{ duration: 1 }}
            className="h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-[var(--success)] to-[var(--success)]/80"
          >
            {parseFloat(successRate) > 10 && `${successRate}%`}
          </motion.div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
            <span className="text-[var(--text-secondary)]">
              GO: {stats.go.toLocaleString()} ({((stats.go / stats.total) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--danger)]" />
            <span className="text-[var(--text-secondary)]">
              NO_GO: {stats.noGo.toLocaleString()} ({((stats.noGo / stats.total) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 4: СТАТИСТИКА ПРИЧИН NO_GO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          📋 NO_GO Reasons Breakdown
        </h3>

        <div className="space-y-4">
          {reasons.map((reason, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {reason.reason}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  {reason.count} ({reason.percentage}%)
                </span>
              </div>
              <div className="relative h-4 bg-[var(--bg-tertiary)] rounded-lg overflow-hidden border border-[var(--border-color)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${reason.percentage}%` }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-[var(--danger)] to-[var(--danger)]/80"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* БЛОК 5: ФИЛЬТР */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            Фильтр:
          </span>
          <div className="flex gap-2">
            {(['all', 'GO', 'NO_GO'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  filter === option
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white shadow-lg'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/80 border border-[var(--border-color)]'
                }`}
              >
                {option === 'all' ? 'All' : option}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* БЛОК 6: ТАБЛИЦА РЕШЕНИЙ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="bg-[var(--bg-tertiary)] px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-bold flex items-center gap-2">
            📜 Recent Decisions ({filteredDecisions.length})
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
                  Decision
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Token Pair
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Profit Est.
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Gas Est.
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDecisions.map((decision, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors ${
                    decision.decision === 'GO'
                      ? 'bg-[var(--success)]/5'
                      : 'bg-[var(--danger)]/5'
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)] font-mono">
                    {decision.timestamp}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        decision.decision === 'GO'
                          ? 'bg-[var(--success)]/20 text-[var(--success)]'
                          : 'bg-[var(--danger)]/20 text-[var(--danger)]'
                      }`}
                    >
                      {decision.decision === 'GO' ? '✅ GO' : '❌ NO_GO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)] font-semibold">
                    {decision.tokenPair}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {decision.reason}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {decision.profitEst > 0 ? (
                      <span className="text-[var(--success)] font-bold">
                        +${decision.profitEst.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-mono">
                    {decision.gasEst > 0 ? decision.gasEst.toFixed(4) : '—'}
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
