# 📝 TODO для следующей сессии

**Дата:** 2025-10-05
**Главная задача:** Протестировать интеграцию с API и доделать загрузку транзакций

---

## 🔴 КРИТИЧНО: Тестирование интеграции

### ⚠️ Важно: Интеграция НЕ протестирована!
В предыдущей сессии был написан код интеграции, но он **НЕ тестировался** в работающем приложении.

**Что протестировать:**
1. Автосоздание категорий и счёта при регистрации
2. Загрузка категорий из API в UI
3. Загрузка счетов из API в Dashboard
4. Сохранение транзакций через API
5. Отображение эмодзи-иконок категорий

---

## 📋 Пошаговый план тестирования

### Шаг 1: Подготовка базы данных (15 мин)

**Проблема:** БД заблокирована, нужно пересоздать для чистого теста.

```bash
# 1. Найти и убить процессы Ruby
tasklist | findstr ruby
taskkill /F /PID <PID>

# 2. Удалить старую БД
cd api
rm -f storage/*.sqlite3*
rm -f tmp/pids/server.pid

# 3. Создать новую БД
bundle exec rails db:create
bundle exec rails db:migrate

# 4. Проверить схему
bundle exec rails db:schema:dump
```

**Ожидаемый результат:**
- ✅ БД создана без ошибок
- ✅ Таблицы: users, accounts, categories, transactions

---

### Шаг 2: Запуск backend (5 мин)

```bash
# 1. Запустить Rails
cd api
bundle exec rails server

# Должен запуститься на http://localhost:3000
```

**Проверка:**
```bash
curl http://localhost:3000/api/categories
# Должен вернуть: 401 Unauthorized (нет токена) - это OK
```

---

### Шаг 3: Запуск ngrok (5 мин)

```bash
ngrok http 3000
```

**Скопировать URL:**
- Пример: `https://abcd-1234-5678.ngrok-free.app`
- Этот URL нужен для Netlify

**Проверка:**
```bash
curl https://your-ngrok-url.ngrok-free.app/api/categories
# Должен вернуть: 401 Unauthorized - это OK
```

---

### Шаг 4: Обновить Netlify (10 мин)

1. **Зайти на Netlify:**
   - https://app.netlify.com/
   - Проект: financetrack21

2. **Обновить переменную окружения:**
   - Site settings → Environment variables
   - Найти `VITE_API_URL`
   - Обновить значение: `https://your-ngrok-url.ngrok-free.app/api`
   - ⚠️ **Важно:** URL должен заканчиваться на `/api`

3. **Пересобрать сайт:**
   - Deploys → Trigger deploy → Clear cache and deploy site
   - Дождаться окончания (~2-3 минуты)

---

### Шаг 5: Тестирование в Telegram (20 мин)

**Важно:** Нужно создать НОВОГО пользователя для теста!

#### Вариант A: Новый Telegram аккаунт
- Создать новый Telegram аккаунт
- Открыть @fintrack21bot
- Запустить Mini App

#### Вариант B: Изменить telegram_id в БД
```bash
# В Rails console
cd api
bundle exec rails console

# Найти текущего пользователя и удалить
User.destroy_all

# Теперь при входе создастся новый
```

#### Тест 1: Автосоздание категорий и счёта
1. Открыть Mini App в Telegram
2. Дождаться авторизации
3. Проверить в Rails console:
   ```ruby
   user = User.last
   user.categories.count  # Должно быть 9
   user.accounts.count    # Должно быть 1

   # Проверить категории
   user.categories.pluck(:name, :icon, :category_type)
   # Должно быть:
   # ["Продукты", "🛒", "expense"]
   # ["Транспорт", "🚗", "expense"]
   # ["Кафе и рестораны", "🍔", "expense"]
   # ["Развлечения", "🎮", "expense"]
   # ["Здоровье", "💊", "expense"]
   # ["Покупки", "🛍️", "expense"]
   # ["Зарплата", "💰", "income"]
   # ["Фриланс", "💼", "income"]
   # ["Подарки", "🎁", "income"]

   # Проверить счёт
   user.accounts.first
   # Должно быть: { name: "Основной счёт", balance: 0, currency: "RUB", account_type: "cash" }
   ```

**Ожидаемый результат:**
- ✅ 9 категорий создано
- ✅ 1 счёт создан
- ✅ Dashboard открывается без ошибок

#### Тест 2: Загрузка категорий в UI
1. В Telegram Mini App нажать "+" (Добавить транзакцию)
2. Проверить DevTools (Telegram Desktop → Ctrl+Shift+I):
   - Network tab → должен быть запрос `GET /api/categories`
   - Status: 200 OK
   - Response: массив из 9 категорий
3. Проверить UI:
   - ✅ Категории отображаются
   - ✅ Эмодзи-иконки видны (🛒, 🚗, 🍔, и т.д.)
   - ✅ При смене типа (Доход/Расход) категории меняются

#### Тест 3: Загрузка счетов в Dashboard
1. В Dashboard проверить DevTools:
   - Network tab → должен быть запрос `GET /api/accounts`
   - Status: 200 OK
   - Response: массив с 1 счётом
2. Проверить UI:
   - ✅ Счёт "Основной счёт" отображается
   - ✅ Баланс: 0₽

#### Тест 4: Создание транзакции через API
1. Добавить транзакцию:
   - Сумма: 500
   - Тип: Расход
   - Категория: Продукты 🛒
   - Счёт: Основной счёт
   - Описание: Тест
2. Проверить DevTools:
   - Network tab → должен быть запрос `POST /api/transactions`
   - Status: 201 Created
   - Response: созданная транзакция
3. Проверить в Rails console:
   ```ruby
   Transaction.last
   # Должна быть транзакция с amount: 500, transaction_type: "expense"
   ```

**Ожидаемый результат:**
- ✅ Транзакция создана в БД
- ✅ Toast "Расход добавлен!" показан
- ✅ Навигация назад работает

#### Тест 5: Перезагрузка данных
1. Закрыть Mini App
2. Открыть снова
3. Проверить:
   - ✅ Категории загрузились
   - ✅ Счета загрузились
   - ⚠️ Транзакции НЕ загрузятся (это известная проблема - см. ниже)

---

## 🔴 Известная проблема: Транзакции не загружаются из API

### Проблема:
Транзакции создаются через API, но НЕ загружаются из API при старте приложения.
Dashboard использует моки из `App.tsx`.

### Решение (30 мин):

**Файл:** `web/src/App.tsx`

Заменить:
```typescript
const [transactions, setTransactions] = useState<Transaction[]>([
  // Моки...
]);
```

На:
```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);

useEffect(() => {
  const loadTransactions = async () => {
    if (isAuthenticated) {
      try {
        const data = await transactionsService.getAll();
        // Преобразовать формат API в формат компонента
        const mappedTransactions = data.map(t => ({
          id: t.id,
          amount: t.amount,
          type: t.transaction_type,
          category: t.category_id,
          categoryName: t.category?.name || '',
          description: t.description,
          accountId: t.account_id,
          date: t.date,
          time: new Date(t.created_at).toTimeString().slice(0, 5)
        }));
        setTransactions(mappedTransactions);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
    }
  };

  loadTransactions();
}, [isAuthenticated]);
```

**После этого:**
- ✅ Транзакции загружаются из API при старте
- ✅ Данные сохраняются между сессиями
- ✅ После добавления новой транзакции - перезагрузить список

---

## 📊 Checklist тестирования

### Backend
- [ ] БД пересоздана без ошибок
- [ ] Rails сервер запущен
- [ ] Ngrok работает
- [ ] Категории создаются при регистрации (9 шт)
- [ ] Счёт создаётся при регистрации (1 шт)
- [ ] Транзакции сохраняются в БД

### Frontend
- [ ] Netlify пересобран с новым `VITE_API_URL`
- [ ] Категории загружаются из API
- [ ] Эмодзи-иконки отображаются
- [ ] Счета загружаются из API
- [ ] Транзакции создаются через API
- [ ] Toast уведомления работают
- [ ] Fallback на моки при ошибках

### Интеграция
- [ ] Новый пользователь → создаются категории/счёт
- [ ] Dashboard загружается без ошибок
- [ ] AddTransactionPage показывает категории из API
- [ ] Транзакция сохраняется и видна в БД
- [ ] ⚠️ Загрузка транзакций из API (нужно доделать)

---

## 🚀 Следующие задачи после тестирования

### Приоритет 1: Загрузка транзакций из API
- Время: 30 мин
- Файл: `web/src/App.tsx`
- Задача: Заменить моки на `transactionsService.getAll()`

### Приоритет 2: Постоянный хостинг backend
**Вариант A: Render.com Free**
- ✅ Бесплатно
- ⚠️ Засыпает через 15 мин
- ⚠️ PostgreSQL БД на 30 дней

**Вариант B: Railway Hobby**
- 💰 $10/месяц
- ✅ Не засыпает
- ✅ PostgreSQL included

**Шаги деплоя:**
1. Обновить `Gemfile` для PostgreSQL
2. Настроить `database.yml` для production
3. Задеплоить на хостинг
4. Обновить `VITE_API_URL` на постоянный URL
5. Финальное тестирование

**Время:** 1-2 часа

---

## 💡 Полезные команды

### Rails Console
```bash
cd api
bundle exec rails console

# Проверить пользователей
User.all

# Проверить категории последнего пользователя
User.last.categories

# Проверить транзакции
Transaction.all

# Удалить всех пользователей (для чистого теста)
User.destroy_all
```

### Ngrok
```bash
# Запустить ngrok
ngrok http 3000

# Проверить URL
curl https://your-ngrok-url.ngrok-free.app/api/categories
```

### DevTools в Telegram
- **Windows/Linux:** Ctrl+Shift+I
- **Mac:** Cmd+Option+I
- **Network tab** - проверить запросы к API
- **Console tab** - проверить ошибки

---

## 🎯 Критерий успеха сессии

**Минимум:**
- ✅ Интеграция протестирована и работает
- ✅ Категории и счета создаются автоматически
- ✅ Транзакции сохраняются в БД
- ✅ Данные загружаются из API

**Идеал:**
- ✅ Всё вышеперечисленное
- ✅ Транзакции загружаются из API
- ✅ Backend задеплоен на постоянный хостинг
- ✅ VITE_API_URL указывает на постоянный URL

---

**Статус:** Готово к тестированию
**Блокеры:** Нет
**Время:** 1-2 часа на тестирование + 1-2 часа на деплой

Последнее обновление: 2025-10-05 14:40 MSK
