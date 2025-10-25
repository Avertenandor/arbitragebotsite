'use client';

import { motion } from 'framer-motion';

interface ComingSoonTabProps {
  icon: string;
  title: string;
  description: string;
}

export default function ComingSoonTab({ icon, title, description }: ComingSoonTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="glass rounded-2xl p-12 max-w-2xl text-center">
        <div className="text-6xl mb-6 animate-float">{icon}</div>
        <h2 className="text-3xl font-bold text-gradient mb-4">{title}</h2>
        <p className="text-[var(--text-secondary)] mb-6 text-lg">{description}</p>
        <div className="glass rounded-xl p-6 bg-[var(--bg-tertiary)]">
          <p className="text-[var(--text-primary)] text-base font-medium">
            Веду работы по этой странице с уважением ваш Саша))
          </p>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </motion.div>
  );
}
