# Mock Backend Server для локального тестирования

> Простой mock сервер для тестирования API и WebSocket интеграции

## 🚀 Быстрый старт

### 1. Установка

```bash
cd "C:\Users\konfu\Desktop\АрбитроботСайт"
npm install --save-dev express ws cors
```

### 2. Создать mock-server.js

```javascript
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock transactions
let transactions = [
  {
    id: '1',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    timestamp: Date.now() - 1000 * 60 * 5,
    blockNumber: 12345678,
    type: 'V2-V3',
    route: ['WBNB', 'USDT', 'WBNB'],
    routeAddresses: ['0x...', '0x...', '0x...'],
    profit: { usd: 12.45, percent: 0.87, bnb: 0.025 },
    gas: { used: 180234, price: '3 Gwei', cost: 0.0054 },
    status: 'success',
  },
  // ... add more mock data
];

// GET /api/transactions
app.get('/api/transactions', (req, res) => {
  const { status, type, page = 1, pageSize = 20 } = req.query;
  
  let filtered = transactions;
  
  if (status && status !== 'all') {
    filtered = filtered.filter(tx => tx.status === status);
  }
  
  if (type && type !== 'all') {
    filtered = filtered.filter(tx => tx.type === type);
  }
  
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + parseInt(pageSize));
  
  res.json({
    success: true,
    data: {
      items,
      total: filtered.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      hasMore: start + items.length < filtered.length,
    },
    timestamp: Date.now(),
  });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const successful = transactions.filter(tx => tx.status === 'success');
  const failed = transactions.filter(tx => tx.status === 'failed');
  const totalProfit = successful.reduce((sum, tx) => sum + tx.profit.usd, 0);
  
  res.json({
    success: true,
    data: {
      totalTransactions: transactions.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      totalProfit,
      last24h: { transactions: transactions.length, profit: totalProfit },
      last7d: { transactions: transactions.length, profit: totalProfit },
      last30d: { transactions: transactions.length, profit: totalProfit },
      avgProfit: totalProfit / successful.length,
      avgGas: 0.0055,
      successRate: (successful.length / transactions.length) * 100,
      lastUpdate: Date.now(),
    },
    timestamp: Date.now(),
  });
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: Date.now(),
    },
  });
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`✅ Mock API server running on http://localhost:${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📥 Received:', data.type);
      
      if (data.type === 'subscribe') {
        // Send confirmation
        ws.send(JSON.stringify({
          type: 'subscribed',
          data: data.data,
          timestamp: Date.now(),
        }));
      }
      
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  // Simulate new transaction every 10 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const newTx = {
        id: `${Date.now()}`,
        hash: `0x${Math.random().toString(16).substring(2)}`,
        timestamp: Date.now(),
        blockNumber: 12345678 + Math.floor(Math.random() * 1000),
        type: ['V2-V2', 'V3-V3', 'V2-V3', 'V3-V2'][Math.floor(Math.random() * 4)],
        route: ['WBNB', 'USDT', 'WBNB'],
        routeAddresses: ['0x...', '0x...', '0x...'],
        profit: {
          usd: Math.random() * 20 - 5,
          percent: Math.random() * 2 - 0.5,
          bnb: Math.random() * 0.05,
        },
        gas: {
          used: 180000 + Math.floor(Math.random() * 20000),
          price: '3 Gwei',
          cost: 0.005 + Math.random() * 0.002,
        },
        status: Math.random() > 0.1 ? 'success' : 'failed',
      };
      
      transactions.unshift(newTx);
      
      ws.send(JSON.stringify({
        type: 'new_transaction',
        data: newTx,
        timestamp: Date.now(),
      }));
      
      console.log('📤 Sent new transaction:', newTx.id);
    }
  }, 10000);
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    clearInterval(interval);
  });
});

console.log('🔌 WebSocket server running on ws://localhost:3001');
```

### 3. Запуск

```bash
# Terminal 1: Mock backend
node mock-server.js

# Terminal 2: Next.js dev server
npm run dev
```

### 4. Проверка

```bash
# Health check
curl http://localhost:3001/api/health

# Get transactions
curl http://localhost:3001/api/transactions

# Get stats
curl http://localhost:3001/api/stats
```

### 5. .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## 📝 Примечания

- Mock сервер создает новую транзакцию каждые 10 секунд
- WebSocket автоматически рассылает обновления всем подключенным клиентам
- Данные хранятся в памяти (теряются при перезапуске)

## 🔄 Интеграция с реальным ботом

Для интеграции с реальным ботом (`Бот переставка/`):

1. Бот должен отправлять POST запросы на API endpoint
2. Или использовать WebSocket для отправки транзакций
3. Формат данных должен соответствовать типам в `lib/api/types.ts`

## 🚀 Production Backend

Для production нужен настоящий backend:
- Node.js + Express (или Fastify)
- PostgreSQL для хранения транзакций
- Redis для кэширования и pub/sub
- JWT authentication
- Rate limiting
- CORS настройка
- HTTPS

Структура:
```
backend/
├── src/
│   ├── routes/
│   │   ├── transactions.ts
│   │   ├── stats.ts
│   │   └── auth.ts
│   ├── services/
│   │   ├── transactionService.ts
│   │   └── botIntegration.ts
│   ├── websocket/
│   │   └── server.ts
│   └── server.ts
├── package.json
└── tsconfig.json
```
