'use client';

import { motion } from 'framer-motion';

interface EcosystemSite {
  name: string;
  url: string;
  description: string;
  icon: string;
  color: string;
}

const ECOSYSTEM_SITES: EcosystemSite[] = [
  {
    name: 'DEXRabbit',
    url: 'https://xn--80apagbbfxgmuj4j.site/',
    description: 'Токенизированная кроличья ферма - основа экосистемы',
    icon: '🐰',
    color: '#00D9FF'
  },
  {
    name: 'Card Processing',
    url: 'https://card-processing.net/',
    description: 'Обработка платежей и карточные транзакции',
    icon: '💳',
    color: '#9D4EDD'
  },
  {
    name: 'Data PLEX',
    url: 'https://data-plex.net/',
    description: 'Аналитика и данные токена PLEX',
    icon: '📊',
    color: '#00FFA3'
  },
  {
    name: 'Digital PLEX',
    url: 'https://digitalplex.net/',
    description: 'Цифровая платформа управления активами',
    icon: '💎',
    color: '#FFB800'
  },
  {
    name: 'GetToken',
    url: 'https://gettoken.nl/',
    description: 'Платформа для получения и обмена токенов',
    icon: '🪙',
    color: '#FF4D6A'
  },
  {
    name: 'Bank P2P Processing',
    url: 'https://bankp2pprocessing.com/',
    description: 'P2P банковские операции и обработка',
    icon: '🏦',
    color: '#00D9FF'
  }
];

export default function EcosystemSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#0A0A0F] via-[#13131A] to-[#0A0A0F]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-[#00D9FF]">Наша</span>{' '}
            <span className="text-white">Экосистема</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto">
            Единая платформа взаимосвязанных сервисов для работы с цифровыми активами
          </p>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-gradient-to-r from-[#FF4D6A]/10 to-[#FFB800]/10 p-6 sm:p-8 rounded-2xl border border-[#FF4D6A]/30 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-[#FFB800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <span>⚠️ Важное условие участия</span>
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  Принять участие в <span className="text-[#00D9FF] font-semibold">ArbitroBot</span> можно 
                  <span className="text-[#FFB800] font-bold"> только в том случае</span>, если у вас в рамках нашей 
                  экосистемы на сайте <span className="text-[#00FFA3] font-semibold">DEXRabbit</span> куплен 
                  <span className="text-white font-bold"> кролик или кролики</span>. 
                  Это обязательное условие для доступа ко всем сервисам экосистемы.
                </p>
                <a
                  href="https://xn--80apagbbfxgmuj4j.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-[#00D9FF] to-[#00FFA3] text-[#0A0A0F] font-bold rounded-xl hover:shadow-lg hover:shadow-[#00D9FF]/50 transition-all duration-300"
                >
                  <span>🐰 Купить кролика на DEXRabbit</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ecosystem Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {ECOSYSTEM_SITES.map((site, index) => (
            <motion.a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-gradient-to-br from-[#1C1C24] to-[#13131A] p-6 sm:p-8 rounded-2xl border border-[#00D9FF]/20 hover:border-[#00D9FF]/50 transition-all duration-300 overflow-hidden"
              style={{
                boxShadow: `0 0 0 1px ${site.color}20`
              }}
            >
              {/* Glow Effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${site.color}15, transparent 70%)`
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${site.color}20, ${site.color}10)`,
                    border: `2px solid ${site.color}30`
                  }}
                >
                  {site.icon}
                </div>

                {/* Name */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[#00D9FF] transition-colors duration-300">
                  {site.name}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 line-clamp-2">
                  {site.description}
                </p>

                {/* Link */}
                <div className="flex items-center gap-2 text-[#00D9FF] text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                  <span>Перейти на сайт</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>

              {/* Corner Accent */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 100% 0%, ${site.color}, transparent 70%)`
                }}
              />
            </motion.a>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 sm:mt-16"
        >
          <div className="inline-block bg-gradient-to-r from-[#1C1C24] to-[#13131A] px-6 sm:px-8 py-4 sm:py-6 rounded-2xl border border-[#00D9FF]/30">
            <p className="text-gray-300 text-sm sm:text-base mb-4">
              Все сервисы экосистемы работают на базе токена{' '}
              <span className="text-[#00D9FF] font-bold">PLEX</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="px-4 py-2 bg-[#00D9FF]/10 text-[#00D9FF] rounded-lg text-sm font-semibold border border-[#00D9FF]/30">
                🪙 BSC Network
              </span>
              <span className="px-4 py-2 bg-[#9D4EDD]/10 text-[#9D4EDD] rounded-lg text-sm font-semibold border border-[#9D4EDD]/30">
                🔒 Безопасно
              </span>
              <span className="px-4 py-2 bg-[#00FFA3]/10 text-[#00FFA3] rounded-lg text-sm font-semibold border border-[#00FFA3]/30">
                ⚡ Быстро
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

