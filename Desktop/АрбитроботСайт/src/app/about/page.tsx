'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTilt } from '@/lib/hooks/useTilt';

export default function AboutPage() {
  const tiltRef1 = useTilt<HTMLDivElement>({ max: 10, scale: 1.02 });
  const tiltRef2 = useTilt<HTMLDivElement>({ max: 10, scale: 1.02 });
  const tiltRef3 = useTilt<HTMLDivElement>({ max: 10, scale: 1.02 });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl sm:text-7xl font-bold text-gradient mb-6">
          ArbitroBot
        </h1>
        <p className="text-xl sm:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-8">
          Автоматический арбитражный робот для DEX-бирж на BNB Smart Chain
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Смотреть мониторинг →
          </Link>
          <Link
            href="/faq"
            className="px-8 py-3 rounded-lg glass hover:glow-primary font-medium transition-all"
          >
            Частые вопросы
          </Link>
        </div>
      </motion.div>

      {/* What is ArbitroBot */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-gradient mb-6">
          Что такое ArbitroBot?
        </h2>
        <div className="glass rounded-xl p-8 space-y-4">
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            <strong className="text-[var(--primary)]">ArbitroBot</strong> — это
            автоматизированная система для арбитражной торговли на
            децентрализованных биржах (DEX) в сети BNB Smart Chain.
          </p>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Бот анализирует разницу цен между различными DEX (PancakeSwap V2,
            V3, Biswap и другие) и автоматически выполняет прибыльные сделки,
            используя технологию flash loans для минимизации рисков.
          </p>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Этот сайт предоставляет{' '}
            <strong className="text-[var(--accent)]">
              real-time мониторинг
            </strong>{' '}
            всех транзакций бота, позволяя отслеживать эффективность,
            прибыльность и статистику в реальном времени.
          </p>
        </div>
      </motion.section>

      {/* Key Features */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-gradient mb-8 text-center">
          Ключевые возможности
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <motion.div
            ref={tiltRef1}
            whileHover={{ y: -5 }}
            className="glass rounded-xl p-6 transition-all cursor-pointer"
          >
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-3">
              Real-time мониторинг
            </h3>
            <p className="text-[var(--text-secondary)]">
              Отслеживайте все транзакции бота в режиме реального времени через
              WebSocket. Получайте мгновенные обновления о новых сделках и
              прибыли.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            ref={tiltRef2}
            whileHover={{ y: -5 }}
            className="glass rounded-xl p-6 transition-all cursor-pointer"
          >
            <div className="text-5xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-3">
              Открытый доступ
            </h3>
            <p className="text-[var(--text-secondary)]">
              Полный доступ к мониторингу и статистике без необходимости регистрации.
              Просто откройте сайт и начните отслеживать работу бота.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            ref={tiltRef3}
            whileHover={{ y: -5 }}
            className="glass rounded-xl p-6 transition-all cursor-pointer"
          >
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-3">
              Детальная статистика
            </h3>
            <p className="text-[var(--text-secondary)]">
              Личный кабинет с подробной статистикой: общая прибыль, количество
              сделок, процент успешности, история операций и многое другое.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-gradient mb-8 text-center">
          Как это работает
        </h2>
        <div className="glass rounded-xl p-8">
          <div className="space-y-8">
            {[
              {
                title: 'Анализ рынка',
                desc: 'Бот постоянно сканирует цены на различных DEX (PancakeSwap V2, V3, Biswap) в поисках арбитражных возможностей. Анализ происходит в режиме реального времени.',
              },
              {
                title: 'Поиск возможностей',
                desc: 'Когда обнаруживается разница в ценах, превышающая порог прибыльности (с учетом комиссий и газа), бот рассчитывает оптимальный маршрут для арбитража.',
              },
              {
                title: 'Выполнение сделки',
                desc: 'Бот использует flash loans для получения капитала без риска, выполняет последовательность обменов и возвращает займ в одной транзакции. Вся прибыль остается боту.',
              },
              {
                title: 'Отображение результатов',
                desc: 'Все транзакции отображаются на этом сайте в реальном времени. Вы можете видеть детали каждой сделки: маршрут, прибыль, статус и ссылку на BSCScan.',
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold text-xl">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[var(--text-secondary)]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Tech Stack */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-gradient mb-8 text-center">
          Технологический стек
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Next.js', icon: '⚛️' },
            { name: 'TypeScript', icon: '🔷' },
            { name: 'ethers.js', icon: '🔗' },
            { name: 'BSC', icon: '🟡' },
            { name: 'WebSocket', icon: '🔌' },
            { name: 'Tailwind', icon: '🎨' },
            { name: 'Zustand', icon: '🐻' },
            { name: 'Framer', icon: '🎬' },
          ].map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="glass rounded-lg p-4 text-center hover:glow-primary transition-all cursor-pointer"
            >
              <div className="text-3xl mb-2">{tech.icon}</div>
              <div className="text-sm font-medium text-[var(--text-secondary)]">
                {tech.name}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-xl p-8 text-center border-l-4 border-[var(--primary)]"
      >
        <h2 className="text-3xl font-bold text-gradient mb-4">
          Готовы начать?
        </h2>
        <p className="text-[var(--text-secondary)] text-lg mb-6 max-w-2xl mx-auto">
          Начните отслеживать работу ArbitroBot прямо сейчас. Получите доступ к
          мониторингу транзакций и детальной статистике без регистрации.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Перейти к мониторингу
          </Link>
          <Link
            href="/faq"
            className="px-8 py-3 rounded-lg glass hover:glow-primary font-medium transition-all"
          >
            Узнать больше
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
