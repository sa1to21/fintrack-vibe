# 🔌 Руководство по интеграции API

## ✅ Что уже сделано

### Backend (Rails API)
- ✅ API запущен на `http://localhost:3000`
- ✅ База данных SQLite настроена и мигрирована
- ✅ Эндпоинты готовы:
  - `/api/auth/register` - Регистрация
  - `/api/auth/login` - Вход
  - `/api/auth/logout` - Выход
  - `/api/accounts` - Управление счетами
  - `/api/categories` - Управление категориями
  - `/api/transactions` - Управление транзакциями

### Frontend (React + Vite)
- ✅ Axios установлен
- ✅ API клиент создан ([web/src/lib/api.ts](web/src/lib/api.ts))
- ✅ Сервисы для работы с API:
  - [web/src/services/auth.service.ts](web/src/services/auth.service.ts)
  - [web/src/services/accounts.service.ts](web/src/services/accounts.service.ts)
  - [web/src/services/categories.service.ts](web/src/services/categories.service.ts)
  - [web/src/services/transactions.service.ts](web/src/services/transactions.service.ts)
- ✅ AuthContext для управления авторизацией ([web/src/contexts/AuthContext.tsx](web/src/contexts/AuthContext.tsx))
- ✅ Страница авторизации ([web/src/components/AuthPage.tsx](web/src/components/AuthPage.tsx))
- ✅ Переменные окружения настроены

---

## 🧪 Локальное тестирование

### 1. Запустите Backend (уже запущен)
```bash
cd api
bundle exec rails server
# Запущен на http://localhost:3000
```

### 2. Запустите Frontend
```bash
cd web
npm run dev
# Откроется на http://localhost:5173
```

### 3. Протестируйте авторизацию
1. Откройте `http://localhost:5173`
2. Перейдите на вкладку "Регистрация"
3. Заполните форму:
   - **Имя:** Test User
   - **Email:** test@example.com
   - **Пароль:** password123
4. Нажмите "Зарегистрироваться"
5. Вы должны автоматически войти в систему

### 4. Проверьте функциональность
После входа проверьте:
- ✅ Dashboard загружается
- ✅ Можно добавить транзакцию
- ✅ Можно создать счет
- ✅ Выход из системы работает

---

## 🌐 Деплой на Netlify + Ngrok

### Шаг 1: Запустите Backend через Ngrok

1. **Установите Ngrok** (если еще не установлен):
   ```bash
   # Windows (через Chocolatey)
   choco install ngrok

   # Или скачайте с https://ngrok.com/download
   ```

2. **Запустите ngrok для Rails API:**
   ```bash
   ngrok http 3000
   ```

3. **Скопируйте URL ngrok:**
   ```
   Forwarding: https://xxxx-xxxx-xxxx.ngrok.io -> http://localhost:3000
   ```
   Например: `https://1234-abcd-efgh.ngrok.io`

### Шаг 2: Обновите переменные окружения Netlify

1. Зайдите в **Netlify Dashboard**
2. Выберите ваш проект **FinTrack**
3. Перейдите в **Site settings → Environment variables**
4. Добавьте переменную:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-ngrok-url.ngrok.io/api`
   - **Scopes:** Production, Deploy previews, Branch deploys
5. Нажмите **Save**

### Шаг 3: Обновите CORS в Backend

В файле [api/config/initializers/cors.rb](api/config/initializers/cors.rb) добавьте ваш Netlify URL:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://your-netlify-app.netlify.app', 'http://localhost:5173'

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

Перезапустите Rails сервер:
```bash
cd api
bundle exec rails server
```

### Шаг 4: Передеплойте Frontend

```bash
git add .
git commit -m "Configure API integration with ngrok"
git push
```

Netlify автоматически пересоберет и задеплоит приложение с новыми переменными окружения.

---

## 📋 Структура переменных окружения

### Локальная разработка
Файл: `web/.env.local`
```env
VITE_API_URL=http://localhost:3000/api
```

### Production (Netlify)
Настраивается в **Netlify UI → Environment Variables**:
```env
VITE_API_URL=https://your-ngrok-url.ngrok.io/api
```

---

## 🔒 Важные замечания

### Ngrok ограничения:
- ⚠️ **URL меняется** при каждом перезапуске ngrok (если нет платного аккаунта)
- ⚠️ **Неоднократно обновляйте** `VITE_API_URL` в Netlify при изменении ngrok URL
- ⚠️ Для постоянного URL рассмотрите:
  - Ngrok Pro (постоянные домены)
  - Railway.app (бесплатный хостинг)
  - Render.com (бесплатный хостинг)
  - Fly.io (бесплатный хостинг)

### Безопасность:
- ✅ JWT токены хранятся в `localStorage`
- ✅ Автоматическая авторизация при каждом запросе через interceptor
- ✅ Автоматический logout при 401 ошибке

---

## 🐛 Решение проблем

### Frontend не подключается к API
1. Проверьте, что Rails API запущен
2. Проверьте URL в `.env.local` или Netlify Environment Variables
3. Откройте DevTools → Network и проверьте запросы
4. Проверьте CORS настройки в Rails

### Ошибка 401 Unauthorized
1. Проверьте, что токен сохраняется в localStorage (DevTools → Application → Local Storage)
2. Проверьте JWT секретный ключ в `api/config/initializers/jwt.rb`
3. Попробуйте выйти и войти заново

### Ngrok тоннель закрылся
1. Перезапустите ngrok: `ngrok http 3000`
2. Скопируйте новый URL
3. Обновите `VITE_API_URL` в Netlify
4. Передеплойте или дождитесь автоматического деплоя

---

## 🎯 Следующие шаги

Теперь, когда интеграция настроена:

1. ✅ **Локально:** Тестируйте функциональность
2. 🌐 **Ngrok:** Запустите ngrok и обновите Netlify
3. 🚀 **Продакшен:** Рассмотрите постоянный хостинг для API
4. 📊 **Интеграция:** Подключите реальные данные в Dashboard и другие компоненты

---

## 📚 Дополнительные ресурсы

- [Rails CORS документация](https://github.com/cyu/rack-cors)
- [Ngrok документация](https://ngrok.com/docs)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Axios документация](https://axios-http.com/docs/intro)
