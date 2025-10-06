# 🎯 Финальная настройка - Инструкция

## ✅ Текущий статус

### Backend (Rails API):
- 🟢 **Запущен локально:** http://localhost:3000
- 🟢 **Ngrok URL:** https://16d821e5fef4.ngrok-free.app
- 🟢 **CORS настроен** для Netlify и ngrok

### Frontend:
- 🟢 **Netlify URL:** https://financetrack21.netlify.app
- 🟢 **Деплой:** Успешен
- ⚠️ **Требуется:** Добавить переменную окружения

---

## 📋 Что нужно сделать СЕЙЧАС:

### 1. Добавьте VITE_API_URL в Netlify

1. **Зайдите на Netlify:**
   - Откройте https://app.netlify.com/
   - Найдите проект **financetrack21**

2. **Перейдите в Environment Variables:**
   - Site settings → Build & deploy → Environment variables
   - ИЛИ прямая ссылка: Site settings → Environment variables

3. **Добавьте переменную:**
   - Нажмите **"Add a variable"** или **"New variable"**
   - Заполните:
     ```
     Key: VITE_API_URL
     Value: https://16d821e5fef4.ngrok-free.app/api
     ```
   - **Важно:** URL должен заканчиваться на `/api`
   - Scopes: ✅ All (Production, Deploy previews, Branch deploys)
   - Нажмите **Save**

4. **Пересоберите сайт:**
   - Перейдите в **Deploys**
   - Нажмите **"Trigger deploy"**
   - Выберите **"Clear cache and deploy site"**
   - Дождитесь окончания деплоя (~2-3 минуты)

---

## 🧪 Тестирование

### После деплоя проверьте:

1. **Откройте Telegram бота**
2. **Запустите Mini App**
3. **Проверьте:**
   - ✅ Приложение загружается (экран загрузки)
   - ✅ Автоматическая авторизация через Telegram
   - ✅ Открывается Welcome или Dashboard страница

### Отладка (если не работает):

**Проверьте в DevTools (Telegram Desktop):**
1. Откройте Mini App в Telegram Desktop
2. Нажмите **Ctrl+Shift+I** (Windows) или **Cmd+Option+I** (Mac)
3. Перейдите на вкладку **Network**
4. Обновите страницу
5. Найдите запрос `/api/auth/telegram`
6. Проверьте:
   - Status должен быть **200 OK** или **201 Created**
   - Если **CORS error** - проверьте, что ngrok URL доступен
   - Если **Network Error** - проверьте переменную VITE_API_URL

**Проверьте ngrok:**
В терминале с ngrok вы должны видеть входящие запросы:
```
POST /api/auth/telegram    200 OK
GET  /api/v1/categories    200 OK
```

---

## 📝 Важные замечания

### Ngrok URL меняется!
- ⚠️ **Бесплатный ngrok** генерирует новый URL при каждом перезапуске
- **Текущий URL:** https://16d821e5fef4.ngrok-free.app
- При перезапуске ngrok нужно:
  1. Скопировать новый URL
  2. Обновить `VITE_API_URL` в Netlify
  3. Пересобрать сайт (Trigger deploy)

### Постоянное решение:
Разверните Rails API на постоянном хостинге:
- **Railway.app** (рекомендуется)
- **Render.com**
- **Fly.io**

После деплоя на постоянный хостинг:
1. Обновите `VITE_API_URL` на постоянный URL
2. Больше не нужно будет использовать ngrok

---

## 🎯 Checklist финальной проверки

- [ ] Rails сервер запущен локально
- [ ] Ngrok запущен и работает
- [ ] CORS обновлен в Rails (файл сохранен)
- [ ] Rails перезапущен с новым CORS
- [ ] `VITE_API_URL` добавлена в Netlify
- [ ] Netlify пересобрал сайт
- [ ] Mini App открывается в Telegram
- [ ] Авторизация работает
- [ ] API запросы проходят (видно в DevTools)

---

## 🚀 Результат

После выполнения всех шагов:

1. **Пользователи открывают** Telegram Mini App
2. **Frontend загружается** с https://financetrack21.netlify.app
3. **Автоматическая авторизация** через Telegram ID
4. **API запросы идут** на https://16d821e5fef4.ngrok-free.app/api
5. **Backend обрабатывает** и возвращает данные
6. **Все работает!** 🎉

---

## 📞 Если что-то не работает

1. **Проверьте логи ngrok** - видны ли запросы?
   ```
   В терминале с ngrok должны появляться строки с POST/GET
   ```

2. **Проверьте Netlify Build Log:**
   - Deploys → последний деплой → Deploy log
   - Убедитесь что `VITE_API_URL` используется при сборке

3. **Проверьте DevTools в Telegram:**
   - Network tab
   - Console tab (ошибки красным)

4. **Проверьте переменную окружения:**
   - Site settings → Environment variables
   - `VITE_API_URL` должна быть там

---

**Удачи! После этих шагов все заработает!** 🚀

---

## 📋 Краткая версия для быстрого старта:

```bash
# 1. Netlify - добавьте переменную
VITE_API_URL=https://16d821e5fef4.ngrok-free.app/api

# 2. Netlify - пересоберите
Trigger deploy → Clear cache and deploy site

# 3. Telegram - откройте Mini App
Готово! ✅
```
