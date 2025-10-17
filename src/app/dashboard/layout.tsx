'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Dashboard Layout с защитой авторизации
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isVerifying } = useAuth();
  const router = useRouter();

  // Redirect если не авторизован
  useEffect(() => {
    if (!isVerifying && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isVerifying, router]);

  // Показываем loader пока проверяем авторизацию
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">
            Проверка авторизации...
          </p>
        </motion.div>
      </div>
    );
  }

  // Если не авторизован, ничего не рендерим (произойдет redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20">
      {children}
    </div>
  );
}
