'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fmtNumber, formatters } from '@/utils/format';

interface BlacklistToken {
  address: string;
  symbol: string;
  reason: 'honeypot' | 'proxy' | 'fee_on_transfer' | 'rug_pull' | 'other';
  evidence: string;
  addedAt: number;
  source: 'scanner' | 'manual' | 'community';
}

// Моковые данные скам-токенов
const BLACKLIST_DATA: BlacklistToken[] = [
  {
    address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    symbol: 'SCAM1',
    reason: 'honeypot',
    evidence: 'Cannot sell, buy tax 99%, honeypot detected',
    addedAt: Date.now() - 86400000 * 2,
    source: 'scanner',
  },
  {
    address: '0xABCD1234567890ABCD1234567890ABCD12345678',
    symbol: 'FAKE',
    reason: 'honeypot',
    evidence: 'Sell function blocked, cannot transfer',
    addedAt: Date.now() - 86400000 * 5,
    source: 'scanner',
  },
  {
    address: '0x9876543210ABCDEF9876543210ABCDEF98765432',
    symbol: 'RUG',
    reason: 'rug_pull',
    evidence: 'Liquidity removed, developer wallet drained',
    addedAt: Date.now() - 86400000 * 10,
    source: 'community',
  },
  {
    address: '0xDEADBEEF1234567890DEADBEEF1234567890DEAD',
    symbol: 'PROXY',
    reason: 'proxy',
    evidence: 'Proxy contract detected, implementation can be changed',
    addedAt: Date.now() - 86400000 * 3,
    source: 'scanner',
  },
  {
    address: '0xFEE123456789ABCDEFFEE123456789ABCDEFFEE1',
    symbol: 'HIGHTAX',
    reason: 'fee_on_transfer',
    evidence: 'Sell tax 50%, buy tax 30%, hidden taxes',
    addedAt: Date.now() - 86400000 * 7,
    source: 'scanner',
  },
  {
    address: '0x1111222233334444555566667777888899990000',
    symbol: 'FAKE2',
    reason: 'honeypot',
    evidence: 'Blacklisted addresses, cannot sell',
    addedAt: Date.now() - 86400000 * 15,
    source: 'manual',
  },
  {
    address: '0xBADBEEF9876543210BADBEE F9876543210BADBEE',
    symbol: 'SCAM2',
    reason: 'other',
    evidence: 'No liquidity, suspicious contract code',
    addedAt: Date.now() - 86400000 * 20,
    source: 'community',
  },
  {
    address: '0x5555AAAA6666BBBB7777CCCC8888DDDD9999EEEE',
    symbol: 'PONZI',
    reason: 'rug_pull',
    evidence: 'Ponzi scheme detected, owner can drain funds',
    addedAt: Date.now() - 86400000 * 12,
    source: 'scanner',
  },
];

const REASON_LABELS = {
  honeypot: 'Honeypot',
  proxy: 'Proxy Contract',
  fee_on_transfer: 'Fee on Transfer',
  rug_pull: 'Rug Pull',
  other: 'Other',
};

const REASON_COLORS = {
  honeypot: 'danger',
  proxy: 'warning',
  fee_on_transfer: 'warning',
  rug_pull: 'danger',
  other: 'danger',
};

export default function BlacklistTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState<'all' | BlacklistToken['reason']>('all');

  // Фильтрация данных
  const filteredData = useMemo(() => {
    return BLACKLIST_DATA.filter((token) => {
      const matchesSearch =
        searchQuery === '' ||
        token.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesReason = reasonFilter === 'all' || token.reason === reasonFilter;

      return matchesSearch && matchesReason;
    });
  }, [searchQuery, reasonFilter]);

  // Статистика
  const stats = useMemo(() => {
    const total = BLACKLIST_DATA.length;
    const honeypot = BLACKLIST_DATA.filter((t) => t.reason === 'honeypot').length;
    const proxy = BLACKLIST_DATA.filter((t) => t.reason === 'proxy').length;
    const feeOnTransfer = BLACKLIST_DATA.filter((t) => t.reason === 'fee_on_transfer').length;
    const other = total - honeypot - proxy - feeOnTransfer;
    return { total, honeypot, proxy, feeOnTransfer, other };
  }, []);

  // Копирование в буфер обмена
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Скопировано: ${text.substring(0, 10)}...`);
  };

  // Форматирование даты
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* ЗАГОЛОВОК */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 flex flex-wrap items-center gap-4"
      >
        <h2 className="text-xl font-bold text-gradient flex-shrink-0">
          ❌ Blacklist - Скам токены
        </h2>
        <div className="flex items-center gap-3 ml-auto text-sm">
          <div className="px-3 py-1.5 rounded-lg bg-[var(--danger)]/20 text-[var(--danger)] font-semibold">
            Всего: {stats.total}
          </div>
        </div>
      </motion.div>

      {/* СТАТИСТИКА */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass rounded-xl p-4 hover:border-[var(--border-color-hover)] transition-all">
          <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
            Honeypot
          </p>
          <p className="text-2xl font-bold text-[var(--danger)]">{stats.honeypot}</p>
        </div>
        <div className="glass rounded-xl p-4 hover:border-[var(--border-color-hover)] transition-all">
          <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
            Proxy Contract
          </p>
          <p className="text-2xl font-bold text-[var(--warning)]">{stats.proxy}</p>
        </div>
        <div className="glass rounded-xl p-4 hover:border-[var(--border-color-hover)] transition-all">
          <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
            Fee on Transfer
          </p>
          <p className="text-2xl font-bold text-[var(--warning)]">{stats.feeOnTransfer}</p>
        </div>
        <div className="glass rounded-xl p-4 hover:border-[var(--border-color-hover)] transition-all">
          <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
            Other
          </p>
          <p className="text-2xl font-bold text-[var(--danger)]">{stats.other}</p>
        </div>
      </motion.div>

      {/* ПАНЕЛЬ ФИЛЬТРОВ И УПРАВЛЕНИЯ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Поиск по адресу или символу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value as any)}
            className="px-4 py-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          >
            <option value="all">Все причины</option>
            <option value="honeypot">Honeypot</option>
            <option value="proxy">Proxy Contract</option>
            <option value="fee_on_transfer">Fee on Transfer</option>
            <option value="rug_pull">Rug Pull</option>
            <option value="other">Other</option>
          </select>
          <button className="px-4 py-2.5 rounded-lg bg-[var(--danger)]/20 text-[var(--danger)] font-medium hover:bg-[var(--danger)]/30 transition-colors">
            ➕ Добавить
          </button>
          <button className="px-4 py-2.5 rounded-lg bg-[var(--info)]/20 text-[var(--info)] font-medium hover:bg-[var(--info)]/30 transition-colors">
            🔄 Обновить
          </button>
        </div>
      </motion.div>

      {/* ТАБЛИЦА */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Адрес
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Символ
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Причина
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Доказательства
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Добавлен
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
                  Источник
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl opacity-30">🔍</span>
                      <p className="text-[var(--text-tertiary)] text-sm">
                        Токены не найдены
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((token, index) => (
                  <motion.tr
                    key={token.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors bg-[var(--danger)]/5"
                  >
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleCopy(token.address)}
                        className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-mono text-xs"
                        title={token.address}
                      >
                        {token.address.substring(0, 6)}...
                        {token.address.substring(token.address.length - 4)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[var(--danger)]">
                      {token.symbol}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          REASON_COLORS[token.reason] === 'danger'
                            ? 'bg-[var(--danger)]/20 text-[var(--danger)]'
                            : 'bg-[var(--warning)]/20 text-[var(--warning)]'
                        }`}
                      >
                        {REASON_LABELS[token.reason]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {token.evidence}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-tertiary)]">
                      {formatDate(token.addedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs">
                        {token.source}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="bg-[var(--bg-tertiary)] px-4 py-3 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            ⚠️ Все токены в blacklist автоматически блокируются ботом | Клик на адрес → копирование
          </p>
        </div>
      </motion.div>
    </div>
  );
}
