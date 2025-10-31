# Локализация приложения WiseTrack

## Обзор

Приложение поддерживает два языка:
- **Русский (ru)** - основной язык
- **English (en)** - английский язык (по умолчанию для всех языков кроме русского)

## Технологии

- **react-i18next** - библиотека для интернационализации
- **i18next** - ядро системы переводов

## Структура файлов

```
web/src/
  ├── i18n.ts                      # Конфигурация i18n
  └── locales/
      ├── ru/                       # Русские переводы
      │   ├── common.json           # Общие переводы (кнопки, навигация)
      │   ├── dashboard.json        # Главная страница
      │   ├── transactions.json     # Транзакции
      │   ├── accounts.json         # Счета
      │   ├── categories.json       # Категории
      │   ├── analytics.json        # Аналитика
      │   ├── settings.json         # Настройки
      │   └── education.json        # Обучение
      └── en/                       # Английские переводы
          ├── common.json
          ├── dashboard.json
          ├── transactions.json
          ├── accounts.json
          ├── categories.json
          ├── analytics.json
          ├── settings.json
          └── education.json
```

## Как использовать в компонентах

### Базовое использование

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('namespace'); // namespace: common, dashboard, etc.

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('buttons.save')}</button>
    </div>
  );
}
```

### Пример с пространством имен

```tsx
// Для общих переводов
const { t } = useTranslation('common');
<button>{t('buttons.save')}</button>

// Для настроек
const { t } = useTranslation('settings');
<h1>{t('title')}</h1>
```

### Использование нескольких namespaces

```tsx
const { t: tCommon } = useTranslation('common');
const { t: tSettings } = useTranslation('settings');

return (
  <>
    <h1>{tSettings('title')}</h1>
    <button>{tCommon('buttons.save')}</button>
  </>
);
```

## Логика определения языка

1. **При входе пользователя:**
   - Проверяется `language_code` из БД
   - Если в БД нет языка, используется автоопределение из Telegram
   - Если язык `ru` → приложение на русском
   - Любой другой язык → приложение на английском

2. **Смена языка:**
   - Пользователь переключает язык в Настройках → Язык
   - Язык сохраняется в БД через API
   - i18n автоматически обновляет интерфейс
   - Язык синхронизируется между ботом и приложением

## Добавление новых переводов

### 1. Добавить ключ в JSON файлы

**Русский** (`locales/ru/common.json`):
```json
{
  "myNewKey": "Мой новый текст",
  "nested": {
    "key": "Вложенный текст"
  }
}
```

**Английский** (`locales/en/common.json`):
```json
{
  "myNewKey": "My new text",
  "nested": {
    "key": "Nested text"
  }
}
```

### 2. Использовать в компоненте

```tsx
const { t } = useTranslation('common');

<p>{t('myNewKey')}</p>
<p>{t('nested.key')}</p>
```

## Добавление нового пространства имен

### 1. Создать файлы переводов

```
locales/ru/newNamespace.json
locales/en/newNamespace.json
```

### 2. Импортировать в i18n.ts

```typescript
import newNamespaceRu from './locales/ru/newNamespace.json';
import newNamespaceEn from './locales/en/newNamespace.json';

const resources = {
  ru: {
    // ...
    newNamespace: newNamespaceRu,
  },
  en: {
    // ...
    newNamespace: newNamespaceEn,
  },
};
```

### 3. Использовать в компоненте

```tsx
const { t } = useTranslation('newNamespace');
```

## API для смены языка

### В компонентах

```tsx
import { useTelegramAuth } from '../contexts/TelegramAuthContext';

function LanguageSwitcher() {
  const { language, changeLanguage } = useTelegramAuth();

  const handleChange = async () => {
    await changeLanguage('en'); // или 'ru'
  };

  return (
    <button onClick={handleChange}>
      Current: {language}
    </button>
  );
}
```

### Backend API endpoint

```
PATCH /api/v1/users/telegram/:telegram_id
{
  "language_code": "ru" // или "en"
}
```

## Best Practices

1. **Всегда используйте ключи** вместо хардкода текстов
2. **Группируйте переводы** по смыслу и функциональности
3. **Используйте вложенность** для логической структуры
4. **Не дублируйте** одинаковые переводы - выносите в common
5. **Проверяйте оба языка** при добавлении новых ключей

## Пример полной интеграции

```tsx
import { useTranslation } from 'react-i18next';
import { useTelegramAuth } from '../contexts/TelegramAuthContext';

function MyPage() {
  const { t } = useTranslation('dashboard');
  const { language, changeLanguage } = useTelegramAuth();

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>

      <button onClick={() => changeLanguage(language === 'ru' ? 'en' : 'ru')}>
        {language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
      </button>
    </div>
  );
}
```

## Troubleshooting

### Переводы не отображаются
- Проверьте, что файлы JSON корректны (валидный JSON)
- Убедитесь, что namespace импортирован в `i18n.ts`
- Проверьте правильность ключа в `t('key')`

### Язык не сохраняется
- Проверьте, что API endpoint работает
- Убедитесь, что пользователь авторизован
- Проверьте консоль на ошибки

### Build ошибки
- Убедитесь, что все JSON файлы имеют корректный синтаксис
- Проверьте импорты в `i18n.ts`
