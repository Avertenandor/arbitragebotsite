'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { fmtNumber } from '@/utils/format';

interface NodeMetrics {
  latency: number;
  rps: number;
  successRate: number;
  totalRequests: number;
}

export default function NodeTab() {
  const [isConnected, setIsConnected] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [metrics, setMetrics] = useState<NodeMetrics>({
    latency: 85,
    rps: 12.5,
    successRate: 99.5,
    totalRequests: 500000,
  });

  // RPS график данные (моковые)
  const [rpsHistory] = useState([
    { time: '00:00', value: 10.5 },
    { time: '00:05', value: 12.3 },
    { time: '00:10', value: 11.8 },
    { time: '00:15', value: 13.2 },
    { time: '00:20', value: 12.5 },
  ]);

  // Тест соединения
  const handleTestConnection = async () => {
    setIsTesting(true);

    // Симуляция теста
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Обновление метрик после теста
    setMetrics({
      latency: Math.floor(Math.random() * 30) + 70,
      rps: parseFloat((Math.random() * 5 + 10).toFixed(1)),
      successRate: parseFloat((Math.random() * 0.5 + 99).toFixed(1)),
      totalRequests: metrics.totalRequests + Math.floor(Math.random() * 100),
    });

    setIsConnected(true);
    setIsTesting(false);
    alert('Соединение успешно! Node работает стабильно.');
  };

  // Получение цвета для latency
  const getLatencyColor = () => {
    if (metrics.latency < 100) return 'success';
    if (metrics.latency < 200) return 'warning';
    return 'danger';
  };

  // Получение цвета для success rate
  const getSuccessRateColor = () => {
    if (metrics.successRate >= 99) return 'success';
    if (metrics.successRate >= 95) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-4">
      {/* БЛОК 1: ЗАГОЛОВОК С ИНДИКАТОРОМ СТАТУСА */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 flex flex-wrap items-center gap-4"
      >
        <h2 className="text-xl font-bold text-gradient flex-shrink-0">
          🌐 RPC Node
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
              isConnected
                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                : 'bg-[var(--danger)]/20 text-[var(--danger)]'
            }`}
          >
            <span className="text-lg">{isConnected ? '🟢' : '🔴'}</span>
            <span>{isConnected ? 'ПОДКЛЮЧЕН' : 'НЕ ПОДКЛЮЧЕН'}</span>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 2: МЕТРИКИ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          icon="⚡"
          title="Latency"
          value={`${fmtNumber(metrics.latency)}ms`}
          color={getLatencyColor() as any}
        />
        <MetricCard
          icon="📊"
          title="RPS"
          value={fmtNumber(metrics.rps, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          color="info"
        />
        <MetricCard
          icon="✅"
          title="Success Rate"
          value={`${fmtNumber(metrics.successRate)}%`}
          color={getSuccessRateColor() as any}
        />
        <MetricCard
          icon="📈"
          title="Total Requests"
          value={fmtNumber(metrics.totalRequests)}
          color="primary"
        />
      </motion.div>

      {/* БЛОК 3: ТЕСТ СОЕДИНЕНИЯ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          🔧 Диагностика
        </h3>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
              isTesting
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[var(--info)] to-[var(--info)]/80 text-white hover:opacity-90 hover:shadow-glow-primary'
            }`}
          >
            {isTesting ? '⏳ Тестирование...' : '🔍 Test Connection'}
          </button>
        </div>

        {isTesting && (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-[var(--info)] border-t-transparent rounded-full" />
              <p className="text-sm text-[var(--text-secondary)]">
                Проверка соединения с node...
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* БЛОК 4: ГРАФИК RPS (PLACEHOLDER) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="bg-[var(--bg-tertiary)] px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-bold flex items-center gap-2">
            📊 RPS History
          </h3>
        </div>

        <div className="p-6">
          {/* График placeholder */}
          <div className="relative h-64 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] flex items-end justify-around p-6 gap-2">
            {rpsHistory.map((point, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(point.value / 15) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-[var(--info)] to-[var(--info)]/50 rounded-t-lg min-h-[20px]"
                  title={`${point.time}: ${point.value} RPS`}
                />
                <p className="text-xs text-[var(--text-tertiary)] font-mono">
                  {point.time}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-[var(--text-tertiary)]">
              График обновляется в реальном времени
            </p>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 5: ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          ℹ️ Node Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Provider" value="Private Node" />
          <InfoRow label="Network" value="BSC Mainnet" />
          <InfoRow label="Chain ID" value="56" />
          <InfoRow label="Protocol" value="HTTPS/WSS" />
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

// Компонент информационной строки
interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)]">
      <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-base font-semibold text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}
