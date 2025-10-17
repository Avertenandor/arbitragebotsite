import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import AnimatedBackground from '@/components/effects/AnimatedBackground';
import CustomCursor from '@/components/effects/CustomCursor';
import PageTransition from '@/components/effects/PageTransition';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ArbitroBot - DEX Арбитражный Робот | Мониторинг Транзакций',
  description: 'Отслеживайте в реальном времени транзакции арбитражного бота на PancakeSwap. Автоматический арбитраж между DEX, мониторинг прибыли, анализ эффективности торговых стратегий.',
  keywords: [
    'арбитраж',
    'криптовалюты',
    'DEX',
    'PancakeSwap',
    'автоматический трейдинг',
    'BSC',
    'DeFi',
    'арбитражный робот',
    'мониторинг транзакций',
    'BNB Chain'
  ],
  authors: [{ name: 'ArbitroBot Team' }],
  openGraph: {
    title: 'ArbitroBot - DEX Арбитражный Робот',
    description: 'Мониторинг арбитражных транзакций в реальном времени',
    type: 'website',
    locale: 'ru_RU',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {/* Animated Background */}
        <AnimatedBackground />
        
        {/* Custom Cursor */}
        <CustomCursor />
        
        {/* Header - добавлен */}
        <Header />
        
        {/* Main Content with padding for fixed header */}
        <main className="pt-20">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </body>
    </html>
  );
}
