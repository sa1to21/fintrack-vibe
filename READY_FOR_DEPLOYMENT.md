# ✅ Приложение готово к развёртыванию!

## 📦 Что включено в релиз

### 🐳 Docker Configuration
- ✅ **API Dockerfile** - Rails API с SQLite, Thruster, Cron
- ✅ **Web Dockerfile** - React + Vite → Nginx (multi-stage build)
- ✅ **Bot Dockerfile** - Python 3.11 + aiogram
- ✅ **docker-compose.yml** - 4 сервиса с health checks
- ✅ **nginx.conf** - Reverse proxy для `/api/*`
- ✅ **.dockerignore** - Оптимизированная сборка

### 🔔 Notification System
- ✅ **Автоматическое создание настроек** - при регистрации нового пользователя
- ✅ **Дефолтные параметры:**
  - Время: 20:00 (по timezone пользователя)
  - Дни: Все дни недели
  - Статус: Включено
- ✅ **Двуязычность** - Русский и английский
- ✅ **Локализованные сообщения:**
  - Форматирование времени (часы/дни назад)
  - Текст напоминания
  - Кнопки и команды
- ✅ **Cron планировщик** - каждые 5 минут

### 🌍 Internationalization
- ✅ Русский и английский интерфейс
- ✅ Автоопределение языка из Telegram
- ✅ Локализованные уведомления
- ✅ Локализованные дефолтные категории и счета

### 📊 Analytics
- ✅ Yandex Metrica интеграция
- ✅ Tracking пользователей через Telegram ID
- ✅ Webvisor, clickmap, ecommerce

### 🗄️ Database
- ✅ SQLite для production
- ✅ 4 базы данных (primary, cache, queue, cable)
- ✅ Хранение в Docker volumes для persistence
- ✅ Автоматические миграции

### 🔒 Security & Configuration
- ✅ Переменные окружения (.env.example)
- ✅ SSL disabled в API (handled by nginx)
- ✅ Health checks для всех сервисов
- ✅ Auto-restart политика

## 📋 Последние коммиты

```
c356da1 - feat: Add Yandex Metrica analytics and improve notifications
56767de - feat: Add Docker deployment configuration
8c50e26 - fix: Disable mouse wheel scroll and hide spinner arrows in number inputs
642d182 - feat: Add bilingual support for default accounts and categories
779c019 - feat: Replace emoji flags with SVG flag icons
```

## 🚀 Быстрый старт на VPS

### 1. Подготовка сервера

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin -y

# Клонирование репозитория
git clone https://github.com/sa1to21/fintrack-vibe.git fintrack
cd fintrack
```

### 2. Настройка DNS (Namecheap)

1. Войдите в Namecheap
2. Перейдите в **Advanced DNS**
3. Добавьте A-записи:
   - `@` → `YOUR_VPS_IP`
   - `www` → `YOUR_VPS_IP`
4. Подождите 15-30 минут

### 3. Конфигурация переменных окружения

```bash
cp .env.example .env
nano .env
```

Заполните:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
WEBAPP_URL=https://your-domain.com
RAILS_MASTER_KEY=<сгенерировать ниже>
API_URL=http://api:80
```

Получение RAILS_MASTER_KEY:
```bash
# Используйте ключ из файла api/config/master.key
cat api/config/master.key
# Скопируйте значение в .env (должно быть 32 символа)
```

### 4. Запуск приложения

```bash
# Сборка и запуск
docker compose up -d --build

# Создание БД
docker compose exec api bin/rails db:create db:migrate

# Проверка статуса
docker compose ps
```

### 5. Настройка SSL (после распространения DNS)

```bash
# Установка Nginx + Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# Создание конфига
sudo nano /etc/nginx/sites-available/fintrack
```

Вставьте:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активация и SSL
sudo ln -s /etc/nginx/sites-available/fintrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 6. Проверка работы

```bash
# Логи сервисов
docker compose logs -f

# Проверка уведомлений
docker compose exec cron cat /rails/log/cron.log

# Тестовая отправка уведомления
docker compose exec api bin/rails notifications:send_reminders
```

## 📚 Документация

Полная документация доступна в [DEPLOYMENT.md](DEPLOYMENT.md)

## 🎯 Архитектура

```
┌─────────────────────────────────────────┐
│    VPS Server (your-domain.com)         │
│  ┌────────────────────────────────────┐ │
│  │  Nginx (Host) - SSL/HTTPS          │ │
│  │  Port 443 → Port 8080 (Docker)     │ │
│  └────────────────────────────────────┘ │
│                    ↓                     │
│  ┌────────────────────────────────────┐ │
│  │  Web (Nginx) - Docker :8080        │ │
│  │  - React статика                   │ │
│  │  - Reverse proxy /api/* → API      │ │
│  └────────────────────────────────────┘ │
│                    ↓                     │
│  ┌────────────────────────────────────┐ │
│  │  API (Rails) - Docker :3000        │ │
│  │  - REST API                        │ │
│  │  - SQLite БД (4 databases)         │ │
│  │  - Thruster server                 │ │
│  └────────────────────────────────────┘ │
│           ↑                    ↑         │
│  ┌────────┴───────┐   ┌────────┴──────┐ │
│  │  Bot (Python)  │   │  Cron         │ │
│  │  - aiogram     │   │  - */5 * * *  │ │
│  │  - Telegram    │   │  - rake task  │ │
│  └────────────────┘   └───────────────┘ │
└─────────────────────────────────────────┘
```

## 🔔 Система уведомлений

### Дефолтные настройки для нового пользователя:
- **Время:** 20:00 (по timezone пользователя)
- **Дни недели:** Все дни (0-6)
- **Статус:** Включено
- **Timezone offset:** UTC+3 (Москва) по умолчанию

### Пример уведомления (RU):
```
💰 Напоминание от WiseTrack

Не забудь внести свои траты за сегодня!

📊 Последняя операция: 3 часа назад

💡 Полезные команды:
/why - Зачем нужен учёт финансов
/guide - Руководство по приложению

[💰 Открыть WiseTrack]
```

### Пример уведомления (EN):
```
💰 Reminder from WiseTrack

Don't forget to track your expenses today!

📊 Last transaction: 3 hours ago

💡 Useful commands:
/why - Why track finances
/guide - App guide

[💰 Open WiseTrack]
```

## 🛠 Управление на сервере

### Обновление приложения
```bash
git pull origin master
docker compose up -d --build
docker compose exec api bin/rails db:migrate
```

### Просмотр логов
```bash
docker compose logs -f api
docker compose logs -f cron
docker compose logs -f bot
docker compose logs -f web
```

### Бэкап базы данных
```bash
docker compose exec api sqlite3 /rails/storage/production.sqlite3 .dump > backup-$(date +%Y%m%d).sql
```

### Перезапуск сервисов
```bash
docker compose restart api
docker compose restart cron
docker compose restart bot
```

## ✨ Готово к production!

Все изменения закоммичены и запушены в репозиторий.
Приложение полностью готово к развёртыванию на VPS.

**Следующий шаг:** Настройте VPS и следуйте инструкциям выше! 🚀
