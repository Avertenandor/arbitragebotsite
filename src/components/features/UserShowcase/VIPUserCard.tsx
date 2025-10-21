'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export type UserRole = 'coordinator' | 'ambassador' | 'both';

interface VIPUserCardProps {
  username: string;
  role: UserRole;
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

/**
 * Пытается загрузить аватар из нескольких источников Telegram
 */
function getTelegramAvatarUrls(username: string): string[] {
  const cleanUsername = username.replace('@', '');
  
  return [
    // Попытка 1: Telegram API (может редиректить на CDN)
    `https://t.me/i/userpic/320/${cleanUsername}.jpg`,
    // Попытка 2: Альтернативный домен
    `https://telegram.me/${cleanUsername}/photo`,
    // Попытка 3: Без расширения (иногда работает)
    `https://t.me/i/userpic/320/${cleanUsername}`,
    // Попытка 4: Меньший размер (160px)
    `https://t.me/i/userpic/160/${cleanUsername}.jpg`,
    // Попытка 5: Username с большой буквы (case-sensitive)
    `https://t.me/i/userpic/320/${cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)}.jpg`,
  ];
}

export default function VIPUserCard({ username, role, index }: VIPUserCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  
  const cleanUsername = username.replace('@', '');
  const gradient = getUserGradient(username);
  const initial = getInitial(username);
  const avatarUrls = getTelegramAvatarUrls(username);

  const isCoordinator = role === 'coordinator' || role === 'both';
  const isAmbassador = role === 'ambassador' || role === 'both';

  // Размер карточки в зависимости от роли
  const cardSize = isCoordinator ? 'large' : 'medium';

  const handleImageError = () => {
    if (currentUrlIndex < avatarUrls.length - 1) {
      // Пробуем следующий URL
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      // Все URL испробованы, показываем fallback
      setImageError(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.1,
      }}
      whileHover={{ 
        scale: 1.03,
        y: -10,
      }}
      className="relative glass-elevated rounded-3xl p-4 sm:p-6 transition-all hover:shadow-glow-primary-lg border-2 border-transparent hover:border-[var(--primary)]"
    >
      {/* VIP Badge Corner */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
        <div 
          className="absolute transform rotate-45 translate-x-8 -translate-y-2 py-1 px-10 text-xs font-bold text-white"
          style={{
            background: isCoordinator 
              ? 'linear-gradient(135deg, #FFB800 0%, #FF4D6A 100%)'
              : 'linear-gradient(135deg, #00D9FF 0%, #9D4EDD 100%)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          VIP
        </div>
      </div>

      {/* Avatar */}
      <div className={`relative mx-auto mb-4 sm:mb-6 ${cardSize === 'large' ? 'w-24 h-24 sm:w-32 sm:h-32' : 'w-20 h-20 sm:w-24 sm:h-24'}`}>
        {/* Background gradient (always visible) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: gradient }}
        />
        
        {/* Telegram photo */}
        {!imageError && (
          <img
            src={avatarUrls[currentUrlIndex]}
            alt={`@${cleanUsername}`}
            className={`absolute inset-0 w-full h-full rounded-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        )}
        
        {/* Fallback: Initial letter */}
        {(imageError || !imageLoaded) && (
          <div
            className={`absolute inset-0 rounded-full flex items-center justify-center font-bold text-white ${
              cardSize === 'large' ? 'text-5xl' : 'text-4xl'
            }`}
            style={{ background: gradient }}
          >
            {initial}
          </div>
        )}
        
        {/* Online indicator */}
        <div className="absolute bottom-2 right-2 w-5 h-5 bg-[var(--accent)] rounded-full border-3 border-[var(--bg-primary)] shadow-glow-accent animate-pulse" />
        
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{ background: gradient }}
        />
      </div>

      {/* Username */}
      <div className="text-center mb-3 sm:mb-4">
        <h3 className={`text-[var(--text-primary)] font-bold mb-2 ${
          cardSize === 'large' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
        }`}>
          @{cleanUsername}
        </h3>
        
        {/* Role Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {isCoordinator && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FFB800] to-[#FF4D6A] text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Координатор
            </span>
          )}
          {isAmbassador && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Амбассадор
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4 px-2 sm:px-4">
        <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-3 rounded-lg bg-[var(--bg-tertiary)]">
          <span className="text-[var(--text-secondary)]">Прибыль:</span>
          <span className="text-[var(--accent)] font-semibold">+0%</span>
        </div>
        <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-3 rounded-lg bg-[var(--bg-tertiary)]">
          <span className="text-[var(--text-secondary)]">Сделок:</span>
          <span className="text-[var(--primary)] font-semibold">0</span>
        </div>
        <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-3 rounded-lg bg-[var(--bg-tertiary)]">
          <span className="text-[var(--text-secondary)]">Статус:</span>
          <span className="text-[var(--accent)] font-semibold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Contact Button */}
      <motion.a
        href={`https://t.me/${cleanUsername}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 text-white"
        style={{
          background: gradient,
          boxShadow: '0 4px 20px rgba(0, 217, 255, 0.4)',
        }}
      >
        <svg 
          className="w-4 h-4 sm:w-5 sm:h-5" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
        <span className="hidden sm:inline">Связаться в Telegram</span>
        <span className="sm:hidden">Связаться</span>
      </motion.a>
    </motion.div>
  );
}

