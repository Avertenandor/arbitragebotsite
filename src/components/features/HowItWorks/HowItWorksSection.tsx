'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Step {
  number: string;
  title: string;
  description: string;
  details: string[];
  icon: string;
}

interface Week {
  number: number;
  percent: string;
  profit: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: '1',
    title: 'Покупаете кролика',
    description: 'Это ваш входной билет в экосистему',
    details: [
      'Переходите на сайт DEXRabbit',
      'Выбираете пакет (от 1 до 15 кроликов)',
      'Оплачиваете токенами PLEX',
      'Получаете доступ к ArbitroBot'
    ],
    icon: '🐰'
  },
  {
    number: '2',
    title: 'Замораживаете PLEX',
    description: 'Храните токены на кошельке (не трогать!)',
    details: [
      '1 кролик = 5,000 PLEX заморозить',
      '3 кролика = 10,000 PLEX заморозить',
      '5 кроликов = 15,000 PLEX заморозить',
      'Это ваш абонемент в систему'
    ],
    icon: '🔒'
  },
  {
    number: '3',
    title: 'Вносите депозит',
    description: 'Ваши деньги работают в торговом боте',
    details: [
      'Минимум: от $100',
      'Деньги остаются вашими',
      'Работают в арбитраже 24/7',
      'Можно вывести в любой момент'
    ],
    icon: '💰'
  },
  {
    number: '4',
    title: 'Платите PLEX ежедневно',
    description: 'За каждый $1 депозита = 10 PLEX в день',
    details: [
      'Это плата за работу бота',
      'Покупаете на PancakeSwap',
      'Автоматически списывается',
      'Создаёт спрос на токен'
    ],
    icon: '🪙'
  },
  {
    number: '5',
    title: 'Получаете прибыль',
    description: 'Ваша доля растёт каждую неделю',
    details: [
      'Неделя 1: 0.5% в день',
      'Неделя 2: 2% в день',
      'Неделя 3: 4% в день',
      'Дальше: до 100% профита'
    ],
    icon: '📈'
  }
];

// Бот зарабатывает 72% В ДЕНЬ (верхняя планка коридора 30-72%)
// Депозит $1,000 → бот зарабатывает $720/день
// Пользователь получает свою долю от $720
const WEEKS: Week[] = [
  { number: 1, percent: '0.5%', profit: '$25', description: 'Знакомство с системой' },
  { number: 2, percent: '2%', profit: '$101', description: 'Видите как работает' },
  { number: 3, percent: '4%', profit: '$202', description: 'Доход растёт' },
  { number: 4, percent: '12%', profit: '$605', description: 'Значительный рост' },
  { number: 5, percent: '16%', profit: '$806', description: 'Ещё +4%' },
  { number: 6, percent: '20%', profit: '$1,008', description: 'Ещё +4%' },
  { number: 7, percent: '24%', profit: '$1,210', description: 'Ещё +4%' },
  { number: 8, percent: '28%', profit: '$1,411', description: 'Ещё +4%' },
  { number: 9, percent: '32%', profit: '$1,613', description: 'Ещё +4%' },
  { number: 10, percent: '36%', profit: '$1,814', description: 'Ещё +4%' },
  { number: 11, percent: '40%', profit: '$2,016', description: 'Ещё +4%' },
  { number: 12, percent: '44%', profit: '$2,218', description: 'Ещё +4%' },
  { number: 13, percent: '48%', profit: '$2,419', description: 'Ещё +4%' },
  { number: 14, percent: '52%', profit: '$2,621', description: 'Ещё +4%' },
  { number: 15, percent: '56%', profit: '$2,822', description: 'Ещё +4%' },
  { number: 16, percent: '60%', profit: '$3,024', description: 'Ещё +4%' },
  { number: 17, percent: '64%', profit: '$3,226', description: 'Ещё +4%' },
  { number: 18, percent: '68%', profit: '$3,427', description: 'Ещё +4%' },
  { number: 19, percent: '72%', profit: '$3,629', description: 'Ещё +4%' },
  { number: 20, percent: '76%', profit: '$3,830', description: 'Ещё +4%' },
  { number: 21, percent: '80%', profit: '$4,032', description: 'Ещё +4%' },
  { number: 22, percent: '84%', profit: '$4,234', description: 'Ещё +4%' },
  { number: 23, percent: '88%', profit: '$4,435', description: 'Ещё +4%' },
  { number: 24, percent: '92%', profit: '$4,637', description: 'Ещё +4%' },
  { number: 25, percent: '96%', profit: '$4,838', description: 'Почти 100%!' },
  { number: 26, percent: '100%', profit: '$5,040', description: '🎯 ПОЛНЫЙ ДОСТУП!' }
];

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<'simple' | 'detailed' | 'calculator'>('simple');
  const [depositAmount, setDepositAmount] = useState<number>(1000);

  const calculateProfit = (week: number) => {
    // Схема роста:
    // Неделя 1: 0.5%, Неделя 2: 2%, Неделя 3: 4%, Неделя 4: 12%
    // Неделя 5+: каждую неделю +4% до 100% (достигается на неделе 26)
    let userPercent = 0;
    if (week === 1) userPercent = 0.5;
    else if (week === 2) userPercent = 2;
    else if (week === 3) userPercent = 4;
    else if (week === 4) userPercent = 12;
    else if (week <= 26) userPercent = 12 + (week - 4) * 4; // +4% каждую неделю после 4-й
    else userPercent = 100; // после недели 26 = полный доступ
    
    const dailyBotProfit = depositAmount * 0.72; // бот зарабатывает 72% в день (верхняя планка)
    const yourProfit = dailyBotProfit * (userPercent / 100);
    const weeklyProfit = yourProfit * 7;
    return weeklyProfit.toFixed(0);
  };

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-[#0A0A0F]">
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
            <span className="text-white">Как это </span>
            <span className="text-[#00D9FF]">работает?</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto">
            Простое объяснение системы ArbitroBot для всех возрастов
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveTab('simple')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'simple'
                ? 'bg-gradient-to-r from-[#00D9FF] to-[#00FFA3] text-[#0A0A0F]'
                : 'bg-[#1C1C24] text-gray-400 hover:text-white border border-[#00D9FF]/20'
            }`}
          >
            📖 Простое объяснение
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'detailed'
                ? 'bg-gradient-to-r from-[#00D9FF] to-[#00FFA3] text-[#0A0A0F]'
                : 'bg-[#1C1C24] text-gray-400 hover:text-white border border-[#00D9FF]/20'
            }`}
          >
            📊 График роста
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'calculator'
                ? 'bg-gradient-to-r from-[#00D9FF] to-[#00FFA3] text-[#0A0A0F]'
                : 'bg-[#1C1C24] text-gray-400 hover:text-white border border-[#00D9FF]/20'
            }`}
          >
            🧮 Калькулятор дохода
          </button>
        </div>

        {/* Content */}
        {activeTab === 'simple' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Simple Explanation */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-gradient-to-br from-[#1C1C24] to-[#13131A] p-6 sm:p-8 rounded-2xl border border-[#00D9FF]/20 mb-8">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-3xl">💡</span>
                  <span>Представьте что это...</span>
                </h3>
                <div className="space-y-4 text-gray-300 text-base sm:text-lg">
                  <p className="leading-relaxed">
                    <span className="font-bold text-[#00FFA3]">Абонемент в спортзал:</span> Покупаете кролика = получаете членство. 
                    Чем дольше ходите, тем больше скидки на услуги тренера.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold text-[#00D9FF]">Банковский вклад:</span> Вносите деньги, они работают. 
                    Но вместо фиксированных 5% годовых, процент растёт каждую неделю!
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold text-[#9D4EDD]">Видеоигра:</span> Начинаете с уровня 1 (0.5% дохода), 
                    каждую неделю прокачиваетесь до уровня 6+ (полный доход).
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STEPS.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-[#1C1C24] to-[#13131A] p-6 rounded-2xl border border-[#00D9FF]/20 hover:border-[#00D9FF]/50 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-5xl">{step.icon}</div>
                      <div className="flex-1">
                        <div className="text-[#00D9FF] text-sm font-bold mb-1">Шаг {step.number}</div>
                        <h4 className="text-white font-bold text-lg">{step.title}</h4>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                          <span className="text-[#00FFA3] mt-1">▸</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Key Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-[#00D9FF]/10 p-6 rounded-xl border border-[#00D9FF]/30 text-center">
                <div className="text-4xl mb-3">⚡</div>
                <div className="text-[#00D9FF] font-bold text-lg mb-2">30-72%</div>
                <div className="text-gray-400 text-sm">Доходность бота в сутки</div>
              </div>
              <div className="bg-[#00FFA3]/10 p-6 rounded-xl border border-[#00FFA3]/30 text-center">
                <div className="text-4xl mb-3">📅</div>
                <div className="text-[#00FFA3] font-bold text-lg mb-2">26 недель</div>
                <div className="text-gray-400 text-sm">До 100% доступа</div>
              </div>
              <div className="bg-[#9D4EDD]/10 p-6 rounded-xl border border-[#9D4EDD]/30 text-center">
                <div className="text-4xl mb-3">🔓</div>
                <div className="text-[#9D4EDD] font-bold text-lg mb-2">Любой момент</div>
                <div className="text-gray-400 text-sm">Можно вывести деньги</div>
              </div>
              <div className="bg-[#FFB800]/10 p-6 rounded-xl border border-[#FFB800]/30 text-center">
                <div className="text-4xl mb-3">👁️</div>
                <div className="text-[#FFB800] font-bold text-lg mb-2">100%</div>
                <div className="text-gray-400 text-sm">Прозрачность on-chain</div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'detailed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-gradient-to-br from-[#1C1C24] to-[#13131A] p-6 sm:p-8 rounded-2xl border border-[#00D9FF]/20 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                📈 График роста вашей доли
              </h3>
              <p className="text-gray-400 text-center mb-4">
                Пример: вы внесли <span className="text-[#00FFA3] font-bold">$1,000</span> депозит. 
                Бот зарабатывает <span className="text-[#00D9FF] font-bold">72% в день</span> (верхняя планка коридора 30-72%) = $720/день
              </p>
              <p className="text-[#FFB800] font-bold text-center mb-8">
                ⚡ Каждую неделю после 4-й +4% до достижения 100%
              </p>

              <div className="space-y-4">
                {WEEKS.map((week, index) => {
                  const width = Math.min((week.number / 26) * 100, 100);
                  return (
                    <motion.div
                      key={week.number}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="relative"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-20 text-right shrink-0">
                          <span className="text-white font-bold text-sm">Нед. {week.number}</span>
                        </div>
                        <div className="flex-1 bg-[#13131A] rounded-full h-10 overflow-hidden border border-[#00D9FF]/20 relative">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${width}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.05 }}
                            className="h-full bg-gradient-to-r from-[#00D9FF] to-[#00FFA3]"
                          />
                          {/* Текст ВСЕГДА видим, не зависит от ширины бара */}
                          <div className="absolute inset-0 flex items-center justify-start pl-4">
                            <span className={`font-bold text-xs whitespace-nowrap ${
                              width > 15 ? 'text-[#0A0A0F]' : 'text-white'
                            }`}>
                              {week.percent} в день
                            </span>
                          </div>
                        </div>
                        <div className="w-28 text-left shrink-0">
                          <div className="text-[#00FFA3] font-bold text-sm">{week.profit}</div>
                          <div className="text-gray-500 text-[10px]">за неделю</div>
                        </div>
                      </div>
                      <div className="ml-24 text-gray-400 text-xs">{week.description}</div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-[#00D9FF]/10 to-[#00FFA3]/10 rounded-xl border border-[#00D9FF]/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🎯</span>
                  <h4 className="text-xl font-bold text-white">После 26 недель (100%):</h4>
                </div>
                <p className="text-gray-300 text-base leading-relaxed">
                  Вы достигаете <span className="text-[#00FFA3] font-bold">полного доступа (100%)</span> и получаете 
                  <span className="text-[#00D9FF] font-bold"> весь дневной профит</span> бота. 
                  Это значит <span className="text-[#FFB800] font-bold">$720/день</span> (на депозите $1,000) = 
                  <span className="text-[#FFB800] font-bold"> ~$21,600 в месяц!</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'calculator' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-[#1C1C24] to-[#13131A] p-6 sm:p-8 rounded-2xl border border-[#00D9FF]/20">
              <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
                <span className="text-3xl">🧮</span>
                <span>Калькулятор вашего дохода</span>
              </h3>

              {/* Input */}
              <div className="mb-8">
                <label className="block text-gray-400 mb-3 text-center">
                  Укажите размер вашего депозита:
                </label>
                <div className="relative max-w-md mx-auto">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    min="100"
                    max="100000"
                    step="100"
                    className="w-full bg-[#13131A] border border-[#00D9FF]/30 rounded-xl px-12 py-4 text-white text-2xl font-bold text-center focus:outline-none focus:border-[#00D9FF] transition-colors"
                  />
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  {[500, 1000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDepositAmount(amount)}
                      className="px-4 py-2 bg-[#1C1C24] hover:bg-[#00D9FF]/20 border border-[#00D9FF]/20 rounded-lg text-sm text-gray-400 hover:text-white transition-all"
                    >
                      ${amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#13131A] p-4 rounded-xl border border-[#00D9FF]/20 text-center">
                    <div className="text-gray-400 text-sm mb-2">Дневной профит бота</div>
                    <div className="text-[#00D9FF] text-2xl font-bold">
                      ${(depositAmount * 0.5).toLocaleString()}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">(в среднем 50%)</div>
                  </div>
                  <div className="bg-[#13131A] p-4 rounded-xl border border-[#00FFA3]/20 text-center">
                    <div className="text-gray-400 text-sm mb-2">Ваша оплата в PLEX</div>
                    <div className="text-[#00FFA3] text-2xl font-bold">
                      {(depositAmount * 10).toLocaleString()}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">(10 PLEX за $1)</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#00D9FF]/10 to-[#00FFA3]/10 p-6 rounded-xl border border-[#00D9FF]/30">
                  <h4 className="text-white font-bold mb-4 text-center">Ваш доход по неделям:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {WEEKS.map((week) => (
                      <div key={week.number} className="text-center">
                        <div className="text-gray-400 text-xs mb-1">Неделя {week.number}</div>
                        <div className="text-white font-bold text-lg">
                          ${calculateProfit(week.number)}
                        </div>
                        <div className="text-gray-500 text-xs">{week.percent}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#FFB800]/10 to-[#FF4D6A]/10 p-6 rounded-xl border border-[#FFB800]/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🎁</span>
                    <h4 className="text-xl font-bold text-white">После достижения полного доступа:</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">В день:</div>
                      <div className="text-[#00FFA3] text-3xl font-bold">
                        ${(depositAmount * 0.5).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">В месяц:</div>
                      <div className="text-[#FFB800] text-3xl font-bold">
                        ${(depositAmount * 0.5 * 30).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-gray-400 text-sm">
                    ROI: <span className="text-white font-bold">{((depositAmount * 0.5 * 30 / depositAmount) * 100).toFixed(0)}%</span> в месяц
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-[#13131A] p-6 rounded-xl border border-[#9D4EDD]/20">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span>📋</span>
                  <span>Для этого депозита вам нужно:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[#1C1C24] rounded-lg">
                    <div className="text-3xl mb-2">🐰</div>
                    <div className="text-white font-bold">1 кролик</div>
                    <div className="text-gray-400 text-sm">На DEXRabbit</div>
                  </div>
                  <div className="text-center p-4 bg-[#1C1C24] rounded-lg">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="text-[#00D9FF] font-bold">5,000 PLEX</div>
                    <div className="text-gray-400 text-sm">Заморозить</div>
                  </div>
                  <div className="text-center p-4 bg-[#1C1C24] rounded-lg">
                    <div className="text-3xl mb-2">🪙</div>
                    <div className="text-[#00FFA3] font-bold">{(depositAmount * 10).toLocaleString()} PLEX</div>
                    <div className="text-gray-400 text-sm">Ежедневно</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="https://xn--80apagbbfxgmuj4j.site/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00D9FF] to-[#00FFA3] text-[#0A0A0F] font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-[#00D9FF]/50 transition-all duration-300 hover:scale-105"
          >
            <span className="text-2xl">🐰</span>
            <span>Купить кролика и начать</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="text-gray-400 text-sm mt-4">
            Есть вопросы? Напишите нам в{' '}
            <a href="https://t.me/DexRebbitOfficial" target="_blank" rel="noopener noreferrer" className="text-[#00D9FF] hover:underline">
              Telegram
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

