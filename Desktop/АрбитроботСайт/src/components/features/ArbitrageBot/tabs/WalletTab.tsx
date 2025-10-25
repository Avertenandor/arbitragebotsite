'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WalletBalances {
  bnb: number;
  usdt: number;
  busd: number;
  others: number;
}

interface Transaction {
  timestamp: string;
  type: string;
  amount: string;
  token: string;
  txHash: string;
}

export default function WalletTab() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balances, setBalances] = useState<WalletBalances>({
    bnb: 0,
    usdt: 0,
    busd: 0,
    others: 0,
  });
  const [transactions] = useState<Transaction[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Автообновление балансов каждые 15 секунд
  useEffect(() => {
    if (isConnected) {
      updateBalances();
      updateIntervalRef.current = setInterval(() => {
        updateBalances();
      }, 15000);
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isConnected]);

  // Функция обновления балансов (моковая)
  const updateBalances = () => {
    if (!isConnected) return;

    // В реальной версии здесь будет запрос к блокчейну
    setBalances({
      bnb: Math.random() * 5,
      usdt: Math.random() * 1000,
      busd: Math.random() * 500,
      others: 0,
    });
  };

  // Подключение кошелька
  const handleConnect = () => {
    const privateKey = prompt('Введите приватный ключ (64 символа):');

    if (!privateKey) return;

    if (privateKey.length !== 64) {
      alert('Ошибка: Приватный ключ должен содержать 64 символа');
      return;
    }

    // В реальной версии здесь будет валидация и получение адреса из приватного ключа
    // Для демонстрации используем моковый адрес
    const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

    setWalletAddress(mockAddress);
    setIsConnected(true);
    updateBalances();

    alert(`Кошелек подключен!\nАдрес: ${mockAddress}`);
  };

  // Отключение кошелька
  const handleDisconnect = () => {
    if (!confirm('Вы уверены, что хотите отключить кошелек?')) return;

    setIsConnected(false);
    setWalletAddress('');
    setBalances({
      bnb: 0,
      usdt: 0,
      busd: 0,
      others: 0,
    });

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  // Копирование адреса
  const handleCopyAddress = () => {
    if (!walletAddress) return;

    navigator.clipboard.writeText(walletAddress);
    alert('Адрес скопирован в буфер обмена!');
  };

  // Открытие в BSCScan
  const handleOpenBSCScan = () => {
    if (!walletAddress) return;

    window.open(`https://bscscan.com/address/${walletAddress}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* БЛОК 1: ЗАГОЛОВОК С ИНДИКАТОРОМ СТАТУСА */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 flex flex-wrap items-center gap-4"
      >
        <h2 className="text-xl font-bold text-gradient flex-shrink-0">
          💼 Кошелек
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
              isConnected
                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                : 'bg-[var(--danger)]/20 text-[var(--danger)]'
            }`}
          >
            <span className="text-lg">{isConnected ? '🟢' : '🔴'}</span>
            <span>{isConnected ? 'ПОДКЛЮЧЕН' : 'НЕ ПОДКЛЮЧЕН'}</span>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 2: ПОДКЛЮЧЕНИЕ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          Подключите кошелек через приватный ключ для начала работы
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleConnect}
            disabled={isConnected}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg ${
              isConnected
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[var(--success)] to-[var(--success)]/80 text-white hover:opacity-90 hover:shadow-glow-accent'
            }`}
          >
            🔗 Подключить кошелек
          </button>
          <button
            onClick={handleDisconnect}
            disabled={!isConnected}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg ${
              !isConnected
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[var(--danger)] to-[var(--danger)]/80 text-white hover:opacity-90 hover:shadow-glow-accent'
            }`}
          >
            ❌ Отключить
          </button>
        </div>
      </motion.div>

      {/* БЛОК 3: АДРЕС КОШЕЛЬКА */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider">
              Адрес кошелька
            </p>
            <p
              className="font-mono text-[var(--primary)] text-base break-all select-all"
              title={walletAddress || '—'}
            >
              {isConnected ? walletAddress : '—'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenBSCScan}
              disabled={!isConnected}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !isConnected
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed opacity-50'
                  : 'bg-[var(--info)]/20 text-[var(--info)] hover:bg-[var(--info)]/30'
              }`}
            >
              🔍 BSCScan
            </button>
            <button
              onClick={handleCopyAddress}
              disabled={!isConnected}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !isConnected
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed opacity-50'
                  : 'bg-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/30'
              }`}
            >
              📋 Копировать
            </button>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 4: БАЛАНСЫ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          💰 Балансы
        </h3>

        {/* Сетка балансов 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* BNB */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)] hover:border-[var(--border-color-hover)] transition-all">
            <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
              BNB:
            </p>
            <p className="text-3xl font-bold text-[var(--success)]">
              {balances.bnb.toFixed(4)}
            </p>
          </div>

          {/* USDT */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)] hover:border-[var(--border-color-hover)] transition-all">
            <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
              USDT:
            </p>
            <p className="text-3xl font-bold text-[var(--success)]">
              {balances.usdt.toFixed(4)}
            </p>
          </div>

          {/* BUSD */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)] hover:border-[var(--border-color-hover)] transition-all">
            <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
              BUSD:
            </p>
            <p className="text-3xl font-bold text-[var(--success)]">
              {balances.busd.toFixed(4)}
            </p>
          </div>

          {/* Другие */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)] hover:border-[var(--border-color-hover)] transition-all">
            <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
              Другие:
            </p>
            <p className="text-2xl font-bold text-[var(--text-tertiary)]">
              {balances.others} токенов
            </p>
          </div>
        </div>

        {/* Кнопка обновления */}
        <button
          onClick={updateBalances}
          disabled={!isConnected}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg ${
            !isConnected
              ? 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-[var(--info)] to-[var(--info)]/80 text-white hover:opacity-90 hover:shadow-glow-primary'
          }`}
        >
          🔄 Обновить балансы
        </button>

        {isConnected && (
          <p className="text-xs text-[var(--text-tertiary)] text-center mt-3">
            ⚡ Автоматическое обновление каждые 15 секунд
          </p>
        )}
      </motion.div>

      {/* БЛОК 5: ПОСЛЕДНИЕ ТРАНЗАКЦИИ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="bg-[var(--bg-tertiary)] px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-bold flex items-center gap-2">
            📝 Последние транзакции
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Время
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Токен
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  TX Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl opacity-30">📭</span>
                      <p className="text-[var(--text-tertiary)] text-sm">
                        Нет транзакций
                      </p>
                      <p className="text-[var(--text-muted)] text-xs">
                        Функционал истории транзакций в разработке
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                      {tx.timestamp}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                      {tx.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                      {tx.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                      {tx.token}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={`https://bscscan.com/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-mono text-xs"
                      >
                        {tx.txHash.substring(0, 8)}...
                        {tx.txHash.substring(tx.txHash.length - 6)}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
