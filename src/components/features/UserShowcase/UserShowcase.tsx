'use client';

import { motion } from 'framer-motion';
import UserCard from './UserCard';
import VIPUserCard, { UserRole } from './VIPUserCard';

// VIP пользователи с их ролями
interface VIPUser {
  username: string;
  role: UserRole;
}

const VIP_USERS: VIPUser[] = [
  { username: '@natder', role: 'coordinator' },       // ЕДИНСТВЕННЫЙ Координатор
  { username: '@ded_vtapkax', role: 'ambassador' },   // Амбассадор
  { username: '@AI_XAN', role: 'ambassador' },        // Амбассадор
  { username: '@AlexGenom8515', role: 'ambassador' }, // Амбассадор
];

// Обычные участники
const REGULAR_USERS = [
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

// Разделяем VIP пользователей по ролям
const coordinators = VIP_USERS.filter(u => u.role === 'coordinator' || u.role === 'both');
const ambassadors = VIP_USERS.filter(u => u.role === 'ambassador' || u.role === 'both');
const totalUsers = VIP_USERS.length + REGULAR_USERS.length;

export default function UserShowcase() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[var(--secondary)] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[var(--accent)] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--primary)]/30 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-sm text-[var(--text-secondary)] font-medium">
              Активное сообщество
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient">Я зарабатываю</span>
            <br />
            <span className="text-white">в Арбитработе</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Присоединяйтесь к нашему растущему сообществу успешных трейдеров, 
            которые зарабатывают на автоматическом DEX-арбитраже 24/7
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 mt-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center px-6 py-4 glass-elevated rounded-2xl"
            >
              <div className="text-4xl font-bold text-gradient mb-1">
                {totalUsers}+
              </div>
              <div className="text-[var(--text-tertiary)] text-sm font-medium">
                Активных трейдеров
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center px-6 py-4 glass-elevated rounded-2xl"
            >
              <div className="text-4xl font-bold text-[var(--accent)] mb-1">
                24/7
              </div>
              <div className="text-[var(--text-tertiary)] text-sm font-medium">
                Автоматическая работа
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center px-6 py-4 glass-elevated rounded-2xl"
            >
              <div className="text-4xl font-bold text-[var(--secondary)] mb-1">
                BSC
              </div>
              <div className="text-[var(--text-tertiary)] text-sm font-medium">
                BNB Smart Chain
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Coordinators Section */}
        {coordinators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            {/* Section Title */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent" />
              <h3 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <svg className="w-8 h-8 text-[#FFB800]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-gradient">Координаторы</span>
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent" />
            </div>

            {/* Coordinator Cards */}
            <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
              {coordinators.map((user, index) => (
                <VIPUserCard
                  key={user.username}
                  username={user.username}
                  role={user.role}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Ambassadors Section */}
        {ambassadors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            {/* Section Title */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
              <h3 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <svg className="w-8 h-8 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gradient">Амбассадоры</span>
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent" />
            </div>

            {/* Ambassador Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {ambassadors.map((user, index) => (
                <VIPUserCard
                  key={user.username}
                  username={user.username}
                  role={user.role}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Regular Users Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Section Title */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Активные участники
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
          </div>

          {/* Regular User Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {REGULAR_USERS.map((username, index) => (
            <UserCard
              key={username}
              username={username}
              index={index}
            />
          ))}
        </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="glass-elevated rounded-3xl p-8 sm:p-12 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Готовы начать зарабатывать?
            </h3>
            <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-2xl mx-auto">
              Присоединитесь к нашему сообществу трейдеров и начните получать пассивный доход от автоматического арбитража
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold text-lg shadow-glow-primary hover:shadow-glow-primary-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            Начать зарабатывать
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

