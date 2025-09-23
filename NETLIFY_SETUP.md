# 🚀 Настройка Netlify для FinTrack

## 📁 Особенности монорепозитория

Поскольку фронтенд находится в папке `web/`, а не в корне репозитория, необходимо настроить Netlify для правильной работы с подпапкой.

---

## 🔧 Способ 1: Автоматическая настройка (netlify.toml)

✅ **УЖЕ НАСТРОЕНО** - файл `web/netlify.toml` уже создан:

```toml
[build]
  base = "web"          # Базовая директория для сборки
  publish = "dist"      # Папка с собранными файлами
  command = "npm run build"  # Команда сборки

[build.environment]
  NODE_VERSION = "18"   # Версия Node.js

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200          # SPA роутинг

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 🔗 Способ 2: Подключение через GitHub

### Шаг 1: Подключение репозитория

1. Перейдите на [netlify.com](https://netlify.com)
2. Нажмите **"New site from Git"**
3. Выберите **GitHub**
4. Найдите репозиторий `sa1to21/fintrack-vibe`
5. Нажмите **"Deploy site"**

### Шаг 2: Настройки будут применены автоматически

Благодаря `netlify.toml` все настройки применятся автоматически:
- ✅ Base directory: `web`
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`
- ✅ Node.js version: 18

---

## 🛠️ Способ 3: Ручная настройка (если автонастройка не сработала)

Если автоматические настройки не применились:

### Build Settings:
```
Base directory: web
Build command: npm run build
Publish directory: web/dist
```

### Environment Variables:
```
NODE_VERSION = 18
```

### Deploy Settings:
```
Branch to deploy: master
```

---

## 📋 Пошаговая инструкция деплоя

### 1. Подключение репозитория
- Заходим на [netlify.com](https://netlify.com)
- Авторизуемся через GitHub
- "Sites" → "Add new site" → "Import an existing project"
- GitHub → `sa1to21/fintrack-vibe`

### 2. Настройка сборки
```
Repository: https://github.com/sa1to21/fintrack-vibe
Branch: master
Base directory: web
Build command: npm run build
Publish directory: web/dist
```

### 3. Деплой
- Нажмите **"Deploy site"**
- Ожидайте завершения сборки (~2-3 минуты)
- Получите уникальный URL вида `https://magical-name-123456.netlify.app`

### 4. Настройка домена (опционально)
- Site settings → Domain management
- Add custom domain
- Настройте DNS записи

---

## ⚡ Что происходит при деплое

1. **Netlify клонирует репозиторий**
2. **Переходит в папку `web/`** (base directory)
3. **Устанавливает зависимости:** `npm install`
4. **Собирает проект:** `npm run build`
5. **Публикует содержимое `web/dist/`**
6. **Настраивает редиректы для SPA**

---

## 🔍 Проверка деплоя

После успешного деплоя проверьте:

- ✅ Главная страница загружается
- ✅ Навигация между страницами работает
- ✅ SPA роутинг функционирует (обновление страницы не дает 404)
- ✅ Стили и компоненты отображаются корректно
- ✅ Mock данные загружаются

---

## 🐛 Решение проблем

### Проблема: "Build failed"
```bash
# Локальная проверка сборки
cd web
npm install
npm run build
```

### Проблема: "Page not found" при навигации
- Проверьте файл `web/public/_redirects`
- Должен содержать: `/*    /index.html   200`

### Проблема: Стили не загружаются
- Проверьте правильность путей в `vite.config.ts`
- Убедитесь что `base` directory установлен как `web`

### Проблема: Неправильная папка деплоя
- Измените Publish directory на `web/dist`
- Или обновите netlify.toml

---

## 📊 Результат

После успешного деплоя получите:
- 🌐 **Live URL:** `https://your-app.netlify.app`
- 🔄 **Автодеплой** при push в GitHub
- 🔒 **HTTPS** из коробки
- 📱 **PWA support** готов
- ⚡ **CDN** глобальное распространение

---

## 🚀 Следующие шаги

1. **Протестируйте приложение** на live URL
2. **Настройте custom domain** (опционально)
3. **Создайте Rails API** по `RAILS_API_PLAN.md`
4. **Интегрируйте фронт с API**
5. **Настройте production БД**

**Время деплоя: ~5 минут** 🎉

---

## 📞 Поддержка

**Официальная документация:**
- [Netlify Deployment](https://docs.netlify.com/site-deploys/create-deploys/)
- [Monorepo Deployment](https://docs.netlify.com/configure-builds/monorepos/)
- [SPA Routing](https://docs.netlify.com/routing/redirects/)