# 🚀 Инструкция по развёртыванию WiseTrack на VPS

## 📋 Требования

- VPS сервер (Ubuntu 20.04+ / Debian 11+)
- Docker и Docker Compose
- Доменное имя (или IP-адрес)
- Telegram Bot Token

## 🔧 Подготовка сервера

### 1. Установка Docker

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo apt install docker-compose-plugin -y

# Проверка установки
docker --version
docker compose version
```

### 2. Клонирование репозитория

```bash
# Клонируем проект
git clone <your-repo-url> fintrack
cd fintrack
```

### 3. Настройка переменных окружения

```bash
# Копируем шаблон
cp .env.example .env

# Редактируем файл
nano .env
```

Заполните следующие переменные:

```bash
# Telegram Bot Token (получить у @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# URL вашего домена или IP
WEBAPP_URL=https://your-domain.com

# Rails master key (generate with: docker compose run api bin/rails secret)
RAILS_MASTER_KEY=your_rails_master_key_here

# API URL для бота (внутренняя сеть Docker)
API_URL=http://api:80
```

### 4. Генерация Rails Master Key

```bash
# Генерируем secret key
docker compose run --rm api bin/rails secret

# Копируем результат в .env файл как RAILS_MASTER_KEY
```

## 🐳 Запуск приложения

### 1. Сборка и запуск контейнеров

```bash
# Собираем образы и запускаем
docker compose up -d --build
```

Это запустит 4 сервиса:
- **api** - Rails API (порт 3000)
- **web** - React frontend с Nginx (порт 80)
- **bot** - Telegram бот
- **cron** - Планировщик уведомлений (каждые 5 минут)

### 2. Инициализация базы данных

```bash
# Создание и миграция БД
docker compose exec api bin/rails db:create db:migrate

# Опционально: загрузка seed данных (если есть)
docker compose exec api bin/rails db:seed
```

### 3. Проверка статуса

```bash
# Проверяем запущенные контейнеры
docker compose ps

# Должны быть 4 контейнера со статусом "Up"
```

## 🔍 Проверка работы

### Проверка API
```bash
curl http://localhost:3000/up
# Должен вернуть: OK
```

### Проверка Web
```bash
curl http://localhost:80/health
# Должен вернуть: OK
```

### Просмотр логов
```bash
# Логи всех сервисов
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f api
docker compose logs -f web
docker compose logs -f bot
docker compose logs -f cron

# Логи cron уведомлений
docker compose exec api tail -f /rails/log/cron.log
```

## 🌐 Настройка домена и SSL

### Вариант 1: Nginx + Certbot на хосте

```bash
# Установка Nginx и Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# Создаем конфиг для домена
sudo nano /etc/nginx/sites-available/fintrack
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Активируем конфиг
sudo ln -s /etc/nginx/sites-available/fintrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Получаем SSL сертификат
sudo certbot --nginx -d your-domain.com
```

### Вариант 2: Traefik (рекомендуется для Docker)

Добавьте Traefik в `docker-compose.yml` для автоматического SSL.

## 🔄 Обновление приложения

```bash
# Получаем последние изменения
git pull origin main

# Пересобираем и перезапускаем контейнеры
docker compose up -d --build

# Применяем миграции (если есть)
docker compose exec api bin/rails db:migrate
```

## 🛠 Полезные команды

### Управление контейнерами
```bash
# Остановить все сервисы
docker compose stop

# Запустить все сервисы
docker compose start

# Перезапустить конкретный сервис
docker compose restart api

# Остановить и удалить контейнеры
docker compose down

# Удалить с volumes (ВНИМАНИЕ: удалит БД!)
docker compose down -v
```

### Работа с базой данных
```bash
# Подключиться к Rails консоли
docker compose exec api bin/rails console

# Бэкап базы данных
docker compose exec api sqlite3 /rails/storage/production.sqlite3 .dump > backup.sql

# Восстановление из бэкапа
cat backup.sql | docker compose exec -T api sqlite3 /rails/storage/production.sqlite3
```

### Мониторинг
```bash
# Использование ресурсов
docker stats

# Размер volumes
docker volume ls
docker volume inspect fintrack_api_storage
```

## 🐛 Troubleshooting

### Проблема: API не стартует
```bash
# Проверяем логи
docker compose logs api

# Проверяем переменные окружения
docker compose exec api env | grep RAILS
```

### Проблема: Бот не отправляет сообщения
```bash
# Проверяем токен
docker compose exec bot env | grep TELEGRAM_BOT_TOKEN

# Проверяем логи бота
docker compose logs bot
```

### Проблема: Уведомления не работают
```bash
# Проверяем логи cron
docker compose exec cron cat /rails/log/cron.log

# Проверяем, запущен ли cron
docker compose exec cron ps aux | grep cron
```

### Проблема: Не хватает места
```bash
# Очистка неиспользуемых образов
docker system prune -a

# Очистка volumes (ОСТОРОЖНО!)
docker volume prune
```

## 📊 Структура сервисов

```
┌─────────────────────────────────────────┐
│           VPS Server (port 80)          │
│  ┌────────────────────────────────────┐ │
│  │  Web (Nginx)                       │ │
│  │  - React статика                   │ │
│  │  - Reverse proxy /api/* → API      │ │
│  └────────────────────────────────────┘ │
│                    ↓                     │
│  ┌────────────────────────────────────┐ │
│  │  API (Rails)                       │ │
│  │  - REST API                        │ │
│  │  - SQLite БД                       │ │
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

## 🔒 Безопасность

1. **Не коммитьте** `.env` файл в git
2. **Используйте** сильные пароли для `RAILS_MASTER_KEY`
3. **Настройте** firewall на VPS
4. **Регулярно обновляйте** Docker образы
5. **Делайте бэкапы** базы данных

```bash
# Настройка firewall (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 📝 Примечания

- Cron запускается каждые 5 минут для отправки уведомлений
- SQLite БД хранится в Docker volume `api_storage`
- Логи сохраняются в volume `api_logs`
- Все контейнеры автоматически перезапускаются при падении

## 💡 Рекомендации для production

1. Настройте мониторинг (Prometheus + Grafana)
2. Настройте логирование (ELK stack или Loki)
3. Используйте CDN для статики
4. Настройте автоматические бэкапы
5. Используйте managed PostgreSQL вместо SQLite для высоких нагрузок
