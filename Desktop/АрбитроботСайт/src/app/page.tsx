'use client';

import UserShowcase from '@/components/features/UserShowcase/UserShowcase';
import PlexWidget from '@/components/features/PlexWidget/PlexWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-6xl font-bold text-center mb-8">
          <span className="text-[#00D9FF]">Arbitro</span>Bot
        </h1>
        <p className="text-xl text-center text-gray-400 mb-12">
          Мониторинг арбитражных транзакций в реальном времени
        </p>
        
        <div className="max-w-4xl mx-auto bg-[#13131A] p-8 rounded-2xl border border-[#00D9FF]/20">
          <h2 className="text-2xl font-semibold mb-4">Добро пожаловать!</h2>
          <p className="text-gray-300 mb-4">
            Сайт находится в разработке. Скоро здесь будет доступен полный функционал мониторинга арбитражных транзакций на BNB Chain.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-[#1C1C24] p-6 rounded-xl border border-[#00D9FF]/10">
              <div className="text-[#00D9FF] text-3xl font-bold mb-2">0</div>
              <div className="text-gray-400">Транзакций сегодня</div>
            </div>
            <div className="bg-[#1C1C24] p-6 rounded-xl border border-[#9D4EDD]/10">
              <div className="text-[#9D4EDD] text-3xl font-bold mb-2">$0</div>
              <div className="text-gray-400">Общая прибыль</div>
            </div>
            <div className="bg-[#1C1C24] p-6 rounded-xl border border-[#00FFA3]/10">
              <div className="text-[#00FFA3] text-3xl font-bold mb-2">0%</div>
              <div className="text-gray-400">Успешность</div>
            </div>
          </div>
        </div>

        {/* О проекте ArbitroBot */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-[#00D9FF]/10 to-[#9D4EDD]/10 p-8 rounded-2xl border border-[#00D9FF]/30">
            <h2 className="text-3xl font-bold mb-6 text-center">
              <span className="text-[#00D9FF]">ArbitroBot</span> — реальный высокодоходный бизнес
            </h2>
            <div className="text-gray-300 space-y-4">
              <p className="text-lg leading-relaxed">
                ArbitroBot — это не очередной хайп-проект или схема. Это реально работающая система автоматизированной арбитражной торговли на децентрализованных биржах BNB Smart Chain, которая показывает выдающиеся результаты: <span className="text-[#00FFA3] font-semibold">до 72.8% дневной доходности</span> для опытных пользователей.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-[#13131A] p-6 rounded-xl border border-[#00D9FF]/20">
                  <div className="text-[#00FFA3] text-4xl mb-2">✓</div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Проверенная технология</h3>
                  <p className="text-gray-400">Арбитражная торговля — это классическая финансовая стратегия, используемая профессиональными трейдерами по всему миру</p>
                </div>
                <div className="bg-[#13131A] p-6 rounded-xl border border-[#9D4EDD]/20">
                  <div className="text-[#00FFA3] text-4xl mb-2">✓</div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Прозрачность</h3>
                  <p className="text-gray-400">Все транзакции записываются в блокчейн и могут быть проверены на BSCScan в любой момент</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Как начать зарабатывать */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-4xl font-bold text-center mb-12">
            Как начать <span className="text-[#00D9FF]">зарабатывать</span>?
          </h2>

          <div className="space-y-6">
            {/* Шаг 1 */}
            <div className="bg-[#13131A] p-6 rounded-2xl border-l-4 border-[#00D9FF]">
              <div className="flex items-start gap-4">
                <div className="bg-[#00D9FF] text-black font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">1</div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">Подготовка входных требований</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#00FFA3] mt-1">•</span>
                      <span><strong className="text-white">PLEX токены:</strong> 5,000-25,000+ токенов в холдинге (определяют количество "сумм")</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00FFA3] mt-1">•</span>
                      <span><strong className="text-white">Живые кролики:</strong> 1-15+ кроликов в токенизированной ферме</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00FFA3] mt-1">•</span>
                      <span><strong className="text-white">Кошелек BNB Chain:</strong> MetaMask или Trust Wallet</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Шаг 2 */}
            <div className="bg-[#13131A] p-6 rounded-2xl border-l-4 border-[#9D4EDD]">
              <div className="flex items-start gap-4">
                <div className="bg-[#9D4EDD] text-white font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">2</div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">Внесение депозита</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#00FFA3] mt-1">•</span>
                      <span><strong className="text-white">Минимальный депозит:</strong> от $100 USDT</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00FFA3] mt-1">•</span>
                      <span><strong className="text-white">Рекомендуемый депозит:</strong> $500-1,000 для оптимальной работы</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00FFA3] mt-1">•</span>
                      <span><strong className="text-white">Ежедневная комиссия:</strong> 10 PLEX токенов за каждый $1 депозита</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Шаг 3 */}
            <div className="bg-[#13131A] p-6 rounded-2xl border-l-4 border-[#00FFA3]">
              <div className="flex items-start gap-4">
                <div className="bg-[#00FFA3] text-black font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">3</div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">Рост доходности по неделям</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#fbbf24] mt-1">📈</span>
                      <span><strong className="text-white">Неделя 1-2:</strong> адаптация и оптимизация алгоритмов</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#fbbf24] mt-1">📈</span>
                      <span><strong className="text-white">Неделя 3-4:</strong> стабильная работа и полная мощность</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00FFA3] mt-1">🚀</span>
                      <span><strong className="text-white">Неделя 5+:</strong> пик доходности — до 72.8% в день</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00FFA3] mt-1">💰</span>
                      <span><strong className="text-white">Месяц 3:</strong> точка безубыточности — начало чистой прибыли</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Шаг 4 */}
            <div className="bg-gradient-to-r from-[#ef4444]/10 to-[#dc2626]/10 p-6 rounded-2xl border-l-4 border-[#ef4444]">
              <div className="flex items-start gap-4">
                <div className="bg-[#ef4444] text-white font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">4</div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">Соблюдение железных правил</h3>
                  <div className="bg-[#ef4444]/20 p-4 rounded-xl mb-3">
                    <p className="text-[#ef4444] font-semibold text-lg mb-2">⚠️ КРИТИЧЕСКИ ВАЖНО:</p>
                    <p className="text-gray-300">Несоблюдение любого из правил приведет к остановке бота и потере доступа!</p>
                  </div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#ef4444] mt-1">🛑</span>
                      <span><strong className="text-white">НЕ продавать PLEX:</strong> Продажа токенов из холдинга останавливает бот НАВСЕГДА</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f59e0b] mt-1">🔒</span>
                      <span><strong className="text-white">НЕ менять депозит:</strong> Изменение суммы сбрасывает прогресс недель к началу</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#fbbf24] mt-1">📅</span>
                      <span><strong className="text-white">Платить КАЖДЫЙ день:</strong> Пропуск ежедневной комиссии останавливает работу бота</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Правила приема пользователей */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-[#fbbf24]/10 via-[#ef4444]/10 to-[#9D4EDD]/10 p-8 rounded-2xl border-2 border-[#fbbf24]/50">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">
                Ограниченный прием <span className="text-[#fbbf24]">инвесторов</span>
              </h2>
              <p className="text-xl text-gray-300">
                ArbitroBot — это не массовый продукт. Мы принимаем только тех, кто готов следовать правилам.
              </p>
            </div>

            <div className="bg-[#13131A] p-6 rounded-xl border border-[#fbbf24]/30 mb-6">
              <h3 className="text-2xl font-semibold mb-4 text-[#fbbf24]">Почему ограниченный прием?</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span><strong className="text-white">Ограниченная ликвидность:</strong> Арбитраж работает эффективно только при определенном объеме</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span><strong className="text-white">Высокая доходность:</strong> Чтобы сохранить 72.8% дневной доходности, мы контролируем количество участников</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FFA3] mt-1">✓</span>
                  <span><strong className="text-white">Качество важнее количества:</strong> Мы работаем только с серьезными инвесторами</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#ef4444]/20 p-6 rounded-xl border border-[#ef4444]/50">
              <h3 className="text-2xl font-semibold mb-4 text-[#ef4444]">Требования для новых пользователей</h3>
              <p className="text-gray-300 mb-4">
                Новые пользователи принимаются <span className="text-white font-semibold">СТРОГО при соответствии ВСЕМ правилам:</span>
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#13131A] p-4 rounded-lg">
                  <div className="text-[#00D9FF] text-2xl mb-2">✓</div>
                  <p className="text-white font-medium mb-1">Наличие PLEX токенов</p>
                  <p className="text-gray-400 text-sm">5,000+ в холдинге</p>
                </div>
                <div className="bg-[#13131A] p-4 rounded-lg">
                  <div className="text-[#00D9FF] text-2xl mb-2">✓</div>
                  <p className="text-white font-medium mb-1">Живые кролики</p>
                  <p className="text-gray-400 text-sm">Минимум 1 кролик в ферме</p>
                </div>
                <div className="bg-[#13131A] p-4 rounded-lg">
                  <div className="text-[#00D9FF] text-2xl mb-2">✓</div>
                  <p className="text-white font-medium mb-1">Готовность к дисциплине</p>
                  <p className="text-gray-400 text-sm">Ежедневные платежи без пропусков</p>
                </div>
                <div className="bg-[#13131A] p-4 rounded-lg">
                  <div className="text-[#00D9FF] text-2xl mb-2">✓</div>
                  <p className="text-white font-medium mb-1">Долгосрочная перспектива</p>
                  <p className="text-gray-400 text-sm">Минимум 3 месяца работы</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-[#ef4444]/10 rounded-lg">
                <p className="text-center text-lg font-semibold text-white">
                  📋 Подробные правила описаны в разделе{' '}
                  <a href="/mindmap" className="text-[#00D9FF] hover:text-[#00FFA3] transition-colors underline">
                    Ментальная карта
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/mindmap"
                className="inline-block px-8 py-4 bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-[#00D9FF]/50 hover:scale-105"
              >
                Изучить все правила →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* User Showcase Section */}
      <UserShowcase />

      {/* PLEX Token Widget */}
      <PlexWidget />
    </div>
  );
}
