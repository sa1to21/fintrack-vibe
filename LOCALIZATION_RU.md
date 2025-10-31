# Локализация WiseTrack - Краткая инструкция

## ✅ Что реализовано

1. **Система локализации react-i18next**
   - Поддержка русского и английского языков
   - Модульная структура переводов по разделам
   - Автоматическое определение языка при входе

2. **Логика определения языка:**
   - Если `language_code` в БД = `ru` → русский
   - Любой другой язык → английский (по умолчанию)

3. **Синхронизация:**
   - Язык хранится в БД (`users.language_code`)
   - Бот и приложение используют один источник
   - Смена языка в приложении → обновляется в БД → доступен в боте
   - Смена языка в боте → обновляется в БД → приложение видит при следующей загрузке

## 📁 Структура файлов

```
web/src/
  ├── i18n.ts                    # Конфигурация
  ├── locales/
  │   ├── ru/                    # Русские переводы
  │   │   ├── common.json        # Общие (кнопки, навигация)
  │   │   ├── dashboard.json
  │   │   ├── transactions.json
  │   │   ├── accounts.json
  │   │   ├── categories.json
  │   │   ├── analytics.json
  │   │   ├── settings.json
  │   │   └── education.json
  │   └── en/                    # Английские переводы
  │       └── ... (то же самое)
```

## 🚀 Как использовать

### В компонентах

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common'); // namespace

  return (
    <button>{t('buttons.save')}</button>
  );
}
```

### Смена языка

Уже реализовано в **Настройках → Язык**

Программно:
```tsx
import { useTelegramAuth } from '../contexts/TelegramAuthContext';

const { language, changeLanguage } = useTelegramAuth();

await changeLanguage('ru'); // или 'en'
```

## 📝 Добавление переводов

### 1. Добавить в оба JSON файла

**locales/ru/common.json:**
```json
{
  "myKey": "Мой текст"
}
```

**locales/en/common.json:**
```json
{
  "myKey": "My text"
}
```

### 2. Использовать в компоненте

```tsx
const { t } = useTranslation('common');
<span>{t('myKey')}</span>
```

## 🎯 Что нужно сделать дальше

### 1. Перевести остальные компоненты

Пока переведены только:
- ✅ BottomNavigation
- ✅ Settings (частично)

Нужно перевести:
- [ ] DashboardPage
- [ ] AddTransactionPage
- [ ] TransactionsPage
- [ ] ManageAccountsPage
- [ ] ManageCategoriesPage
- [ ] AnalyticsPage
- [ ] TransferPage
- [ ] И другие...

### 2. Процесс перевода компонента

Пример для DashboardPage:

#### a) Открыть компонент
```tsx
// web/src/components/DashboardPage.tsx
```

#### b) Добавить импорт
```tsx
import { useTranslation } from 'react-i18next';
```

#### c) Использовать хук
```tsx
function DashboardPage() {
  const { t } = useTranslation('dashboard');

  return (
    <h1>{t('title')}</h1> // вместо "Главная"
  );
}
```

#### d) Обновить переводы

Уже есть базовая структура в:
- `locales/ru/dashboard.json`
- `locales/en/dashboard.json`

Просто добавляй новые ключи по мере необходимости!

### 3. Полезные команды

```bash
# Сборка (проверка ошибок)
cd web && npm run build

# Запуск dev сервера
cd web && npm run dev
```

## 🔍 Где смотреть примеры

1. **BottomNavigation.tsx** - простой пример использования
2. **LanguageSwitcher.tsx** - пример смены языка с сохранением в БД
3. **SettingsPage.tsx** - использование языка из контекста

## 💡 Tips

1. Используй вложенные ключи для структуры:
   ```json
   {
     "buttons": {
       "save": "Сохранить",
       "cancel": "Отмена"
     }
   }
   ```

2. Общие переводы (кнопки, навигация) → `common.json`

3. Специфичные для страницы → отдельный namespace

4. При добавлении ключа - сразу добавляй в оба языка (ru + en)

## ❓ Частые вопросы

**Q: Как добавить новый язык (например, испанский)?**
A: Создай папку `locales/es/`, добавь все JSON файлы, импортируй в `i18n.ts`, обнови логику в `TelegramAuthContext`

**Q: Можно ли использовать переменные в переводах?**
A: Да! `t('welcome', { name: 'Иван' })` → "Привет, Иван!"

**Q: Где хранятся валюты?**
A: В `constants/currencies.ts` - они не переводятся, символы универсальные

## 🎉 Готово!

Основа локализации настроена. Теперь нужно постепенно переводить компоненты, используя созданную структуру.

Подробная документация: `web/LOCALIZATION.md`
