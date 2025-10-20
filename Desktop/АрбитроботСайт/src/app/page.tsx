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
      </div>

      {/* User Showcase Section */}
      <UserShowcase />

      {/* PLEX Token Widget */}
      <PlexWidget />
    </div>
  );
}
