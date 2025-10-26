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
      'ArbitroBot — это автоматизированная система для арбитражной торговли на децентрализованных биржах (DEX) в сети BNB Smart Chain. Бот анализирует разницу цен между различными DEX и выполняет прибыльные сделки автоматически.',
  },
  {
    category: 'Общие',
    question: 'Как работает арбитраж?',
    answer:
      'Арбитраж — это одновременная покупка и продажа актива на разных рынках для получения прибыли от разницы цен. Бот покупает токен на одной DEX по низкой цене и продает на другой по высокой цене в одной транзакции.',
  },
  {
    category: 'Общие',
    question: 'Какие DEX поддерживаются?',
    answer:
      'ArbitroBot работает с основными DEX на BSC: PancakeSwap V2, PancakeSwap V3, Biswap и другими популярными биржами. Бот постоянно сканирует все поддерживаемые платформы.',
  },

  // Доступ и Мониторинг
  {
    category: 'Доступ',
    question: 'Как получить доступ к панели управления?',
    answer:
      'Доступ к панели управления и личному кабинету открыт для всех пользователей. Просто перейдите в соответствующий раздел через главное меню.',
  },
  {
    category: 'Доступ',
    question: 'Нужна ли регистрация?',
    answer:
      'Нет, регистрация не требуется. Все функции мониторинга и статистики доступны без авторизации. Вы можете сразу начать просматривать транзакции и статистику бота.',
  },
  {
    category: 'Доступ',
    question: 'Безопасно ли это?',
    answer:
      'Да, абсолютно безопасно. Сайт предоставляет только информацию для просмотра о работе арбитражного бота. Никакие персональные данные не требуются.',
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
    question: 'Как рассчитывается прибыль?',
    answer:
      'Прибыль рассчитывается как разница между ценой покупки и продажи минус все комиссии (газ, swap fees). Отображается в USD, процентах и BNB эквиваленте.',
  },
  {
    category: 'Прибыль',
    question: 'Почему некоторые сделки убыточны?',
    answer:
      'Не все сделки заканчиваются прибылью из-за волатильности рынка, изменения цен во время транзакции (slippage), высокого газа или конкуренции с другими ботами. Бот пытается минимизировать такие случаи.',
  },
  {
    category: 'Прибыль',
    question: 'Какая средняя прибыльность?',
    answer:
      'Средняя прибыльность зависит от рыночных условий и волатильности. В благоприятных условиях прибыль может составлять от 0.5% до 5% за транзакцию. Чистая прибыль после всех расходов обычно 0.3-2%.',
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
      'Да, сайт полностью адаптирован для мобильных устройств. Вы можете просматривать статистику и мониторинг транзакций с любого устройства.',
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
            href="https://t.me/arbitrobot"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg glass hover:glow-primary font-medium transition-all flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.324-.437.892-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.332-1.386 4.025-1.627 4.477-1.635.099-.001.321.023.465.141.121.098.154.23.169.323.015.094.035.307.02.474z" />
            </svg>
            Telegram
          </a>
        </div>
      </motion.div>
    </div>
  );
}
