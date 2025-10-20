# ARCHITECTURE.md

> **Проект:** ArbitroBot Monitoring Website  
> **Версия:** 1.0.0  
> **Дата:** 2025-10-16

---

## Обзор

**ArbitroBot Website** — современный веб-интерфейс для мониторинга DEX арбитражного бота в реальном времени. Пользователи авторизуются через Web3 кошелек, получают доступ к личному кабинету и отслеживают транзакции бота.

### Ключевые особенности
- 🌙 Темная тема (dark by default)
- 🔐 Web3 авторизация (1 PLEX = вход)
- 📊 Real-time мониторинг транзакций
- 📱 Полная адаптивность (mobile-first)
- ⚡ Современные анимации (Framer Motion)
- 🎨 Киберпанк эстетика

---

## Технологический стек

### Frontend
- **React 18** — UI библиотека
- **Next.js 14** — фреймворк (App Router, SSR/SSG)
- **TypeScript** — типизация
- **Tailwind CSS** — utility-first стили
- **Framer Motion** — анимации

### Blockchain
- **ethers.js v6** — Web3 интеграция
- **BSC Mainnet** — сеть (chainId: 56)
- **RainbowKit** — wallet connection UI

### State Management
- **Zustand** — глобальное состояние (легче Redux)
- **React Query** — server state, кэширование

### Styling
- **Tailwind CSS** — базовые стили
- **CSS Variables** — темизация
- **Glassmorphism** — карточки с blur
- **Gradient backgrounds** — акценты

---

## Архитектурные слои

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│  (UI Components, Pages, Animations)     │
├─────────────────────────────────────────┤
│          Business Logic Layer           │
│   (Hooks, Context, State Management)    │
├─────────────────────────────────────────┤
│          Data Access Layer              │
│   (API Clients, Web3 Providers)         │
├─────────────────────────────────────────┤
│          External Services              │
│   (BSC RPC, Backend API, WebSocket)     │
└─────────────────────────────────────────┘
```

### 1. Presentation Layer
**Ответственность:** Отображение UI, пользовательский ввод, анимации

**Компоненты:**
- `app/` — Next.js pages (App Router)
- `components/ui/` — переиспользуемые UI элементы
- `components/layout/` — Header, Footer, Navigation
- `components/features/` — feature-specific компоненты

**Правила:**
- ❌ НЕ содержит бизнес-логику
- ❌ НЕ работает напрямую с API
- ✅ Использует hooks из Business Layer
- ✅ Чистый UI + анимации

### 2. Business Logic Layer
**Ответственность:** Бизнес-правила, валидация, оркестрация

**Структура:**
- `lib/hooks/` — custom React hooks
- `lib/stores/` — Zustand stores
- `lib/context/` — React Context провайдеры
- `lib/utils/` — helper функции

**Примеры:**
- `useWallet()` — управление подключением кошелька
- `useTransactions()` — загрузка/фильтрация транзакций
- `useAuth()` — проверка авторизации (1 PLEX)

**Правила:**
- ✅ Инкапсулирует бизнес-логику
- ✅ Переиспользуемые hooks
- ❌ НЕ знает о деталях UI

### 3. Data Access Layer
**Ответственность:** Взаимодействие с внешними системами

**Структура:**
- `lib/api/` — HTTP API клиенты (fetch wrappers)
- `lib/web3/` — Web3 провайдеры, контракты
- `lib/services/` — сервисы (auth, transactions)

**Примеры:**
- `web3Provider.ts` — ethers.js provider setup
- `plexContract.ts` — PLEX token контракт
- `txMonitor.ts` — WebSocket для транзакций

**Правила:**
- ✅ Абстрагирует внешние API
- ✅ Обработка ошибок
- ✅ Retry логика

### 4. External Services
**Ответственность:** Внешние зависимости

- BSC RPC (QuickNode/Ankr)
- Backend API (будущее)
- IPFS (для метаданных)
- Analytics (GA4)

---

## Структура проекта

```
АрбитроботСайт/
├── public/
│   ├── logo.svg              # Логотип ArbitroBot
│   ├── favicon.ico
│   └── images/
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx         # Главная (/)
│   │   ├── dashboard/       # Личный кабинет (/dashboard)
│   │   │   └── page.tsx
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   │
│   ├── components/
│   │   ├── ui/              # Базовые UI (shadcn/ui inspired)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/          # Layout компоненты
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   │
│   │   └── features/        # Feature компоненты
│   │       ├── TransactionMonitor/
│   │       │   ├── TransactionWindow.tsx
│   │       │   ├── TransactionCard.tsx
│   │       │   └── TransactionFilters.tsx
│   │       │
│   │       └── Auth/
│   │           ├── ConnectWallet.tsx
│   │           ├── VerifyPLEX.tsx
│   │           └── AuthGuard.tsx
│   │
│   ├── lib/
│   │   ├── hooks/           # Custom hooks
│   │   │   ├── useWallet.ts
│   │   │   ├── useTransactions.ts
│   │   │   └── useAuth.ts
│   │   │
│   │   ├── stores/          # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   └── txStore.ts
│   │   │
│   │   ├── web3/            # Web3 интеграция
│   │   │   ├── provider.ts
│   │   │   ├── contracts/
│   │   │   │   └── plex.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── api/             # API клиенты
│   │   │   └── client.ts
│   │   │
│   │   └── utils/           # Helpers
│   │       ├── format.ts
│   │       └── constants.ts
│   │
│   └── styles/
│       └── theme.css        # CSS variables
│
├── docs/                     # Документация
│   ├── ЖИВОЙ_ЖУРНАЛ_РАЗРАБОТКИ.md
│   ├── ЖИВОЙ_ЖУРНАЛ_ПРОБЛЕМ.md
│   └── ЖИВОЙ_ЖУРНАЛ_ЗАДАЧ.md
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

---

## Ключевые паттерны

### 1. Dependency Injection через Props
```typescript
// ❌ ПЛОХО
const TransactionCard = () => {
  const web3 = useWeb3(); // tight coupling
  ...
}

// ✅ ХОРОШО
const TransactionCard = ({ tx }: { tx: Transaction }) => {
  ...
}
```

### 2. Custom Hooks для логики
```typescript
// Вся логика в hook
export function useTransactions() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // fetch, filter, sort...
  
  return { txs, loading, refetch };
}

// Компонент только рендерит
const TransactionList = () => {
  const { txs, loading } = useTransactions();
  
  if (loading) return <Skeleton />;
  return <div>{txs.map(...)}</div>;
}
```

### 3. Server/Client Components разделение
```typescript
// app/dashboard/page.tsx (Server Component)
export default async function Dashboard() {
  const stats = await getStats(); // server fetch
  
  return (
    <div>
      <StaticStats data={stats} />
      <LiveTransactions /> {/* Client Component */}
    </div>
  );
}
```

### 4. Error Boundaries
```typescript
// app/error.tsx
export default function Error({ error, reset }) {
  return (
    <ErrorCard 
      message={error.message}
      onRetry={reset}
    />
  );
}
```

---

## Dизайн-система

### Цветовая палитра

```css
:root {
  /* Backgrounds */
  --bg-primary: #0A0A0F;      /* Глубокий черный */
  --bg-secondary: #13131A;    /* Карточки */
  --bg-tertiary: #1C1C24;     /* Hover states */
  
  /* Accent Colors */
  --primary: #00D9FF;         /* Cyan blue */
  --primary-hover: #00B8E6;
  --secondary: #9D4EDD;       /* Purple */
  --accent: #00FFA3;          /* Success green */
  --danger: #FF4D6A;          /* Error red */
  
  /* Text */
  --text-primary: #E6E6E8;    /* Почти белый */
  --text-secondary: #A3A3A8;  /* Средний серый */
  --text-muted: #6B6B70;      /* Темный серый */
  
  /* Borders */
  --border-color: rgba(255, 255, 255, 0.1);
  --border-color-hover: rgba(0, 217, 255, 0.3);
}
```

### Типографика

```css
/* Headings */
--font-heading: 'Inter', sans-serif;
--weight-heading: 700;

/* Body */
--font-body: 'Inter', sans-serif;
--weight-normal: 400;
--weight-medium: 500;

/* Mono (addresses, hashes) */
--font-mono: 'JetBrains Mono', monospace;
```

### Spacing Scale
```
0.25rem (4px)  → xs
0.5rem (8px)   → sm
1rem (16px)    → md
1.5rem (24px)  → lg
2rem (32px)    → xl
3rem (48px)    → 2xl
4rem (64px)    → 3xl
```

### Animations
```typescript
// Framer Motion variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};
```

---

## Web3 Авторизация (Flow)

```
1. User clicks "Connect Wallet"
   ↓
2. Wallet selector modal (MetaMask/WalletConnect)
   ↓
3. Check PLEX balance
   ↓
4. If balance < 1 → Show error
   ↓
5. Request 1 PLEX transaction to AUTH_ADDRESS
   ↓
6. Monitor transaction (pending → confirmed)
   ↓
7. Verify transaction on-chain
   ↓
8. Generate JWT (payload: {address, timestamp})
   ↓
9. Store JWT in localStorage
   ↓
10. Redirect to /dashboard
```

**Security:**
- JWT expires in 24h
- Each request verified middleware
- No private keys stored locally
- Transaction hash stored for audit

---

## SEO Оптимизация

### Meta Tags (Next.js metadata)
```typescript
export const metadata = {
  title: 'ArbitroBot - DEX Арбитражный Робот | Мониторинг',
  description: 'Отслеживайте транзакции арбитражного бота...',
  keywords: [
    'арбитраж', 'крипто', 'DEX', 'PancakeSwap',
    'автоматический трейдинг', 'BSC', 'DeFi'
  ],
  openGraph: {
    title: 'ArbitroBot',
    description: '...',
    images: ['/og-image.png']
  }
};
```

### Sitemap
```
/                  → Главная
/dashboard         → Личный кабинет
/about             → О проекте
/faq               → FAQ
/docs              → Документация
```

### Robots.txt
```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api

Sitemap: https://arbitrobot.com/sitemap.xml
```

---

## Производительность

### Цели
- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3.5s
- **CLS** (Cumulative Layout Shift): < 0.1

### Оптимизации
- ✅ Next.js Image optimization
- ✅ Code splitting (dynamic imports)
- ✅ Tree shaking (Tailwind JIT)
- ✅ CDN для статики (Vercel/Cloudflare)
- ✅ Gzip/Brotli compression

---

## Безопасность

### Frontend
- ❌ НИКОГДА не храним private keys
- ✅ JWT для сессий (HttpOnly cookies в будущем)
- ✅ Content Security Policy
- ✅ XSS защита (React escaping)

### Web3
- ✅ Verify contract addresses перед вызовом
- ✅ Estimate gas перед транзакцией
- ✅ User approval для каждой транзакции
- ❌ НЕ запрашиваем больше, чем нужно (approve)

---

## ЗАПРЕТЫ

| ❌ НИКОГДА | ✅ ВМЕСТО ЭТОГО |
|-----------|----------------|
| Inline styles в JSX | Tailwind classes |
| `any` type | Explicit types |
| Глобальные переменные | Zustand/Context |
| Hardcoded URLs | env variables |
| Console.log в prod | Proper logging |
| Ignore TypeScript errors | Fix them |

---

## Roadmap

### Phase 1: MVP (2 недели)
- [x] Архитектура
- [ ] Базовый UI
- [ ] Web3 auth
- [ ] Transaction monitor

### Phase 2: Enhancement (1 неделя)
- [ ] Real-time WebSocket
- [ ] Dashboard статистика
- [ ] Mobile оптимизация

### Phase 3: Production (1 неделя)
- [ ] Тестирование
- [ ] SEO финализация
- [ ] Деплой на Vercel

---

**Дата последнего обновления:** 2025-10-16  
**Автор:** Claude Sonnet 4.5
