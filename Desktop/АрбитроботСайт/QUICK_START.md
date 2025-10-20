# 🚀 Инструкция по запуску ArbitroBot Website

## Быстрый старт

### 1. Установка зависимостей

```bash
cd "C:\Users\konfu\Desktop\АрбитроботСайт"

# Основные зависимости (если еще не установлены)
npm install

# Зависимости для mock backend
npm install --save-dev express ws cors
```

### 2. Запуск Mock Backend (в отдельном терминале)

```bash
# Terminal 1
node mock-server.js
```

Вы увидите:
```
╔════════════════════════════════════════════════════╗
║   🚀 ArbitroBot Mock Backend Server               ║
╠════════════════════════════════════════════════════╣
║   📡 HTTP API:  http://localhost:3001             ║
║   🔌 WebSocket: ws://localhost:3001               ║
╚════════════════════════════════════════════════════╝
```

### 3. Запуск Next.js приложения (в отдельном терминале)

```bash
# Terminal 2
npm run dev
```

### 4. Открыть в браузере

```
http://localhost:3000
```

---

## Что работает

### ✅ Главная страница
- Animated Background
- Custom Cursor
- Header с логотипом
- TransactionWindow с real-time обновлениями
- Адаптивный дизайн

### ✅ Web3 интеграция
- Подключение MetaMask/Trust Wallet
- Проверка сети BSC
- Авторизация через 1 PLEX
- Отображение балансов

### ✅ Real-time данные
- HTTP API для загрузки транзакций
- WebSocket для live обновлений
- Новая транзакция каждые 15 секунд
- Фильтрация по статусу/типу
- Статистика в реальном времени

### ✅ Mock Backend
- REST API endpoints
- WebSocket server
- Автогенерация транзакций
- Полная типизация

---

## Структура проекта

```
АрбитроботСайт/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx         # Главная страница
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Глобальные стили
│   │
│   ├── components/          # React компоненты
│   │   ├── effects/         # Визуальные эффекты
│   │   ├── features/        # Фичи (Auth, Dashboard, Monitor)
│   │   ├── layout/          # Layout компоненты
│   │   └── ui/              # UI компоненты
│   │
│   └── lib/                 # Библиотеки и утилиты
│       ├── api/             # API клиент и WebSocket
│       ├── hooks/           # Custom React hooks
│       ├── stores/          # Zustand stores
│       └── web3/            # Web3 интеграция
│
├── docs/                    # Документация
│   ├── ЖИВОЙ_ЖУРНАЛ_РАЗРАБОТКИ.md
│   ├── ЖИВОЙ_ЖУРНАЛ_ЗАДАЧ.md
│   └── ЖИВОЙ_ЖУРНАЛ_ПРОБЛЕМ.md
│
├── mock-server.js           # Mock backend
├── .env.local               # Локальная конфигурация
└── package.json
```

---

## Тестирование Mock Backend

### Проверить API вручную

```bash
# Health check
curl http://localhost:3001/api/health

# Получить транзакции
curl http://localhost:3001/api/transactions

# Получить статистику
curl http://localhost:3001/api/stats

# С фильтрами
curl "http://localhost:3001/api/transactions?status=success&page=1&pageSize=10"
```

### Проверить WebSocket

Откройте консоль браузера на http://localhost:3000 и наблюдайте:
- Подключение WebSocket
- Новые транзакции каждые 15 секунд
- Live badge должен показывать "Live"

---

## Troubleshooting

### Mock backend не запускается
```bash
# Убедитесь, что порт 3001 свободен
netstat -ano | findstr :3001

# Если занят, завершите процесс
taskkill /PID <PID> /F

# Или измените порт в mock-server.js и .env.local
```

### Next.js не подключается к API
1. Проверьте, что mock-server.js запущен
2. Проверьте .env.local:
   - `NEXT_PUBLIC_API_URL=http://localhost:3001`
   - `NEXT_PUBLIC_WS_URL=ws://localhost:3001`
3. Перезапустите `npm run dev`

### WebSocket не подключается
1. Откройте DevTools → Network → WS
2. Проверьте ошибки подключения
3. Убедитесь, что firewall не блокирует порт 3001

### Ошибки TypeScript
```bash
# Проверить типы
npm run type-check

# Если есть ошибки, исправьте их и перезапустите
npm run dev
```

---

## Следующие шаги

### Phase 5: Dashboard (в работе)
- [ ] Страница /dashboard
- [ ] User statistics
- [ ] Personal transaction history
- [ ] Charts

### Phase 6: Дополнительные страницы
- [ ] /about - О проекте
- [ ] /faq - Частые вопросы
- [ ] /docs - Документация

### Phase 7: Production
- [ ] Интеграция с реальным ботом
- [ ] Backend с PostgreSQL
- [ ] Деплой на Vercel
- [ ] Настройка домена

---

## Полезные команды

```bash
# Разработка
npm run dev            # Запуск dev сервера
npm run build          # Production build
npm run start          # Запуск production сервера
npm run lint           # ESLint проверка
npm run type-check     # TypeScript проверка

# Mock Backend
node mock-server.js    # Запуск mock API

# Очистка
rm -rf .next           # Очистка Next.js cache
npm ci                 # Чистая установка зависимостей
```

---

## Контакты и поддержка

**Разработчик:** Claude Sonnet 4.5  
**Дата:** 2025-10-16  
**Версия:** 1.0.0 (Phase 4 Complete)

**Документация:**
- ARCHITECTURE.md - Архитектура проекта
- ЖИВОЙ_ЖУРНАЛ_РАЗРАБОТКИ.md - История разработки
- ЖИВОЙ_ЖУРНАЛ_ЗАДАЧ.md - Задачи и планы

---

✅ **Готово к разработке!**
