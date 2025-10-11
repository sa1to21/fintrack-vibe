# FinTrack - Telegram Mini App для управления финансами

Современное веб-приложение для учета личных финансов, интегрированное с Telegram.

## 🚀 Текущее состояние проекта

**Статус**: ✅ В разработке
**Версия**: 0.2.0
**Последнее обновление**: 11 октября 2025

### 📊 Статистика

- **Backend**: Rails 8.0.3 + SQLite
- **Frontend**: React 18 + TypeScript + Vite
- **Bundle Size**: 220 KB первая загрузка (72 KB gzip) ✨ **-65% оптимизация!**
- **Performance**: First Load ~300ms (3G), TTI ~600ms
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
- [x] **Перевод между счетами** ✨

### ✅ Категории
- [x] Предустановленные категории (6 расходов + 3 доходов)
- [x] Emoji иконки из API
- [x] Фильтрация по типу (доход/расход)
- [x] Автоматическое создание при регистрации

### ✅ Транзакции
- [x] Создание операций (доход/расход)
- [x] **Редактирование транзакций** ✨
- [x] **Редактирование переводов** ✨ NEW!
- [x] **Удаление транзакций** ✨
- [x] **Удаление переводов** ✨ NEW!
- [x] **Переводы между счетами с UUID-паирингом** ✨
- [x] Проверка баланса (предотвращение отрицательного)
- [x] Специальные уведомления "Недостаточно средств"
- [x] История операций
- [x] Детальный просмотр с иконками
- [x] Отображение переводов с фиолетовым UI и стрелками "откуда → куда"

### ✅ Фильтрация и поиск
- [x] Поиск по описанию и категории
- [x] **DateRangePicker с календарем** ✨
  - Быстрые периоды: всё время, неделя, месяц, 3 месяца, год
  - Кастомный диапазон дат
  - Календарь по кнопке (не сразу)
  - Скролл для PC версии
  - **Дефолтный фильтр "Всё время"** (показывает все операции)
- [x] Фильтр по типу операций (включая "Только переводы")
- [x] Фильтр по счетам

### ✅ Дашборд
- [x] Общий баланс с глазком для скрытия
- [x] Карточки счетов (первые 4 в grid 2x2, ограничение показа до 4)
- [x] Статистика за месяц (доходы/расходы)
- [x] Последние 3 операции с отображением переводов
- [x] **Дедупликация переводов** - каждый перевод показывается один раз
- [x] Быстрые действия
- [x] Правильное название месяца (динамическое)
- [x] Отображение переводов с фиолетовым значком и стрелкой
- [x] Отображение баланса счета при создании операций

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
- [x] Framer Motion анимации (оптимизированные, без hover эффектов на списках)
- [x] Tailwind CSS стилизация
- [x] Toast уведомления (sonner)
- [x] Скелетоны загрузки
- [x] Градиентные фоны
- [x] **Защита от переполнения текста** - обрезка длинных названий счетов и категорий
- [x] **Вертикальная компоновка переводов** в деталях (для длинных названий)

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
│   │   │   ├── TransferPage.tsx               # ✨ Переводы
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ManageAccountsPage.tsx
│   │   │   ├── DateRangePicker.tsx            # ✨ Новый компонент
│   │   │   └── ui/                            # shadcn/ui компоненты
│   │   ├── services/
│   │   │   ├── accounts.service.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── transactions.service.ts
│   │   │   ├── transfers.service.ts           # ✨ Новый сервис
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
VITE_API_URL=https://b0089b101bb1.ngrok-free.app/api/v1
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

### Переводы
- `POST /api/v1/transfers` - **Создать перевод между счетами** ✨
- `PUT /api/v1/transfers/:transfer_id` - **Обновить перевод** ✨ NEW!
- `DELETE /api/v1/transfers/:transfer_id` - **Удалить перевод** ✨ NEW!

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

### 5. Переводы между счетами
- Атомарные операции (expense + income)
- Проверка баланса перед переводом
- Выбор счета с отображением баланса
- Автоматическая фильтрация (нельзя перевести на тот же счет)
- Кнопка в быстрых действиях (при наличии 2+ счетов)

---

## 📈 Метрики производительности

### ✅ Оптимизировано! (v0.2.0)
- **Bundle size**: 220 KB первая загрузка (72 KB gzip) ✨ **-65%**
- **CSS**: 90 KB (12.6 KB gzip)
- **First Load**: ~300ms (3G) → **-62%** ⚡
- **Time to Interactive**: ~600ms → **-60%** ⚡
- **Code splitting**: 52 chunks для оптимальной загрузки

### Было vs Стало
| Метрика | До | После | Улучшение |
|---------|-------|--------|-----------|
| Bundle (первая загрузка) | 657 KB | 220 KB | **-65%** |
| Gzip | 197 KB | 72 KB | **-63%** |
| First Load (3G) | ~800ms | ~300ms | **-62%** |
| Time to Interactive | ~1500ms | ~600ms | **-60%** |

### Применённые оптимизации
- ✅ Tree-shaking для Lucide icons
- ✅ Code splitting с React.lazy для всех страниц
- ✅ Manual chunks (react-vendor, motion, ui-radix, charts, date)
- ✅ Terser minification с drop_console
- ✅ Удаление всех debug console.log (40+ instances)
- ✅ Suspense boundaries для lazy loading

---

## 🐛 Известные проблемы

### Решенные ✅
- ✅ Моки в списке операций - удалены
- ✅ Название месяца не менялось - исправлено
- ✅ Счета не отображались в деталях - исправлено
- ✅ Время неправильно в "Все операции" - исправлено
- ✅ Горизонтальный скролл счетов - пока отложен
- ✅ Календарь обрезался на PC - добавлен скролл
- ✅ Hover анимации вызывали сдвиг элементов - удалены
- ✅ Переводы не отображались в деталях правильно - исправлено
- ✅ Длинные названия счетов ломали layout - добавлена обрезка
- ✅ Операции загружались только с первого счета - исправлено
- ✅ Переводы дублировались в последних операциях - добавлена дедупликация
- ✅ Фильтр "месяц" по умолчанию скрывал старые операции - изменен на "всё время"

### В работе 🔄
- ✅ Оптимизация bundle size - **ЗАВЕРШЕНО** (v0.2.0)

---

## 📝 История изменений

### [2025-10-11] - Масштабная оптимизация производительности (v0.2.0)
- ⚡ **Оптимизация bundle на 65%** - с 657 KB до 220 KB первой загрузки
- 🚀 **Code Splitting с React.lazy**
  - Все страницы загружаются по требованию через lazy()
  - Добавлены Suspense boundaries с loading states
  - 52 chunk файла для оптимальной загрузки
- 🌳 **Tree-shaking для иконок**
  - Создан barrel file (web/src/components/icons/index.ts)
  - Импорт только используемых иконок из lucide-react
  - Заменены импорты во всех 13 компонентах
- 🧹 **Удаление debug кода**
  - Удалены все console.log (40+ instances)
  - Оставлены только критичные console.error
  - Чистый production код
- 🔧 **Vite оптимизация**
  - Manual chunks: react-vendor (139 KB), motion (55 KB), ui-radix (86 KB), date (51 KB)
  - Terser minification с drop_console и drop_debugger
  - Улучшенное кеширование благодаря раздельным vendor chunks
- 📊 **Результаты**
  - First Load: 800ms → 300ms (-62%)
  - Time to Interactive: 1500ms → 600ms (-60%)
  - Gzip size: 197 KB → 72 KB (-63%)
- 📝 Обновлена документация с новыми метриками

### [2025-10-11] - Фильтрация, дедупликация переводов и UI-фиксы
- ✨ **Добавлен фильтр "Всё время"** в DateRangePicker
  - Новая опция показывает все операции без фильтрации по дате
  - Установлен как дефолтный период в AllTransactionsPage
  - Улучшена логика getDateRange() с поддержкой null (без фильтра)
- 🐛 **Исправлена дедупликация переводов в последних операциях**
  - Добавлено поле transferId в Transaction интерфейс DashboardPage
  - Реализована дедупликация через Set с отслеживанием seen transfer_id
  - Переводы теперь показываются один раз вместо двух
- 🐛 **Удалены hover анимации на списках транзакций**
  - Убраны whileHover эффекты, вызывавшие сдвиг layout
  - Оставлен hover:bg-blue-50/50 для визуального feedback
- 🐛 **Исправлена загрузка транзакций со всех счетов**
  - DashboardPage и AllTransactionsPage загружают данные со ВСЕХ счетов
  - Используется Promise.all для параллельной загрузки
  - Изменена сортировка с date+time на createdAt timestamp
- 🎨 **UI улучшения для переводов**
  - Вертикальная компоновка в деталях операции (откуда/куда)
  - Обрезка длинных названий счетов (10 символов для переводов, 22 для обычных)
  - Добавлены flex-shrink-0 и min-w-0 для защиты от overflow
  - Скрыты кнопки редактирования/удаления для переводов
- 🎨 **Добавлено отображение баланса счетов**
  - При создании операции рядом со счётом показывается его баланс
  - Формат совпадает с TransferPage для консистентности
- 🔧 **Добавлены console.log для отладки**
  - Логи создания транзакций с датой/временем
  - Детальные логи фильтрации переводов по датам
  - Отслеживание загрузки и форматирования данных
- 📝 Обновлена документация с текущим состоянием

### [2025-10-10] - Отображение переводов и UI улучшения
- ✨ **Реализовано отображение переводов в последних операциях**
  - Добавлены поля transfer_id (string, UUID) и paired_transaction_id в transactions
  - Backend создает связанные пары транзакций с общим UUID
  - Фиолетовый значок ArrowRightLeft для переводов
  - Формат плашки "Откуда → Куда" для переводов
- 🎨 **Улучшен layout дашборда**
  - Изменено отображение счетов: первые 4 в grid 2x2
  - Ограничен показ счетов до 4 максимум
  - Увеличен padding в карточках операций (p-4 → p-5)
- 🐛 **Исправлено отображение последних операций**
  - Восстановлена рабочая структура layout
  - Description показывается только для обычных операций
  - Правильное выравнивание элементов
- 🔧 **Backend изменения**
  - Миграция для изменения transfer_id с integer на string
  - TransfersController генерирует UUID и связывает транзакции
  - Transaction модель с методами transfer? и paired_transaction
- 📝 Обновлена документация с текущим состоянием

### [2025-10-09] - Переводы и редактирование
- ✨ **Переводы между счетами** (TransferPage, TransfersController)
- ✨ Добавлено редактирование транзакций через API
- ✨ Добавлено удаление транзакций через API
- ✨ DateRangePicker с календарем в AllTransactionsPage
- ✨ Проверка недостаточности средств при редактировании и переводах
- 🎨 Улучшен DateRangePicker (календарь по кнопке, центрирование)
- 🎨 Кнопка переводов в быстрых действиях (при 2+ счетах)
- 🐛 Исправлено отображение времени в AllTransactionsPage
- 🐛 Исправлены иконки счетов в TransferPage
- 🐛 Центрирована иконка переводов между селектами
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
- **Current ngrok**: https://e1b06042c578.ngrok-free.app
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
2. ✅ Переводы между счетами - DONE
3. ⏳ Оптимизация производительности - PLANNED
4. ⏳ Горизонтальный скролл счетов - BACKLOG
5. ⏳ PWA поддержка - FUTURE

---

## 📄 License

MIT License - свободное использование

---

## 👨‍💻 Авторы

- **Разработка**: Dima Nikitenko (@Sa1to21)
- **AI Assistant**: Claude (Anthropic)

---

**Последнее обновление**: 10 октября 2025, 01:15 UTC+4
