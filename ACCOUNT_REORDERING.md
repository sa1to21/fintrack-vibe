# Функция перетаскивания счетов (Drag and Drop Reordering)

## Обзор

Реализована функция изменения порядка отображения счетов с помощью перетаскивания (drag-and-drop). Пользователь может настроить, какие счета отображаются на главной странице, изменяя их порядок на странице управления счетами.

## Как это работает

### Пользовательский интерфейс

1. **Страница управления счетами** ([ManageAccountsPage.tsx](web/src/components/ManageAccountsPage.tsx))
   - Каждый счёт имеет иконку "захвата" (три вертикальные полоски) слева
   - Зажмите иконку и перетащите счёт вверх или вниз
   - Порядок автоматически сохраняется при отпускании
   - Работает на desktop (мышь) и mobile (touch)

2. **Главная страница** ([DashboardPage.tsx](web/src/components/DashboardPage.tsx))
   - Отображаются только первые 4 счета согласно установленному порядку
   - Порядок автоматически обновляется после изменения

### Технические детали

#### Backend (Rails API)

**База данных:**
- Добавлено поле `display_order` (integer) в таблицу `accounts`
- Индекс на `[user_id, display_order]` для производительности
- Миграция автоматически устанавливает начальный порядок для существующих счетов

**API Endpoints:**

1. **GET /api/v1/accounts**
   - Возвращает счета отсортированные по `display_order ASC, id ASC`
   - Пример: `GET /api/v1/accounts`

2. **POST /api/v1/accounts/reorder**
   - Обновляет порядок счетов
   - Параметры:
     ```json
     {
       "accounts": [
         { "id": "23", "position": 0 },
         { "id": "24", "position": 1 },
         { "id": "26", "position": 2 }
       ]
     }
     ```
   - Выполняется в транзакции для атомарности
   - Возвращает `{ "success": true }` при успехе

3. **GET /api/v1/dashboard**
   - Возвращает счета в отсортированном порядке
   - Frontend берет первые 4 для отображения на главной

**Контроллер:**
```ruby
# app/controllers/api/v1/accounts_controller.rb
def reorder
  account_orders = params.require(:accounts)

  ActiveRecord::Base.transaction do
    account_orders.each do |order_data|
      account = current_user.accounts.find_by(id: order_data[:id])
      next unless account

      account.update!(display_order: order_data[:position])
    end
  end

  render json: { success: true }
end
```

#### Frontend (React)

**Библиотеки:**
- `@dnd-kit/core` - основная библиотека для drag-and-drop (~4KB)
- `@dnd-kit/sortable` - утилиты для сортируемых списков (~3KB)
- `@dnd-kit/utilities` - вспомогательные функции (~3KB)

**Компоненты:**

1. **SortableAccountItem** - отдельный компонент для каждого счёта
   - Использует `useSortable` hook для drag-and-drop
   - Показывает визуальную обратную связь (opacity, ring) при перетаскивании
   - Содержит drag handle (иконка `GripVertical`)

2. **ManageAccountsPage** - главный компонент
   - `DndContext` - контекст для drag-and-drop
   - `SortableContext` - управляет сортируемым списком
   - `handleDragEnd` - обработчик завершения перетаскивания
   - Оптимистичное обновление UI (сначала обновляется локально, потом сохраняется на сервер)
   - Откат изменений при ошибке сохранения

**Сервис:**
```typescript
// services/accounts.service.ts
async reorder(accountOrders: Array<{ id: string; position: number }>): Promise<void> {
  await api.post('/accounts/reorder', { accounts: accountOrders });
}
```

**Обработчик перетаскивания:**
```typescript
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over || active.id === over.id) {
    return;
  }

  const oldIndex = accounts.findIndex((acc) => acc.id === active.id);
  const newIndex = accounts.findIndex((acc) => acc.id === over.id);

  const newAccounts = arrayMove(accounts, oldIndex, newIndex);

  // Оптимистичное обновление UI
  setAccounts(newAccounts);

  try {
    // Отправляем обновленный порядок на сервер
    const accountOrders = newAccounts.map((acc, index) => ({
      id: acc.id,
      position: index
    }));

    await accountsService.reorder(accountOrders);
    toast.success("Порядок счетов обновлён");
  } catch (error) {
    console.error('Failed to reorder accounts:', error);
    toast.error("Не удалось сохранить порядок счетов");
    // Откатываем изменения при ошибке
    await loadAccounts();
  }
};
```

## Миграция базы данных

```ruby
class AddDisplayOrderToAccounts < ActiveRecord::Migration[8.0]
  def change
    add_column :accounts, :display_order, :integer, default: 0, null: false
    add_index :accounts, [:user_id, :display_order]

    # Set initial display_order for existing accounts
    reversible do |dir|
      dir.up do
        execute <<-SQL
          UPDATE accounts
          SET display_order = (
            SELECT COUNT(*)
            FROM accounts AS a2
            WHERE a2.user_id = accounts.user_id
            AND a2.id <= accounts.id
          )
        SQL
      end
    end
  end
end
```

## Производительность

- **Размер библиотек:** ~10KB (gzip)
- **Запросы к API:** 1 запрос на сохранение порядка (атомарная транзакция)
- **UI:** Оптимистичное обновление для мгновенной реакции
- **Индексы:** Добавлен индекс на `[user_id, display_order]` для быстрой сортировки

## Особенности реализации

1. **Атомарность:** Изменение порядка выполняется в транзакции
2. **Откат при ошибке:** Если сохранение не удалось, UI откатывается к предыдущему состоянию
3. **Кеширование:** Dashboard использует кеш, который автоматически обновляется при reorder
4. **Touch support:** Работает на мобильных устройствах через touch events
5. **Accessibility:** Поддерживает управление с клавиатуры

## Тестирование

1. Перейдите на страницу "Управление счетами"
2. Зажмите иконку захвата (три полоски) на любом счёте
3. Перетащите счёт вверх или вниз
4. Отпустите - порядок сохранится автоматически
5. Вернитесь на главную страницу - первые 4 счета отображаются в новом порядке
6. Перезагрузите приложение - порядок сохраняется

## Будущие улучшения

- [ ] Анимация перехода между позициями
- [ ] Возможность скрывать счета полностью (не показывать на главной)
- [ ] Группировка счетов (например, "Основные", "Накопления", "Долги")
- [ ] Drag-and-drop для категорий транзакций
