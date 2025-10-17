'use client';

import { motion } from 'framer-motion';
import UserCard from './UserCard';

const USERS = [
  '@Lubovco',
  '@Kapral41',
  '@saveiko',
  '@Golotvina',
  '@Ddpalych78',
  '@Lyuss1',
  '@EvgeniiPolovinka',
  '@Zogia1970',
  '@VladkrusB',
  '@vikastin',
  '@Amplituda1102',
  '@Annik99',
  '@Ulzana77',
  '@VegaSpain',
  '@shevch26',
  '@Zakharov1978',
  '@OLEZHIK4848',
  '@Audrius33',
  '@T_Sh5',
  '@ElenaRom72',
  '@lianastar61',
  '@Viktor040972',
  '@Lyudmiladusv',
  '@salambek7',
  '@ded_vtapkax',
  '@IrinaTurkinaSeregina',
  '@ArsenSman',
  '@rifkat999',
  '@mzvor',
  '@Natalimam',
  '@Magamed0791',
  '@hrilag57',
  '@ALEXNDER68',
  '@Svetik8865',
  '@Ramune6',
  '@absmir',
  '@ledi1234',
];

export default function UserShowcase() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient">Я зарабатываю</span>{' '}
            <span className="text-white">в Арбитработе</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Наши активные пользователи, которые уже получают прибыль от автоматического арбитража
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--primary)]">
                {USERS.length}
              </div>
              <div className="text-[var(--text-tertiary)] text-sm">
                Активных трейдеров
              </div>
            </div>
            <div className="w-px h-12 bg-[var(--border-color)]" />
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--accent)]">
                24/7
              </div>
              <div className="text-[var(--text-tertiary)] text-sm">
                Мониторинг
              </div>
            </div>
            <div className="w-px h-12 bg-[var(--border-color)]" />
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--secondary)]">
                BSC
              </div>
              <div className="text-[var(--text-tertiary)] text-sm">
                BNB Chain
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {USERS.map((username, index) => (
            <UserCard
              key={username}
              username={username}
              index={index}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-[var(--text-secondary)] mb-6">
            Хотите присоединиться к нашему сообществу успешных трейдеров?
          </p>
          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold hover:opacity-90 transition-all glow-primary">
            Начать зарабатывать
          </button>
        </motion.div>
      </div>
    </section>
  );
}

