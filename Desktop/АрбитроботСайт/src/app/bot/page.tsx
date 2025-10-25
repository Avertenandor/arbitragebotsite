'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import BotNavigation, { BotTab } from '@/components/features/ArbitrageBot/BotNavigation';
import DashboardTab from '@/components/features/ArbitrageBot/tabs/DashboardTab';
import WalletTab from '@/components/features/ArbitrageBot/tabs/WalletTab';
import ScannerTab from '@/components/features/ArbitrageBot/tabs/ScannerTab';
import ContractTab from '@/components/features/ArbitrageBot/tabs/ContractTab';
import StatisticsTab from '@/components/features/ArbitrageBot/tabs/StatisticsTab';
import DecisionsTab from '@/components/features/ArbitrageBot/tabs/DecisionsTab';
import WhitelistTab from '@/components/features/ArbitrageBot/tabs/WhitelistTab';
import BlacklistTab from '@/components/features/ArbitrageBot/tabs/BlacklistTab';
import GraylistTab from '@/components/features/ArbitrageBot/tabs/GraylistTab';
import ArbitrageTab from '@/components/features/ArbitrageBot/tabs/ArbitrageTab';
import NodeTab from '@/components/features/ArbitrageBot/tabs/NodeTab';
import TerminalTab from '@/components/features/ArbitrageBot/tabs/TerminalTab';

/**
 * ArbitroBot Interface - Интерфейс арбитражного бота
 */
export default function BotPage() {
  const [activeTab, setActiveTab] = useState<BotTab>('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'wallet':
        return <WalletTab />;
      case 'scanner':
        return <ScannerTab />;
      case 'contract':
        return <ContractTab />;
      case 'statistics':
        return <StatisticsTab />;
      case 'decisions':
        return <DecisionsTab />;
      case 'whitelist':
        return <WhitelistTab />;
      case 'blacklist':
        return <BlacklistTab />;
      case 'graylist':
        return <GraylistTab />;
      case 'arbitrage':
        return <ArbitrageTab />;
      case 'node':
        return <NodeTab />;
      case 'terminal':
        return <TerminalTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-3">
            🤖 ArbitroBot Control Panel
          </h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg">
            Панель управления арбитражным ботом на BNB Chain
          </p>
        </motion.div>

        {/* Navigation */}
        <BotNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTab()}
        </motion.div>
      </div>
    </div>
  );
}
