import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import AnimatedBackground from '@/components/effects/AnimatedBackground';
import PageTransition from '@/components/effects/PageTransition';

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
  metadataBase: new URL('https://arbitrage-bot.com'),
  
  // Open Graph (Facebook, Discord, Telegram)
  openGraph: {
    title: 'ArbitroBot - DEX Арбитражный Робот',
    description: 'Мониторинг арбитражных транзакций в реальном времени на BNB Chain. Автоматический арбитраж между DEX 24/7.',
    url: 'https://arbitrage-bot.com',
    siteName: 'ArbitroBot',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'ArbitroBot - DEX Арбитражный Робот',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'ArbitroBot - DEX Арбитражный Робот',
    description: 'Мониторинг арбитражных транзакций в реальном времени на BNB Chain',
    images: ['/logo.svg'],
    creator: '@ArbitroBot',
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  // Manifest для PWA
  manifest: '/manifest.json',
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
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
    <html lang="ru" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Header */}
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
