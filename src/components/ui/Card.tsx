'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient';
  hoverable?: boolean;
  children: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hoverable = true,
      className,
      ...props
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

    const MotionDiv = hoverable ? motion.div : 'div';

    const motionProps = hoverable
      ? {
          whileHover: { scale: 1.02, y: -4 },
          whileTap: { scale: 0.98 },
        }
      : {};

    return (
      <MotionDiv
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          hoverStyles,
          className
        )}
        {...(hoverable ? motionProps : {})}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

Card.displayName = 'Card';

export default Card;
