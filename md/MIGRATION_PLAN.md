# План миграции финансового трекера

## Обзор проекта
Миграция существующего React + Vite приложения (FIGMA AI generated) на Next.js с последующим созданием Ruby on Rails API.

**Текущее состояние:**
- ✅ React + TypeScript + Vite приложение готово
- ✅ UI компоненты на Radix UI + Tailwind CSS
- ✅ Mock данные для транзакций
- ✅ Полная функциональность фронтенда

---

## 🚀 Фаза 1: Миграция на Next.js

### Задачи:
- [ ] 1.1 Создать новый Next.js проект с App Router
- [ ] 1.2 Перенести компоненты из `web/src/components` в Next.js структуру
- [ ] 1.3 Настроить Tailwind CSS и Radix UI
- [ ] 1.4 Адаптировать роутинг (убрать state-based navigation, использовать Next.js router)
- [ ] 1.5 Создать layout компоненты и страницы
- [ ] 1.6 Настроить TypeScript конфигурацию
- [ ] 1.7 Протестировать функциональность

### Структура Next.js проекта:
```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Welcome/Dashboard)
│   │   ├── analytics/
│   │   ├── education/
│   │   ├── settings/
│   │   ├── transactions/
│   │   └── accounts/
│   ├── components/
│   │   ├── ui/ (Radix UI компоненты)
│   │   ├── WelcomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ...
│   └── lib/
│       ├── types.ts
│       └── utils.ts
```

---

## 🔥 Фаза 2: Ruby on Rails API

### Задачи:
- [ ] 2.1 Создать новый Rails API проект
- [ ] 2.2 Настроить CORS для фронтенда
- [ ] 2.3 Создать модели: User, Account, Transaction, Category
- [ ] 2.4 Реализовать API endpoints:
  - [ ] `/api/auth` (аутентификация)
  - [ ] `/api/users` (профиль пользователя)
  - [ ] `/api/accounts` (CRUD счетов)
  - [ ] `/api/transactions` (CRUD транзакций)
  - [ ] `/api/categories` (категории)
  - [ ] `/api/analytics` (статистика и аналитика)
- [ ] 2.5 Добавить валидацию и сериализацию
- [ ] 2.6 Настроить базу данных (PostgreSQL)
- [ ] 2.7 Добавить тесты

### API Структура:
```ruby
# Models
class User < ApplicationRecord
  has_many :accounts
  has_many :transactions, through: :accounts
end

class Account < ApplicationRecord
  belongs_to :user
  has_many :transactions
end

class Transaction < ApplicationRecord
  belongs_to :account
  belongs_to :category
end

class Category < ApplicationRecord
  has_many :transactions
end
```

---

## 🔗 Фаза 3: Интеграция фронтенда и API

### Задачи:
- [ ] 3.1 Заменить mock данные на API вызовы
- [ ] 3.2 Добавить состояние загрузки и обработку ошибок
- [ ] 3.3 Реализовать аутентификацию (JWT или sessions)
- [ ] 3.4 Добавить клиентскую валидацию форм
- [ ] 3.5 Оптимизировать производительность (кэширование, lazy loading)
- [ ] 3.6 Добавить real-time обновления (websockets/SSE)

### HTTP Client Setup:
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  transactions: {
    getAll: () => fetch(`${API_BASE_URL}/api/transactions`),
    create: (data) => fetch(`${API_BASE_URL}/api/transactions`, { method: 'POST', body: JSON.stringify(data) }),
    // ...
  }
}
```

---

## 🚀 Фаза 4: Деплой и производство

### Задачи:
- [ ] 4.1 Настроить деплой фронтенда на Vercel
- [ ] 4.2 Настроить деплой Rails API на Railway/Heroku
- [ ] 4.3 Настроить production базу данных
- [ ] 4.4 Добавить мониторинг и логирование
- [ ] 4.5 Настроить CI/CD pipeline
- [ ] 4.6 Добавить резервное копирование БД

### Деплой стратегия:
- **Frontend**: Vercel (автодеплой из GitHub)
- **Backend**: Railway или Heroku
- **Database**: PostgreSQL (Railway/Heroku Postgres)
- **File Storage**: Cloudinary или AWS S3 (если нужно)

---

## 📝 Технические детали

### Зависимости для Next.js:
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "@radix-ui/react-*": "latest",
    "lucide-react": "latest",
    "react-hook-form": "^7.0.0",
    "recharts": "^2.0.0"
  }
}
```

### Rails Gemfile:
```ruby
gem 'rails', '~> 7.0'
gem 'pg'
gem 'rack-cors'
gem 'jwt'
gem 'bcrypt'
gem 'active_model_serializers'
gem 'bootsnap'
gem 'puma'
```

---

## ⚡ Альтернативные подходы

1. **Full-stack Next.js** - API routes + Prisma + PostgreSQL
2. **Node.js + Express** - Единая экосистема JavaScript
3. **Supabase Backend** - Готовый BaaS с auth и real-time

---

## 📅 Временные рамки

- **Фаза 1**: 1-2 дня (миграция на Next.js)
- **Фаза 2**: 2-3 дня (Rails API)
- **Фаза 3**: 1-2 дня (интеграция)
- **Фаза 4**: 1 день (деплой)

**Итого**: ~1 неделя для MVP