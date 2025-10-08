# FinTrack - Telegram Mini App для управления финансами

Современное веб-приложение для учета личных финансов, интегрированное с Telegram.

## 🚀 Текущее состояние проекта

**Статус**: ✅ В разработке
**Версия**: 0.1.0
**Последнее обновление**: 9 октября 2025

### 📊 Статистика

- **Backend**: Rails 8.0.3 + SQLite
- **Frontend**: React 18 + TypeScript + Vite
- **Bundle Size**: 639 КБ (194 КБ gzip)
- **Deployment**: Netlify (Frontend) + ngrok (API)

---

## 🎯 Реализованный функционал

### ✅ Авторизация
- [x] Telegram WebApp авторизация
- [x] JWT токены для API
- [x] Автоматическое создание пользователя при первом входе

### ✅ Управление счетами
- [x] CRUD операции со счетами
- [x] 3 типа счетов: Кошелек, Карта, Накопления
- [x] Автоматический расчет баланса
- [x] Создание дефолтного счета при регистрации
- [x] Клик на счета → переход к управлению

### ✅ Категории
- [x] Предустановленные категории (6 расходов + 3 доходов)
- [x] Emoji иконки из API
- [x] Фильтрация по типу (доход/расход)
- [x] Автоматическое создание при регистрации

### ✅ Транзакции
- [x] Создание операций (доход/расход)
- [x] **Редактирование транзакций** ✨
- [x] **Удаление транзакций** ✨
- [x] Проверка баланса (предотвращение отрицательного)
- [x] Специальные уведомления "Недостаточно средств"
- [x] История операций
- [x] Детальный просмотр с иконками

### ✅ Фильтрация и поиск
- [x] Поиск по описанию и категории
- [x] **DateRangePicker с календарем** ✨
  - Быстрые периоды: неделя, месяц, 3 месяца, год
  - Кастомный диапазон дат
  - Календарь по кнопке (не сразу)
  - Скролл для PC версии
- [x] Фильтр по типу операций
- [x] Фильтр по счетам

### ✅ Дашборд
- [x] Общий баланс с глазком для скрытия
- [x] Карточки счетов (первые 2 в grid, остальные в слайдере)
- [x] Статистика за месяц (доходы/расходы)
- [x] Последние 3 операции
- [x] Быстрые действия
- [x] Правильное название месяца (динамическое)

### ✅ Аналитика
- [x] Фильтрация по периодам
- [x] DateRangePicker интеграция
- [x] Статистика доходов/расходов
- [x] Распределение по категориям

### ✅ Настройки
- [x] Управление счетами
- [x] Удаление всех данных (для тестирования)
- [x] Информация о приложении

### ✅ UI/UX
- [x] Адаптивный дизайн
- [x] Framer Motion анимации
- [x] Tailwind CSS стилизация
- [x] Toast уведомления (sonner)
- [x] Скелетоны загрузки
- [x] Градиентные фоны

---

## 🛠 Технологический стек

### Backend (Rails API)
- **Framework**: Ruby on Rails 8.0.3
- **Database**: SQLite3
- **Auth**: JWT (jwt gem)
- **Serialization**: ActiveModel::Serializers
- **CORS**: rack-cors

**Основные модели**:
- User (telegram_id, username)
- Account (name, balance, account_type)
- Category (name, icon, category_type)
- Transaction (amount, transaction_type, date, time)

### Frontend (React)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner
- **HTTP Client**: Axios
- **Date Handling**: date-fns, react-day-picker

---

## 📁 Структура проекта

```
fintrack/
├── api/                          # Rails API Backend
│   ├── app/
│   │   ├── controllers/
│   │   │   └── api/
│   │   │       ├── telegram_auth_controller.rb
│   │   │       └── v1/
│   │   │           ├── accounts_controller.rb
│   │   │           ├── categories_controller.rb
│   │   │           ├── transactions_controller.rb
│   │   │           └── users_controller.rb
│   │   ├── models/
│   │   │   ├── user.rb
│   │   │   ├── account.rb
│   │   │   ├── category.rb
│   │   │   └── transaction.rb
│   │   └── serializers/
│   │       ├── account_serializer.rb
│   │       ├── category_serializer.rb
│   │       └── transaction_serializer.rb
│   └── config/
│       ├── routes.rb
│       └── initializers/cors.rb
│
├── web/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AddTransactionPage.tsx
│   │   │   ├── AllTransactionsPage.tsx
│   │   │   ├── TransactionDetailPage.tsx     # ✨ С редактированием
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ManageAccountsPage.tsx
│   │   │   ├── DateRangePicker.tsx            # ✨ Новый компонент
│   │   │   └── ui/                            # shadcn/ui компоненты
│   │   ├── services/
│   │   │   ├── accounts.service.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── transactions.service.ts
│   │   │   └── users.service.ts
│   │   ├── lib/
│   │   │   └── api.ts                         # Axios instance
│   │   └── App.tsx
│   └── package.json
│
├── OPTIMIZATION_PLAN.md          # ✨ План оптимизации
├── RAILS_API_PLAN.md             # Backend roadmap
└── README.md                      # Этот файл
```

---

## 🚀 Запуск проекта

### Предварительные требования
- Ruby 3.4.6
- Node.js 18+
- ngrok (для API туннеля)

### Backend (Rails API)
```bash
cd api
bundle install
bin/rails db:migrate
bin/rails s -p 3000

# В отдельном терминале - ngrok туннель
ngrok http 3000
```

### Frontend (React)
```bash
cd web
npm install

# Development
npm run dev

# Production build
npm run build
```

### Переменные окружения

**`.env.local`** (для разработки):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

**`.env.production`**:
```env
VITE_API_URL=https://e1e8f46f6a8a.ngrok-free.app/api/v1
```

---

## 🔗 API Endpoints

### Авторизация
- `POST /api/auth/telegram` - Telegram авторизация

### Счета
- `GET /api/v1/accounts` - Список счетов
- `POST /api/v1/accounts` - Создать счет
- `PATCH /api/v1/accounts/:id` - Обновить счет
- `DELETE /api/v1/accounts/:id` - Удалить счет

### Категории
- `GET /api/v1/categories` - Список категорий

### Транзакции
- `GET /api/v1/accounts/:account_id/transactions` - Список транзакций
- `POST /api/v1/accounts/:account_id/transactions` - Создать транзакцию
- `PUT /api/v1/transactions/:id` - **Обновить транзакцию** ✨
- `DELETE /api/v1/transactions/:id` - **Удалить транзакцию** ✨

### Пользователь
- `DELETE /api/v1/users/clear_data` - Удалить все данные пользователя

---

## 🎨 Ключевые фичи

### 1. DateRangePicker Component
Универсальный компонент выбора периода с:
- Быстрыми кнопками (неделя, месяц, 3 месяца, год)
- Календарем для кастомного диапазона
- Центрированным позиционированием
- Скроллом для PC версии

### 2. Редактирование транзакций
- Полное редактирование: сумма, тип, категория, счет, дата, описание
- Проверка баланса при изменении
- Специальные уведомления об ошибках
- API интеграция с rollback при ошибке

### 3. Умная фильтрация
- Поиск по тексту (описание, категория)
- Фильтр по типу операций
- Фильтр по счетам
- Фильтр по датам с календарем

### 4. Защита от отрицательного баланса
- Backend валидация при создании
- Backend валидация при редактировании
- Frontend проверка с понятными сообщениями
- Rollback транзакций при ошибке

---

## 📈 Метрики производительности

### Текущие показатели
- **Bundle size**: 639 КБ (194 КБ gzip)
- **CSS**: 90 КБ (12.6 КБ gzip)
- **First Load**: ~800ms (3G)
- **Time to Interactive**: ~1500ms

### Планы по оптимизации
См. `OPTIMIZATION_PLAN.md` для деталей:
- **Этап 1**: Tree shaking → ~500 КБ (-20%)
- **Этап 2**: Code splitting → ~300 КБ (-50%)
- **Этап 3**: Framer Motion + Tailwind → ~250 КБ (-60%)

---

## 🐛 Известные проблемы

### Решенные ✅
- ✅ Моки в списке операций - удалены
- ✅ Название месяца не менялось - исправлено
- ✅ Счета не отображались в деталях - исправлено
- ✅ Время неправильно в "Все операции" - исправлено
- ✅ Горизонтальный скролл счетов - пока отложен
- ✅ Календарь обрезался на PC - добавлен скролл

### В работе 🔄
- Горизонтальный скролл для счетов (>2)
- Оптимизация bundle size

---

## 📝 История изменений

### [2025-10-09] - Редактирование и оптимизация
- ✨ Добавлено редактирование транзакций через API
- ✨ Добавлено удаление транзакций через API
- ✨ DateRangePicker с календарем в AllTransactionsPage
- ✨ Проверка недостаточности средств при редактировании
- 🎨 Улучшен DateRangePicker (календарь по кнопке, центрирование)
- 🐛 Исправлено отображение времени в AllTransactionsPage
- 🐛 Добавлен скролл в DateRangePicker для PC
- 📝 Создан OPTIMIZATION_PLAN.md

### [2025-10-08] - Интеграция с API
- ✨ Интеграция фронтенда с Rails API
- ✨ Загрузка счетов, категорий, транзакций из API
- ✨ Создание транзакций через API
- ✨ Автосоздание дефолтного счета и категорий
- 🐛 Исправлена валидация баланса
- 🐛 Исправлено отображение месяца
- 🎨 Обновлен дизайн главной страницы

### [2025-10-07] - Rails API
- ✨ Создан Rails API backend
- ✨ Модели: User, Account, Category, Transaction
- ✨ Telegram авторизация
- ✨ JWT токены
- ✨ CORS настройка

### [2025-10-06] - React Frontend
- ✨ Создан React frontend с TypeScript
- ✨ Routing между страницами
- ✨ UI компоненты (shadcn/ui)
- ✨ Анимации (Framer Motion)

---

## 🔐 Безопасность

- JWT токены с истечением
- CORS настройка для защиты API
- Валидация на backend и frontend
- Sanitization пользовательского ввода
- ngrok-skip-browser-warning headers

---

## 🚀 Deployment

### Frontend (Netlify)
- **URL**: https://financetrack21.netlify.app
- **Auto-deploy**: При push в master
- **Build command**: `cd web && npm run build`
- **Publish directory**: `web/dist`

### Backend (ngrok + local)
- **Current ngrok**: https://e1e8f46f6a8a.ngrok-free.app
- **Local**: http://localhost:3000
- **Note**: Обновлять `.env.production` при смене ngrok URL

---

## 📚 Дополнительная документация

- [RAILS_API_PLAN.md](./RAILS_API_PLAN.md) - Roadmap backend'а
- [OPTIMIZATION_PLAN.md](./OPTIMIZATION_PLAN.md) - План оптимизации bundle
- [web/README.md](./web/README.md) - Frontend документация

---

## 🤝 Contributing

Проект в активной разработке. Основные задачи:
1. ✅ Редактирование транзакций - DONE
2. ⏳ Оптимизация производительности - PLANNED
3. ⏳ Горизонтальный скролл счетов - BACKLOG
4. ⏳ PWA поддержка - FUTURE

---

## 📄 License

MIT License - свободное использование

---

## 👨‍💻 Авторы

- **Разработка**: Dima Nikitenko (@Sa1to21)
- **AI Assistant**: Claude (Anthropic)

---

**Последнее обновление**: 9 октября 2025, 02:30 UTC+4
