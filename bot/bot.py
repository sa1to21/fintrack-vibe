import os
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, CallbackQuery
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL', 'https://financetrack21.netlify.app')

# Инициализация бота
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Функция для создания кнопки открытия приложения
def get_webapp_keyboard(url: str = WEBAPP_URL) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="💰 Открыть FinTrack",
            web_app=WebAppInfo(url=url)
        )
    ]])

# Команда /start
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    keyboard = get_webapp_keyboard()
    await message.answer(
        "🦉 Добро пожаловать в FinTrack!\n\n"
        "Управляй финансами легко и удобно.\n"
        "Нажми кнопку ниже, чтобы начать 👇",
        reply_markup=keyboard
    )

# Команда /help - Справка
@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    keyboard = get_webapp_keyboard()
    help_text = """
📚 Список команд FinTrack:

/start - Запустить приложение
/help - Список команд
/guide - Руководство по функциям
/version - Информация о версии
/donate - Поддержать проект

Нажмите кнопку ниже, чтобы открыть приложение 👇
"""
    await message.answer(help_text, reply_markup=keyboard)

# Команда /guide - Руководство по функциям
@dp.message(Command("guide"))
async def cmd_guide(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="💳 Счета и порядок отображения", callback_data="guide_accounts")],
        [InlineKeyboardButton(text="💱 Валюта и статистика", callback_data="guide_currency")],
        [InlineKeyboardButton(text="📉 Погашение задолженностей", callback_data="guide_debt")],
        [InlineKeyboardButton(text="🏷️ Управление категориями", callback_data="guide_categories")],
        [InlineKeyboardButton(text="🔍 Фильтры и поиск", callback_data="guide_filters")],
        [InlineKeyboardButton(text="💾 Экспорт данных", callback_data="guide_export")],
        [InlineKeyboardButton(text="✏️ Редактирование операций", callback_data="guide_edit")],
        [InlineKeyboardButton(text="💰 Открыть FinTrack", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])
    await message.answer(
        "📖 Руководство по функциям FinTrack\n\n"
        "Выберите интересующую вас тему:",
        reply_markup=keyboard
    )

# Обработка callback-запросов от inline-кнопок
@dp.callback_query(F.data.startswith("guide_") & ~F.data.in_(["guide_back"]))
async def handle_guide_callback(callback: CallbackQuery):
    topic = callback.data.split("_")[1]

    guides = {
        "accounts": """
💳 Счета и порядок отображения

• На главном экране отображаются первые 4 счета
• Чтобы изменить порядок:
  Настройки → Управление счетами → перетащите карточки
• Все счета доступны на странице "Управление счетами"
""",
        "currency": """
💱 Валюта и статистика

• Статистика считается только по операциям в валюте из настроек
• Валюта по умолчанию: рубль (₽)
• Операции в другой валюте не учитываются в графиках и аналитике
• Вы всегда можете изменить валюту для статистики в настройках
""",
        "debt": """
📉 Погашение задолженностей

Правильный способ погашения долга:
1. Откройте функцию "Перевод между счетами"
2. Выберите счет, с которого гасите долг (источник)
3. Выберите долговой счет (получатель)
4. Укажите сумму погашения

⚠️ Важно: Такие переводы учитываются в статистике расходов
""",
        "categories": """
🏷️ Управление категориями

Как настроить категории:
• Настройки → Управление категориями
• Можно создавать новые категории
• Можно редактировать существующие
• Можно удалять (если нет привязанных транзакций)

Возможности кастомизации:
• 60+ эмодзи на выбор
• Раздельные категории для доходов и расходов
""",
        "filters": """
🔍 Фильтры и поиск

Доступны в разделе "История операций":

Фильтры по периоду:
• Всё время / Неделя / Месяц / 3 месяца / Год
• Кастомный период (выбор дат)

Фильтры по типу:
• Все операции
• Только доходы
• Только расходы
• Только переводы

Дополнительно:
• Фильтр по счетам (один или несколько)
• Поиск по описанию и категории
• Комбинирование всех фильтров
""",
        "export": """
💾 Экспорт данных

Как экспортировать транзакции:
1. Откройте приложение
2. Перейдите в Настройки
3. Найдите раздел "Данные"
4. Нажмите "Экспортировать данные"

Что входит в экспорт:
• Дата и время операции
• Тип (доход/расход/перевод)
• Категория
• Счёт
• Сумма
• Описание

Формат: CSV (UTF-8)
Использование: Excel, Google Sheets, Numbers
""",
        "edit": """
✏️ Редактирование операций

Как изменить или удалить транзакцию:
1. Откройте "История операций"
2. Нажмите на нужную транзакцию
3. В открывшемся окне доступны:
   • Просмотр всех деталей
   • Кнопка "Удалить операцию"

Что можно посмотреть:
• Дата и время операции
• Тип и категория
• Счёт и сумма
• Описание (если есть)
"""
    }

    back_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="← Назад к темам", callback_data="guide_back")],
        [InlineKeyboardButton(text="💰 Открыть FinTrack", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])

    await callback.message.edit_text(
        guides[topic],
        reply_markup=back_keyboard
    )
    await callback.answer()

# Обработка кнопки "Назад" в руководстве
@dp.callback_query(F.data == "guide_back")
async def handle_guide_back(callback: CallbackQuery):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="💳 Счета и порядок отображения", callback_data="guide_accounts")],
        [InlineKeyboardButton(text="💱 Валюта и статистика", callback_data="guide_currency")],
        [InlineKeyboardButton(text="📉 Погашение задолженностей", callback_data="guide_debt")],
        [InlineKeyboardButton(text="🏷️ Управление категориями", callback_data="guide_categories")],
        [InlineKeyboardButton(text="🔍 Фильтры и поиск", callback_data="guide_filters")],
        [InlineKeyboardButton(text="💾 Экспорт данных", callback_data="guide_export")],
        [InlineKeyboardButton(text="✏️ Редактирование операций", callback_data="guide_edit")],
        [InlineKeyboardButton(text="💰 Открыть FinTrack", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])
    await callback.message.edit_text(
        "📖 Руководство по функциям FinTrack\n\n"
        "Выберите интересующую вас тему:",
        reply_markup=keyboard
    )
    await callback.answer()

# Команда /version - Информация о версии
@dp.message(Command("version"))
async def cmd_version(message: types.Message):
    keyboard = get_webapp_keyboard()
    version_text = """
FinTrack v1.0 (BETA) 🚀
Последнее обновление: 30 октября 2025

Нажмите кнопку ниже, чтобы открыть приложение 👇
"""
    await message.answer(version_text, reply_markup=keyboard)

# Команда /donate - Поддержать проект
@dp.message(Command("donate"))
async def cmd_donate(message: types.Message):
    keyboard = get_webapp_keyboard(f"{WEBAPP_URL}/settings")
    donate_text = """
💝 Поддержать проект FinTrack

Проект развивается на донатной основе. Спасибо за вашу поддержку!

Способы поддержки:

💳 СБП (Т-банк)
`+79939009598`

🏦 TBC Bank IBAN (только GEL)
`GE15TB7537945061200012`

💎 TON
`UQBagnAhrTd6AJbQg8zfP9oyIFU_8a5RgX_78k64jBVxLLEJ`

💵 USDT (TRC20)
`TSG71BQmZL2E6q46u39PfUQSjaWNcENmRm`
"""
    await message.answer(donate_text, parse_mode="Markdown", reply_markup=keyboard)

# Обработка всех остальных сообщений
@dp.message()
async def handle_any_message(message: types.Message):
    keyboard = get_webapp_keyboard()
    await message.answer(
        "Используйте /help для справки или откройте приложение 👇",
        reply_markup=keyboard
    )

# Главная функция запуска бота
async def main():
    print("Bot FinTrack started!")
    print(f"WebApp URL: {WEBAPP_URL}")
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
