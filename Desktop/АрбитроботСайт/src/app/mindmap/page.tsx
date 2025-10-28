'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MindMapPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Load mindmap CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles-mindmap.css';
    document.head.appendChild(link);

    // Load mindmap scripts in order
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Ensure scripts load in order
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    // Load scripts sequentially
    loadScript('/mindmap-core.js')
      .then(() => loadScript('/mindmap-render.js'))
      .then(() => loadScript('/mindmap.js'))
      .then(() => {
        // Initialize mind map after all scripts are loaded
        if (typeof window !== 'undefined' && window.mindMap) {
          setTimeout(() => {
            window.mindMap.init();
          }, 100);
        }
      })
      .catch(error => {
        console.error('Error loading mindmap scripts:', error);
      });

    // Cleanup
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
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
            Путь пользователя к прибыли: от входных требований до доходности 72.8% в день
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
          <button id="mindmapZoomIn" className="mindmap-btn">
            <span>🔍</span>
            <span>Увеличить</span>
          </button>
          <button id="mindmapZoomOut" className="mindmap-btn">
            <span>🔎</span>
            <span>Уменьшить</span>
          </button>
          <button id="mindmapCenter" className="mindmap-btn">
            <span>🎯</span>
            <span>Центрировать</span>
          </button>
          <button id="mindmapReset" className="mindmap-btn">
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
          <svg id="mindmapSvg" className="mindmap-svg" viewBox="0 0 1400 900">
            <defs>
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Node gradients - ArbitroBot Journey */}
              <radialGradient id="coreGradient">
                <stop offset="0%" stopColor="#00D9FF"/>
                <stop offset="100%" stopColor="#0891b2"/>
              </radialGradient>

              <radialGradient id="requirementGradient">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#1e3a8a"/>
              </radialGradient>

              <radialGradient id="timelineGradient">
                <stop offset="0%" stopColor="#22c55e"/>
                <stop offset="100%" stopColor="#10b981"/>
              </radialGradient>

              <radialGradient id="ruleGradient">
                <stop offset="0%" stopColor="#ef4444"/>
                <stop offset="100%" stopColor="#dc2626"/>
              </radialGradient>

              <radialGradient id="resultGradient">
                <stop offset="0%" stopColor="#fbbf24"/>
                <stop offset="100%" stopColor="#f59e0b"/>
              </radialGradient>

              {/* Legacy gradients (fallback) */}
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
            <span>ArbitroBot</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-requirement"></div>
            <span>Входные требования</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-timeline"></div>
            <span>Временная шкала</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-rule"></div>
            <span>Железные правила</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-result"></div>
            <span>Итоговые результаты</span>
          </div>
        </motion.div>

        {/* User Journey Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-[#13131A] rounded-2xl p-8 border border-[#00D9FF]/20"
        >
          <h2 className="text-3xl font-bold text-gradient mb-6">
            Путь к прибыли с ArbitroBot
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-[#3b82f6] mb-4">
                Входные требования
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">→</span>
                  <span><strong>PLEX холдинг:</strong> 5,000-25,000+ токенов определяют количество &quot;сумм&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">→</span>
                  <span><strong>DEXRabbit NFT:</strong> 1-15+ кроликов как второй фактор авторизации</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">→</span>
                  <span><strong>Депозит USDT:</strong> от $100, рекомендуется $500-1,000</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">→</span>
                  <span><strong>Ежедневная комиссия:</strong> 10 PLEX за каждый $1 депозита</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#22c55e] mb-4">
                Временная шкала доходности
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#10b981] mt-1">•</span>
                  <span><strong>Неделя 1:</strong> 0.5% в день - адаптация системы</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10b981] mt-1">•</span>
                  <span><strong>Неделя 2:</strong> 2% в день - оптимизация алгоритмов</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10b981] mt-1">•</span>
                  <span><strong>Неделя 3:</strong> 4% в день - стабильная работа</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] mt-1">•</span>
                  <span><strong>Неделя 4:</strong> 12% в день - полная мощность</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] mt-1">★</span>
                  <span><strong>Неделя 5+:</strong> до 72.8% в день - пик доходности</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#fbbf24] mt-1">⚖️</span>
                  <span><strong>Месяц 3:</strong> БЕЗУБЫТОК - начало чистой прибыли</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-[#ef4444]/10 to-[#dc2626]/10 border border-[#ef4444]/30 rounded-xl">
            <h3 className="text-xl font-semibold text-[#ef4444] mb-4">
              ⚠️ Железные правила (критически важно!)
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-[#ef4444] mt-1">🛑</span>
                <span><strong>ЗАПРЕТ продажи PLEX:</strong> Продал даже 1 PLEX из холдинга → бот останавливается НАВСЕГДА</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f59e0b] mt-1">🔒</span>
                <span><strong>Фиксированный депозит:</strong> Изменил размер суммы → прогресс недель сбрасывается</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#fbbf24] mt-1">📅</span>
                <span><strong>Ежедневная оплата:</strong> Пропустил комиссию → бот останавливается, потеря прогресса</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Results Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-[#fbbf24]/20 to-[#f59e0b]/20 border border-[#fbbf24]/40 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-[#fbbf24] mb-4">
              🏆 Потенциальные результаты через 6 месяцев
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-[#22c55e] mb-2">~$360,000</div>
                <div className="text-sm text-gray-400">Прибыль от бота</div>
                <div className="text-xs text-gray-500 mt-1">При депозите $1,000</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#00D9FF] mb-2">$750,000</div>
                <div className="text-sm text-gray-400">Рост холдинга PLEX</div>
                <div className="text-xs text-gray-500 mt-1">15,000 PLEX × $50</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#fbbf24] mb-2">$1,100,000+</div>
                <div className="text-sm text-gray-400">ИТОГО возможно</div>
                <div className="text-xs text-gray-500 mt-1">ROI: 110,150%</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-6">
              ⚠️ Требует терпения первые 2.5 месяца для достижения безубытка
            </p>
          </div>

          <div className="inline-flex flex-wrap gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] text-white font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-[#00D9FF]/50 hover:scale-105"
            >
              Начать работу с ботом →
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 rounded-lg bg-[#13131A] border border-[#00D9FF]/30 text-[#00D9FF] font-semibold hover:bg-[#00D9FF]/10 transition-all"
            >
              Узнать больше о проекте
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
