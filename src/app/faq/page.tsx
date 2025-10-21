'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Общие
  {
    category: 'Общие',
    question: 'Что такое ArbitroBot?',
    answer:
      'ArbitroBot — это автоматизированная система арбитражной торговли на DEX в сети BNB Smart Chain с доходностью 30-72% в день. Бот работает 24/7, анализирует разницу цен и выполняет прибыльные сделки. Часть экосистемы DEXRabbit.',
  },
  {
    category: 'Общие',
    question: 'Как работает арбитраж?',
    answer:
      'ArbitroBot работает по УНИКАЛЬНОЙ схеме V2↔V3 арбитража на PancakeSwap. Мы мониторим ВСЕ монеты на Binance Smart Chain в реальном времени. Каждая покупка/продажа создаёт разницу цен между пулами V2 и V3. В каждом блоке (~3 секунды) — сотни/тысячи сделок → ~100 арбитражных возможностей! Мы проводим АТОМАРНЫЕ транзакции: взяли из V2 пула, переместили в V3, забрали разницу — ВСЁ в одной транзакции. Небольшая прибыль на операцию × тысячи операций в день = 30-72% дневного дохода.',
  },
  {
    category: 'Общие',
    question: 'Какие DEX поддерживаются?',
    answer:
      'ArbitroBot работает ТОЛЬКО с PancakeSwap — крупнейшей DEX на BSC. Мы арбитражим разницу цен между пулами PancakeSwap V2 и PancakeSwap V3. Никакие другие DEX мы не используем! Это позволяет нам проводить атомарные транзакции (всё в одной сделке) и минимизировать риски. Полная специализация = максимальная эффективность.',
  },
  {
    category: 'Общие',
    question: 'Какая доходность бота?',
    answer:
      'Бот зарабатывает 30-72% В ДЕНЬ от вашего депозита (для расчетов используем верхнюю планку 72%). Это реальный заработок от V2↔V3 арбитража на PancakeSwap — тысячи микро-операций ежедневно. Ваша доля растёт постепенно: первая неделя — 0.5% в день, через 26 недель — 100% доступ ко всему дневному профиту.',
  },
  {
    category: 'Общие',
    question: '⚡ Что такое атомарная транзакция?',
    answer:
      'Атомарная транзакция = ВСЁ в одной сделке on-chain. Мы берём токен из пула V2 → перемещаем в пул V3 → забираем разницу → возвращаем исходный актив. Если хоть один шаг не проходит — ВСЯ транзакция откатывается. Это гарантирует нулевой риск! Либо мы получаем прибыль, либо сделка не проходит (потеря только gas). Невозможно "застрять" между пулами или потерять средства. Каждый блок (~3 секунды) = ~100 таких атомарных операций!',
  },

  // Система участия
  {
    category: 'Система ArbitroBot',
    question: '🐰 Зачем нужен кролик из DEXRabbit?',
    answer:
      'Кролик с DEXRabbit — это ОБЯЗАТЕЛЬНОЕ условие для участия в ArbitroBot. Это ваш входной билет во всю экосистему. Купите минимум 1 кролика на сайте DEXRabbit, чтобы получить доступ к боту. Без кролика арбитраж недоступен.',
  },
  {
    category: 'Система ArbitroBot',
    question: '🔒 Что такое заморозка PLEX?',
    answer:
      'После покупки кролика нужно заморозить токены PLEX на кошельке (просто держать, не трогать): 1 кролик = 5,000 PLEX, 3 кролика = 10,000 PLEX, 5 кроликов = 15,000 PLEX. Это ваш абонемент в систему. Продадите кролика — прогресс сбросится.',
  },
  {
    category: 'Система ArbitroBot',
    question: '💰 Сколько нужно денег для старта?',
    answer:
      'Минимальный депозит — от $100. Ваши деньги остаются ВАШИМИ и работают в арбитражном боте 24/7. Можно вывести в любой момент. Депозит не блокируется, просто участвует в торговле.',
  },
  {
    category: 'Система ArbitroBot',
    question: '🪙 Что такое ежедневная плата в PLEX?',
    answer:
      'За каждый $1 вашего депозита нужно платить 10 PLEX В ДЕНЬ. Например, депозит $1,000 = 10,000 PLEX в день. Покупаете PLEX на PancakeSwap, он списывается автоматически. Это плата за работу бота. Создаёт спрос на токен.',
  },
  {
    category: 'Система ArbitroBot',
    question: '📈 Как растёт моя доля прибыли?',
    answer:
      'Ваша доля растёт каждую неделю: Неделя 1: 0.5% → Неделя 2: 2% → Неделя 3: 4% → Неделя 4: 12% → Дальше каждую неделю +4% до достижения 100%. Неделя 26: 100% = полный доступ! На депозите $1,000 через 26 недель получаете $720 В ДЕНЬ (при 72% доходности бота)!',
  },
  {
    category: 'Система ArbitroBot',
    question: '⚠️ Что если продам кролика?',
    answer:
      'Если продадите кролика — ВСЁ сбрасывается! Прогресс по неделям обнуляется, доступ к боту блокируется. Это анти-спекуляционная мера. Система для долгосрочных участников, не для быстрой перепродажи.',
  },

  // Web3 и Авторизация
  {
    category: 'Web3',
    question: 'Как подключить кошелек?',
    answer:
      'Нажмите кнопку "Подключить кошелёк" в правом верхнем углу. Поддерживаются MetaMask, Trust Wallet, Binance Wallet. Выберите ваш кошелек и подтвердите подключение.',
  },
  {
    category: 'Web3',
    question: 'Почему нужна сеть BSC?',
    answer:
      'ArbitroBot работает на BNB Smart Chain (BSC), поэтому ваш кошелек должен быть подключен к этой сети. Если вы на другой сети, сайт автоматически предложит переключиться.',
  },
  {
    category: 'Web3',
    question: 'Что такое авторизация через 1 PLEX?',
    answer:
      'Для доступа к личному кабинету нужно отправить 1 PLEX токен на адрес авторизации. Это подтверждает владение кошельком без необходимости передавать приватные ключи. Транзакция верифицируется on-chain.',
  },
  {
    category: 'Web3',
    question: 'Безопасно ли это?',
    answer:
      'Да, абсолютно безопасно. Мы никогда не запрашиваем ваши приватные ключи. Авторизация происходит через подтверждение транзакции в вашем кошельке, которую вы полностью контролируете.',
  },

  // Личный кабинет
  {
    category: 'Личный кабинет',
    question: 'Что показывает Dashboard?',
    answer:
      'В личном кабинете отображается ваша статистика: общее количество транзакций, общая прибыль, средняя прибыль, процент успешности, рейтинг и полная история операций с фильтрацией.',
  },
  {
    category: 'Личный кабинет',
    question: 'Как обновить статистику?',
    answer:
      'Статистика обновляется автоматически в реальном времени через WebSocket. Также вы можете нажать кнопку "Обновить" для ручного обновления данных.',
  },
  {
    category: 'Личный кабинет',
    question: 'Можно ли экспортировать историю?',
    answer:
      'Функция экспорта истории транзакций в CSV/PDF находится в разработке и будет добавлена в ближайшее время. Пока вы можете просматривать историю на сайте и переходить к каждой транзакции на BSCScan.',
  },

  // Прибыль и транзакции
  {
    category: 'Прибыль',
    question: '💸 Как рассчитывается моя прибыль?',
    answer:
      'Бот зарабатывает 30-72% в день (расчёты по верхней планке 72%). ВЫ получаете свою долю от этого заработка. Доля растёт по неделям: 0.5% → 2% → 4% → 12% → +4% каждую неделю → 100%. На депозите $1,000 в первую неделю получаете $25/неделю, через 26 недель — $5,040/неделю (100% доступ)!',
  },
  {
    category: 'Прибыль',
    question: '🔢 Пример расчёта прибыли?',
    answer:
      'Депозит: $1,000. Бот зарабатывает: 72% в день = $720/день. Неделя 1 (0.5%): $3.6/день × 7 = $25/неделю. Неделя 26 (100%): $720/день × 7 = $5,040/неделю. Минус ежедневная плата: 10,000 PLEX/день (цена зависит от рынка).',
  },
  {
    category: 'Прибыль',
    question: '⚡ Когда получу полный доход?',
    answer:
      'Через 26 недель вы достигаете 100% доступа ко всему дневному профиту бота. Это не реферальная система, а прогрессивный доступ к заработку. Чем дольше участвуете — тем больше доверия — тем выше доля. После 4-й недели каждую неделю +4% до 100%.',
  },
  {
    category: 'Прибыль',
    question: '📊 Можно ли вывести деньги?',
    answer:
      '⚠️ ДА, но ТОЛЬКО ВСЮ СУММУ ЦЕЛИКОМ! При выводе даже $1 система АВТОМАТИЧЕСКИ выводит ВСЮ вашу сумму и СБРАСЫВАЕТ ПРОГРЕСС ДО НУЛЯ! Стаж аннулируется, недели обнуляются. Частичный вывод ($500 из $1,000) технически НЕВОЗМОЖЕН. Это защита от спекуляций. Решили выводить — выводите всё и начинайте с нуля при следующем депозите.',
  },
  {
    category: 'Прибыль',
    question: '🚫 Можно ли снять часть и оставить часть работать?',
    answer:
      'НЕТ! Это НЕВОЗМОЖНО технически. Система не поддерживает частичный вывод. При попытке вывода она АВТОМАТИЧЕСКИ выводит ВСЮ сумму на вашем счету. Пример: у вас $1,000, хотите вывести $200 — система выведет ВСЕ $1,000 и обнулит прогресс. Каждая сумма = неделимый цикл. Хотите продолжить с меньшей суммой? Выведите всё → внесите новую сумму → начинайте с недели 1.',
  },
  {
    category: 'Прибыль',
    question: '🎯 Где видеть транзакции бота?',
    answer:
      'Все транзакции бота публичны и видны on-chain на BscScan. Полная прозрачность! На сайте есть мониторинг в реальном времени. После верификации 1 PLEX — доступен личный дашборд с детальной статистикой.',
  },

  // Технические
  {
    category: 'Техническое',
    question: 'Что такое Live badge?',
    answer:
      'Зеленый "Live" badge означает, что WebSocket подключение активно и вы получаете обновления в реальном времени. Если badge не горит, попробуйте обновить страницу.',
  },
  {
    category: 'Техническое',
    question: 'Почему не подключается WebSocket?',
    answer:
      'Проверьте подключение к интернету. Убедитесь, что firewall или антивирус не блокирует WebSocket соединения. Попробуйте обновить страницу (Ctrl+R или Cmd+R).',
  },
  {
    category: 'Техническое',
    question: 'Сайт работает на мобильных?',
    answer:
      'Да, сайт полностью адаптирован для мобильных устройств. Вы можете использовать мобильные кошельки (Trust Wallet, MetaMask Mobile) для подключения и работы с сайтом.',
  },
];

function AccordionItem({
  item,
  isOpen,
  onClick,
  index,
}: {
  item: FAQItem;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <span className="text-lg font-medium text-[var(--text-primary)] pr-4">
          {item.question}
        </span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 text-[var(--primary)]"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-[var(--text-secondary)] leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');

  const categories = [
    'Все',
    ...Array.from(new Set(faqData.map((item) => item.category))),
  ];

  const filteredFAQ =
    selectedCategory === 'Все'
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl sm:text-6xl font-bold text-gradient mb-4">
          Частые вопросы
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          Ответы на часто задаваемые вопросы о ArbitroBot
        </p>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 justify-center mb-8"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white'
                : 'glass text-[var(--text-secondary)] hover:text-[var(--primary)]'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* FAQ Items */}
      <div className="space-y-4 mb-12">
        {filteredFAQ.map((item, index) => (
          <AccordionItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            index={index}
          />
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-gradient mb-4">
          Не нашли ответ?
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Свяжитесь с нами в Telegram или посмотрите подробную информацию о
          проекте
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/about"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            О проекте
          </Link>
          <a
            href="https://t.me/+7WPfDTZSo_Y0NjFk"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg glass hover:glow-primary font-medium transition-all flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.324-.437.892-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.332-1.386 4.025-1.627 4.477-1.635.099-.001.321.023.465.141.121.098.154.23.169.323.015.094.035.307.02.474z" />
            </svg>
            Партнерский чат
          </a>
        </div>
      </motion.div>
    </div>
  );
}
