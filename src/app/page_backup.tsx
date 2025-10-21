'use client';

import TransactionWindow from '@/components/features/TransactionMonitor/TransactionWindow';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient with more depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] via-[#0D0D14] to-[var(--bg-primary)]" />
      </div>
    </div>
  );
}

