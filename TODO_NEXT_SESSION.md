# 📝 TODO для следующей сессии

**Дата:** 2025-10-05
**Главная задача:** Интегрировать реальные данные из API вместо моков

---

## ✅ Что было исправлено в предыдущей сессии

### Telegram авторизация - РЕШЕНО ✅
- ✅ Исправлена загрузка Telegram WebApp SDK
- ✅ Добавлен таймаут ожидания SDK
- ✅ Исправлен TelegramAuthController (убран несуществующий callback)
- ✅ Исправлена миграция users (убран UUID, теперь integer)
- ✅ Пересоздана база данных с правильной схемой
- ✅ Настроен ngrok host authorization
- ✅ **Авторизация работает полностью!**

---

## 🔴 Критические задачи

### 1. Интеграция API - Категории

**Проблема:** Категории захардкожены в UI, нет в БД

**Решение:**
- [ ] Создать seeds для дефолтных категорий
- [ ] Добавить категории при создании пользователя (в TelegramAuthController)
- [ ] Загружать категории из API при старте приложения

**Дефолтные категории (для seeds.rb):**
```ruby
# api/db/seeds.rb
def create_default_categories(user)
  [
    # Расходы
    { name: 'Продукты', category_type: 'expense', icon: '🛒', color: '#FF6B6B' },
    { name: 'Транспорт', category_type: 'expense', icon: '🚗', color: '#4ECDC4' },
    { name: 'Кафе и рестораны', category_type: 'expense', icon: '🍔', color: '#FFD93D' },
    { name: 'Развлечения', category_type: 'expense', icon: '🎮', color: '#A8E6CF' },
    { name: 'Здоровье', category_type: 'expense', icon: '💊', color: '#FF8B94' },
    { name: 'Покупки', category_type: 'expense', icon: '🛍️', color: '#C7CEEA' },

    # Доходы
    { name: 'Зарплата', category_type: 'income', icon: '💰', color: '#95E1D3' },
    { name: 'Фриланс', category_type: 'income', icon: '💼', color: '#6C5CE7' },
    { name: 'Подарки', category_type: 'income', icon: '🎁', color: '#FDCB6E' },
  ].each do |cat_attrs|
    user.categories.create!(cat_attrs)
  end
end
```

**Где изменить:**
- `api/db/seeds.rb` - добавить функцию создания категорий
- `api/app/controllers/api/telegram_auth_controller.rb` - вызывать после создания пользователя
- `web/src/components/AddTransactionPage.tsx` - загружать категории из API

---

### 2. Интеграция API - Счета

**Проблема:** Счета захардкожены в DashboardPage.tsx

**Решение:**
- [ ] Создавать дефолтный счет при регистрации пользователя
- [ ] Загружать счета из API в Dashboard
- [ ] Заменить моки на реальные данные

**Код для TelegramAuthController:**
```ruby
# После создания пользователя
if user.new_record?
  user.save!

  # Создать дефолтный счет
  user.accounts.create!(
    name: 'Основной счет',
    balance: 0,
    currency: 'RUB',
    account_type: 'cash'
  )

  # Создать дефолтные категории
  create_default_categories(user)
end
```

**Где изменить:**
- `api/app/controllers/api/telegram_auth_controller.rb` - создавать счет при регистрации
- `web/src/components/DashboardPage.tsx` - загружать через `accounts.service.ts`

---

### 3. Интеграция API - Транзакции

**Проблема:** Транзакции хранятся в локальном стейте App.tsx

**Решение:**
- [ ] Интегрировать `transactions.service.ts` в `AddTransactionPage`
- [ ] Загружать транзакции из API в Dashboard
- [ ] Сохранять новые транзакции через API
- [ ] Обновление/удаление через API

**Где изменить:**
- `web/src/App.tsx` - убрать моки, загружать из API
- `web/src/components/AddTransactionPage.tsx` - вызывать `transactions.service.create()`
- `web/src/components/DashboardPage.tsx` - использовать данные из API

**Пример интеграции в AddTransactionPage:**
```typescript
import transactionsService from '../services/transactions.service';

const handleSubmit = async (data) => {
  try {
    const transaction = await transactionsService.create({
      amount: data.amount,
      transaction_type: data.type,
      description: data.description,
      date: data.date,
      account_id: data.accountId,
      category_id: data.categoryId
    });

    // Обновить список транзакций
    onTransactionAdded(transaction);
  } catch (error) {
    console.error('Failed to create transaction:', error);
  }
};
```

---

## 🟡 Важные задачи

### 4. Обновить User Model для категорий и счетов

**Текущее состояние:** User модель не связана с категориями

**Что нужно:**
- [ ] Проверить associations в `api/app/models/user.rb`
- [ ] Добавить `has_many :categories` если нет

**Проверить:**
```ruby
# api/app/models/user.rb
class User < ApplicationRecord
  has_many :accounts, dependent: :destroy
  has_many :transactions, through: :accounts
  has_many :categories, dependent: :destroy  # Должно быть!
end
```

---

### 5. Обновить Categories Controller

**Проблема:** Категории должны быть привязаны к пользователю

**Решение:**
- [ ] Убедиться что `CategoriesController` возвращает только категории текущего пользователя
- [ ] Добавить фильтрацию по `user_id`

**Проверить в контроллере:**
```ruby
def index
  @categories = current_user.categories  # Только категории пользователя
  render json: @categories
end
```

---

### 6. Тестирование интеграции

После интеграции API протестировать:
- [ ] Создание нового пользователя → создаются категории и счет
- [ ] Загрузка Dashboard → данные приходят из API
- [ ] Добавление транзакции → сохраняется в БД
- [ ] Перезагрузка страницы → данные сохранились

---

## 🟢 Дополнительные задачи

### 7. Постоянный хостинг для Backend

**Проблема:** Ngrok URL меняется при каждом перезапуске

**Решение:** Развернуть на постоянном хостинге

**Рекомендуемые платформы:**

**Railway.app (рекомендуется):**
- 500 часов/месяц бесплатно
- Автоматический деплой из Git
- PostgreSQL included
- [railway.app](https://railway.app)

**Render.com:**
- Бесплатный tier
- Деплой из GitHub
- Засыпает после 15 мин неактивности
- [render.com](https://render.com)

**Fly.io:**
- $5 бесплатных кредитов/месяц
- Деплой из Git
- [fly.io](https://fly.io)

**Шаги для Railway:**
1. Зарегистрироваться на Railway
2. New Project → Deploy from GitHub
3. Выбрать репозиторий fintrack-vibe
4. Указать root directory: `api`
5. Настроить PostgreSQL (вместо SQLite)
6. Обновить `VITE_API_URL` в Netlify

---

### 8. Миграция с SQLite на PostgreSQL

**Почему:** Для продакшена нужна PostgreSQL

**Шаги:**
- [ ] Обновить Gemfile: добавить `pg`, убрать `sqlite3` для production
- [ ] Обновить `database.yml` для production
- [ ] Запустить миграции на production БД

**Gemfile:**
```ruby
# Use sqlite3 as the database for Active Record in development
gem "sqlite3", ">= 2.1", group: :development

# Use PostgreSQL in production
gem "pg", "~> 1.5", group: :production
```

**database.yml:**
```yaml
production:
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  url: <%= ENV['DATABASE_URL'] %>
```

---

### 9. UX улучшения

**После интеграции с API:**
- [ ] Добавить Skeleton loaders при загрузке данных
- [ ] Добавить оптимистичные обновления UI
- [ ] Показывать ошибки API пользователю (toast notifications)
- [ ] Добавить Pull-to-refresh для обновления данных

---

### 10. Использовать Telegram UI компоненты

**Идеи для улучшения UX:**
- [ ] Использовать `tg.themeParams` для цветовой схемы
- [ ] Добавить `tg.HapticFeedback` при действиях
- [ ] Использовать `tg.MainButton` для добавления транзакций
- [ ] Добавить `tg.BackButton` для навигации
- [ ] Показывать фото пользователя из Telegram

---

## 📚 Документация для изучения

**Rails Associations:**
- https://guides.rubyonrails.org/association_basics.html

**React Query (для кэширования API):**
- https://tanstack.com/query/latest

**Telegram Mini Apps Advanced:**
- https://core.telegram.org/bots/webapps#themeparams
- https://core.telegram.org/bots/webapps#hapticfeedback

---

## 🎯 Критерий успеха следующей сессии

### ✅ Минимальный успех:
- Категории создаются автоматически при регистрации
- Дефолтный счет создается при регистрации
- Транзакции сохраняются в БД через API
- Данные загружаются из API после перезагрузки

### ✅ Идеальный результат:
- Полная интеграция с API
- Все CRUD операции работают
- Backend развернут на постоянном хостинге
- PostgreSQL настроена для production
- UX улучшения добавлены

---

## 💡 Архитектура после интеграции

**Ожидаемый flow:**

```
1. Пользователь открывает Mini App
   ↓
2. TelegramAuthContext инициализируется
   ↓
3. POST /api/auth/telegram
   ↓
4. Rails создает/находит пользователя
   ↓
5. Если новый: создать счет + категории
   ↓
6. Вернуть JWT токен
   ↓
7. Frontend загружает:
   - GET /api/categories (категории пользователя)
   - GET /api/accounts (счета пользователя)
   - GET /api/transactions (транзакции пользователя)
   ↓
8. Пользователь добавляет транзакцию
   ↓
9. POST /api/transactions
   ↓
10. Обновить UI с новой транзакцией
```

---

**Время на интеграцию:** ~3-4 часа
**Сложность:** Средняя 🟡

**Удачи! 🚀**

Последнее обновление: 2025-10-05 01:15 MSK
