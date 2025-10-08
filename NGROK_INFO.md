# 🌐 Ngrok Configuration

**Дата:** 2025-10-08
**Текущий URL:** https://09f792ab62c1.ngrok-free.app

---

## ✅ Что сделано:

1. **Rails конфигурация обновлена:**
   - Файл: [api/config/environments/development.rb](api/config/environments/development.rb)
   - URL добавлен в `config.hosts`

2. **Документация обновлена:**
   - [CURRENT_STATUS.md](CURRENT_STATUS.md) - обновлен ngrok URL

---

## 🔧 Как использовать:

### Для тестирования в браузере:
- URL: https://f8cab2efe083.ngrok-free.app
- При первом заходе ngrok покажет warning - нажать "Visit Site"

### Для API запросов (curl/Postman):
```bash
# Добавить заголовок для обхода browser warning
curl https://f8cab2efe083.ngrok-free.app/api/v1/categories \
  -H "ngrok-skip-browser-warning: true"
```

### Для использования во Frontend:
```typescript
// В web/src/lib/api.ts axios уже настроен с baseURL
// Обновить переменную окружения VITE_API_URL на Netlify:
VITE_API_URL=https://f8cab2efe083.ngrok-free.app
```

---

## 📋 Checklist при смене ngrok URL:

- [ ] Обновить `api/config/environments/development.rb`
- [ ] Обновить `CURRENT_STATUS.md`
- [ ] Обновить переменную `VITE_API_URL` на Netlify
- [ ] Перезапустить Rails server (если нужно)
- [ ] Протестировать endpoint

---

## ⚠️ Важно:

- Ngrok бесплатный tier генерирует новый URL при каждом перезапуске
- Для production использовать постоянный хостинг (Railway/Render)
- Regex паттерн `/\.ngrok-free\.app$/` позволяет работать любым ngrok URL

---

**Последнее обновление:** 2025-10-07 (автоматически при смене URL)
