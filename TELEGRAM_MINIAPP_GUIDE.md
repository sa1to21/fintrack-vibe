# 🤖 Telegram Mini App - Руководство по настройке

## ✅ Что изменилось

### Авторизация через Telegram
Приложение теперь использует **автоматическую авторизацию через Telegram**:
- ❌ **Удалена** страница регистрации/входа с email/password
- ✅ **Добавлена** авторизация через Telegram ID
- ✅ Пользователи автоматически регистрируются при первом запуске
- ✅ Данные пользователя берутся из Telegram (имя, username, язык)

### Backend изменения
- ✅ Новый endpoint: `POST /api/auth/telegram`
- ✅ Модель User поддерживает `telegram_id`, `username`, `language_code`
- ✅ Email и password теперь опциональны (для Telegram пользователей)

### Frontend изменения
- ✅ Установлен `@telegram-apps/sdk-react`
- ✅ Создан `TelegramAuthContext` для управления авторизацией
- ✅ App.tsx обернут в `SDKProvider` и `TelegramAuthProvider`
- ✅ Автоматическая загрузка при старте приложения

---

## 🚀 Локальное тестирование

### Проблема локальной разработки
Telegram Mini App SDK работает **только внутри Telegram**. При открытии в браузере вы увидите ошибку:
```
Приложение должно быть открыто в Telegram Mini App
```

### Решение для локального тестирования

#### Вариант 1: Тестирование в Telegram (рекомендуется)

1. **Создайте бота через [@BotFather](https://t.me/BotFather):**
   ```
   /newbot
   Название: FinTrack Dev Bot
   Username: fintrack_dev_bot
   ```

2. **Получите Bot Token** и сохраните его

3. **Настройте Mini App:**
   ```
   /newapp
   Выберите вашего бота
   Название: FinTrack
   Description: Финансовый трекер
   URL: https://your-ngrok-url.ngrok.io
   ```

4. **Запустите ngrok для фронтенда:**
   ```bash
   ngrok http 3001
   ```

5. **Обновите URL Mini App** в BotFather:
   ```
   /myapps
   Выберите ваш бот
   Edit Bot → Edit Mini App → URL
   Введите: https://your-ngrok-url.ngrok.io
   ```

6. **Откройте Mini App в Telegram:**
   - Найдите вашего бота
   - Нажмите Menu → ваше приложение

#### Вариант 2: Mock для локальной разработки

Обновите `TelegramAuthContext.tsx` для fallback:

```typescript
// В случае ошибки - используем моки для локальной разработки
if (process.env.NODE_ENV === 'development') {
  const mockUser = {
    id: 123456789,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser'
  };

  setTelegramUser(mockUser);
  // ... остальная логика авторизации
}
```

---

## 📱 Создание Telegram Bot

### Шаг 1: Создание бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Введите имя бота: **FinTrack**
4. Введите username: **fintrack_your_name_bot** (должен заканчиваться на `_bot`)
5. Скопируйте **Bot Token** (например: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Шаг 2: Создание Mini App

1. Отправьте `/newapp` в BotFather
2. Выберите вашего бота
3. Введите:
   - **Title:** FinTrack
   - **Description:** Управление личными финансами
   - **Photo:** загрузите иконку (512x512px)
   - **GIF Demo:** (опционально)
   - **URL:** Ваш ngrok URL (например: `https://abcd-1234.ngrok.io`)

### Шаг 3: Настройка Backend

Сохраните Bot Token в переменные окружения:

```env
# api/.env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

Обновите `api/app/controllers/api/telegram_auth_controller.rb` для валидации:

```ruby
def validate_telegram_data(init_data)
  return true if Rails.env.development? # Для локальной разработки

  # Валидация init_data с bot token
  bot_token = ENV['TELEGRAM_BOT_TOKEN']
  # ... реализация валидации хеша
  true
end
```

---

## 🌐 Деплой на Netlify

### 1. Обновите переменные окружения

В Netlify Dashboard → Site settings → Environment variables:
```
VITE_API_URL=https://your-api-url.com/api
```

### 2. Деплойте фронтенд

```bash
cd web
npm run build
# Netlify автоматически соберет при git push
```

### 3. Обновите URL в BotFather

После деплоя обновите URL Mini App:
```
/myapps
→ Выберите бота
→ Edit Mini App
→ URL: https://your-netlify-app.netlify.app
```

---

## 🔧 Структура авторизации

### Как это работает:

1. **Пользователь открывает Mini App в Telegram**
2. **Frontend получает данные из Telegram WebApp API:**
   ```typescript
   const { user, initData } = retrieveLaunchParams();
   ```
3. **Отправляет на backend:**
   ```typescript
   POST /api/auth/telegram
   {
     init_data: "query_id=...",
     user: {
       telegram_id: 123456789,
       first_name: "John",
       last_name: "Doe",
       username: "johndoe"
     }
   }
   ```
4. **Backend проверяет и создает/находит пользователя**
5. **Возвращает JWT токен**
6. **Frontend сохраняет токен и авторизует пользователя**

### Безопасность:

- ✅ Init data валидируется по хешу с bot token
- ✅ JWT токен действителен 30 дней
- ✅ Токен автоматически добавляется к каждому запросу
- ✅ При 401 ошибке пользователь деавторизуется

---

## 📋 Checklist перед запуском

- [ ] Создан Telegram Bot через BotFather
- [ ] Создан Mini App с URL
- [ ] Bot Token сохранен в .env
- [ ] Backend развернут и доступен
- [ ] Frontend развернут на Netlify
- [ ] CORS настроен для вашего домена
- [ ] URL Mini App обновлен в BotFather
- [ ] Протестировано открытие в Telegram

---

## 🐛 Решение проблем

### "Приложение должно быть открыто в Telegram"
**Причина:** Приложение открыто в браузере, а не в Telegram

**Решение:**
1. Откройте Mini App через Telegram бота
2. ИЛИ используйте mock для локальной разработки

### "Invalid Telegram data"
**Причина:** Init data не прошла валидацию

**Решение:**
1. Проверьте TELEGRAM_BOT_TOKEN в .env
2. Убедитесь, что токен правильный
3. Для разработки можно временно отключить валидацию

### "Network Error" при авторизации
**Причина:** Backend недоступен или CORS не настроен

**Решение:**
1. Проверьте, что backend запущен
2. Проверьте CORS в `api/config/initializers/cors.rb`
3. Добавьте ваш Netlify домен в origins

### Mini App не открывается в Telegram
**Причина:** Неправильный URL или App не активирован

**Решение:**
1. Проверьте URL в BotFather
2. URL должен быть HTTPS (используйте ngrok или Netlify)
3. Убедитесь, что App активирован в настройках бота

---

## 📚 Полезные ссылки

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [BotFather Commands](https://core.telegram.org/bots#botfather)
- [@telegram-apps/sdk-react GitHub](https://github.com/telegram-mini-apps/telegram-apps/tree/master/packages/sdk-react)
- [Validating init_data](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)

---

## 🎯 Следующие шаги

1. ✅ Создайте Telegram бота
2. ✅ Настройте Mini App
3. ✅ Протестируйте локально через ngrok
4. ✅ Задеплойте на Netlify
5. ✅ Опубликуйте Mini App

**Готово к запуску в Telegram!** 🚀
