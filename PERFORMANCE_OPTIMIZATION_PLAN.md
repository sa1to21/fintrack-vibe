# План оптимизации производительности API

**Дата создания:** 13 октября 2025
**Текущая проблема:** Долгие загрузки API (80-120ms), белый экран перед лоадером, N+1 queries

---

## 🔍 Обнаруженные проблемы

### 1. **N+1 Query Problem в TransactionSerializer** 🚨
```
Transaction Load (0.1ms) SELECT * WHERE id = 53 LIMIT 1
Transaction Load (0.1ms) SELECT * WHERE id = 56 LIMIT 1
Transaction Load (0.1ms) SELECT * WHERE id = 57 LIMIT 1
... (для каждого перевода отдельный запрос)
```

**Проблема:** `TransactionSerializer#paired_account_id` делает отдельный SQL запрос для КАЖДОЙ транзакции-перевода.

**Текущее время:** ~80-120ms на запрос транзакций
**Ожидаемое после фикса:** ~20-40ms

---

### 2. **Множественные параллельные запросы**
DashboardPage делает:
- 1 запрос `/api/v1/accounts`
- 3 параллельных запроса `/api/v1/accounts/{id}/transactions`

**Итого:** 4 HTTP запроса на загрузку дашборда

---

### 3. **Отсутствие кеширования**
Каждый переход на страницу = новые запросы к API, даже если данные не изменились.

---

### 4. **Белый экран перед загрузкой**
`currentScreen = null` → пустой белый экран → потом лоадер → потом контент

**UX проблема:** Пользователь видит 3 состояния вместо 2

---

## 📋 Этапы оптимизации

### ✅ **Этап 1: Быстрые победы** (30-60 минут)

#### 1.1 ✅ Исправить N+1 в TransactionsController
**Файл:** `api/app/controllers/api/v1/transactions_controller.rb`

```ruby
def index
  @transactions = @account.transactions
    .includes(:category, :paired_transaction) # ← Eager loading
    .order(date: :desc, time: :desc)

  render json: @transactions
end
```

**Результат:** 30+ отдельных запросов → 3 запроса (transactions + categories + paired_transactions)

---

#### 1.2 ✅ Убрать белый экран - skeleton с самого начала
**Файл:** `web/src/App.tsx`

**Было:**
```typescript
const [currentScreen, setCurrentScreen] = useState<AppScreen | null>(null);
// null = белый экран
```

**Станет:**
```typescript
const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');
// Сразу показываем dashboard с loading=true → skeleton
```

**Результат:** Нет белого экрана, сразу skeleton → данные

---

#### 1.3 ⏳ Добавить индексы в базу данных
**Файл:** `api/db/migrate/add_performance_indexes.rb`

```ruby
add_index :transactions, :paired_transaction_id
add_index :transactions, :category_id
add_index :transactions, [:account_id, :created_at]
add_index :transactions, :transfer_id
```

**Результат:** Ускорение сложных запросов на 50-70%

---

### ⏳ **Этап 2: API консолидация** (1-2 часа)

#### 2.1 Создать единый endpoint `/api/v1/dashboard`
**Файл:** `api/app/controllers/api/v1/dashboard_controller.rb`

```ruby
# GET /api/v1/dashboard
def index
  accounts = current_user.accounts

  transactions = Transaction
    .where(account: accounts)
    .includes(:category, :paired_transaction)
    .order(created_at: :desc)
    .limit(20) # Только последние 20

  render json: {
    accounts: ActiveModelSerializers::SerializableResource.new(accounts),
    transactions: ActiveModelSerializers::SerializableResource.new(transactions)
  }
end
```

**Результат:** 4 HTTP запроса → 1 HTTP запрос

---

#### 2.2 Обновить DashboardPage для использования нового endpoint
**Файл:** `web/src/services/dashboard.service.ts`

```typescript
export const dashboardService = {
  async getData() {
    const response = await api.get('/dashboard');
    return response.data; // { accounts, transactions }
  }
};
```

**Результат:** Один useEffect вместо двух цепочек запросов

---

### ⏳ **Этап 3: Кеширование** (2-3 часа)

#### 3.1 localStorage для мгновенного старта
**Файл:** `web/src/utils/cache.ts`

```typescript
export const cache = {
  set(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  },

  get(key: string, maxAge = 5 * 60 * 1000) {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > maxAge) return null;

    return data;
  }
};
```

**Использование:**
```typescript
// При монтировании компонента
const cached = cache.get('dashboard');
if (cached) {
  setAccounts(cached.accounts); // Мгновенно
  setTransactions(cached.transactions);
}

// Потом обновляем с API
const fresh = await dashboardService.getData();
setAccounts(fresh.accounts);
cache.set('dashboard', fresh);
```

**Результат:** Perceived loading time = 0ms (показываем кеш мгновенно)

---

#### 3.2 Опционально: React Query
**Установка:** `npm install @tanstack/react-query`

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['dashboard'],
  queryFn: dashboardService.getData,
  staleTime: 5 * 60 * 1000, // 5 минут кеш
  gcTime: 10 * 60 * 1000, // 10 минут в памяти
});
```

**Преимущества:**
- Автоматическое кеширование
- Фоновое обновление
- Dedupe одинаковых запросов
- Retry при ошибках

---

### 🚀 **Этап 4: Продвинутые оптимизации** (опционально, 4+ часов)

#### 4.1 Optimistic UI updates
```typescript
// Сразу показываем в UI
const optimisticTransaction = { ...newTransaction, id: 'temp' };
setTransactions([optimisticTransaction, ...transactions]);

// API запрос фоном
try {
  const saved = await api.post('/transactions', newTransaction);
  // Заменяем временный на настоящий
  setTransactions(txs => txs.map(t => t.id === 'temp' ? saved : t));
} catch (error) {
  // Откатываем при ошибке
  setTransactions(txs => txs.filter(t => t.id !== 'temp'));
  toast.error('Ошибка сохранения');
}
```

---

#### 4.2 Pagination для All Transactions
```typescript
// Вместо загрузки всех транзакций сразу
const [page, setPage] = useState(1);
const { data } = useInfiniteQuery({
  queryKey: ['transactions', page],
  queryFn: ({ pageParam = 1 }) =>
    transactionsService.getAll(accountId, { page: pageParam, limit: 20 })
});
```

---

#### 4.3 WebSocket для real-time (future)
```ruby
# Action Cable для Rails
class DashboardChannel < ApplicationCable::Channel
  def subscribed
    stream_for current_user
  end
end

# Broadcast при изменениях
DashboardChannel.broadcast_to(user, { type: 'transaction_created', data: transaction })
```

---

## 📊 Ожидаемые результаты

| Метрика | До | После Этапа 1 | После Этапа 2 | После Этапа 3 |
|---------|-----|---------------|---------------|---------------|
| Время загрузки Dashboard | 400-600ms | 150-250ms | 80-120ms | 0ms (кеш) + 80ms (фон) |
| Количество HTTP запросов | 4 | 4 | 1 | 1 (или 0 из кеша) |
| SQL запросов на /transactions | 30+ | 3-5 | 3-5 | 3-5 |
| Белый экран | Да ❌ | Нет ✅ | Нет ✅ | Нет ✅ |
| UX states | 3 (белый → loader → контент) | 2 (loader → контент) | 2 | 1 (кеш → обновление фоном) |

---

## 🎯 Приоритеты

### **Высокий (делаем сейчас):**
1. ✅ Исправить N+1 query в TransactionsController
2. ✅ Убрать белый экран (skeleton сразу)
3. ⏳ Добавить индексы БД

### **Средний (следующая сессия):**
4. Создать `/api/v1/dashboard` endpoint
5. localStorage кеш

### **Низкий (опционально):**
6. React Query
7. Optimistic updates
8. WebSocket

---

## 📝 Заметки

- **SQLite limitation:** В production рассмотреть PostgreSQL для лучшей производительности
- **Rails caching:** Можно добавить `Rails.cache` для кеширования на backend
- **CDN:** Статика через Netlify уже оптимизирована
- **Bundle size:** Уже оптимизирован (220 KB / 72 KB gzip) в v0.2.0

---

**Последнее обновление:** 13 октября 2025, 01:51 UTC+4
