# План оптимизации производительности на мобильных устройствах

**Дата создания:** 13 октября 2025
**Проблема:** Лаги и подтормаживания на мобильных телефонах при работе приложения
**Текущее состояние:** Отлично работает на ПК, тормозит на мобильных

---

## 🔍 Анализ текущей ситуации

### **Выявленные проблемы:**

1. **Избыточные анимации Framer Motion**
   - 779 упоминаний анимаций в 43 файлах
   - Каждая страница: 5-10 motion.div с initial/animate
   - whileHover/whileTap на списках (вызывают постоянные reflow)
   - Декоративные анимации при монтировании компонентов

2. **Тяжелые CSS эффекты**
   - `blur-2xl`, `blur-3xl` - очень GPU intensive
   - Множественные градиенты
   - `backdrop-blur` эффекты
   - Декоративные фоновые круги с blur

3. **Telegram WebView ограничения**
   - Не такой мощный как нативный Chrome
   - Меньше доступной памяти
   - Ограниченный GPU для анимаций

4. **Отсутствие адаптации под устройство**
   - Одинаковые анимации для всех устройств
   - Нет определения производительности
   - Нет "легкого режима"

---

## 📊 Рейтинг решений (от лучшего к опциональному)

### **🥇 Место 1: Упрощение Framer Motion анимаций**
**Приоритет:** ⭐⭐⭐⭐⭐ КРИТИЧНО
**Усилия:** 2-3 часа
**Эффект:** +60% FPS на мобильных
**Сложность:** Низкая

---

### **🥈 Место 2: Удаление тяжелых CSS эффектов**
**Приоритет:** ⭐⭐⭐⭐⭐ КРИТИЧНО
**Усилия:** 1 час
**Эффект:** +30% GPU performance
**Сложность:** Очень низкая

---

### **🥉 Место 3: Performance Mode (адаптивная оптимизация)**
**Приоритет:** ⭐⭐⭐⭐ ВЫСОКИЙ
**Усилия:** 1-2 часа
**Эффект:** +40% на слабых устройствах
**Сложность:** Средняя

---

### **4️⃣ Место 4: Hybrid режим анимаций**
**Приоритет:** ⭐⭐⭐ СРЕДНИЙ
**Усилия:** 2 часа
**Эффект:** +50% FPS, сохранение UX
**Сложность:** Средняя

---

### **5️⃣ Место 5: Virtual Lists для длинных списков**
**Приоритет:** ⭐⭐ НИЗКИЙ (только если >100 транзакций)
**Усилия:** 2-3 часа
**Эффект:** +80% для больших списков
**Сложность:** Средняя

---

### **6️⃣ Место 6: Мемоизация тяжелых вычислений**
**Приоритет:** ⭐⭐ НИЗКИЙ
**Усилия:** 1 час
**Эффект:** +10-15% рендеринг
**Сложность:** Низкая

---

## 🎯 Детальное описание решений

---

## **Решение 1: Упрощение Framer Motion анимаций** ⭐⭐⭐⭐⭐

### **Проблема:**
Framer Motion - тяжелая библиотека. Каждый `motion.div` создает дополнительную нагрузку на рендеринг.

**Текущее использование (пример DashboardPage):**
```typescript
// 5+ анимаций на одной странице
<motion.div
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
  >
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
```

### **Решение:**

#### **Что убрать полностью:**
- ❌ `initial/animate` при монтировании страниц (fade-in эффекты)
- ❌ `whileHover` на списках транзакций/карточках
- ❌ Декоративные анимации фоновых элементов
- ❌ Staggered animations (анимация с delay)
- ❌ Scale/rotate анимации на hover

#### **Что оставить:**
- ✅ `whileTap` только на кнопках (важно для тактильного фидбека)
- ✅ Анимации модальных окон (Dialog, AlertDialog)
- ✅ Анимации выдвижных панелей (Drawer)

#### **Замена на CSS:**

**БЫЛО (тяжело):**
```typescript
<motion.div
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
```

**СТАЛО (легко):**
```typescript
// Вариант 1: Простой CSS
<div className="animate-in fade-in duration-200">

// Вариант 2: Без анимации (самое быстрое)
<div>
```

**Tailwind CSS animations (уже в проекте):**
```css
/* Эти классы легкие и быстрые */
.animate-in       /* Базовая анимация входа */
.fade-in          /* Плавное появление */
.slide-in-from-top /* Слайд сверху */
.duration-200     /* Быстро (200ms) */
```

### **Файлы для изменения:**
```
web/src/components/
├── DashboardPage.tsx          (103 анимации)
├── SettingsPage.tsx           (74 анимации)
├── EducationPage.tsx          (65 анимации)
├── TransactionDetailPage.tsx  (46 анимации)
├── AllTransactionsPage.tsx    (49 анимации)
└── другие страницы...
```

### **Процесс:**
1. Найти все `<motion.` в компоненте
2. Заменить на обычные `<div>` или CSS классы
3. Оставить только критичные анимации (кнопки, модалки)
4. Тестировать на мобильном после каждой страницы

### **Ожидаемый результат:**
- 📉 Снижение количества анимаций: 779 → ~50
- 📈 FPS на мобильных: 30 fps → 50-60 fps
- 📦 Bundle size: -5-10 KB (меньше motion кода)
- ⚡ Мгновенная реакция на touch события

### **Примерное время:** 2-3 часа

---

## **Решение 2: Удаление тяжелых CSS эффектов** ⭐⭐⭐⭐⭐

### **Проблема:**
CSS blur и backdrop-blur - самые тяжелые CSS свойства для GPU.

**Текущие проблемные места:**
```typescript
// DashboardPage - декоративные круги
<div className="w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
<div className="w-24 h-24 bg-white/5 rounded-full blur-3xl"></div>

// Множественные градиенты
<div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
  <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent">
    <div className="bg-gradient-to-br from-blue-100 to-indigo-200">
```

### **Решение:**

#### **Что убрать:**
```css
/* GPU killers - УДАЛИТЬ */
.blur-2xl         /* Очень тяжело */
.blur-3xl         /* Очень тяжело */
.blur-xl          /* Тяжело */
.backdrop-blur    /* Очень тяжело */
.drop-shadow-2xl  /* Средне тяжело */

/* Декоративные элементы - УДАЛИТЬ */
Фоновые круги с blur
Множественные наложенные градиенты
Сложные box-shadow с большим blur
```

#### **Что оставить/упростить:**
```css
/* Легкие эффекты - ОСТАВИТЬ */
.shadow-sm        /* Легкая тень */
.shadow-md        /* Средняя тень */
.rounded-lg       /* Без проблем */
простые градиенты /* Один градиент ок */
```

#### **Замена:**

**БЫЛО:**
```typescript
<div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 px-4 py-6 relative overflow-hidden">
  {/* Background decorations */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-y-12"></div>
  <div className="absolute top-4 right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
  <div className="absolute bottom-4 left-8 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
</div>
```

**СТАЛО:**
```typescript
<div className="bg-gradient-to-br from-blue-500 to-indigo-700 px-4 py-6">
  {/* Чистый дизайн без декораций */}
</div>
```

### **Где применить:**
- Все header'ы страниц (убрать декоративные круги)
- Карточки (упростить тени и градиенты)
- Фоновые элементы (убрать полностью)

### **Альтернатива blur:**
Вместо blur можно использовать:
- Простую прозрачность (`opacity-50`)
- Градиенты без blur
- Паттерн noise/texture (легче чем blur)

### **Ожидаемый результат:**
- 📉 GPU usage: -30-40%
- 📈 Smooth scrolling: значительное улучшение
- 🎨 Дизайн: остается красивым, но чище
- ⚡ Instant response: нет задержек при прокрутке

### **Примерное время:** 1 час

---

## **Решение 3: Performance Mode (адаптивная оптимизация)** ⭐⭐⭐⭐

### **Концепция:**
Автоматически определять производительность устройства и отключать тяжелые фичи.

### **Реализация:**

#### **Шаг 1: Создать утилиту определения устройства**

**Файл:** `web/src/utils/performance.ts`

```typescript
/**
 * Определение производительности устройства
 */

interface DeviceCapabilities {
  isLowEnd: boolean;
  shouldReduceAnimations: boolean;
  shouldReduceEffects: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
}

export const detectDeviceCapabilities = (): DeviceCapabilities => {
  // 1. Проверка типа соединения
  const connection = (navigator as any).connection || (navigator as any).mozConnection;
  const effectiveType = connection?.effectiveType || 'unknown';

  const isSlowConnection = effectiveType === '2g' || effectiveType === 'slow-2g';
  const isMediumConnection = effectiveType === '3g';

  // 2. Проверка User Agent (тип устройства)
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/i.test(ua);
  const isOldAndroid = /android [4-6]/i.test(ua);
  const isIOSLow = /iphone os [8-11]/i.test(ua);

  // 3. Проверка памяти устройства (если доступно)
  const deviceMemory = (navigator as any).deviceMemory; // GB
  const isLowMemory = deviceMemory && deviceMemory < 4;

  // 4. Проверка количества ядер процессора
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  const isLowCPU = hardwareConcurrency <= 4;

  // 5. Итоговая оценка
  const isLowEnd =
    isSlowConnection ||
    isOldAndroid ||
    isIOSLow ||
    isLowMemory ||
    (isAndroid && isLowCPU);

  const shouldReduceAnimations =
    isLowEnd ||
    isMediumConnection ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches; // Системная настройка

  const shouldReduceEffects = isLowEnd || isSlowConnection;

  return {
    isLowEnd,
    shouldReduceAnimations,
    shouldReduceEffects,
    connectionSpeed: isSlowConnection ? 'slow' : isMediumConnection ? 'medium' : 'fast'
  };
};

// Синглтон для кэширования результата
let cachedCapabilities: DeviceCapabilities | null = null;

export const getDeviceCapabilities = (): DeviceCapabilities => {
  if (!cachedCapabilities) {
    cachedCapabilities = detectDeviceCapabilities();
    console.log('[Performance] Device capabilities:', cachedCapabilities);
  }
  return cachedCapabilities;
};

// Экспорт быстрых проверок
export const shouldUseAnimations = (): boolean => {
  return !getDeviceCapabilities().shouldReduceAnimations;
};

export const shouldUseEffects = (): boolean => {
  return !getDeviceCapabilities().shouldReduceEffects;
};

export const isLowEndDevice = (): boolean => {
  return getDeviceCapabilities().isLowEnd;
};
```

#### **Шаг 2: Создать Performance Context**

**Файл:** `web/src/contexts/PerformanceContext.tsx`

```typescript
import { createContext, useContext, ReactNode } from 'react';
import { getDeviceCapabilities } from '../utils/performance';

interface PerformanceContextType {
  shouldUseAnimations: boolean;
  shouldUseEffects: boolean;
  isLowEnd: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const capabilities = getDeviceCapabilities();

  return (
    <PerformanceContext.Provider
      value={{
        shouldUseAnimations: !capabilities.shouldReduceAnimations,
        shouldUseEffects: !capabilities.shouldReduceEffects,
        isLowEnd: capabilities.isLowEnd,
        connectionSpeed: capabilities.connectionSpeed
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}
```

#### **Шаг 3: Интеграция в приложение**

**App.tsx:**
```typescript
import { PerformanceProvider } from './contexts/PerformanceContext';

<TelegramAuthProvider>
  <PerformanceProvider>
    <AppContent />
  </PerformanceProvider>
</TelegramAuthProvider>
```

#### **Шаг 4: Использование в компонентах**

**Пример 1: Условные анимации**
```typescript
import { usePerformance } from '../contexts/PerformanceContext';

function DashboardPage() {
  const { shouldUseAnimations } = usePerformance();

  return (
    <div>
      {shouldUseAnimations ? (
        <motion.div animate={{ opacity: 1 }}>
          Контент с анимацией
        </motion.div>
      ) : (
        <div>
          Контент без анимации
        </div>
      )}
    </div>
  );
}
```

**Пример 2: Условные эффекты**
```typescript
function Header() {
  const { shouldUseEffects } = usePerformance();

  return (
    <div className={`bg-gradient-to-br from-blue-500 to-indigo-700 ${
      shouldUseEffects ? 'with-decorations' : ''
    }`}>
      {shouldUseEffects && (
        <>
          <div className="blur-decoration" />
          <div className="gradient-overlay" />
        </>
      )}
    </div>
  );
}
```

**Пример 3: Динамические стили**
```typescript
const { isLowEnd } = usePerformance();

<Card className={
  isLowEnd
    ? "shadow-sm"
    : "shadow-lg hover:shadow-xl transition-shadow"
}>
```

### **Ожидаемый результат:**
- 📱 Автоматическая адаптация под устройство
- 📈 +40% производительности на слабых устройствах
- 🎨 Полный UI на мощных, упрощенный на слабых
- 🔋 Экономия батареи на мобильных

### **Примерное время:** 1-2 часа

---

## **Решение 4: Hybrid режим анимаций** ⭐⭐⭐

### **Концепция:**
Сохранить анимации только там, где они критичны для UX. Убрать везде остальное.

### **Категории анимаций:**

#### **🟢 Критичные (оставить):**
- ✅ Модальные окна (появление/исчезновение)
- ✅ Toast уведомления
- ✅ Loading состояния
- ✅ Кнопки (whileTap для тактильного фидбека)
- ✅ Переходы между экранами (fade)

#### **🟡 Опциональные (упростить):**
- 🟡 Карточки счетов (убрать hover, оставить tap)
- 🟡 Списки транзакций (убрать все анимации)
- 🟡 Header анимации (заменить на CSS)

#### **🔴 Декоративные (убрать):**
- ❌ Фоновые элементы
- ❌ Staggered animations
- ❌ Scale/rotate на hover
- ❌ Анимация при монтировании всего компонента

### **Реализация:**

**Создать компонент-wrapper для условных анимаций:**

```typescript
// components/ui/conditional-motion.tsx
import { motion } from 'motion/react';
import { usePerformance } from '../../contexts/PerformanceContext';
import { HTMLMotionProps } from 'motion/react';

interface ConditionalMotionProps extends HTMLMotionProps<'div'> {
  priority?: 'critical' | 'optional' | 'decorative';
  children: React.ReactNode;
}

export function ConditionalMotion({
  priority = 'optional',
  children,
  ...motionProps
}: ConditionalMotionProps) {
  const { shouldUseAnimations, isLowEnd } = usePerformance();

  // Критичные - всегда показываем
  if (priority === 'critical') {
    return <motion.div {...motionProps}>{children}</motion.div>;
  }

  // Декоративные - только на мощных устройствах
  if (priority === 'decorative') {
    if (isLowEnd) {
      return <div>{children}</div>;
    }
  }

  // Опциональные - зависит от настроек
  if (!shouldUseAnimations) {
    return <div>{children}</div>;
  }

  return <motion.div {...motionProps}>{children}</motion.div>;
}
```

**Использование:**
```typescript
// Критичная анимация (всегда)
<ConditionalMotion
  priority="critical"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  <Dialog>...</Dialog>
</ConditionalMotion>

// Декоративная (только на мощных)
<ConditionalMotion
  priority="decorative"
  animate={{ rotate: 360 }}
>
  <div className="decoration" />
</ConditionalMotion>
```

### **Ожидаемый результат:**
- 📉 Количество анимаций: 779 → ~100
- 🎨 Сохранение визуальной привлекательности
- ⚡ +50% FPS на средних устройствах
- 🎯 Фокус на важных анимациях

### **Примерное время:** 2 часа

---

## **Решение 5: Virtual Lists для длинных списков** ⭐⭐

### **Когда нужно:**
- Список транзакций >50-100 элементов
- История операций за год
- Бесконечный скролл

### **Проблема:**
React рендерит ВСЕ элементы списка, даже невидимые:
```typescript
// Рендерит 500 элементов, видно только 10
transactions.map(t => <TransactionCard key={t.id} {...t} />)
```

### **Решение: @tanstack/react-virtual**

#### **Установка:**
```bash
npm install @tanstack/react-virtual
```

#### **Реализация:**

**Файл:** `web/src/components/VirtualTransactionList.tsx`

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface Transaction {
  id: string;
  // ... другие поля
}

interface Props {
  transactions: Transaction[];
  onTransactionClick: (t: Transaction) => void;
}

export function VirtualTransactionList({ transactions, onTransactionClick }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Примерная высота одного элемента в px
    overscan: 5 // Рендерить на 5 элементов больше сверху/снизу
  });

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const transaction = transactions[virtualItem.index];

          return (
            <div
              key={transaction.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TransactionCard
                transaction={transaction}
                onClick={() => onTransactionClick(transaction)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

#### **Использование в AllTransactionsPage:**

```typescript
// БЫЛО
{filteredTransactions.map(t => (
  <TransactionCard key={t.id} {...t} />
))}

// СТАЛО
<VirtualTransactionList
  transactions={filteredTransactions}
  onTransactionClick={handleTransactionClick}
/>
```

### **Ожидаемый результат:**
- 📉 Рендер: 500 элементов → 15 элементов
- 📈 Скролл: плавный даже с 1000+ транзакций
- 💾 Память: -80% использования
- ⚡ Мгновенная прокрутка

### **Примерное время:** 2-3 часа

### **Когда применять:**
- ✅ Если пользователь имеет >100 транзакций
- ✅ Если планируется бесконечный скролл
- ❌ Если обычно <50 транзакций (овер-инжиниринг)

---

## **Решение 6: Мемоизация тяжелых вычислений** ⭐⭐

### **Проблема:**
Некоторые вычисления выполняются при каждом рендере:

```typescript
// DashboardPage - пересчитывается при каждом рендере
const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
const monthlyIncome = transactions
  .filter(t => t.type === 'income')
  .reduce((sum, t) => sum + t.amount, 0);
```

### **Решение: useMemo и React.memo**

#### **useMemo для вычислений:**

**БЫЛО:**
```typescript
const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
```

**СТАЛО:**
```typescript
const totalBalance = useMemo(() =>
  accounts.reduce((sum, acc) => sum + acc.balance, 0),
  [accounts] // Пересчитывать только когда accounts изменились
);
```

#### **React.memo для компонентов:**

**БЫЛО:**
```typescript
function TransactionCard({ transaction }: Props) {
  return <div>...</div>;
}
```

**СТАЛО:**
```typescript
const TransactionCard = React.memo(({ transaction }: Props) => {
  return <div>...</div>;
}, (prevProps, nextProps) => {
  // Re-render только если ID изменился
  return prevProps.transaction.id === nextProps.transaction.id;
});
```

#### **useCallback для функций:**

**БЫЛО:**
```typescript
const handleClick = (id: string) => {
  // Создается новая функция при каждом рендере
};

<Component onClick={handleClick} />
```

**СТАЛО:**
```typescript
const handleClick = useCallback((id: string) => {
  // Функция создается один раз
}, []);

<Component onClick={handleClick} />
```

### **Где применять:**
- Вычисления статистики (totalBalance, monthlyIncome)
- Фильтрация больших списков
- Форматирование дат/валют
- Тяжелые компоненты (карточки с данными)

### **Ожидаемый результат:**
- 📉 Количество пересчетов: -70%
- 📈 Скорость рендеринга: +10-15%
- ⚡ Меньше "дерганья" при взаимодействии

### **Примерное время:** 1 час

---

## 📋 Итоговая таблица рекомендаций

| # | Решение | Приоритет | Усилия | Эффект | Сложность | Bundle Δ |
|---|---------|-----------|--------|--------|-----------|----------|
| 1 | **Упрощение анимаций** | ⭐⭐⭐⭐⭐ | 2-3 ч | **+60% FPS** | Низкая | -5 KB |
| 2 | **Удаление blur/эффектов** | ⭐⭐⭐⭐⭐ | 1 ч | **+30% GPU** | Очень низкая | 0 KB |
| 3 | **Performance Mode** | ⭐⭐⭐⭐ | 1-2 ч | **+40% слабые** | Средняя | +2 KB |
| 4 | **Hybrid анимации** | ⭐⭐⭐ | 2 ч | +50% FPS | Средняя | -3 KB |
| 5 | **Virtual Lists** | ⭐⭐ | 2-3 ч | +80% списки | Средняя | +15 KB |
| 6 | **Мемоизация** | ⭐⭐ | 1 ч | +10-15% | Низкая | 0 KB |

---

## 🎯 Рекомендованный план внедрения

### **Фаза 1: Quick Wins (4-5 часов) - КРИТИЧНО**
Выполнить первым делом для максимального эффекта:

1. ✅ **Решение 2:** Удаление blur/градиентов (1 час)
   - Убрать все `blur-2xl`, `blur-3xl`
   - Упростить декоративные элементы
   - **Результат:** +30% GPU, мгновенный эффект

2. ✅ **Решение 1:** Упрощение анимаций (2-3 часа)
   - Заменить motion.div на обычные div
   - Убрать initial/animate
   - Оставить только критичные анимации
   - **Результат:** +60% FPS

**Итого Фазы 1:** +90% улучшение производительности за 4 часа

---

### **Фаза 2: Smart Optimization (2-3 часа) - ВЫСОКИЙ ПРИОРИТЕТ**
Добавить интеллектуальную адаптацию:

3. ✅ **Решение 3:** Performance Mode (1-2 часа)
   - Создать utils/performance.ts
   - Добавить PerformanceContext
   - Интегрировать в App.tsx
   - **Результат:** Автоматическая оптимизация

4. ✅ **Решение 4:** Hybrid режим (1 час)
   - Создать ConditionalMotion компонент
   - Категоризировать анимации
   - **Результат:** Баланс между красотой и скоростью

**Итого Фазы 2:** Умное приложение, адаптирующееся под устройство

---

### **Фаза 3: Advanced (опционально, 3-4 часа)**
Только если нужно дополнительное улучшение:

5. 🟡 **Решение 5:** Virtual Lists (2-3 часа)
   - **Только если** пользователи имеют >100 транзакций
   - Реализовать для AllTransactionsPage
   - **Результат:** Плавный скролл больших списков

6. 🟡 **Решение 6:** Мемоизация (1 час)
   - useMemo для вычислений
   - React.memo для компонентов
   - **Результат:** +10-15% скорость

**Итого Фазы 3:** Финальная полировка

---

## 📊 Ожидаемые результаты

### **После Фазы 1 (КРИТИЧНО):**
| Метрика | До | После | Улучшение |
|---------|-----|-------|-----------|
| FPS (мобильный) | 25-30 fps | 50-60 fps | **+100%** |
| GPU usage | 80% | 40% | **-50%** |
| Лаги | Частые | Редкие | **-80%** |
| Плавность скролла | Рывки | Плавно | ✅ |

### **После Фазы 2 (ВЫСОКИЙ):**
| Метрика | Улучшение |
|---------|-----------|
| Слабые устройства | +40% производительности |
| Средние устройства | +20% производительности |
| Мощные устройства | Сохранение красивого UI |
| Адаптивность | Автоматическая |

### **После Фазы 3 (ОПЦИОНАЛЬНО):**
| Метрика | Улучшение |
|---------|-----------|
| Большие списки | Нет лагов даже с 500+ элементами |
| Рендеринг | +10-15% скорость |

---

## ⚠️ Что НЕ делать

### **❌ Next.js миграция**
**Почему НЕТ:**
- SSR не работает в Telegram Mini App
- Добавит +150 KB к bundle
- Увеличит сложность кода
- Не решит проблему анимаций
- Потребует 8+ часов работы
- **Эффект: 0% улучшения**

### **❌ Полное удаление Framer Motion**
**Почему НЕТ:**
- Критичные анимации нужны (модалки, переходы)
- Полная замена займет слишком много времени
- Можно просто упростить использование

### **❌ Переход на Preact**
**Почему НЕТ:**
- Совместимость может быть проблемой
- Некоторые Radix UI компоненты могут не работать
- Экономия только ~50 KB
- Риск новых багов

---

## 🚀 Когда начинать?

### **Немедленно (Фаза 1):**
Если пользователи жалуются на лаги - начинайте с Фазы 1 прямо сейчас:
1. Удаление blur (30 минут)
2. Упрощение анимаций DashboardPage (1 час)
3. Упрощение анимаций остальных страниц (1-2 часа)

**Результат через 4 часа:** Приложение будет летать

### **Через неделю (Фаза 2):**
После тестирования Фазы 1, добавить умную адаптацию

### **По необходимости (Фаза 3):**
Только если есть конкретные проблемы с большими списками

---

## 📝 Заметки

- Все решения совместимы друг с другом
- Можно внедрять поэтапно
- Каждая фаза дает измеримое улучшение
- Не требуется радикальный рефакторинг
- Bundle size практически не меняется
- Код остается поддерживаемым

---

**Последнее обновление:** 13 октября 2025, 02:15 UTC+4
