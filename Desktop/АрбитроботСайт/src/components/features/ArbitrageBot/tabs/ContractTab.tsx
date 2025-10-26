'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { fmtNumber, formatters } from '@/utils/format';

interface ContractStatus {
  address: string;
  isPaused: boolean;
  gasCap: number;
  balanceBNB: number;
  owner: string;
}

interface ContractEvent {
  timestamp: string;
  eventType: string;
  details: string;
  txHash: string;
}

// Генерация случайного хэша транзакции
const generateTxHash = () => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

export default function ContractTab() {
  const [contractStatus, setContractStatus] = useState<ContractStatus>({
    address: '0xBa1C7d35Cc6634C0532925a3b844Bc9e7595873B',
    isPaused: false,
    gasCap: 10,
    balanceBNB: 5.4321,
    owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  });

  const [events] = useState<ContractEvent[]>([
    {
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString('ru-RU'),
      eventType: 'Trade Executed',
      details: 'Arbitrage trade completed successfully',
      txHash: generateTxHash(),
    },
    {
      timestamp: new Date(Date.now() - 600000).toLocaleTimeString('ru-RU'),
      eventType: 'Gas Cap Updated',
      details: 'Gas cap changed from 8 to 10 Gwei',
      txHash: generateTxHash(),
    },
    {
      timestamp: new Date(Date.now() - 900000).toLocaleTimeString('ru-RU'),
      eventType: 'Deposit',
      details: 'Received 2.5 BNB',
      txHash: generateTxHash(),
    },
    {
      timestamp: new Date(Date.now() - 1200000).toLocaleTimeString('ru-RU'),
      eventType: 'Trade Executed',
      details: 'Arbitrage trade completed successfully',
      txHash: generateTxHash(),
    },
    {
      timestamp: new Date(Date.now() - 1500000).toLocaleTimeString('ru-RU'),
      eventType: 'Contract Unpaused',
      details: 'Contract resumed operations',
      txHash: generateTxHash(),
    },
  ]);

  // Пауза контракта
  const handlePause = () => {
    if (!confirm('Вы уверены, что хотите приостановить работу контракта?')) return;

    setContractStatus(prev => ({ ...prev, isPaused: true }));
    alert('Контракт приостановлен!');
  };

  // Возобновление контракта
  const handleUnpause = () => {
    if (!confirm('Вы уверены, что хотите возобновить работу контракта?')) return;

    setContractStatus(prev => ({ ...prev, isPaused: false }));
    alert('Контракт возобновлен!');
  };

  // Установка Gas Cap
  const handleSetGasCap = () => {
    const newGasCap = prompt('Введите новый Gas Cap (Gwei):', contractStatus.gasCap.toString());

    if (!newGasCap) return;

    const gasCap = parseInt(newGasCap);
    if (isNaN(gasCap) || gasCap < 1) {
      alert('Ошибка: введите корректное значение');
      return;
    }

    setContractStatus(prev => ({ ...prev, gasCap }));
    alert(`Gas Cap обновлен до ${gasCap} Gwei!`);
  };

  // Вывод средств
  const handleWithdraw = () => {
    const amount = prompt('Введите сумму для вывода (BNB):', contractStatus.balanceBNB.toString());

    if (!amount) return;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > contractStatus.balanceBNB) {
      alert('Ошибка: введите корректную сумму');
      return;
    }

    setContractStatus(prev => ({
      ...prev,
      balanceBNB: prev.balanceBNB - withdrawAmount
    }));
    alert(`Выведено ${withdrawAmount} BNB!`);
  };

  // Копирование адреса контракта
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(contractStatus.address);
    alert('Адрес контракта скопирован в буфер обмена!');
  };

  // Копирование адреса владельца
  const handleCopyOwner = () => {
    navigator.clipboard.writeText(contractStatus.owner);
    alert('Адрес владельца скопирован в буфер обмена!');
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
          📜 Contract Management
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
              contractStatus.isPaused
                ? 'bg-[var(--danger)]/20 text-[var(--danger)]'
                : 'bg-[var(--success)]/20 text-[var(--success)]'
            }`}
          >
            <span className="text-lg">{contractStatus.isPaused ? '⏸️' : '▶️'}</span>
            <span>{contractStatus.isPaused ? 'PAUSED' : 'ACTIVE'}</span>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 2: АДРЕС КОНТРАКТА */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          🔗 Contract Address
        </h3>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[var(--primary)] text-base break-all select-all bg-[var(--bg-tertiary)] px-4 py-3 rounded-lg border border-[var(--border-color)]">
              {contractStatus.address}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)]/30 transition-colors"
            >
              📋 Копировать
            </button>
            <button
              onClick={() => window.open(`https://bscscan.com/address/${contractStatus.address}`, '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--info)]/20 text-[var(--info)] text-sm font-medium hover:bg-[var(--info)]/30 transition-colors"
            >
              🔍 BSCScan
            </button>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 3: СТАТУС КОНТРАКТА */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          📊 Contract Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            label="Paused"
            value={contractStatus.isPaused ? 'Yes' : 'No'}
            color={contractStatus.isPaused ? 'danger' : 'success'}
          />
          <InfoCard
            label="Gas Cap"
            value={`${contractStatus.gasCap} Gwei`}
            color="info"
          />
          <InfoCard
            label="Balance"
            value={`${contractStatus.fmtNumber(balanceBNB, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} BNB`}
            color="warning"
          />
          <InfoCard
            label="Network"
            value="BSC Mainnet"
            color="primary"
          />
        </div>
      </motion.div>

      {/* БЛОК 4: ВЛАДЕЛЕЦ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          👤 Owner
        </h3>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[var(--text-primary)] text-base break-all select-all bg-[var(--bg-tertiary)] px-4 py-3 rounded-lg border border-[var(--border-color)]">
              {contractStatus.owner}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyOwner}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)]/30 transition-colors"
            >
              📋 Копировать
            </button>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 5: КНОПКИ УПРАВЛЕНИЯ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          🎮 Control Panel
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handlePause}
            disabled={contractStatus.isPaused}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
              contractStatus.isPaused
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[var(--warning)] to-[var(--warning)]/80 text-white hover:opacity-90 hover:shadow-glow-accent'
            }`}
          >
            ⏸️ Pause
          </button>

          <button
            onClick={handleUnpause}
            disabled={!contractStatus.isPaused}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
              !contractStatus.isPaused
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[var(--success)] to-[var(--success)]/80 text-white hover:opacity-90 hover:shadow-glow-accent'
            }`}
          >
            ▶️ Unpause
          </button>

          <button
            onClick={handleSetGasCap}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[var(--info)] to-[var(--info)]/80 text-white font-bold text-base transition-all hover:opacity-90 shadow-lg hover:shadow-glow-primary"
          >
            ⚙️ Set Gas Cap
          </button>

          <button
            onClick={handleWithdraw}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white font-bold text-base transition-all hover:opacity-90 shadow-lg hover:shadow-glow-primary"
          >
            💰 Withdraw
          </button>
        </div>
      </motion.div>

      {/* БЛОК 6: ТАБЛИЦА СОБЫТИЙ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="bg-[var(--bg-tertiary)] px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-bold flex items-center gap-2">
            📜 Recent Events
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  TX Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)] font-mono">
                    {event.timestamp}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--info)]/20 text-[var(--info)]">
                      {event.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {event.details}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={`https://bscscan.com/tx/${event.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-mono text-xs"
                      title={event.txHash}
                    >
                      {event.txHash.substring(0, 8)}...
                      {event.txHash.substring(event.txHash.length - 6)}
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

// Компонент информационной карточки
interface InfoCardProps {
  label: string;
  value: string;
  color: 'primary' | 'success' | 'danger' | 'warning' | 'info';
}

function InfoCard({ label, value, color }: InfoCardProps) {
  const colorClasses = {
    primary: 'text-[var(--primary)]',
    success: 'text-[var(--success)]',
    danger: 'text-[var(--danger)]',
    warning: 'text-[var(--warning)]',
    info: 'text-[var(--info)]',
  };

  return (
    <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)] hover:border-[var(--border-color-hover)] transition-all">
      <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-xl font-bold ${colorClasses[color]}`}>
        {value}
      </p>
    </div>
  );
}
