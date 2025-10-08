# План оптимизации приложения FinTrack

## Текущее состояние
- **Bundle size**: 639 КБ (194 КБ gzip)
- **CSS**: 90 КБ (12.6 КБ gzip)
- **Проблема**: Приложение лагает на мобильных устройствах
- **Цель**: Уменьшить размер до 250-300 КБ без потери функционала

---

## 1. Code Splitting (Приоритет: ВЫСОКИЙ)
**Экономия**: ~40-50% от начальной загрузки

### Что делать:
- Внедрить lazy loading для страниц через `React.lazy()`
- Разделить приложение на chunks по маршрутам

### Реализация:
```tsx
// App.tsx
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./components/DashboardPage'));
const AddTransactionPage = lazy(() => import('./components/AddTransactionPage'));
const AllTransactionsPage = lazy(() => import('./components/AllTransactionsPage'));
const AnalyticsPage = lazy(() => import('./components/AnalyticsPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const TransactionDetailPage = lazy(() => import('./components/TransactionDetailPage'));

// В рендере обернуть в Suspense:
<Suspense fallback={<div>Loading...</div>}>
  {currentPage === 'dashboard' && <DashboardPage />}
  {currentPage === 'add-transaction' && <AddTransactionPage />}
  // ...
</Suspense>
```

### Результат:
- Первая загрузка: только Dashboard + core (~150-200 КБ)
- Остальные страницы подгружаются по требованию

---

## 2. Framer Motion оптимизация (Приоритет: СРЕДНИЙ)
**Экономия**: ~30-40 КБ

### Что делать:
- Заменить простые анимации на CSS
- Использовать `motion` только для сложных интерактивных элементов

### Где можно заменить на CSS:
- Fade in/out анимации
- Простые slide transitions
- Hover эффекты
- Scale анимации

### Оставить Framer Motion:
- Gesture detection (swipe, drag)
- Сложные spring animations
- AnimatePresence для условного рендера

### Пример замены:
```tsx
// Было (Framer Motion):
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// Стало (CSS):
<div className="animate-fade-in">

// В Tailwind или CSS:
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
```

---

## 3. Tree Shaking для иконок Lucide (Приоритет: ВЫСОКИЙ)
**Экономия**: ~20-30 КБ

### Текущая проблема:
```tsx
// Импортируем весь пакет иконок:
import { ArrowLeft, Edit, Trash2, Save, Calendar, ... } from "lucide-react"
```

### Решение:
```tsx
// Импортируем только нужные иконки:
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left"
import Edit from "lucide-react/dist/esm/icons/edit"
import Trash2 from "lucide-react/dist/esm/icons/trash-2"
```

### Альтернатива (проще):
Создать файл `web/src/components/icons/index.ts`:
```tsx
export { ArrowLeft } from "lucide-react/dist/esm/icons/arrow-left"
export { Edit } from "lucide-react/dist/esm/icons/edit"
export { Trash2 } from "lucide-react/dist/esm/icons/trash-2"
// ... все используемые иконки
```

Затем во всех компонентах:
```tsx
import { ArrowLeft, Edit, Trash2 } from '@/components/icons'
```

---

## 4. Tailwind CSS оптимизация (Приоритет: СРЕДНИЙ)
**Экономия**: ~30-40 КБ

### Текущий размер: 90 КБ (12.6 КБ gzip)

### Что делать:
1. Настроить PurgeCSS в `tailwind.config.js`:
```js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Убрать неиспользуемые утилиты
  safelist: [], // Добавить только критичные классы
}
```

2. Отключить неиспользуемые плагины Tailwind
3. Использовать CSS переменные для повторяющихся значений

---

## 5. Vite Bundle Optimization (Приоритет: ВЫСОКИЙ)
**Экономия**: Лучший кеш, параллельная загрузка

### Настройка в `vite.config.ts`:
```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделить на vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-components': [
            '@/components/ui/button',
            '@/components/ui/card',
            '@/components/ui/input',
            // ... все UI компоненты
          ],
          'motion': ['framer-motion'],
          'icons': ['lucide-react'],
        }
      }
    },
    // Минификация
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Удалить console.log в production
        drop_debugger: true,
      }
    }
  }
})
```

---

## 6. Удалить неиспользуемые зависимости (Приоритет: НИЗКИЙ)
**Экономия**: 10-20 КБ

### Что проверить:
1. Запустить: `npx depcheck`
2. Найти неиспользуемые пакеты
3. Проверить дубликаты функционала

---

## 7. Image optimization (Приоритет: НИЗКИЙ)
Если будут добавляться изображения:
- WebP формат вместо PNG/JPG
- Lazy loading для изображений
- Responsive images с srcset

---

## 8. Service Worker / PWA кеширование (Приоритет: СРЕДНИЙ)
**Результат**: Мгновенная загрузка при повторных визитах

### Что делать:
- Настроить Workbox или Vite PWA plugin
- Кешировать статические ресурсы
- Offline fallback

---

## Порядок внедрения (рекомендуемый):

### Этап 1 (Быстрые победы - 1-2 часа):
1. ✅ Tree Shaking для Lucide иконок
2. ✅ Vite bundle optimization (manualChunks)
3. ✅ Удалить console.log в production

**Ожидаемый результат**: ~500 КБ (-20%)

### Этап 2 (Code Splitting - 2-3 часа):
1. ✅ Lazy loading страниц
2. ✅ Suspense boundaries
3. ✅ Loading states

**Ожидаемый результат**: ~300-350 КБ (-50%)

### Этап 3 (Глубокая оптимизация - 3-4 часа):
1. ✅ Замена Framer Motion на CSS где возможно
2. ✅ Tailwind PurgeCSS
3. ✅ Проверка зависимостей

**Ожидаемый результат**: ~250-280 КБ (-60%)

### Этап 4 (PWA - опционально):
1. ✅ Service Worker
2. ✅ Offline support
3. ✅ App manifest

---

## Метрики для отслеживания:

### До оптимизации:
- Bundle: 639 КБ (194 КБ gzip)
- CSS: 90 КБ (12.6 КБ gzip)
- First Load: ~800ms (3G)
- Time to Interactive: ~1500ms

### Цель после оптимизации:
- Bundle: 250-300 КБ (80-100 КБ gzip)
- CSS: 50 КБ (8 КБ gzip)
- First Load: ~300ms (3G)
- Time to Interactive: ~600ms

---

## Инструменты для проверки:

1. **Bundle Analyzer**:
   ```bash
   npm install --save-dev rollup-plugin-visualizer
   npm run build -- --mode analyze
   ```

2. **Lighthouse** (Chrome DevTools):
   - Performance score
   - Bundle size
   - Unused JavaScript

3. **webpack-bundle-analyzer** альтернатива для Vite:
   ```bash
   npm install --save-dev vite-bundle-visualizer
   ```

---

## Заметки:

- Не оптимизировать раньше времени - сначала функционал
- Измерять before/after каждого изменения
- Тестировать на реальных мобильных устройствах
- Сохранять backup перед масштабными изменениями

---

**Статус**: 📋 План составлен, готов к реализации
**Дата создания**: 2025-10-09
**Автор**: Claude Code
