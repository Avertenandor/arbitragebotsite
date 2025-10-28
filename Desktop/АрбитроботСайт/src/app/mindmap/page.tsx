'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MindMapPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Initialize mind map after component mounts
    if (typeof window !== 'undefined' && window.mindMap) {
      // Wait for DOM to be ready
      setTimeout(() => {
        window.mindMap.init();
      }, 100);
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#13131A] to-[#0A0A0F] text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00D9FF]/10 to-[#9D4EDD]/10 border-2 border-[#00D9FF] text-[#00D9FF] font-semibold hover:bg-[#00D9FF]/20 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#00D9FF]/40"
        >
          <span className="text-2xl">←</span>
          <span>На главную</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#00D9FF] via-[#9D4EDD] to-[#00FFA3] bg-clip-text text-transparent">
              Интерактивная карта ArbitroBot
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Визуализация всех возможностей и функций платформы для работы с арбитражным ботом
          </p>
        </motion.div>

        {/* Mind Map Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#13131A] rounded-2xl p-6 mb-8 border border-[#00D9FF]/20"
        >
          <h3 className="text-2xl font-bold text-[#00D9FF] mb-4 flex items-center gap-3">
            <span>🗺️</span>
            <span>Как пользоваться картой</span>
          </h3>
          <ul className="space-y-3">
            <li className="text-gray-300 flex items-start gap-3">
              <span className="text-[#00D9FF] font-bold mt-1">→</span>
              <span><strong className="text-white">Увеличение/Уменьшение:</strong> Используйте кнопки управления или колесико мыши</span>
            </li>
            <li className="text-gray-300 flex items-start gap-3">
              <span className="text-[#00D9FF] font-bold mt-1">→</span>
              <span><strong className="text-white">Перемещение:</strong> Кликните и тяните для навигации по карте</span>
            </li>
            <li className="text-gray-300 flex items-start gap-3">
              <span className="text-[#00D9FF] font-bold mt-1">→</span>
              <span><strong className="text-white">Интерактивность:</strong> Наведите курсор на узлы для подробной информации</span>
            </li>
            <li className="text-gray-300 flex items-start gap-3">
              <span className="text-[#00D9FF] font-bold mt-1">→</span>
              <span><strong className="text-white">Мобильная версия:</strong> Используйте жесты щипка для масштабирования</span>
            </li>
          </ul>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mindmap-controls"
        >
          <button
            id="mindmapZoomIn"
            className="mindmap-btn"
          >
            <span>🔍</span>
            <span>Увеличить</span>
          </button>
          <button
            id="mindmapZoomOut"
            className="mindmap-btn"
          >
            <span>🔎</span>
            <span>Уменьшить</span>
          </button>
          <button
            id="mindmapCenter"
            className="mindmap-btn"
          >
            <span>🎯</span>
            <span>Центрировать</span>
          </button>
          <button
            id="mindmapReset"
            className="mindmap-btn"
          >
            <span>↺</span>
            <span>Сброс</span>
          </button>
        </motion.div>

        {/* SVG Mind Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mindmap-container"
        >
          <svg
            id="mindmapSvg"
            className="mindmap-svg"
            viewBox="0 0 1400 900"
          >
            {/* Define gradients and filters */}
            <defs>
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Node gradients */}
              <radialGradient id="coreGradient">
                <stop offset="0%" stopColor="#ff6b6b"/>
                <stop offset="100%" stopColor="#ee5a6f"/>
              </radialGradient>

              <radialGradient id="pageGradient">
                <stop offset="0%" stopColor="#4a9eff"/>
                <stop offset="100%" stopColor="#357abd"/>
              </radialGradient>

              <radialGradient id="featureGradient">
                <stop offset="0%" stopColor="#51cf66"/>
                <stop offset="100%" stopColor="#37b24d"/>
              </radialGradient>

              <radialGradient id="dataGradient">
                <stop offset="0%" stopColor="#ffd93d"/>
                <stop offset="100%" stopColor="#fab005"/>
              </radialGradient>

              <radialGradient id="conditionGradient">
                <stop offset="0%" stopColor="#9D4EDD"/>
                <stop offset="100%" stopColor="#7b2cbf"/>
              </radialGradient>
            </defs>

            {/* Content group (transformed by JS) */}
            <g id="mindmapContent"></g>
          </svg>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mindmap-legend"
        >
          <div className="legend-item">
            <div className="legend-color legend-core"></div>
            <span>Центральный узел</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-page"></div>
            <span>Страницы и разделы</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-feature"></div>
            <span>Функциональность</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-data"></div>
            <span>Данные и источники</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#9D4EDD' }}></div>
            <span>Условия и требования</span>
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-[#13131A] rounded-2xl p-8 border border-[#00D9FF]/20"
        >
          <h2 className="text-3xl font-bold text-gradient mb-6">
            Работа с ArbitroBot
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-[#00D9FF] mb-4">
                Для новичков
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span>Откройте страницу мониторинга для просмотра транзакций в реальном времени</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span>Изучите статистику работы бота на главной странице</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span>Ознакомьтесь с FAQ для понимания арбитражной торговли</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span>Наблюдайте за успешными сделками других пользователей</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#9D4EDD] mb-4">
                Для опытных пользователей
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span>Получите доступ к панели управления ботом (/bot)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span>Настройте параметры сканера и фильтры токенов</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span>Управляйте белыми/черными списками токенов</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span>Анализируйте детальную статистику и принимайте решения</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-wrap gap-4 justify-center">
            <Link
              href="/bot"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] text-white font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-[#00D9FF]/50 hover:scale-105"
            >
              Открыть панель управления →
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 rounded-lg bg-[#13131A] border border-[#00D9FF]/30 text-[#00D9FF] font-semibold hover:bg-[#00D9FF]/10 transition-all"
            >
              Узнать больше
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    mindMap: any;
  }
}
