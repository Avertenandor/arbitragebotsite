'use client';

import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      icon,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center gap-1.5 rounded-full font-medium transition-smooth';

    const variants = {
      success: 'bg-[rgba(0,255,163,0.1)] text-[var(--accent)]',
      danger: 'bg-[rgba(255,77,106,0.1)] text-[var(--danger)]',
      warning: 'bg-[rgba(255,184,0,0.1)] text-[var(--warning)]',
      info: 'bg-[rgba(0,217,255,0.1)] text-[var(--primary)]',
      default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        <span>{children}</span>
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
