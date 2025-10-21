'use client';

import { motion } from 'framer-motion';

export default function PlexWidget() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#0A0A0F] via-[#13131A] to-[#0A0A0F]">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-[#1C1C24] to-[#13131A] rounded-3xl p-8 md:p-12 border border-[#00D9FF]/30 shadow-2xl shadow-[#00D9FF]/10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] p-1 rounded-2xl mb-6"
            >
              <div className="bg-[#13131A] px-6 py-3 rounded-2xl">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] text-transparent bg-clip-text">
                  Токен PLEX
                </h2>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto"
            >
              Для доступа к нашему <span className="text-[#00D9FF] font-semibold">Арбитработу</span>, вам необходима наша монета{' '}
              <span className="text-[#9D4EDD] font-semibold">PLEX</span>. Помните, что каждый доллар вашего депозита, который участвует в оборотке, 
              оплачивается каждые сутки <span className="text-[#00FFA3] font-bold">10 монетами PLEX</span>.
            </motion.p>
          </div>

          {/* Widget Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative rounded-2xl overflow-hidden border border-[#00D9FF]/20 bg-[#0A0A0F] shadow-inner"
          >
            {/* Decorative Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/5 via-transparent to-[#9D4EDD]/5 pointer-events-none" />
            
            {/* GeckoTerminal Widget */}
            <div className="relative z-10 p-1">
              <iframe
                src="https://www.geckoterminal.com/ru/bsc/pools/0x41d9650faf3341cbf8947fd8063a1fc88dbf1889?embed=1&info=0&swaps=1"
                title="PLEX Token на GeckoTerminal"
                className="w-full h-[600px] rounded-xl"
                style={{ border: 'none' }}
                allowFullScreen
              />
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-[#0A0A0F]/50 p-4 rounded-xl border border-[#00D9FF]/10 text-center">
              <div className="text-[#00D9FF] text-2xl font-bold mb-1">10 PLEX</div>
              <div className="text-gray-400 text-sm">за $1 в день</div>
            </div>
            <div className="bg-[#0A0A0F]/50 p-4 rounded-xl border border-[#9D4EDD]/10 text-center">
              <div className="text-[#9D4EDD] text-2xl font-bold mb-1">BSC</div>
              <div className="text-gray-400 text-sm">BNB Smart Chain</div>
            </div>
            <div className="bg-[#0A0A0F]/50 p-4 rounded-xl border border-[#00FFA3]/10 text-center">
              <div className="text-[#00FFA3] text-2xl font-bold mb-1">24/7</div>
              <div className="text-gray-400 text-sm">Ежедневные выплаты</div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <a
              href="https://www.geckoterminal.com/ru/bsc/pools/0x41d9650faf3341cbf8947fd8063a1fc88dbf1889"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] hover:from-[#00B8D4] hover:to-[#8A3EC7] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#00D9FF]/20 hover:shadow-[#00D9FF]/40 hover:scale-105"
            >
              <span>Купить PLEX на PancakeSwap</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

