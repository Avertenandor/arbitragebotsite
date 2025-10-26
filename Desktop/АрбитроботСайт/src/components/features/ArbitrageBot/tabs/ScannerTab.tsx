'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fmtNumber, formatters } from '@/utils/format';

interface ScannerMetrics {
  scannedBlocks: number;
  checkedTokens: number;
  scanSpeed: number;
  whitelistAdded: number;
  blacklistAdded: number;
  checksPerBlock: number;
  trashRate: number;
}

interface TokenCheck {
  blockNumber: number;
  tokenAddress: string;
  result: 'whitelist' | 'blacklist';
  reason: string;
  timestamp: string;
}

// Генерация случайного адреса токена
const generateTokenAddress = () => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

// Причины для whitelist
const whitelistReasons = [
  'Verified contract',
  'High liquidity',
  'Trusted team',
  'Good tokenomics',
  'Audit passed',
  'Community trusted',
];

// Причины для blacklist
const blacklistReasons = [
  'Honeypot detected',
  'High sell tax',
  'Low liquidity',
  'Suspicious contract',
  'Rug pull risk',
  'No liquidity lock',
  'Hidden mint function',
  'Ownership not renounced',
];

export default function ScannerTab() {
  const [isScanning, setIsScanning] = useState(false);
  const [metrics, setMetrics] = useState<ScannerMetrics>({
    scannedBlocks: 0,
    checkedTokens: 0,
    scanSpeed: 0,
    whitelistAdded: 0,
    blacklistAdded: 0,
    checksPerBlock: 0,
    trashRate: 0,
  });
  const [history, setHistory] = useState<TokenCheck[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Автообновление каждые 3 секунды
  useEffect(() => {
    if (isScanning) {
      updateIntervalRef.current = setInterval(() => {
        updateMetrics();
        addRandomCheck();
      }, 3000);
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isScanning]);

  // Обновление метрик
  const updateMetrics = () => {
    setMetrics((prev) => {
      const newBlocks = Math.floor(Math.random() * 3) + 1;
      const newTokens = Math.floor(Math.random() * 5) + 2;
      const isTrash = Math.random() > 0.4; // 60% вероятность trash

      const totalBlocks = prev.scannedBlocks + newBlocks;
      const totalTokens = prev.checkedTokens + newTokens;
      const totalWhitelist = prev.whitelistAdded + (isTrash ? 0 : 1);
      const totalBlacklist = prev.blacklistAdded + (isTrash ? 1 : 0);
      const totalChecks = totalWhitelist + totalBlacklist;

      return {
        scannedBlocks: totalBlocks,
        checkedTokens: totalTokens,
        scanSpeed: (Math.random() * 1.5 + 2.5).toFixed(2) as any,
        whitelistAdded: totalWhitelist,
        blacklistAdded: totalBlacklist,
        checksPerBlock: totalBlocks > 0 ? (totalChecks / totalBlocks).toFixed(1) as any : 0,
        trashRate: totalChecks > 0 ? Math.round((totalBlacklist / totalChecks) * 100) : 0,
      };
    });
  };

  // Добавление случайной проверки в историю
  const addRandomCheck = () => {
    const isTrash = Math.random() > 0.4; // 60% вероятность trash
    const currentBlock = 44123456 + metrics.scannedBlocks;

    const newCheck: TokenCheck = {
      blockNumber: currentBlock,
      tokenAddress: generateTokenAddress(),
      result: isTrash ? 'blacklist' : 'whitelist',
      reason: isTrash
        ? blacklistReasons[Math.floor(Math.random() * blacklistReasons.length)]
        : whitelistReasons[Math.floor(Math.random() * whitelistReasons.length)],
      timestamp: new Date().toLocaleTimeString('ru-RU'),
    };

    setHistory((prev) => {
      const updated = [newCheck, ...prev];
      // Ограничиваем до 50 записей
      return updated.slice(0, 50);
    });
  };

  // Запуск сканера
  const handleStart = () => {
    setIsScanning(true);
  };

  // Остановка сканера
  const handleStop = () => {
    setIsScanning(false);
  };

  // Ручное обновление
  const handleManualUpdate = () => {
    if (isScanning) {
      updateMetrics();
      addRandomCheck();
    }
  };

  // Определение статуса
  const getStatus = () => {
    if (!isScanning && metrics.scannedBlocks === 0) {
      return { text: 'Готов к работе', color: 'info', emoji: '🔵' };
    }
    if (isScanning) {
      return { text: 'Сканирование активно', color: 'success', emoji: '🟢' };
    }
    return { text: 'Остановлено', color: 'danger', emoji: '🔴' };
  };

  const status = getStatus();

  // Определение цвета trash rate
  const getTrashRateColor = () => {
    if (metrics.trashRate < 30) return 'success';
    if (metrics.trashRate < 60) return 'warning';
    return 'danger';
  };

  const trashRateColor = getTrashRateColor();

  return (
    <div className="space-y-4">
      {/* БЛОК 1: ЗАГОЛОВОК С ИНДИКАТОРОМ СТАТУСА */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 flex flex-wrap items-center gap-4"
      >
        <h2 className="text-xl font-bold text-gradient flex-shrink-0">
          🔍 Scanner - Защита от Trash
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
              status.color === 'success'
                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                : status.color === 'info'
                ? 'bg-[var(--info)]/20 text-[var(--info)]'
                : 'bg-[var(--danger)]/20 text-[var(--danger)]'
            }`}
          >
            <span className="text-lg">{status.emoji}</span>
            <span>{status.text}</span>
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
          ⚡ Управление сканированием
        </h3>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleStart}
            disabled={isScanning}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--success)] to-[var(--success)]/80 text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-glow-accent"
          >
            🟢 СТАРТ SCANNER
          </button>
          <button
            onClick={handleStop}
            disabled={!isScanning}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--danger)] to-[var(--danger)]/80 text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-glow-accent"
          >
            🔴 СТОП SCANNER
          </button>
        </div>
      </motion.div>

      {/* БЛОК 3: СЕТКА МЕТРИК (2 ряда по 3) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* РЯД 1 */}
        <MetricCard
          icon="📦"
          title="Отсканировано блоков"
          value={metrics.fmtNumber(scannedBlocks)}
          color="info"
        />
        <MetricCard
          icon="🔍"
          title="Проверено токенов"
          value={metrics.fmtNumber(checkedTokens)}
          color="primary"
        />
        <MetricCard
          icon="⚡"
          title="Скорость сканирования"
          value={`${metrics.scanSpeed} блок/сек`}
          color="warning"
        />

        {/* РЯД 2 */}
        <MetricCard
          icon="✅"
          title="Whitelist добавлено"
          value={metrics.fmtNumber(whitelistAdded)}
          color="success"
        />
        <MetricCard
          icon="🚫"
          title="Blacklist добавлено"
          value={metrics.fmtNumber(blacklistAdded)}
          color="danger"
        />
        <MetricCard
          icon="📊"
          title="Проверок на блок"
          value={metrics.checksPerBlock.toString()}
          color="info"
        />
      </motion.div>

      {/* БЛОК 4: ИНДИКАТОР TRASH RATE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            🎯 Trash Rate
          </h3>
          <span
            className={`text-2xl font-bold ${
              trashRateColor === 'success'
                ? 'text-[var(--success)]'
                : trashRateColor === 'warning'
                ? 'text-[var(--warning)]'
                : 'text-[var(--danger)]'
            }`}
          >
            {metrics.trashRate}%
          </span>
        </div>

        {/* Прогресс-бар */}
        <div className="relative h-8 bg-[var(--bg-tertiary)] rounded-lg overflow-hidden border border-[var(--border-color)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metrics.trashRate}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full flex items-center justify-center text-xs font-bold text-white ${
              trashRateColor === 'success'
                ? 'bg-gradient-to-r from-[var(--success)] to-[var(--success)]/80'
                : trashRateColor === 'warning'
                ? 'bg-gradient-to-r from-[var(--warning)] to-[var(--warning)]/80'
                : 'bg-gradient-to-r from-[var(--danger)] to-[var(--danger)]/80'
            }`}
          >
            {metrics.trashRate > 10 && `${metrics.trashRate}%`}
          </motion.div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
            <span>&lt;30% - Отличные условия</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
            <span>30-60% - Средние условия</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--danger)]" />
            <span>&gt;60% - Плохие условия</span>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 5: ТАБЛИЦА ИСТОРИИ ПРОВЕРОК */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="bg-[var(--bg-tertiary)] px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            📜 Последние проверки
          </h3>
          <button
            onClick={handleManualUpdate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--info)]/20 text-[var(--info)] text-sm font-medium hover:bg-[var(--info)]/30 transition-colors"
          >
            🔄 Обновить
          </button>
        </div>

        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Block
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl opacity-30">🔍</span>
                      <p className="text-[var(--text-tertiary)] text-sm">
                        Нет данных
                      </p>
                      <p className="text-[var(--text-muted)] text-xs">
                        Запустите сканер для начала проверки токенов
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((check, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors ${
                      check.result === 'whitelist'
                        ? 'bg-[var(--success)]/5'
                        : 'bg-[var(--danger)]/5'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)] font-mono">
                      {check.fmtNumber(blockNumber)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={`https://bscscan.com/address/${check.tokenAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-mono text-xs"
                        title={check.tokenAddress}
                      >
                        {check.tokenAddress.substring(0, 6)}...
                        {check.tokenAddress.substring(check.tokenAddress.length - 4)}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          check.result === 'whitelist'
                            ? 'bg-[var(--success)]/20 text-[var(--success)]'
                            : 'bg-[var(--danger)]/20 text-[var(--danger)]'
                        }`}
                      >
                        {check.result === 'whitelist' ? '✅ Whitelist' : '🚫 Blacklist'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {check.reason}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-tertiary)] font-mono">
                      {check.timestamp}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isScanning && (
          <div className="bg-[var(--bg-tertiary)] px-6 py-3 border-t border-[var(--border-color)]">
            <p className="text-xs text-[var(--text-tertiary)] text-center">
              ⚡ Автоматическое обновление каждые 3 секунды
            </p>
          </div>
        )}
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
