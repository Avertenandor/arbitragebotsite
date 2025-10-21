'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui';

export default function ConnectWallet() {
  const [showModal, setShowModal] = useState(false);

  const handleConnect = () => {
    setShowModal(true);
  };

  return (
    <>
      <Button
        variant="primary"
        size="md"
        onClick={handleConnect}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M17.5 6.66667L10 2.5L2.5 6.66667L10 10.8333L17.5 6.66667Z"
            fill="currentColor"
            opacity="0.8"
          />
          <path
            d="M2.5 10L10 14.1667L17.5 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="hidden sm:inline">Подключить кошелёк</span>
        <span className="sm:hidden">Войти</span>
      </Button>

      {/* Информационное модальное окно */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative glass rounded-2xl p-8 w-full max-w-lg"
            >
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF] to-[#00FFA3] rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-[#00D9FF] to-[#00FFA3] p-6 rounded-full">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <path
                        d="M24 8L8 16L24 24L40 16L24 8Z"
                        fill="white"
                        opacity="0.9"
                      />
                      <path
                        d="M8 24L24 32L40 24"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 32L24 40L40 32"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-bold text-center mb-4">
                <span className="text-gradient">Вход в личный кабинет</span>
              </h3>

              {/* Message */}
              <div className="bg-gradient-to-r from-[#00D9FF]/10 to-[#00FFA3]/10 p-6 rounded-xl border border-[#00D9FF]/30 mb-6">
                <p className="text-base sm:text-lg text-center text-[var(--text-primary)] leading-relaxed">
                  <span className="font-semibold text-[#00FFA3]">После завершения всех тестов</span> это будет ваша{' '}
                  <span className="font-bold text-[#00D9FF]">точка входа</span> в личный кабинет на нашем сайте.
                </p>
              </div>

              {/* Additional info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
                        stroke="#00D9FF"
                        strokeWidth="2"
                      />
                      <path
                        d="M10 6V10L13 13"
                        stroke="#00D9FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Сейчас проходит <span className="text-[#00FFA3] font-semibold">финальное тестирование</span> системы
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 2L3 6L10 10L17 6L10 2Z"
                        fill="#9D4EDD"
                        opacity="0.8"
                      />
                      <path
                        d="M3 10L10 14L17 10"
                        stroke="#9D4EDD"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Скоро здесь будет <span className="text-[#9D4EDD] font-semibold">Web3 авторизация</span> через кошелёк
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="5" width="14" height="12" rx="2" stroke="#FFB800" strokeWidth="2" />
                      <path d="M7 5V3C7 2.44772 7.44772 2 8 2H12C12.5523 2 13 2.44772 13 3V5" stroke="#FFB800" strokeWidth="2" />
                      <circle cx="10" cy="11" r="2" fill="#FFB800" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Доступ к <span className="text-[#FFB800] font-semibold">личному дашборду</span> и статистике
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowModal(false)}
                className="w-full"
              >
                Понятно
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
