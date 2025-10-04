# 🗺️ План интеграции API с Frontend

**Дата создания:** 2025-10-05
**Статус:** Планирование

---

## 📊 Текущее состояние

**Что работает:**
- ✅ Telegram авторизация (API интегрирован)
- ✅ JWT токены сохраняются

**Что на моках:**
- 🎭 Счета (3 хардкод счета в DashboardPage)
- 🎭 Транзакции (локальный стейт в App.tsx)
- 🎭 Категории (хардкод в AddTransactionPage)

---

## 🎯 Цель интеграции

Заменить все моки на реальные данные из Rails API, чтобы:
1. Данные сохранялись между сессиями
2. Работала синхронизация между устройствами
3. Можно было масштабировать приложение

---

## 📝 План по этапам

### Phase 1: Категории (приоритет HIGH)

**Зачем:** Без категорий нельзя создавать транзакции

**Backend изменения:**
```ruby
# api/app/controllers/api/telegram_auth_controller.rb
def create_default_categories(user)
  categories = [
    { name: 'Продукты', category_type: 'expense', icon: '🛒', color: '#FF6B6B' },
    { name: 'Транспорт', category_type: 'expense', icon: '🚗', color: '#4ECDC4' },
    # ... остальные категории
  ]
  categories.each { |cat| user.categories.create!(cat) }
end

# Вызывать при создании пользователя
if user.new_record?
  user.save!
  create_default_categories(user)
end
```

**Frontend изменения:**
- Загружать категории при старте: `categories.service.getAll()`
- Использовать в AddTransactionPage вместо хардкода

**Время:** ~1 час

---

### Phase 2: Счета (приоритет HIGH)

**Зачем:** Основа для транзакций

**Backend изменения:**
```ruby
# В telegram_auth_controller.rb
if user.new_record?
  user.save!

  # Создать дефолтный счет
  user.accounts.create!(
    name: 'Основной счет',
    balance: 0,
    currency: 'RUB',
    account_type: 'cash'
  )

  create_default_categories(user)
end
```

**Frontend изменения:**
```typescript
// DashboardPage.tsx
const [accounts, setAccounts] = useState<Account[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadAccounts = async () => {
    try {
      const data = await accountsService.getAll();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  loadAccounts();
}, []);
```

**Время:** ~1 час

---

### Phase 3: Транзакции (приоритет HIGH)

**Зачем:** Главная функциональность приложения

**Frontend изменения:**

**1. App.tsx - загрузка транзакций:**
```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);

useEffect(() => {
  if (isAuthenticated) {
    transactionsService.getAll().then(setTransactions);
  }
}, [isAuthenticated]);
```

**2. AddTransactionPage - создание:**
```typescript
const handleSubmit = async (formData) => {
  const newTransaction = await transactionsService.create({
    amount: formData.amount,
    transaction_type: formData.type,
    description: formData.description,
    date: formData.date,
    account_id: formData.accountId,
    category_id: formData.categoryId
  });

  onTransactionAdded(newTransaction);
  navigate('/dashboard');
};
```

**3. TransactionDetailPage - обновление/удаление:**
```typescript
const handleUpdate = async (data) => {
  await transactionsService.update(transaction.id, data);
  // Обновить локальный стейт
};

const handleDelete = async () => {
  await transactionsService.delete(transaction.id);
  navigate('/dashboard');
};
```

**Время:** ~1.5 часа

---

## ✅ Чеклист интеграции

### Backend
- [ ] User model: добавить `has_many :categories`
- [ ] TelegramAuthController: создавать категории при регистрации
- [ ] TelegramAuthController: создавать дефолтный счет при регистрации
- [ ] CategoriesController: фильтровать по `current_user`
- [ ] Протестировать создание пользователя

### Frontend
- [ ] DashboardPage: загружать счета из API
- [ ] DashboardPage: загружать транзакции из API
- [ ] AddTransactionPage: загружать категории из API
- [ ] AddTransactionPage: создавать транзакции через API
- [ ] TransactionDetailPage: обновлять через API
- [ ] TransactionDetailPage: удалять через API
- [ ] Добавить loading states
- [ ] Добавить error handling

### Тестирование
- [ ] Новый пользователь → создается счет и категории
- [ ] Загрузка Dashboard → данные из API
- [ ] Добавление транзакции → сохраняется в БД
- [ ] Перезагрузка страницы → данные сохранились
- [ ] Удаление транзакции → удаляется из БД
- [ ] Редактирование транзакции → обновляется в БД

---

## 🚧 Потенциальные проблемы

### 1. Типы данных не совпадают
**Проблема:** Frontend ожидает `type: 'income'`, API возвращает `transaction_type: 'income'`

**Решение:** Добавить маппинг в сервисах или обновить типы

### 2. UUID vs Integer IDs
**Проблема:** Accounts/Categories используют UUID, Users - integer

**Решение:** Оставить как есть, SQLite поддерживает UUID для других таблиц

### 3. Категории пользователя vs глобальные
**Проблема:** Нужно решить, категории глобальные или персональные

**Решение:** Пока персональные для каждого пользователя

---

## 📈 После интеграции

**Следующие шаги:**
1. Развернуть backend на постоянном хостинге (Railway/Render)
2. Мигрировать на PostgreSQL
3. Добавить кэширование с React Query
4. Добавить оптимистичные обновления UI
5. Добавить offline support

---

**Общее время интеграции:** ~3-4 часа
**Сложность:** Средняя 🟡

Последнее обновление: 2025-10-05 01:20 MSK
