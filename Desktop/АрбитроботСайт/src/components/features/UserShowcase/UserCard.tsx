'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface UserCardProps {
  username: string;
  index: number;
}

/**
 * Генерирует уникальный градиент на основе username
 */
function getUserGradient(username: string): string {
  const colors = [
    ['#00D9FF', '#9D4EDD'], // cyan-purple
    ['#00FFA3', '#00D9FF'], // green-cyan
    ['#9D4EDD', '#FF4D6A'], // purple-red
    ['#FFB800', '#FF4D6A'], // yellow-red
    ['#00FFA3', '#FFB800'], // green-yellow
    ['#00D9FF', '#00FFA3'], // cyan-green
  ];
  
  const hash = username.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const index = Math.abs(hash) % colors.length;
  return `linear-gradient(135deg, ${colors[index][0]} 0%, ${colors[index][1]} 100%)`;
}

/**
 * Получает первую букву username для fallback аватара
 */
function getInitial(username: string): string {
  const cleaned = username.replace('@', '');
  return cleaned.charAt(0).toUpperCase();
}

export default function UserCard({ username, index }: UserCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  
  const cleanUsername = username.replace('@', '');
  const gradient = getUserGradient(username);
  const initial = getInitial(username);
  
  // Telegram avatar URLs (попытка загрузки в приоритете)
  const avatarUrls = [
    // Попытка 1: Telegram API (может редиректить на CDN)
    `https://t.me/i/userpic/320/${cleanUsername}.jpg`,
    // Попытка 2: Альтернативный домен
    `https://telegram.me/${cleanUsername}/photo`,
    // Попытка 3: Telegram Web (без query params)
    `https://t.me/i/userpic/320/${cleanUsername}`,
    // Попытка 4: С CORS headers (иногда помогает)
    `https://t.me/i/userpic/160/${cleanUsername}.jpg`, // Меньше размер
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.05, // Stagger animation
      }}
      whileHover={{ 
        scale: 1.05,
        y: -8,
      }}
      className="glass rounded-2xl p-4 transition-all hover:border-[var(--border-color-hover)] hover:shadow-glow-primary"
    >
      {/* Avatar */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        {/* Background gradient (always visible) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: gradient }}
        />
        
        {/* Avatar photo */}
        {!imageError && (
          <img
            src={avatarUrls[currentUrlIndex]}
            alt={`@${cleanUsername}`}
            className={`absolute inset-0 w-full h-full rounded-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              if (currentUrlIndex < avatarUrls.length - 1) {
                // Пробуем следующий URL
                setCurrentUrlIndex(currentUrlIndex + 1);
              } else {
                // Все URL испробованы, показываем fallback
                setImageError(true);
              }
            }}
          />
        )}
        
        {/* Fallback: Initial letter */}
        {(imageError || !imageLoaded) && (
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center text-3xl font-bold text-white"
            style={{
              background: gradient,
            }}
          >
            {initial}
          </div>
        )}
        
        {/* Online indicator (decorative) */}
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-primary)] shadow-glow-accent" />
      </div>

      {/* Username */}
      <div className="text-center">
        <p className="text-[var(--text-primary)] font-semibold text-lg">
          @{cleanUsername}
        </p>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">
          Активный трейдер
        </p>
      </div>

      {/* Stats (mock data - можно подключить реальные позже) */}
      <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Прибыль:</span>
          <span className="text-[var(--accent)] font-semibold">+0%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Сделок:</span>
          <span className="text-[var(--primary)] font-semibold">0</span>
        </div>
      </div>

      {/* Contact Button */}
      <motion.a
        href={`https://t.me/${cleanUsername}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300"
        style={{
          background: gradient,
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 217, 255, 0.3)',
        }}
      >
        <svg 
          className="w-5 h-5" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
        Связаться
      </motion.a>
    </motion.div>
  );
}

