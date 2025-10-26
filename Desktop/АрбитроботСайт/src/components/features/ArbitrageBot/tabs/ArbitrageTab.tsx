'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ArbitrageSettings {
  minProfitPercent: number;
  maxGasGwei: number;
  slippagePercent: number;
  priorityDEX: 'V2' | 'V3' | 'Auto';
  enableV2: boolean;
  enableV3: boolean;
  dailyLimitUSD: number;
  maxPerTradeUSD: number;
}

export default function ArbitrageTab() {
  const [settings, setSettings] = useState<ArbitrageSettings>({
    minProfitPercent: 0.5,
    maxGasGwei: 5,
    slippagePercent: 1,
    priorityDEX: 'Auto',
    enableV2: true,
    enableV3: true,
    dailyLimitUSD: 10000,
    maxPerTradeUSD: 500,
  });

  const [isModified, setIsModified] = useState(false);

  // Обработка изменения настроек
  const handleChange = (key: keyof ArbitrageSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsModified(true);
  };

  // Применение настроек
  const handleApply = () => {
    alert('Настройки успешно применены!');
    setIsModified(false);
  };

  // Сброс к значениям по умолчанию
  const handleReset = () => {
    if (!confirm('Вы уверены, что хотите сбросить все настройки?')) return;

    setSettings({
      minProfitPercent: 0.5,
      maxGasGwei: 5,
      slippagePercent: 1,
      priorityDEX: 'Auto',
      enableV2: true,
      enableV3: true,
      dailyLimitUSD: 10000,
      maxPerTradeUSD: 500,
    });
    setIsModified(false);
    alert('Настройки сброшены к значениям по умолчанию!');
  };

  return (
    <div className="space-y-4">
      {/* БЛОК 1: ЗАГОЛОВОК */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 flex flex-wrap items-center gap-4"
      >
        <h2 className="text-xl font-bold text-gradient flex-shrink-0">
          ⚙️ Настройки арбитража
        </h2>
        {isModified && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--warning)]/20 text-[var(--warning)]">
            <span className="text-lg">⚠️</span>
            <span>Есть несохраненные изменения</span>
          </div>
        )}
      </motion.div>

      {/* БЛОК 2: ОСНОВНЫЕ НАСТРОЙКИ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          🎯 Основные параметры
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Min Profit % */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Min Profit %
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={settings.minProfitPercent}
              onChange={(e) => handleChange('minProfitPercent', parseFloat(e.target.value))}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Минимальная прибыль для выполнения сделки
            </p>
          </div>

          {/* Max Gas Gwei */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Max Gas Gwei
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={settings.maxGasGwei}
              onChange={(e) => handleChange('maxGasGwei', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Максимальная цена газа
            </p>
          </div>

          {/* Slippage % */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Slippage %
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={settings.slippagePercent}
              onChange={(e) => handleChange('slippagePercent', parseFloat(e.target.value))}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Допустимое проскальзывание цены
            </p>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 3: DEX НАСТРОЙКИ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          🔄 DEX Settings
        </h3>

        <div className="space-y-6">
          {/* Priority DEX */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Priority DEX
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['V2', 'V3', 'Auto'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => handleChange('priorityDEX', option)}
                  className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                    settings.priorityDEX === option
                      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white shadow-lg'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/80 border border-[var(--border-color)]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Enable V2/V3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] cursor-pointer hover:border-[var(--border-color-hover)] transition-colors">
              <input
                type="checkbox"
                checked={settings.enableV2}
                onChange={(e) => handleChange('enableV2', e.target.checked)}
                className="w-5 h-5 rounded border-2 border-[var(--border-color)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Enable V2 DEXs
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  PancakeSwap V2, BiSwap, ApeSwap
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] cursor-pointer hover:border-[var(--border-color-hover)] transition-colors">
              <input
                type="checkbox"
                checked={settings.enableV3}
                onChange={(e) => handleChange('enableV3', e.target.checked)}
                className="w-5 h-5 rounded border-2 border-[var(--border-color)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Enable V3 DEXs
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  PancakeSwap V3, Uniswap V3
                </p>
              </div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 4: ЛИМИТЫ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          💵 Лимиты
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Limit */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Daily Limit USD
            </label>
            <input
              type="number"
              step="100"
              min="0"
              value={settings.dailyLimitUSD}
              onChange={(e) => handleChange('dailyLimitUSD', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Максимальный объем торговли в день
            </p>
          </div>

          {/* Max Per Trade */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              Max Per Trade USD
            </label>
            <input
              type="number"
              step="50"
              min="0"
              value={settings.maxPerTradeUSD}
              onChange={(e) => handleChange('maxPerTradeUSD', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Максимальный размер одной сделки
            </p>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 5: КНОПКИ УПРАВЛЕНИЯ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleApply}
            disabled={!isModified}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
              !isModified
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[var(--success)] to-[var(--success)]/80 text-white hover:opacity-90 hover:shadow-glow-accent'
            }`}
          >
            ✅ Apply Settings
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--danger)] to-[var(--danger)]/80 text-white font-bold text-base transition-all hover:opacity-90 shadow-lg hover:shadow-glow-accent"
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </motion.div>

      {/* БЛОК 6: ИНФОРМАЦИЯ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">
              Рекомендации по настройкам
            </h4>
            <ul className="text-xs text-[var(--text-secondary)] space-y-1">
              <li>• Min Profit: 0.5-1% - оптимальное значение для BSC</li>
              <li>• Max Gas: 5-10 Gwei - безопасный диапазон цен</li>
              <li>• Slippage: 1-2% - баланс между скоростью и точностью</li>
              <li>• Auto DEX - автоматический выбор лучшего маршрута</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
