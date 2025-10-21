'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ConnectWallet from '@/components/features/Auth/ConnectWallet';
import MobileMenu from './MobileMenu';
import { useAuth } from '@/lib/hooks';

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border-color)]"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] p-2 rounded-lg">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[var(--bg-primary)]"
                  >
                    <path
                      d="M16 4L4 10L16 16L28 10L16 4Z"
                      fill="currentColor"
                      opacity="0.8"
                    />
                    <path
                      d="M4 16L16 22L28 16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 22L16 28L28 22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gradient">
                  ArbitroBot
                </h1>
                <p className="text-xs text-[var(--text-muted)] hidden sm:block">
                  DEX Арбитраж
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
                }`}
              >
                Мониторинг
              </Link>
              
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
                  }`}
                >
                  Личный кабинет
                </Link>
              )}
              
              <Link
                href="/about"
                className={`text-sm font-medium transition-colors ${
                  isActive('/about')
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
                }`}
              >
                О проекте
              </Link>
              <Link
                href="/faq"
                className={`text-sm font-medium transition-colors ${
                  isActive('/faq')
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
                }`}
              >
                FAQ
              </Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Connect Wallet (hidden on mobile) */}
              <div className="hidden sm:block">
                <ConnectWallet />
              </div>

              {/* Hamburger Button (mobile only) */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors touch-manipulation active:scale-95 relative z-10"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Открыть меню"
                type="button"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--text-primary)]"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              {/* Connect Wallet (mobile - inside hamburger) */}
              <div className="sm:hidden">
                <ConnectWallet />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
