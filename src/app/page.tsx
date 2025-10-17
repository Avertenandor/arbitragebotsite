'use client';

import TransactionWindow from '@/components/features/TransactionMonitor/TransactionWindow';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient with more depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] via-[#0D0D14] to-[var(--bg-primary)]" />
        
        {/* Multiple animated orbs for depth */}
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] opacity-[0.08] blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -120, 0],
            y: [0, 80, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] opacity-[0.08] blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
          className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] opacity-[0.06] blur-[90px]"
        />
        
        {/* Enhanced grid pattern with fade */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--border-color) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          }}
        />
        
        {/* Vignette effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 15, 0.8) 100%)',
          }}
        />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <section className="pt-32 sm:pt-40 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="text-center mb-16 space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-elevated text-sm font-medium"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
                </span>
                <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent font-semibold">
                  Live Monitoring System
                </span>
              </motion.div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight">
                  <span className="block text-gradient pb-2">ArbitroBot</span>
                  <span className="block text-[var(--text-primary)] text-4xl sm:text-5xl lg:text-6xl mt-2">
                    DEX Арбитраж
                  </span>
                </h1>
                <p className="lead max-w-3xl mx-auto text-[var(--text-secondary)] px-4">
                  Следите за арбитражными транзакциями в режиме реального времени.
                  Анализируйте прибыль, маршруты и эффективность автоматического бота.
                </p>
              </div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-12"
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient">24/7</div>
                  <div className="text-sm text-[var(--text-tertiary)] mt-1">Мониторинг</div>
                </div>
                <div className="h-12 w-px bg-[var(--border-color)]"></div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient-accent">< 2s</div>
                  <div className="text-sm text-[var(--text-tertiary)] mt-1">Латентность</div>
                </div>
                <div className="h-12 w-px bg-[var(--border-color)]"></div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-[var(--accent)]">DEX</div>
                  <div className="text-sm text-[var(--text-tertiary)] mt-1">PancakeSwap</div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
              >
                <a
                  href="#transactions"
                  className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl font-semibold text-white shadow-lg hover:shadow-glow-primary transition-all duration-300 hover:scale-105"
                >
                  <span>Смотреть транзакции</span>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 20 20" 
                    fill="none"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    <path 
                      d="M4 10H16M16 10L11 5M16 10L11 15" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                
                <a
                  href="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 glass-elevated rounded-xl font-semibold text-[var(--text-primary)] hover:border-[var(--border-color-hover)] transition-all duration-300 hover:scale-105"
                >
                  <span>Узнать больше</span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
            >
              {[
                {
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M16 4L28 10L16 16L4 10L16 4Z" fill="currentColor" opacity="0.2" />
                      <path d="M4 16L16 22L28 16M4 22L16 28L28 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                  title: 'Real-time мониторинг',
                  description: 'Получайте обновления транзакций в реальном времени через WebSocket'
                },
                {
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                      <path d="M12 16L16 20L24 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  title: 'Web3 авторизация',
                  description: 'Безопасный вход через кошелек MetaMask с верификацией 1 PLEX'
                },
                {
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16Z" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                      <path d="M16 12V16L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                  title: 'История транзакций',
                  description: 'Анализируйте прошлые сделки и отслеживайте прибыльность'
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="glass-elevated rounded-2xl p-8 hover:border-[var(--border-color-hover)] transition-all cursor-default"
                >
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 text-[var(--primary)] mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Transactions Section */}
        <section id="transactions" className="py-12 px-4 sm:px-6 lg:px-8">
          <TransactionWindow />
        </section>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-px h-32 bg-gradient-to-b from-transparent via-[var(--primary)] to-transparent opacity-30" />
        <div className="absolute top-1/2 right-0 w-px h-32 bg-gradient-to-b from-transparent via-[var(--secondary)] to-transparent opacity-30" />
      </main>

      {/* Enhanced Footer */}
      <footer className="relative mt-24 border-t border-[var(--border-color)] glass">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-lg blur-md opacity-50" />
                  <div className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] p-2 rounded-lg">
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-[var(--bg-primary)]">
                      <path d="M16 4L4 10L16 16L28 10L16 4Z" fill="currentColor" opacity="0.8" />
                      <path d="M4 16L16 22L28 16M4 22L16 28L28 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <span className="text-xl font-bold text-gradient">ArbitroBot</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] max-w-xs">
                Профессиональный арбитражный бот для DEX с мониторингом в реальном времени
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4 text-[var(--text-primary)]">Навигация</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Мониторинг', href: '/' },
                  { label: 'Личный кабинет', href: '/dashboard' },
                  { label: 'О проекте', href: '/about' },
                  { label: 'FAQ', href: '/faq' },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4 text-[var(--text-primary)]">Социальные сети</h4>
              <div className="flex gap-3">
                {[
                  { icon: 'github', href: 'https://github.com' },
                  { icon: 'twitter', href: 'https://twitter.com' },
                  { icon: 'telegram', href: 'https://t.me' },
                ].map((social) => (
                  <a
                    key={social.icon}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl glass-elevated hover:border-[var(--border-color-hover)] hover:scale-110 transition-all"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--text-secondary)]">
                      {social.icon === 'github' && (
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      )}
                      {social.icon === 'twitter' && (
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      )}
                      {social.icon === 'telegram' && (
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                      )}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[var(--text-muted)] text-center sm:text-left">
              © 2025 ArbitroBot. Все права защищены.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/privacy" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                Политика конфиденциальности
              </a>
              <a href="/terms" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                Условия использования
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
