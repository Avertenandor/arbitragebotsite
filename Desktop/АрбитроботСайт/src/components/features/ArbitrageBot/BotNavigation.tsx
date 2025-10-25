'use client';

import { useState } from 'react';

export type BotTab =
  | 'dashboard'
  | 'wallet'
  | 'scanner'
  | 'contract'
  | 'statistics'
  | 'decisions'
  | 'whitelist'
  | 'blacklist'
  | 'graylist'
  | 'arbitrage'
  | 'node'
  | 'terminal';

interface BotNavigationProps {
  activeTab: BotTab;
  onTabChange: (tab: BotTab) => void;
}

const tabs: Array<{ id: BotTab; icon: string; label: string }> = [
  { id: 'dashboard', icon: '📊', label: 'Дашборд' },
  { id: 'wallet', icon: '💼', label: 'Кошелек' },
  { id: 'scanner', icon: '🔍', label: 'Scanner' },
  { id: 'contract', icon: '⚙️', label: 'Контракт' },
  { id: 'statistics', icon: '📈', label: 'Статистика' },
  { id: 'decisions', icon: '📋', label: 'Решения' },
  { id: 'whitelist', icon: '✅', label: 'Whitelist' },
  { id: 'blacklist', icon: '❌', label: 'Blacklist' },
  { id: 'graylist', icon: '🕓', label: 'Graylist' },
  { id: 'arbitrage', icon: '⚡', label: 'Арбитраж' },
  { id: 'node', icon: '🌐', label: 'Нода' },
  { id: 'terminal', icon: '💻', label: 'Terminal' },
];

export default function BotNavigation({ activeTab, onTabChange }: BotNavigationProps) {
  return (
    <div className="glass rounded-xl p-2 mb-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg
              transition-all duration-300 font-medium text-sm
              ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-glow-primary'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
