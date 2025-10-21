import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import AnimatedBackground from '@/components/effects/AnimatedBackground';
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
  metadataBase: new URL('https://arbitrage-bot.com'),
  
  // Open Graph (Facebook, Discord, Telegram, VK)
  openGraph: {
    title: 'ArbitroBot - DEX Арбитражный Робот | 30-72% в день',
    description: 'Автоматический арбитраж на BNB Chain 24/7. Мониторинг транзакций в реальном времени. Прозрачность и надёжность.',
    url: 'https://arbitrage-bot.com',
    siteName: 'ArbitroBot',
    images: [
      {
        url: 'https://arbitrage-bot.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'ArbitroBot - DEX Арбитражный Робот. Доход 30-72% в день. Работает 24/7 на BSC',
        type: 'image/png',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'ArbitroBot - DEX Арбитражный Робот',
    description: '🤖 Автоматический арбитраж 24/7 | 📈 30-72% в день | 🔗 BSC Network',
    images: ['https://arbitrage-bot.com/opengraph-image.png'],
    creator: '@ArbitroBot',
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo.svg', type: 'image/svg+xml' },
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
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
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
