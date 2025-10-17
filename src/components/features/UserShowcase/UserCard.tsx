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
  
  const cleanUsername = username.replace('@', '');
  const gradient = getUserGradient(username);
  const initial = getInitial(username);
  
  // Telegram avatar URLs (пробуем несколько вариантов)
  const avatarUrls = [
    `https://t.me/i/userpic/320/${cleanUsername}.jpg`,
    `https://telegram.me/${cleanUsername}/photo`,
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
        
        {/* Telegram photo (if available) */}
        {!imageError && (
          <img
            src={avatarUrls[0]}
            alt={`@${cleanUsername}`}
            className={`absolute inset-0 w-full h-full rounded-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              // Try second URL
              const img = new Image();
              img.onload = () => setImageLoaded(true);
              img.onerror = () => setImageError(true);
              img.src = avatarUrls[1];
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
      <a
        href={`https://t.me/${cleanUsername}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center"
      >
        <p className="text-[var(--text-primary)] font-semibold hover:text-[var(--primary)] transition-colors">
          @{cleanUsername}
        </p>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">
          Активный трейдер
        </p>
      </a>

      {/* Stats (mock data - можно подключить реальные позже) */}
      <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Прибыль:</span>
          <span className="text-[var(--accent)] font-semibold">+0%</span>
        </div>
      </div>
    </motion.div>
  );
}

