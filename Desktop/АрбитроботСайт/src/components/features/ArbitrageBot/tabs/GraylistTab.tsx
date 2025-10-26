'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fmtNumber, formatters } from '@/utils/format';

interface GraylistToken {
  address: string;
  symbol: string;
  decimals: number;
  firstSeen: number;
  lastChecked: number;
  ttlSeconds: number;
}

// Моковые данные токенов в серой зоне
const GRAYLIST_DATA: GraylistToken[] = [
  {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    symbol: 'NEWTOKEN',
    decimals: 18,
    firstSeen: Date.now() - 3600000 * 2,
    lastChecked: Date.now() - 600000,
    ttlSeconds: 10800,
  },
  {
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    symbol: 'TESTCOIN',
    decimals: 18,
    firstSeen: Date.now() - 3600000 * 5,
    lastChecked: Date.now() - 1800000,
    ttlSeconds: 10800,
  },
  {
    address: '0xfedcba0987654321fedcba0987654321fedcba09',
    symbol: 'UNKNOWN',
    decimals: 9,
    firstSeen: Date.now() - 3600000 * 1,
    lastChecked: Date.now() - 300000,
    ttlSeconds: 10800,
  },
];

export default function GraylistTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [schedulerEnabled, setSchedulerEnabled] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(180);

  // Фильтрация данных
  const filteredData = useMemo(() => {
    return GRAYLIST_DATA.filter((token) => {
      return (
        searchQuery === '' ||
        token.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  // Копирование в буфер обмена
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Скопировано: ${text.substring(0, 10)}...`);
  };

  // Форматирование даты
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Форматирование TTL
  const formatTTL = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  };

  const handleStartScheduler = () => {
    setSchedulerEnabled(true);
    alert(`Планировщик запущен! Интервал: ${intervalMinutes} минут`);
  };

  const handleStopScheduler = () => {
    setSchedulerEnabled(false);
    alert('Планировщик остановлен');
  };

  const handleRunNow = () => {
    alert('Запущена немедленная переобходка токенов...');
  };

  return (
    <div className="space-y-4">
      {/* ЗАГОЛОВОК */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 flex flex-wrap items-center gap-4"
      >
        <h2 className="text-xl font-bold text-gradient flex-shrink-0">
          🕓 Graylist - Мониторинг раз в 3 часа
        </h2>
        <div className="flex items-center gap-3 ml-auto text-sm">
          <div className="px-3 py-1.5 rounded-lg bg-[var(--warning)]/20 text-[var(--warning)] font-semibold">
            Токенов: {GRAYLIST_DATA.length}
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg font-semibold ${
              schedulerEnabled
                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                : 'bg-[var(--danger)]/20 text-[var(--danger)]'
            }`}
          >
            Планировщик: {schedulerEnabled ? 'Активен' : 'Остановлен'}
          </div>
        </div>
      </motion.div>

      {/* ПАНЕЛЬ ПЛАНИРОВЩИКА */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          ⏰ Планировщик переобходов
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              Интервал переобхода (минуты):
            </label>
            <input
              type="number"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 180)}
              min={1}
              max={1440}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={schedulerEnabled}
                onChange={(e) => setSchedulerEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--success)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                Включить автоматический планировщик
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleStartScheduler}
            disabled={schedulerEnabled}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--success)] to-[var(--success)]/80 text-white font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            🟢 Запустить
          </button>
          <button
            onClick={handleStopScheduler}
            disabled={!schedulerEnabled}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--danger)] to-[var(--danger)]/80 text-white font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            🔴 Остановить
          </button>
          <button
            onClick={handleRunNow}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--info)] to-[var(--info)]/80 text-white font-bold transition-all hover:opacity-90 shadow-lg"
          >
            ⚡ Запустить сейчас
          </button>
        </div>
      </motion.div>

      {/* ПАНЕЛЬ ФИЛЬТРОВ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Поиск по адресу или символу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
          <button className="px-4 py-2.5 rounded-lg bg-[var(--warning)]/20 text-[var(--warning)] font-medium hover:bg-[var(--warning)]/30 transition-colors">
            ➕ Добавить
          </button>
          <button className="px-4 py-2.5 rounded-lg bg-[var(--info)]/20 text-[var(--info)] font-medium hover:bg-[var(--info)]/30 transition-colors">
            🔄 Обновить
          </button>
        </div>
      </motion.div>

      {/* ТАБЛИЦА */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Токен
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Символ
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Dec
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Впервые замечен
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Последняя проверка
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  TTL
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl opacity-30">🔍</span>
                      <p className="text-[var(--text-tertiary)] text-sm">
                        Токены не найдены
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((token, index) => (
                  <motion.tr
                    key={token.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors bg-[var(--warning)]/5"
                  >
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleCopy(token.address)}
                        className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-mono text-xs"
                        title={token.address}
                      >
                        {token.address.substring(0, 6)}...
                        {token.address.substring(token.address.length - 4)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)]">
                      {token.symbol}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {token.decimals}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {formatDate(token.firstSeen)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-tertiary)]">
                      {formatDate(token.lastChecked)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-3 py-1 rounded-full bg-[var(--warning)]/20 text-[var(--warning)] text-xs font-bold">
                        {formatTTL(token.ttlSeconds)}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="bg-[var(--bg-tertiary)] px-4 py-3 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            ⚙️ Токены в сером списке автоматически переобходятся планировщиком | TTL: время до следующей проверки
          </p>
        </div>
      </motion.div>
    </div>
  );
}
