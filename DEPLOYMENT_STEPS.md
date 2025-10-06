# 🚀 Пошаговая инструкция по деплою

## ✅ Что уже сделано:

1. ✅ **Git:** Все изменения закоммичены и запушены на GitHub
2. ✅ **Frontend:** Netlify автоматически начнет деплой (проверьте на netlify.com)
3. ✅ **Telegram Bot:** URL Mini App уже указывает на Netlify

---

## 📋 Следующие шаги:

### Шаг 1: Дождитесь деплоя Netlify

1. Зайдите на https://app.netlify.com/
2. Найдите ваш проект **fintrack-vibe**
3. Дождитесь окончания деплоя (обычно 2-3 минуты)
4. Проверьте, что деплой успешен (зеленая галочка ✅)

**URL вашего фронтенда:** https://fintrack-vibe.netlify.app (или ваш custom domain)

---

### Шаг 2: Запустите Backend через ngrok

1. **Убедитесь, что Rails API запущен:**
   ```bash
   cd api
   bundle exec rails server
   # Должен работать на http://localhost:3000
   ```

2. **Запустите ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Скопируйте ngrok URL:**
   ```
   Forwarding: https://xxxx-yyyy-zzzz.ngrok-free.app -> http://localhost:3000
   ```
   Скопируйте URL вида: `https://xxxx-yyyy-zzzz.ngrok-free.app`

---

### Шаг 3: Обновите CORS в Rails

Откройте `api/config/initializers/cors.rb` и добавьте ваш Netlify домен:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://fintrack-vibe.netlify.app', 'http://localhost:5173'

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

**Перезапустите Rails сервер:**
```bash
# Ctrl+C чтобы остановить
bundle exec rails server
```

---

### Шаг 4: Добавьте VITE_API_URL в Netlify

1. Зайдите на https://app.netlify.com/
2. Выберите ваш проект **fintrack-vibe**
3. Перейдите в **Site settings → Environment variables**
4. Нажмите **Add a variable**
5. Заполните:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-ngrok-url.ngrok-free.app/api` (используйте ваш ngrok URL!)
   - **Scopes:** ✅ Production, ✅ Deploy previews, ✅ Branch deploys
6. Нажмите **Save**

---

### Шаг 5: Пересоберите Netlify (чтобы применить переменную)

**Вариант 1: Через UI**
1. Перейдите в **Deploys**
2. Нажмите **Trigger deploy → Clear cache and deploy site**

**Вариант 2: Через Git**
```bash
git commit --allow-empty -m "Trigger Netlify rebuild"
git push
```

---

### Шаг 6: Проверьте работу в Telegram

1. **Откройте вашего Telegram бота**
2. **Запустите Mini App** (Menu → ваше приложение)
3. **Проверьте:**
   - ✅ Приложение загружается
   - ✅ Экран загрузки появляется
   - ✅ Пользователь автоматически авторизуется
   - ✅ Открывается Dashboard или Welcome страница

---

## 🐛 Проверка и отладка

### Проверьте ngrok

```bash
# В терминале с ngrok вы должны видеть запросы:
POST /api/auth/telegram    200 OK
GET  /api/accounts         200 OK
# и т.д.
```

### Проверьте Netlify Build Log

1. Netlify → Deploys → последний деплой
2. Посмотрите **Deploy log**
3. Убедитесь, что нет ошибок
4. Проверьте, что `VITE_API_URL` используется

### Проверьте DevTools в Telegram

1. Откройте Mini App в Telegram Desktop (не в мобильном!)
2. **Windows/Linux:** Ctrl+Shift+I
3. **Mac:** Cmd+Option+I
4. Перейдите на вкладку **Network**
5. Проверьте запросы к API

---

## ⚠️ Важные замечания

### Ngrok URL меняется
- ⚠️ **Бесплатный ngrok** генерирует новый URL при каждом перезапуске
- При изменении URL нужно:
  1. Обновить `VITE_API_URL` в Netlify
  2. Пересобрать Netlify (Trigger deploy)

### Решение: Постоянный хостинг для Backend

Рекомендуется развернуть Rails API на постоянном хостинге:

**Бесплатные варианты:**
1. **Railway.app** (рекомендуется)
   - 500 часов/месяц бесплатно
   - Автоматический деплой из Git
   - PostgreSQL database included

2. **Render.com**
   - Бесплатный tier
   - Деплой из GitHub
   - Засыпает после 15 мин неактивности

3. **Fly.io**
   - $5 бесплатных кредитов/месяц
   - Деплой из Git

---

## 📊 Checklist финального деплоя

### Frontend (Netlify):
- [ ] Деплой завершен успешно
- [ ] `VITE_API_URL` добавлена в Environment Variables
- [ ] Пересборка после добавления переменной выполнена
- [ ] URL доступен и загружается

### Backend (ngrok):
- [ ] Rails сервер запущен на localhost:3000
- [ ] ngrok запущен и работает
- [ ] ngrok URL скопирован
- [ ] CORS настроен с Netlify доменом

### Telegram Bot:
- [ ] Mini App URL указывает на Netlify
- [ ] Приложение открывается в Telegram
- [ ] Авторизация работает
- [ ] API запросы проходят успешно

---

## 🎯 После успешного деплоя

1. **Протестируйте все функции:**
   - Авторизация через Telegram
   - Навигация по разделам
   - (Пока моки) Добавление транзакций
   - Настройки

2. **Интегрируйте реальные данные:**
   - Dashboard с API
   - Транзакции из API
   - Счета из API

3. **Деплой на постоянный хостинг:**
   - Замените ngrok на Railway/Render
   - Обновите `VITE_API_URL` на постоянный URL

---

## 📞 Поддержка

Если что-то не работает:

1. **Проверьте логи ngrok** - видны ли запросы?
2. **Проверьте Netlify Deploy Log** - нет ли ошибок сборки?
3. **Проверьте DevTools в Telegram** - какие ошибки в консоли?
4. **Проверьте CORS** - добавлен ли Netlify домен?

---

**Удачи с деплоем! 🚀**

После завершения всех шагов ваше Telegram Mini App будет полностью работать!
