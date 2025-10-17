/**
 * Mock Backend Server для локальной разработки
 * Эмулирует API арбитражного бота
 * 
 * Запуск: node mock-server.js
 */

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ============================================================================
// MOCK DATA
// ============================================================================

const TOKEN_NAMES = ['WBNB', 'USDT', 'BUSD', 'CAKE', 'ETH', 'BTC', 'ADA', 'DOT'];
const TYPES = ['V2-V2', 'V3-V3', 'V2-V3', 'V3-V2'];

function generateMockTransaction(id) {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  const token1 = TOKEN_NAMES[Math.floor(Math.random() * TOKEN_NAMES.length)];
  const token2 = TOKEN_NAMES[Math.floor(Math.random() * TOKEN_NAMES.length)];
  
  const profitUsd = Math.random() * 30 - 5; // -5 to +25 USD
  const isSuccess = profitUsd > 0;
  
  return {
    id: String(id),
    hash: `0x${Math.random().toString(16).substring(2).padEnd(64, '0')}`,
    timestamp: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60), // last hour
    blockNumber: 42000000 + Math.floor(Math.random() * 10000),
    type,
    route: [token1, token2, token1],
    routeAddresses: [
      `0x${Math.random().toString(16).substring(2).padEnd(40, '0')}`,
      `0x${Math.random().toString(16).substring(2).padEnd(40, '0')}`,
      `0x${Math.random().toString(16).substring(2).padEnd(40, '0')}`,
    ],
    profit: {
      usd: parseFloat(profitUsd.toFixed(2)),
      percent: parseFloat((profitUsd / 100).toFixed(4)),
      bnb: parseFloat((profitUsd / 600).toFixed(6)), // BNB @ $600
    },
    gas: {
      used: 180000 + Math.floor(Math.random() * 50000),
      price: `${(2 + Math.random() * 3).toFixed(1)} Gwei`,
      cost: parseFloat((0.004 + Math.random() * 0.004).toFixed(6)),
    },
    status: isSuccess ? 'success' : (Math.random() > 0.5 ? 'failed' : 'pending'),
  };
}

// Генерируем начальные транзакции
let transactions = [];
for (let i = 1; i <= 50; i++) {
  transactions.push(generateMockTransaction(i));
}

// Сортируем по timestamp (новые первыми)
transactions.sort((a, b) => b.timestamp - a.timestamp);

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /api/transactions
 * Получить список транзакций с фильтрацией и пагинацией
 */
app.get('/api/transactions', (req, res) => {
  const {
    status = 'all',
    type = 'all',
    minProfit,
    maxProfit,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
    sortBy = 'timestamp',
    sortOrder = 'desc',
  } = req.query;
  
  let filtered = [...transactions];
  
  // Filter by status
  if (status && status !== 'all') {
    filtered = filtered.filter(tx => tx.status === status);
  }
  
  // Filter by type
  if (type && type !== 'all') {
    filtered = filtered.filter(tx => tx.type === type);
  }
  
  // Filter by profit range
  if (minProfit !== undefined) {
    filtered = filtered.filter(tx => tx.profit.usd >= parseFloat(minProfit));
  }
  if (maxProfit !== undefined) {
    filtered = filtered.filter(tx => tx.profit.usd <= parseFloat(maxProfit));
  }
  
  // Filter by date range
  if (startDate) {
    filtered = filtered.filter(tx => tx.timestamp >= parseInt(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(tx => tx.timestamp <= parseInt(endDate));
  }
  
  // Sort
  filtered.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'profit') {
      aVal = a.profit.usd;
      bVal = b.profit.usd;
    }
    
    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1;
    } else {
      return aVal > bVal ? 1 : -1;
    }
  });
  
  // Paginate
  const pageNum = parseInt(page);
  const pageSizeNum = parseInt(pageSize);
  const start = (pageNum - 1) * pageSizeNum;
  const items = filtered.slice(start, start + pageSizeNum);
  
  res.json({
    success: true,
    data: {
      items,
      total: filtered.length,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore: start + items.length < filtered.length,
    },
    timestamp: Date.now(),
  });
});

/**
 * GET /api/transactions/:id
 * Получить одну транзакцию по ID
 */
app.get('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const tx = transactions.find(t => t.id === id);
  
  if (!tx) {
    return res.status(404).json({
      success: false,
      error: 'Transaction not found',
      timestamp: Date.now(),
    });
  }
  
  res.json({
    success: true,
    data: tx,
    timestamp: Date.now(),
  });
});

/**
 * GET /api/stats
 * Глобальная статистика
 */
app.get('/api/stats', (req, res) => {
  const successful = transactions.filter(tx => tx.status === 'success');
  const failed = transactions.filter(tx => tx.status === 'failed');
  const pending = transactions.filter(tx => tx.status === 'pending');
  
  const totalProfit = successful.reduce((sum, tx) => sum + tx.profit.usd, 0);
  const avgProfit = successful.length > 0 ? totalProfit / successful.length : 0;
  const avgGas = transactions.reduce((sum, tx) => sum + tx.gas.cost, 0) / transactions.length;
  const successRate = transactions.length > 0 
    ? (successful.length / transactions.length) * 100 
    : 0;
  
  // Last 24h
  const last24h = transactions.filter(tx => tx.timestamp > Date.now() - 24 * 60 * 60 * 1000);
  const profit24h = last24h
    .filter(tx => tx.status === 'success')
    .reduce((sum, tx) => sum + tx.profit.usd, 0);
  
  // Last 7d
  const last7d = transactions.filter(tx => tx.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000);
  const profit7d = last7d
    .filter(tx => tx.status === 'success')
    .reduce((sum, tx) => sum + tx.profit.usd, 0);
  
  // Last 30d
  const profit30d = totalProfit; // Все транзакции за последний час (mock)
  
  res.json({
    success: true,
    data: {
      totalTransactions: transactions.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      pendingTransactions: pending.length,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      last24h: {
        transactions: last24h.length,
        profit: parseFloat(profit24h.toFixed(2)),
      },
      last7d: {
        transactions: last7d.length,
        profit: parseFloat(profit7d.toFixed(2)),
      },
      last30d: {
        transactions: transactions.length,
        profit: parseFloat(profit30d.toFixed(2)),
      },
      avgProfit: parseFloat(avgProfit.toFixed(2)),
      avgGas: parseFloat(avgGas.toFixed(6)),
      successRate: parseFloat(successRate.toFixed(2)),
      lastUpdate: Date.now(),
    },
    timestamp: Date.now(),
  });
});

/**
 * GET /api/user/stats
 * Статистика пользователя
 */
app.get('/api/user/stats', (req, res) => {
  const { address } = req.query;
  
  if (!address) {
    return res.status(400).json({
      success: false,
      error: 'Address parameter required',
      timestamp: Date.now(),
    });
  }
  
  // Mock: генерируем случайную статистику для пользователя
  const userTxCount = Math.floor(Math.random() * 20) + 5;
  const successCount = Math.floor(userTxCount * 0.7);
  const failedCount = userTxCount - successCount;
  const totalProfit = (Math.random() * 100) + 20;
  const avgProfit = totalProfit / successCount;
  
  res.json({
    success: true,
    data: {
      userId: address,
      userAddress: address,
      totalTransactions: userTxCount,
      successfulTransactions: successCount,
      failedTransactions: failedCount,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      avgProfit: parseFloat(avgProfit.toFixed(2)),
      successRate: parseFloat(((successCount / userTxCount) * 100).toFixed(2)),
      firstTransaction: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      lastTransaction: Date.now() - Math.floor(Math.random() * 60 * 60 * 1000), // last hour
      activeDays: Math.floor(Math.random() * 30) + 1,
      rank: Math.floor(Math.random() * 100) + 1,
      percentile: parseFloat((Math.random() * 100).toFixed(2)),
    },
    timestamp: Date.now(),
  });
});

/**
 * GET /api/user/transactions
 * Транзакции пользователя
 */
app.get('/api/user/transactions', (req, res) => {
  const { address, page = 1, pageSize = 20 } = req.query;
  
  if (!address) {
    return res.status(400).json({
      success: false,
      error: 'Address parameter required',
      timestamp: Date.now(),
    });
  }
  
  // Mock: возвращаем случайные транзакции как пользовательские
  const userTransactions = transactions.slice(0, 15).map(tx => ({
    ...tx,
    userId: address,
    userAddress: address,
  }));
  
  const pageNum = parseInt(page);
  const pageSizeNum = parseInt(pageSize);
  const start = (pageNum - 1) * pageSizeNum;
  const items = userTransactions.slice(start, start + pageSizeNum);
  
  res.json({
    success: true,
    data: {
      items,
      total: userTransactions.length,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore: start + items.length < userTransactions.length,
    },
    timestamp: Date.now(),
  });
});

/**
 * GET /api/health
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
      version: '1.0.0',
    },
  });
});

// ============================================================================
// HTTP SERVER
// ============================================================================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   🚀 ArbitroBot Mock Backend Server               ║');
  console.log('╠════════════════════════════════════════════════════╣');
  console.log(`║   📡 HTTP API:  http://localhost:${PORT}           ║`);
  console.log(`║   🔌 WebSocket: ws://localhost:${PORT}             ║`);
  console.log('║                                                    ║');
  console.log('║   Endpoints:                                       ║');
  console.log('║   • GET /api/transactions                          ║');
  console.log('║   • GET /api/stats                                 ║');
  console.log('║   • GET /api/user/stats?address=0x...              ║');
  console.log('║   • GET /api/health                                ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');
});

// ============================================================================
// WEBSOCKET SERVER
// ============================================================================

const wss = new WebSocket.Server({ server });

let nextId = transactions.length + 1;

wss.on('connection', (ws) => {
  console.log('🔌 [WebSocket] Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'subscribe') {
        console.log(`📥 [WebSocket] Client subscribed to: ${data.data.channel}`);
        ws.send(JSON.stringify({
          type: 'subscribed',
          data: data.data,
          timestamp: Date.now(),
        }));
      }
      
      if (data.type === 'unsubscribe') {
        console.log(`📤 [WebSocket] Client unsubscribed from: ${data.data.channel}`);
      }
      
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      console.error('❌ [WebSocket] Error parsing message:', error);
    }
  });
  
  // Simulate new transaction every 15 seconds
  const transactionInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const newTx = generateMockTransaction(nextId++);
      transactions.unshift(newTx);
      
      // Keep only last 100 transactions in memory
      if (transactions.length > 100) {
        transactions = transactions.slice(0, 100);
      }
      
      ws.send(JSON.stringify({
        type: 'new_transaction',
        data: newTx,
        timestamp: Date.now(),
      }));
      
      console.log(`📤 [WebSocket] Sent new transaction: ${newTx.id} (${newTx.status}, $${newTx.profit.usd})`);
    }
  }, 15000); // Every 15 seconds
  
  // Simulate stats update every 30 seconds
  const statsInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const successful = transactions.filter(tx => tx.status === 'success');
      const totalProfit = successful.reduce((sum, tx) => sum + tx.profit.usd, 0);
      
      ws.send(JSON.stringify({
        type: 'stats_update',
        data: {
          totalTransactions: transactions.length,
          successfulTransactions: successful.length,
          totalProfit: parseFloat(totalProfit.toFixed(2)),
          lastUpdate: Date.now(),
        },
        timestamp: Date.now(),
      }));
      
      console.log('📊 [WebSocket] Sent stats update');
    }
  }, 30000); // Every 30 seconds
  
  ws.on('close', () => {
    console.log('🔌 [WebSocket] Client disconnected');
    clearInterval(transactionInterval);
    clearInterval(statsInterval);
  });
  
  ws.on('error', (error) => {
    console.error('❌ [WebSocket] Error:', error);
  });
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
