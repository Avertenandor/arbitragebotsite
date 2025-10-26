'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui';
import { TxStatus } from '@/lib/web3/config';
import { fmtNumber } from '@/utils/format';

export default function ConnectWallet() {
  const router = useRouter();
  const wallet = useWallet();
  const auth = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async () => {
    if (wallet.isConnected) {
      setShowModal(true);
    } else {
      await wallet.connect();
    }
  };

  const handleProfileClick = () => {
    // Go to dashboard
    router.push('/dashboard');
  };

  const handleAuthenticate = async () => {
    if (!wallet.address) return;

    const success = await auth.verifyAndAuthenticate(wallet.address);
    
    if (success) {
      setShowModal(false);
      // Redirect to dashboard
      router.push('/dashboard');
    }
  };

  const handleDisconnect = async () => {
    await wallet.disconnect();
    auth.logout();
    setShowModal(false);
  };

  // Format address: 0x1234...5678
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // If authenticated, show profile button
  if (auth.isAuthenticated && wallet.address) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-[var(--text-muted)]">
            Баланс PLEX
          </span>
          <span className="text-sm font-semibold text-[var(--accent)]">
            {fmtNumber(parseFloat(wallet.balance.plex), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="md"
          onClick={handleProfileClick}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="10" cy="8" r="3" fill="currentColor" />
            <path
              d="M5 15c0-2.5 2-4 5-4s5 1.5 5 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="hidden sm:inline">
            {formatAddress(wallet.address)}
          </span>
          <span className="sm:hidden">Профиль</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        size="md"
        onClick={handleConnect}
        isLoading={wallet.isConnecting}
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

      {/* Modal */}
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
              className="relative glass rounded-2xl p-6 w-full max-w-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gradient">
                  {wallet.isConnected ? 'Ваш кошелёк' : 'Подключить кошелёк'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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
              </div>

              {/* Error */}
              {(wallet.error || auth.error) && (
                <div className="mb-4 p-3 rounded-lg bg-[rgba(255,77,106,0.1)] border border-[var(--danger)]">
                  <p className="text-sm text-[var(--danger)]">
                    {wallet.error || auth.error}
                  </p>
                </div>
              )}

              {/* Connected wallet info */}
              {wallet.isConnected && wallet.address && (
                <div className="space-y-4">
                  {/* Address */}
                  <div className="glass rounded-lg p-4">
                    <div className="text-xs text-[var(--text-muted)] mb-1">
                      Адрес
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[var(--text-primary)]">
                        {formatAddress(wallet.address)}
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(wallet.address!)
                        }
                        className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <rect
                            x="5"
                            y="5"
                            width="9"
                            height="9"
                            rx="1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M3 11V3C3 2.44772 3.44772 2 4 2H11"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Network warning */}
                  {!wallet.isCorrectNetwork && (
                    <div className="p-3 rounded-lg bg-[rgba(255,184,0,0.1)] border border-[var(--warning)]">
                      <p className="text-sm text-[var(--warning)] mb-2">
                        Неверная сеть. Переключитесь на BSC.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={wallet.switchNetwork}
                      >
                        Переключить на BSC
                      </Button>
                    </div>
                  )}

                  {/* Balances */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-lg p-4">
                      <div className="text-xs text-[var(--text-muted)] mb-1">
                        BNB
                      </div>
                      <div className="text-lg font-bold text-[var(--primary)]">
                        {fmtNumber(parseFloat(wallet.balance.bnb), { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                      </div>
                    </div>
                    <div className="glass rounded-lg p-4">
                      <div className="text-xs text-[var(--text-muted)] mb-1">
                        PLEX
                      </div>
                      <div className="text-lg font-bold text-[var(--accent)]">
                        {fmtNumber(parseFloat(wallet.balance.plex), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Authentication */}
                  {!auth.isAuthenticated && wallet.isCorrectNetwork && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-[rgba(0,217,255,0.1)] border border-[var(--primary)]">
                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                          Для входа в личный кабинет отправьте 1 PLEX токен на
                          адрес верификации.
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Это одноразовая операция для подтверждения владения
                          кошельком.
                        </p>
                      </div>

                      {/* Transaction status */}
                      {auth.txStatus !== TxStatus.IDLE && (
                        <div className="glass rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {auth.txStatus === TxStatus.PENDING && (
                              <svg
                                className="animate-spin"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M8 2V4M8 12V14M2 8H4M12 8H14M3.5 3.5L4.9 4.9M11.1 11.1L12.5 12.5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                            {auth.txStatus === TxStatus.SUCCESS && (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M13 4L6 11L3 8"
                                  stroke="var(--accent)"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                            {auth.txStatus === TxStatus.FAILED && (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M12 4L4 12M4 4l8 8"
                                  stroke="var(--danger)"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                            <span className="text-sm font-medium">
                              {auth.txStatus === TxStatus.PENDING &&
                                'Ожидание подтверждения...'}
                              {auth.txStatus === TxStatus.SUCCESS &&
                                'Транзакция подтверждена!'}
                              {auth.txStatus === TxStatus.FAILED &&
                                'Транзакция не удалась'}
                            </span>
                          </div>
                          {auth.txHash && (
                            <a
                              href={`https://bscscan.com/tx/${auth.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[var(--primary)] hover:underline font-mono"
                            >
                              {auth.txHash.slice(0, 10)}...
                              {auth.txHash.slice(-8)}
                            </a>
                          )}
                        </div>
                      )}

                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleAuthenticate}
                        isLoading={auth.isVerifying}
                        disabled={
                          parseFloat(wallet.balance.plex) < 1 ||
                          !wallet.isCorrectNetwork
                        }
                        className="w-full"
                      >
                        {auth.isVerifying
                          ? 'Обработка...'
                          : 'Отправить 1 PLEX и войти'}
                      </Button>

                      {parseFloat(wallet.balance.plex) < 1 && (
                        <p className="text-xs text-[var(--danger)] text-center">
                          Недостаточно PLEX токенов. Минимум: 1 PLEX
                        </p>
                      )}
                    </div>
                  )}

                  {/* Disconnect button */}
                  <div className="pt-4 border-t border-[var(--border-color)]">
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={handleDisconnect}
                      className="w-full text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[rgba(255,77,106,0.1)]"
                    >
                      Отключить кошелёк
                    </Button>
                  </div>
                </div>
              )}

              {/* Not connected */}
              {!wallet.isConnected && (
                <div className="space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Подключите кошелёк для доступа к личному кабинету и
                    мониторингу ваших транзакций.
                  </p>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={wallet.connect}
                    isLoading={wallet.isConnecting}
                    className="w-full"
                  >
                    Подключить MetaMask
                  </Button>

                  <p className="text-xs text-[var(--text-muted)] text-center">
                    Поддерживаются: MetaMask, Trust Wallet, Binance Wallet
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
