# План реализации страницы Статистики

## 🎯 Цель
Создать простую, понятную и полезную страницу статистики без перегруза информацией.

---

## 📊 Структура страницы (что показываем)

```
┌─────────────────────────────────────┐
│   [Фильтр: Неделя|Месяц|3мес|Год]  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💰 Hero Card - Главное            │
│                                     │
│     Накоплено за период             │
│        +23,000 ₽                   │
│   (доходы 75,000 - расходы 52,000) │
└─────────────────────────────────────┘

┌──────────────┬──────────────────────┐
│ Доходы       │ Расходы              │
│ 75,000 ₽    │ 52,000 ₽            │
│ ↗️ +12%      │ ↗️ +8%               │
└──────────────┴──────────────────────┘

┌─────────────────────────────────────┐
│ 📊 Расходы по категориям (ТОП-5)   │
│  [Progress bars с иконками]         │
│  Еда 🍕      18,000₽  ███████ 35%  │
│  Транспорт 🚗 12,000₽  █████  23%  │
│  ...                                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💼 Баланс по счетам                 │
│  Карта      150,000₽  ████████ 61% │
│  Сбережения  70,000₽  ███     29%  │
│  Наличные    25,000₽  ██      10%  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💡 Полезная инфо (1-2 инсайта)     │
│ • Самая большая трата: 15,000₽     │
│ • Средний расход в день: 1,733₽    │
└─────────────────────────────────────┘
```

---

## 🔧 Backend (Rails API) - что делаем

### Этап 1: Доработать существующий контроллер (1.5-2 часа)

**Файл:** `api/app/controllers/api/v1/analytics_controller.rb`

#### 1. Доработать метод `summary`
- ✅ Добавить параметры `date_from`, `date_to` для фильтрации
- ✅ Вернуть накопления (income - expenses)
- ✅ Вернуть средний расход в день

**Endpoint:**
```
GET /api/v1/analytics/summary?date_from=2025-10-01&date_to=2025-10-31
```

**Response:**
```json
{
  "income": 75000,
  "expenses": 52000,
  "savings": 23000,
  "avg_expense_per_day": 1733,
  "total_balance": 245000
}
```

#### 2. Доработать метод `by_category`
- ✅ Добавить параметры `date_from`, `date_to`
- ✅ Сортировка по сумме (DESC)
- ✅ Лимит (параметр `limit`, по умолчанию 5)
- ✅ Расчет процентов для каждой категории
- ✅ Возвращать только расходы (не доходы)

**Endpoint:**
```
GET /api/v1/analytics/categories?date_from=...&date_to=...&limit=5
```

**Response:**
```json
{
  "categories": [
    {
      "name": "Еда",
      "icon": "🍕",
      "amount": 18000,
      "percentage": 35,
      "color": "#3B82F6"
    },
    ...
  ],
  "total_expenses": 52000
}
```

#### 3. Создать новый метод `accounts_balance`
- ✅ Вернуть баланс по всем счетам
- ✅ Вернуть процент от общего баланса
- ✅ Вернуть общий баланс

**Endpoint:**
```
GET /api/v1/analytics/accounts_balance
```

**Response:**
```json
{
  "accounts": [
    {
      "id": 1,
      "name": "Карта Т-Банк",
      "balance": 150000,
      "percentage": 61,
      "currency": "RUB",
      "account_type": "credit_card"
    },
    ...
  ],
  "total_balance": 245000
}
```

#### 4. Создать новый метод `comparison`
- ✅ Сравнение текущего периода с предыдущим
- ✅ Вернуть процент изменения для доходов и расходов
- ✅ Автоматически определять предыдущий период по длине текущего

**Endpoint:**
```
GET /api/v1/analytics/comparison?date_from=2025-10-01&date_to=2025-10-31
```

**Response:**
```json
{
  "current": {
    "income": 75000,
    "expenses": 52000
  },
  "previous": {
    "income": 67000,
    "expenses": 48000
  },
  "change": {
    "income_percent": 12,
    "expenses_percent": 8
  }
}
```

#### 5. Добавить метод для инсайтов (простой)
- ✅ Самая большая трата за период
- ✅ Средний расход в день

**Добавить в response `summary`**

### Оптимизация:
- Убрать N+1 queries через `.includes(:category, :account)`
- Проверить индексы на `transactions.date`

### Роутинг:
Добавить в `config/routes.rb`:
```ruby
get 'analytics/accounts_balance', to: 'analytics#accounts_balance'
get 'analytics/comparison', to: 'analytics#comparison'
```

---

## 💻 Frontend (React) - что делаем

### Этап 2: Создать сервис для аналитики (30 мин)

**Файл:** `web/src/services/analytics.service.ts`

```typescript
interface AnalyticsSummary {
  income: number;
  expenses: number;
  savings: number;
  avg_expense_per_day: number;
  total_balance: number;
  biggest_expense?: {
    amount: number;
    category: string;
    date: string;
  };
}

interface CategoryBreakdown {
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  color: string;
}

interface AccountBalance {
  id: string;
  name: string;
  balance: number;
  percentage: number;
  currency: string;
  account_type: string;
}

interface Comparison {
  current: { income: number; expenses: number };
  previous: { income: number; expenses: number };
  change: { income_percent: number; expenses_percent: number };
}

class AnalyticsService {
  async getSummary(dateFrom: string, dateTo: string): Promise<AnalyticsSummary>
  async getCategoriesBreakdown(dateFrom: string, dateTo: string, limit: number = 5): Promise<CategoryBreakdown[]>
  async getAccountsBalance(): Promise<{ accounts: AccountBalance[], total_balance: number }>
  async getComparison(dateFrom: string, dateTo: string): Promise<Comparison>
}

export default new AnalyticsService();
```

---

### Этап 3: Переписать AnalyticsPage.tsx (2.5-3 часа)

**Файл:** `web/src/components/AnalyticsPage.tsx`

#### Что УБИРАЕМ:
- ❌ Все mock данные (`getStatsForPeriod`, `getCategoryExpenses`)
- ❌ Карточку "Норма сбережений 30.7%" (непонятная метрика)
- ❌ Заглушку "Финансовые цели - Скоро доступно"
- ❌ Избыточные анимации (оставить только базовые)

#### Что ДОБАВЛЯЕМ:

##### 1. Hero Card - Главная метрика
```tsx
<Card className="hero-card">
  <CardContent>
    <p className="text-sm">Накоплено за {periodLabel}</p>
    <h2 className="text-3xl font-bold text-emerald-600">
      {savings > 0 ? '+' : ''}{formatCurrency(savings)}
    </h2>
    <p className="text-xs text-muted-foreground">
      Доходы {formatCurrency(income)} - Расходы {formatCurrency(expenses)}
    </p>
  </CardContent>
</Card>
```

##### 2. Карточки с сравнением
```tsx
<div className="grid grid-cols-2 gap-3">
  <Card>
    <CardContent>
      <div className="flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        <div>
          <p className="text-sm">Доходы</p>
          <p className="font-medium">{formatCurrency(income)}</p>
          {comparison && (
            <div className="flex items-center gap-1 text-xs">
              {comparison.change.income_percent > 0 ? '↗️' : '↘️'}
              <span>{Math.abs(comparison.change.income_percent)}%</span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Аналогично для расходов */}
</div>
```

##### 3. ТОП-5 категорий с процентами
```tsx
<Card>
  <CardHeader>
    <CardTitle>Расходы по категориям</CardTitle>
  </CardHeader>
  <CardContent>
    {categories.map(cat => (
      <div key={cat.name} className="space-y-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{cat.icon}</span>
            <span className="text-sm">{cat.name}</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{formatCurrency(cat.amount)}</div>
            <div className="text-xs text-muted-foreground">{cat.percentage}%</div>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="h-2 rounded-full"
            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
          />
        </div>
      </div>
    ))}
  </CardContent>
</Card>
```

##### 4. Баланс по счетам
```tsx
<Card>
  <CardHeader>
    <CardTitle>Баланс по счетам</CardTitle>
  </CardHeader>
  <CardContent>
    {accounts.map(acc => (
      <div key={acc.id} className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">{acc.name}</span>
          <div className="text-right">
            <div className="text-sm font-medium">{formatCurrency(acc.balance)}</div>
            <div className="text-xs text-muted-foreground">{acc.percentage}%</div>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-blue-500"
            style={{ width: `${acc.percentage}%` }}
          />
        </div>
      </div>
    ))}
    <div className="mt-3 pt-3 border-t">
      <div className="flex justify-between font-medium">
        <span>ИТОГО</span>
        <span>{formatCurrency(totalBalance)}</span>
      </div>
    </div>
  </CardContent>
</Card>
```

##### 5. Простые инсайты
```tsx
<Card>
  <CardHeader>
    <CardTitle>💡 Полезная информация</CardTitle>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2 text-sm">
      {biggestExpense && (
        <li>• Самая большая трата: {formatCurrency(biggestExpense.amount)}</li>
      )}
      <li>• Средний расход в день: {formatCurrency(avgExpensePerDay)}</li>
    </ul>
  </CardContent>
</Card>
```

##### 6. Loading & Error States
```tsx
if (loading) {
  return <LoadingSpinner />
}

if (error) {
  return <ErrorMessage message={error} />
}
```

#### Логика работы с периодами:
```typescript
const getPeriodDates = (period: string) => {
  const today = new Date();
  let dateFrom, dateTo;

  switch(period) {
    case 'week':
      dateFrom = subDays(today, 7);
      dateTo = today;
      break;
    case 'month':
      dateFrom = startOfMonth(today);
      dateTo = endOfMonth(today);
      break;
    case '3months':
      dateFrom = subMonths(today, 3);
      dateTo = today;
      break;
    case 'year':
      dateFrom = startOfYear(today);
      dateTo = endOfYear(today);
      break;
    case 'custom':
      dateFrom = customRange.from;
      dateTo = customRange.to;
      break;
  }

  return { dateFrom, dateTo };
}

useEffect(() => {
  const { dateFrom, dateTo } = getPeriodDates(selectedPeriod);
  loadAnalytics(dateFrom, dateTo);
}, [selectedPeriod, customRange]);
```

---

## 📦 Этапы разработки

### Этап 1: Backend API (1.5-2 часа)
- [ ] Доработать `summary` - добавить фильтрацию по датам
- [ ] Доработать `by_category` - сортировка, лимит, проценты
- [ ] Создать `accounts_balance`
- [ ] Создать `comparison`
- [ ] Добавить роуты в `routes.rb`
- [ ] Протестировать через curl/Postman

### Этап 2: Frontend Service (30 мин)
- [ ] Создать `analytics.service.ts`
- [ ] Добавить типы для всех данных
- [ ] Подключить к API endpoints

### Этап 3: Frontend UI (2.5-3 часа)
- [ ] Убрать все mock данные из AnalyticsPage
- [ ] Добавить Hero Card с накоплениями
- [ ] Обновить карточки доходов/расходов + сравнение
- [ ] Обновить расходы по категориям (ТОП-5)
- [ ] Добавить баланс по счетам
- [ ] Добавить блок инсайтов
- [ ] Добавить Loading/Error states
- [ ] Подключить реальные данные из service

### Этап 4: Тестирование (30 мин)
- [ ] Проверить на реальных данных
- [ ] Проверить все периоды (неделя, месяц, 3 мес, год)
- [ ] Проверить custom период
- [ ] Проверить на мобильном
- [ ] Проверить edge cases (нет данных, ошибка API)
- [ ] Исправить найденные баги

### Этап 5: Деплой (15 мин)
- [ ] Commit changes
- [ ] Push to GitHub
- [ ] Деплой API на Render
- [ ] Деплой Frontend на Netlify
- [ ] Проверка на production

---

## ⏱️ Общая оценка времени

- **Backend:** 1.5-2 часа
- **Frontend Service:** 30 минут
- **Frontend UI:** 2.5-3 часа
- **Тестирование:** 30 минут
- **Деплой:** 15 минут

**ИТОГО: 5-6.5 часов**

---

## 🎨 Дизайн-принципы

1. **Минимализм** - только важная информация, без перегруза
2. **Читаемость** - крупные цифры, понятные лейблы
3. **Быстрота** - минимум анимаций, быстрая загрузка
4. **Полезность** - каждый блок отвечает на конкретный вопрос пользователя
5. **Простота** - никаких сложных графиков на первом этапе

---

## ✅ Критерии готовности (Definition of Done)

- [ ] Все данные загружаются с API (не mock)
- [ ] Фильтр периода работает корректно
- [ ] Видно: накопления, доходы, расходы, ТОП категорий, баланс счетов
- [ ] Есть сравнение с предыдущим периодом (↗️ +12%)
- [ ] Нет заглушек и "скоро доступно"
- [ ] Loading состояние при загрузке
- [ ] Обработка ошибок API
- [ ] Работает на мобильном без багов
- [ ] Нет ошибок в консоли браузера
- [ ] Нет N+1 запросов в Rails
- [ ] Быстрая загрузка (< 1 сек)

---

## 🚫 Что НЕ делаем (оставляем на потом)

- ❌ Графики (line charts, bar charts)
- ❌ AI-инсайты и предсказания
- ❌ Экспорт данных (CSV, Excel)
- ❌ Календарь трат (heatmap)
- ❌ Финансовые цели
- ❌ Детальная аналитика по каждой категории
- ❌ Сравнение нескольких периодов одновременно

---

## 📝 Заметки по реализации

### Backend:
- Использовать `.includes()` для eager loading
- Группировка по категориям через `.group()`
- Проценты считать на уровне Ruby, не в SQL
- Кешировать не нужно на первом этапе

### Frontend:
- Использовать `date-fns` для работы с датами
- Минимум анимаций - только OptimizedMotion для входа
- Не использовать сторонние библиотеки для графиков пока
- Progress bars - простые div с width в процентах

### Тестирование:
- Проверить что происходит когда нет транзакций
- Проверить что происходит когда только доходы или только расходы
- Проверить граничные даты (начало/конец месяца)
