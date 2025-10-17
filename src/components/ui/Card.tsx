'use client';

import { motion } from 'framer-motion';
import { forwardRef, ReactNode, MouseEvent } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  variant?: 'default' | 'glass' | 'gradient';
  hoverable?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hoverable = true,
      className,
      onClick,
    },
    ref
  ) => {
    const baseStyles = 'rounded-xl p-6 transition-smooth';

    const variants = {
      default: 'bg-[var(--bg-secondary)] border border-[var(--border-color)]',
      glass:
        'bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)]',
      gradient:
        'bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border border-[var(--border-color)]',
    };

    const hoverStyles = hoverable
      ? 'hover:border-[var(--border-color-hover)] hover:shadow-glow-primary cursor-pointer'
      : '';

    if (hoverable) {
      return (
        <motion.div
          ref={ref}
          onClick={onClick}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className={clsx(
            baseStyles,
            variants[variant],
            hoverStyles,
            className
          )}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={clsx(
          baseStyles,
          variants[variant],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
