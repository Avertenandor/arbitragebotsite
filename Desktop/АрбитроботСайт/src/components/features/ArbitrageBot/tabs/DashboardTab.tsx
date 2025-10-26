'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fmtNumber, formatters } from '@/utils/format';
import NoSSR from '@/components/utils/NoSSR';

// Моковые данные для демонстрации
const useBotMetrics = () => {
  const [metrics, setMetrics] = useState({
    systemStatus: 'stopped' as 'stopped' | 'running',
    scannerStatus: 'ready' as 'ready' | 'active',
    currentBlock: 44123456,
    rpcRequests: { used: 847, limit: 5000000 },
    whitelistCount: 334,
    opportunities: 0,
    successfulTrades: 0,
    failedTrades: 0,
    profit: 0.0,
    scannedBlocks: 0,
    lastBlock: 0,
    successRate: 0,
  });

  const [logs, setLogs] = useState<string[]>([
    '[2025-10-25 14:30:00] [SYSTEM] Арбитражный бот инициализирован',
    '[2025-10-25 14:30:01] [SCANNER] Whitelist загружен: 334 токенов',
    '[2025-10-25 14:30:02] [RPC] Подключение к QuickNode установлено',
  ]);

  // Симуляция обновления данных каждые 2 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        currentBlock: prev.currentBlock + 1,
        rpcRequests: {
          ...prev.rpcRequests,
          // Используем детерминированное увеличение вместо random
          used: prev.rpcRequests.used + ((prev.currentBlock % 3) + 1),
        },
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addLog = (message: string) => {
    const timestamp = formatters.dateTime(new Date());
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  return { metrics, setMetrics, logs, addLog };
};

export default function DashboardTab() {
  const { metrics, setMetrics, logs, addLog } = useBotMetrics();
  const [observationMode, setObservationMode] = useState(false);
  const [confirmTrades, setConfirmTrades] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Автопрокрутка терминала
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleStart = () => {
    setMetrics((prev) => ({ ...prev, systemStatus: 'running', scannerStatus: 'active' }));
    addLog('[TRADING] 🟢 Торговая система запущена');
    addLog(observationMode ? '[TRADING] ⚠️ Режим наблюдения активен' : '[TRADING] ⚡ Режим реальной торговли');
  };

  const handleStop = () => {
    setMetrics((prev) => ({ ...prev, systemStatus: 'stopped', scannerStatus: 'ready' }));
    addLog('[TRADING] 🔴 Торговая система остановлена');
  };

  const handlePauseContract = () => {
    addLog('[CONTRACT] ⚠️ Смарт-контракт поставлен на паузу');
  };

  const clearLogs = () => {
    addLog('[TERMINAL] 🗑️ Логи очищены');
  };

  return (
    <div className="space-y-6">
      {/* БЛОК 1: ЗАГОЛОВОК С ИНДИКАТОРАМИ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 flex flex-wrap items-center gap-4"
      >
        <h2 className="text-xl font-bold text-gradient flex-shrink-0">
          📊 Дашборд арбитража
        </h2>
        <div className="flex flex-wrap items-center gap-4 ml-auto">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
              metrics.systemStatus === 'running'
                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                : 'bg-[var(--danger)]/20 text-[var(--danger)]'
            }`}
          >
            <span className={metrics.systemStatus === 'running' ? '🟢' : '🔴'}>
              {metrics.systemStatus === 'running' ? '🟢' : '🔴'}
            </span>
            <span>Система: {metrics.systemStatus === 'running' ? 'Работает' : 'Остановлена'}</span>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              metrics.scannerStatus === 'active'
                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                : 'bg-[var(--info)]/20 text-[var(--info)]'
            }`}
          >
            <span>{metrics.scannerStatus === 'active' ? '🟢' : '🔵'}</span>
            <span>Scanner: {metrics.scannerStatus === 'active' ? 'Активен' : 'Готов'}</span>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 2: ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          ⚡ Управление торговлей
        </h3>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleStart}
            disabled={metrics.systemStatus === 'running'}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--success)] to-[var(--success)]/80 text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-glow-accent"
          >
            🟢 СТАРТ
          </button>
          <button
            onClick={handleStop}
            disabled={metrics.systemStatus === 'stopped'}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--danger)] to-[var(--danger)]/80 text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-glow-accent"
          >
            🔴 СТОП
          </button>
          <button
            onClick={handlePauseContract}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--warning)] to-[var(--warning)]/80 text-white font-bold text-base transition-all hover:opacity-90 shadow-lg hover:shadow-glow-accent"
          >
            ⚠️ ПАУЗА КОНТРАКТА
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={observationMode}
              onChange={(e) => setObservationMode(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--warning)]"
            />
            <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              ⚠️ Режим наблюдения (без реальных сделок)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmTrades}
              onChange={(e) => setConfirmTrades(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--primary)]"
            />
            <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              Подтверждать каждую сделку
            </span>
          </label>
        </div>
      </motion.div>

      {/* БЛОК 3: СЕТКА МЕТРИК (3x3) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* РЯД 1 */}
        <MetricCard
          icon="📦"
          title="Текущий блок"
          value={fmtNumber(metrics.currentBlock)}
          color="info"
          dynamic
        />
        <MetricCard
          icon="🌐"
          title="RPC запросов (мес)"
          value={`${fmtNumber(metrics.rpcRequests.used)} / ${fmtNumber(metrics.rpcRequests.limit / 1000000, { maximumFractionDigits: 0 })}M`}
          color="success"
          tooltip="⚠️ Только этот проект (DexArbBot)\nНода обслуживает несколько проектов!"
          dynamic
        />
        <MetricCard
          icon="👁️"
          title="Whitelist"
          value={fmtNumber(metrics.whitelistCount)}
          color="success"
        />

        {/* РЯД 2 */}
        <MetricCard
          icon="💹"
          title="Возможности"
          value={fmtNumber(metrics.opportunities)}
          color="primary"
        />
        <MetricCard
          icon="✅"
          title="Успешно"
          value={fmtNumber(metrics.successfulTrades)}
          color="success"
        />
        <MetricCard
          icon="❌"
          title="Неудачно"
          value={fmtNumber(metrics.failedTrades)}
          color="danger"
        />

        {/* РЯД 3 */}
        <MetricCard
          icon="💰"
          title="Профит (USDT)"
          value={fmtNumber(metrics.profit, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
          color="success"
          large
        />
        <MetricCard
          icon="🔍"
          title="Отсканировано"
          value={`${fmtNumber(metrics.scannedBlocks)} блоков`}
          subtitle={`последний: ${fmtNumber(metrics.lastBlock)}`}
          color="primary"
        />
        <MetricCard
          icon="⚡"
          title="Success Rate"
          value={`${fmtNumber(metrics.successRate)}%`}
          color="warning"
        />
      </motion.div>

      {/* БЛОК 4: ЖИВОЙ ТЕРМИНАЛ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="bg-[var(--bg-tertiary)] px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            📝 Живой терминал
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => alert('Полный терминал в разработке')}
              className="px-3 py-1.5 rounded-lg bg-[var(--info)]/20 text-[var(--info)] text-xs font-medium hover:bg-[var(--info)]/30 transition-colors"
            >
              🔍 Полный терминал
            </button>
            <button
              onClick={clearLogs}
              className="px-3 py-1.5 rounded-lg bg-[var(--text-muted)]/20 text-[var(--text-secondary)] text-xs font-medium hover:bg-[var(--text-muted)]/30 transition-colors"
            >
              🗑️ Очистить
            </button>
          </div>
        </div>
        <div
          ref={terminalRef}
          className="bg-[#0d0d0d] p-4 font-mono text-xs text-[#ddd] h-64 overflow-y-auto overflow-x-auto"
        >
          {logs.map((log, index) => (
            <div key={index} className="mb-1 whitespace-pre-wrap">
              {log}
            </div>
          ))}
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
  subtitle?: string;
  tooltip?: string;
  large?: boolean;
  dynamic?: boolean; // Флаг для динамических данных (блок, RPC счетчики и т.д.)
}

function MetricCard({ icon, title, value, color, subtitle, tooltip, large, dynamic }: MetricCardProps) {
  const colorClasses = {
    primary: 'text-[var(--primary)]',
    success: 'text-[var(--success)]',
    danger: 'text-[var(--danger)]',
    warning: 'text-[var(--warning)]',
    info: 'text-[var(--info)]',
  };

  const valueElement = (
    <p className={`${large ? 'text-3xl' : 'text-2xl'} font-bold ${colorClasses[color]} truncate`}>
      {value}
    </p>
  );

  return (
    <div className="glass rounded-xl p-5 hover:border-[var(--border-color-hover)] transition-all group" title={tooltip}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
            {title}
          </p>
          {dynamic ? (
            <span suppressHydrationWarning>
              <NoSSR fallback="—">{valueElement}</NoSSR>
            </span>
          ) : (
            valueElement
          )}
          {subtitle && (
            <p className="text-xs text-[var(--text-tertiary)] mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
