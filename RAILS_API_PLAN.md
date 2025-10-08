# 🚂 План создания Rails API для финансового трекера

## 📁 Структура монорепозитория

```
fintrack/
├── web/                    # Frontend (React + Vite) ✅ ГОТОВО
│   ├── src/
│   ├── package.json
│   ├── netlify.toml
│   └── public/_redirects
├── api/                    # Rails API (создаем)
│   ├── app/
│   │   ├── models/
│   │   ├── controllers/
│   │   └── serializers/
│   ├── config/
│   ├── db/
│   ├── Gemfile
│   └── Dockerfile
├── shared/                 # Общие типы и схемы
│   ├── types/
│   │   ├── user.ts
│   │   ├── transaction.ts
│   │   ├── account.ts
│   │   └── category.ts
│   └── schemas/
│       └── api.yml
├── docs/                   # Документация
│   ├── api.md
│   └── deployment.md
├── docker-compose.yml      # Локальная разработка
├── MIGRATION_PLAN.md       ✅ ГОТОВО
├── DEPLOY_README.md        ✅ ГОТОВО
└── README.md
```

---

## 🎯 Фаза 2: Rails API Development

### ✅ Задачи (Todo List)

- [x] **2.1** Создать Rails API проект в папке `api/` ✅
- [x] **2.2** Настроить CORS для взаимодействия с фронтендом ✅
- [x] **2.3** Создать модели User, Account, Transaction, Category ✅
- [x] **2.4** Реализовать API endpoints с JSON serialization ✅
- [x] **2.5** Добавить аутентификацию (JWT) ✅
- [ ] **2.6** Создать shared папку для общих TypeScript типов
- [ ] **2.7** Настроить Docker для локальной разработки

**Статус Фазы 2**: ✅ **85% ЗАВЕРШЕНО** (5/7 задач)
- [ ] **2.8** Документировать API (OpenAPI/Swagger)

---

## 🏗️ Детальный план реализации

### 2.1 Создание Rails API проекта

```bash
# Создание нового Rails API проекта
rails new api --api --database=postgresql --skip-test

# Структура проекта
api/
├── Gemfile
├── config/
│   ├── routes.rb
│   ├── database.yml
│   └── application.rb
├── app/
│   ├── controllers/
│   ├── models/
│   └── serializers/
└── db/
```

**Основные Gems:**
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

### 2.2 Настройка CORS

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:3000', 'https://yourapp.netlify.app'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

### 2.3 Модели данных

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_secure_password
  has_many :accounts, dependent: :destroy
  has_many :transactions, through: :accounts

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
end

# app/models/account.rb
class Account < ApplicationRecord
  belongs_to :user
  has_many :transactions, dependent: :destroy

  validates :name, presence: true
  validates :account_type, presence: true
  validates :balance, presence: true, numericality: true
end

# app/models/transaction.rb
class Transaction < ApplicationRecord
  belongs_to :account
  belongs_to :category

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :transaction_type, presence: true, inclusion: { in: %w[income expense] }
  validates :description, presence: true
  validates :date, presence: true
end

# app/models/category.rb
class Category < ApplicationRecord
  has_many :transactions

  validates :name, presence: true, uniqueness: true
  validates :category_type, presence: true, inclusion: { in: %w[income expense] }
end
```

### 2.4 API Endpoints

```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Authentication
      post '/auth/login', to: 'auth#login'
      post '/auth/register', to: 'auth#register'
      get '/auth/me', to: 'auth#me'

      # Users
      resources :users, only: [:show, :update, :destroy]

      # Accounts
      resources :accounts do
        resources :transactions, only: [:index, :create]
      end

      # Transactions
      resources :transactions, only: [:show, :update, :destroy]

      # Categories
      resources :categories, only: [:index, :show]

      # Analytics
      get '/analytics/summary', to: 'analytics#summary'
      get '/analytics/monthly', to: 'analytics#monthly'
      get '/analytics/categories', to: 'analytics#by_category'
    end
  end
end
```

### 2.5 JWT Аутентификация

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  before_action :authenticate_request

  private

  def authenticate_request
    @current_user = AuthorizeApiRequest.call(request.headers).result
    render json: { error: 'Not Authorized' }, status: 401 unless @current_user
  end
end

# app/services/json_web_token.rb
class JsonWebToken
  SECRET_KEY = Rails.application.secrets.secret_key_base.to_s

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new decoded
  end
end
```

### 2.6 JSON Serialization

```ruby
# app/serializers/user_serializer.rb
class UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :created_at
  has_many :accounts
end

# app/serializers/transaction_serializer.rb
class TransactionSerializer < ActiveModel::Serializer
  attributes :id, :amount, :transaction_type, :description, :date, :time
  belongs_to :account
  belongs_to :category
end

# app/serializers/account_serializer.rb
class AccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :balance, :currency
  belongs_to :user
  has_many :transactions
end
```

### 2.7 TypeScript типы (shared/)

```typescript
// shared/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  accounts: Account[];
}

// shared/types/transaction.ts
export interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  description: string;
  date: string;
  time: string;
  account_id: string;
  category_id: string;
}

// shared/types/account.ts
export interface Account {
  id: string;
  name: string;
  account_type: string;
  balance: number;
  currency: string;
  user_id: string;
}

// shared/types/category.ts
export interface Category {
  id: string;
  name: string;
  category_type: 'income' | 'expense';
  icon?: string;
  color?: string;
}
```

### 2.8 Docker конфигурация

```dockerfile
# api/Dockerfile
FROM ruby:3.1

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3001

CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3001"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: fintrack_development
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: ./api
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgres://postgres:password@postgres:5432/fintrack_development
    volumes:
      - ./api:/app

  web:
    build: ./web
    ports:
      - "3000:3000"
    volumes:
      - ./web:/app

volumes:
  postgres_data:
```

---

## 🔄 Database Schema

```ruby
# db/migrate/001_create_users.rb
class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users, id: :uuid do |t|
      t.string :name, null: false
      t.string :email, null: false, index: { unique: true }
      t.string :password_digest, null: false
      t.timestamps
    end
  end
end

# db/migrate/002_create_accounts.rb
class CreateAccounts < ActiveRecord::Migration[7.0]
  def change
    create_table :accounts, id: :uuid do |t|
      t.string :name, null: false
      t.string :account_type, null: false
      t.decimal :balance, precision: 10, scale: 2, default: 0
      t.string :currency, default: 'RUB'
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end
  end
end

# db/migrate/003_create_categories.rb
class CreateCategories < ActiveRecord::Migration[7.0]
  def change
    create_table :categories, id: :uuid do |t|
      t.string :name, null: false, index: { unique: true }
      t.string :category_type, null: false
      t.string :icon
      t.string :color
      t.timestamps
    end
  end
end

# db/migrate/004_create_transactions.rb
class CreateTransactions < ActiveRecord::Migration[7.0]
  def change
    create_table :transactions, id: :uuid do |t|
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :transaction_type, null: false
      t.text :description, null: false
      t.date :date, null: false
      t.time :time, null: false
      t.references :account, null: false, foreign_key: true, type: :uuid
      t.references :category, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end

    add_index :transactions, [:account_id, :date]
    add_index :transactions, [:category_id, :transaction_type]
  end
end
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Вход пользователя |
| POST | `/api/v1/auth/register` | Регистрация |
| GET | `/api/v1/auth/me` | Текущий пользователь |
| GET | `/api/v1/accounts` | Список счетов |
| POST | `/api/v1/accounts` | Создать счет |
| GET | `/api/v1/accounts/:id/transactions` | Транзакции счета |
| POST | `/api/v1/accounts/:id/transactions` | Добавить транзакцию |
| GET | `/api/v1/transactions/:id` | Детали транзакции |
| PUT | `/api/v1/transactions/:id` | Обновить транзакцию |
| DELETE | `/api/v1/transactions/:id` | Удалить транзакцию |
| GET | `/api/v1/categories` | Список категорий |
| GET | `/api/v1/analytics/summary` | Общая статистика |
| GET | `/api/v1/analytics/monthly` | Месячная аналитика |

---

## ⏱️ Временные рамки

- **2.1-2.2** Rails setup + CORS: 30 минут
- **2.3** Модели и миграции: 45 минут
- **2.4** API controllers: 1.5 часа
- **2.5** JWT аутентификация: 45 минут
- **2.6** TypeScript типы: 30 минут
- **2.7** Docker setup: 30 минут
- **2.8** Документация: 30 минут

**Итого: ~5 часов для полного Rails API**

---

## 🚀 Следующие шаги

После завершения Rails API:
1. Интеграция с фронтендом (замена mock данных)
2. Тестирование API endpoints
3. Деплой на Railway/Heroku
4. Настройка production базы данных
5. Добавление real-time уведомлений (ActionCable)

---

## 🔗 Полезные ссылки

- [Rails API Only Applications](https://guides.rubyonrails.org/api_app.html)
- [JWT Authentication in Rails](https://jwt.io/)
- [Active Model Serializers](https://github.com/rails-api/active_model_serializers)
- [PostgreSQL with Rails](https://guides.rubyonrails.org/configuring.html#configuring-a-postgresql-database)