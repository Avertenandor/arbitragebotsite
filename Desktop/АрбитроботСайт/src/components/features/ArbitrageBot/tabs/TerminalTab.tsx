'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatters } from '@/utils/format';
import { useIsClient } from '@/hooks/useIsClient';

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: string;
}

export default function TerminalTab() {
  const isClient = useIsClient();

  // Используем пустой массив для SSR, заполняем на клиенте
  const [lines, setLines] = useState<TerminalLine[]>([]);

  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Инициализация начальных строк на клиенте
  useEffect(() => {
    if (isClient && lines.length === 0) {
      const now = formatters.time(new Date());
      setLines([
        {
          type: 'output',
          content: 'Python 3.11.5 Terminal - ArbitroBot',
          timestamp: now,
        },
        {
          type: 'output',
          content: 'Type "help" for available commands',
          timestamp: now,
        },
        {
          type: 'output',
          content: '─'.repeat(60),
          timestamp: now,
        },
      ]);
    }
  }, [isClient, lines.length]);

  // Автоскролл к последней строке
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  // Доступные команды
  const executeCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    const now = formatters.time(new Date());

    // Добавляем команду в вывод
    const newLines: TerminalLine[] = [
      {
        type: 'command',
        content: `$ ${cmd}`,
        timestamp: now,
      },
    ];

    // Обработка команд
    switch (command) {
      case 'help':
        newLines.push(
          {
            type: 'output',
            content: 'Available commands:',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  help          - Show this help message',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  status        - Show bot status',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  stats         - Display statistics',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  wallet        - Check wallet balance',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  node          - Check RPC node status',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  clear         - Clear terminal output',
            timestamp: now,
          }
        );
        break;

      case 'status':
        newLines.push(
          {
            type: 'output',
            content: 'Bot Status: ACTIVE',
            timestamp: now,
          },
          {
            type: 'output',
            content: 'Uptime: 5 days, 12 hours, 34 minutes',
            timestamp: now,
          },
          {
            type: 'output',
            content: 'Last trade: 5 minutes ago',
            timestamp: now,
          }
        );
        break;

      case 'stats':
        newLines.push(
          {
            type: 'output',
            content: 'Trading Statistics:',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  Total Trades: 7,821',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  Success Rate: 91.5%',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  Total Profit: $45,678.92',
            timestamp: now,
          }
        );
        break;

      case 'wallet':
        newLines.push(
          {
            type: 'output',
            content: 'Wallet Balance:',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  BNB:  5.4321',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  USDT: 1,234.56',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  BUSD: 987.65',
            timestamp: now,
          }
        );
        break;

      case 'node':
        newLines.push(
          {
            type: 'output',
            content: 'RPC Node Status:',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  Status: Connected',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  Latency: 85ms',
            timestamp: now,
          },
          {
            type: 'output',
            content: '  RPS: 12.5',
            timestamp: now,
          }
        );
        break;

      case 'clear':
        setLines([
          {
            type: 'output',
            content: 'Terminal cleared',
            timestamp: now,
          },
        ]);
        return;

      case '':
        // Пустая команда - ничего не делаем
        break;

      default:
        newLines.push(
          {
            type: 'error',
            content: `Command not found: ${command}`,
            timestamp: now,
          },
          {
            type: 'output',
            content: 'Type "help" for available commands',
            timestamp: now,
          }
        );
    }

    setLines((prev) => [...prev, ...newLines]);
  };

  // Обработка Enter
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim() === '') return;

    // Добавляем команду в историю
    setCommandHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);

    // Выполняем команду
    executeCommand(input);

    // Очищаем input
    setInput('');
  };

  // Обработка Up/Down для истории команд
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;

      const newIndex = historyIndex === -1
        ? commandHistory.length - 1
        : Math.max(0, historyIndex - 1);

      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const newIndex = historyIndex + 1;

      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    }
  };

  // Очистка вывода
  const handleClearOutput = () => {
    const now = formatters.time(new Date());
    setLines([
      {
        type: 'output',
        content: 'Terminal cleared',
        timestamp: now,
      },
    ]);
  };

  // Копирование вывода
  const handleCopyOutput = () => {
    if (typeof window === 'undefined') return;
    const text = lines.map((line) => line.content).join('\n');
    navigator.clipboard.writeText(text);
    alert('Вывод скопирован в буфер обмена!');
  };

  // Сохранение сессии
  const handleSaveSession = () => {
    if (typeof window === 'undefined') return;
    const text = lines.map((line) => `[${line.timestamp}] ${line.content}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-session-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Сессия сохранена!');
  };

  return (
    <div className="space-y-4">
      {/* БЛОК 1: ЗАГОЛОВОК */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4"
      >
        <h2 className="text-xl font-bold text-gradient">
          💻 Python Terminal
        </h2>
      </motion.div>

      {/* БЛОК 2: КНОПКИ УПРАВЛЕНИЯ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleClearOutput}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--warning)] to-[var(--warning)]/80 text-white font-bold text-base transition-all hover:opacity-90 shadow-lg hover:shadow-glow-accent"
          >
            🗑️ Clear Output
          </button>

          <button
            onClick={handleCopyOutput}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--info)] to-[var(--info)]/80 text-white font-bold text-base transition-all hover:opacity-90 shadow-lg hover:shadow-glow-primary"
          >
            📋 Copy Output
          </button>

          <button
            onClick={handleSaveSession}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--success)] to-[var(--success)]/80 text-white font-bold text-base transition-all hover:opacity-90 shadow-lg hover:shadow-glow-accent"
          >
            💾 Save Session
          </button>
        </div>
      </motion.div>

      {/* БЛОК 3: ПАНЕЛЬ ВЫВОДА */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="bg-[var(--bg-tertiary)] px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-bold flex items-center gap-2">
            📺 Output
          </h3>
        </div>

        <div
          ref={outputRef}
          className="h-96 overflow-y-auto bg-black p-6 font-mono text-sm"
        >
          {lines.map((line, index) => (
            <div
              key={index}
              className={`mb-1 ${
                line.type === 'command'
                  ? 'text-[var(--success)]'
                  : line.type === 'error'
                  ? 'text-[var(--danger)]'
                  : 'text-gray-300'
              }`}
            >
              {line.content}
            </div>
          ))}
          <div className="animate-pulse inline-block">_</div>
        </div>
      </motion.div>

      {/* БЛОК 4: ПАНЕЛЬ ВВОДА */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="bg-[var(--bg-tertiary)] px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-bold flex items-center gap-2">
            ⌨️ Input
          </h3>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <span className="text-[var(--success)] font-mono font-bold">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите команду... (↑↓ для истории, Enter для выполнения)"
              className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--primary)] transition-colors"
              autoFocus
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white font-bold text-base transition-all hover:opacity-90 shadow-lg hover:shadow-glow-primary"
            >
              ▶️ Execute
            </button>
          </form>

          <div className="mt-4 text-xs text-[var(--text-muted)]">
            <p>💡 Подсказки:</p>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• Используйте ↑/↓ для навигации по истории команд</li>
              <li>• Введите "help" для списка доступных команд</li>
              <li>• Нажмите Enter для выполнения команды</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* БЛОК 5: ИНФОРМАЦИЯ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">
              О терминале
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Это интерактивный Python-терминал для управления ArbitroBot.
              Вы можете выполнять команды для проверки статуса бота, просмотра статистики,
              управления кошельком и мониторинга RPC node. Все команды выполняются в безопасной
              изолированной среде.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
