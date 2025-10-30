import os
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, CallbackQuery, FSInputFile
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL', 'https://financetrack21.netlify.app')

# Инициализация бота
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Кеш для file_id изображений
welcome_photo_file_id = None

# Функция для создания кнопки открытия приложения
def get_webapp_keyboard(url: str = WEBAPP_URL, show_help: bool = True) -> InlineKeyboardMarkup:
    buttons = [[InlineKeyboardButton(
        text="💰 Открыть WiseTrack",
        web_app=WebAppInfo(url=url)
    )]]

    if show_help:
        buttons.append([InlineKeyboardButton(
            text="❓ Помощь",
            callback_data="show_help"
        )])

    return InlineKeyboardMarkup(inline_keyboard=buttons)

# Команда /start
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    global welcome_photo_file_id
    keyboard = get_webapp_keyboard()

    caption_text = ("🦉 Добро пожаловать в WiseTrack!\n\n"
                   "Управляй финансами легко и удобно через приложение в Telegram.\n\n"
                   "📌 Полезные команды:\n"
                   "• /help - Список всех команд бота\n"
                   "• /guide - Руководство по функциям приложения\n"
                   "• /tips - Полезные советы по использованию\n"
                   "• /why - Зачем нужен учёт финансов?\n\n"
                   "Нажми кнопку ниже, чтобы начать 👇")

    # Используем кешированный file_id если он есть
    if welcome_photo_file_id:
        await message.answer_photo(
            photo=welcome_photo_file_id,
            caption=caption_text,
            reply_markup=keyboard
        )
    else:
        # Первая отправка - загружаем файл
        image_path = os.path.join(os.path.dirname(__file__), "..", "images", "Welcome FinTrack.png")
        photo = FSInputFile(image_path)

        sent_message = await message.answer_photo(
            photo=photo,
            caption=caption_text,
            reply_markup=keyboard
        )

        # Сохраняем file_id для последующих отправок
        welcome_photo_file_id = sent_message.photo[-1].file_id

# Команда /help - Справка
@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    keyboard = get_webapp_keyboard(show_help=False)
    help_text = """
📚 Список команд WiseTrack:

/start - Запустить приложение
/help - Список команд
/guide - Руководство по функциям
/why - Зачем нужен учёт финансов
/tips - Полезные советы
/version - Информация о версии
/donate - Поддержать проект
/support - Техническая поддержка

Нажмите кнопку ниже, чтобы открыть приложение 👇
"""
    await message.answer(help_text, reply_markup=keyboard)

# Команда /tips - Полезные советы
@dp.message(Command("tips"))
async def cmd_tips(message: types.Message):
    keyboard = get_webapp_keyboard()
    await message.answer(
        "💡 Несколько полезных советов:\n\n"
        "📌 Закрепи чат со мной вверху списка Telegram, чтобы я был всегда под рукой.\n\n"
        "✍️ Записывай операции сразу, как только они произошли. Это займет пару секунд!\n\n"
        "📊 Постоянство - ключ к успеху в учете финансов. Заноси траты регулярно.\n\n"
        "🤝 <a href=\"https://t.me/share/url?url=https://t.me/WiseTrackAppBot\">Поделись ботом с друзьями</a> - вместе управлять финансами веселее!\n\n"
        "💬 Есть вопросы или нашёл ошибку? Пиши @sa1to21",
        reply_markup=keyboard,
        parse_mode="HTML"
    )

# Команда /why - Зачем нужен учёт финансов
@dp.message(Command("why"))
async def cmd_why(message: types.Message):
    keyboard = get_webapp_keyboard()
    await message.answer(
        "🎯 Зачем нужен учёт финансов?\n\n"
        "💪 <b>Контроль над деньгами</b>\n"
        "Ты всегда знаешь, сколько у тебя денег и куда они уходят. Никаких сюрпризов в конце месяца.\n\n"
        "🎁 <b>Достижение целей</b>\n"
        "Хочешь накопить на отпуск, машину или квартиру? Учёт финансов помогает планировать и откладывать нужные суммы.\n\n"
        "✂️ <b>Избавление от лишних трат</b>\n"
        "Когда видишь статистику, сразу понятно, на что уходят деньги впустую. Это помогает экономить без ущерба для качества жизни.",
        reply_markup=keyboard,
        parse_mode="HTML"
    )

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
        [InlineKeyboardButton(text="💰 Открыть WiseTrack", web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton(text="❓ Помощь", callback_data="show_help")]
    ])
    await message.answer(
        "📖 Руководство по функциям WiseTrack\n\n"
        "Выберите интересующую вас тему:",
        reply_markup=keyboard
    )

# Обработка кнопки "Помощь"
@dp.callback_query(F.data == "show_help")
async def handle_help_callback(callback: CallbackQuery):
    keyboard = get_webapp_keyboard(show_help=False)
    help_text = """
📚 Список команд WiseTrack:

/start - Запустить приложение
/help - Список команд
/guide - Руководство по функциям
/why - Зачем нужен учёт финансов
/tips - Полезные советы
/version - Информация о версии
/donate - Поддержать проект
/support - Техническая поддержка

Нажмите кнопку ниже, чтобы открыть приложение 👇
"""
    await callback.message.answer(help_text, reply_markup=keyboard)
    await callback.answer()

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
        [InlineKeyboardButton(text="💰 Открыть WiseTrack", web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton(text="❓ Помощь", callback_data="show_help")]
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
        [InlineKeyboardButton(text="💰 Открыть WiseTrack", web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton(text="❓ Помощь", callback_data="show_help")]
    ])
    await callback.message.edit_text(
        "📖 Руководство по функциям WiseTrack\n\n"
        "Выберите интересующую вас тему:",
        reply_markup=keyboard
    )
    await callback.answer()

# Команда /version - Информация о версии
@dp.message(Command("version"))
async def cmd_version(message: types.Message):
    keyboard = get_webapp_keyboard()
    version_text = """
WiseTrack v1.0 (BETA) 🚀
Последнее обновление: 30 октября 2025
Приложение находится в стадии бета-тестирования. Ваши отзывы очень важны!

Нажмите кнопку ниже, чтобы открыть приложение 👇
"""
    await message.answer(version_text, reply_markup=keyboard)

# Команда /donate - Поддержать проект
@dp.message(Command("donate"))
async def cmd_donate(message: types.Message):
    keyboard = get_webapp_keyboard(f"{WEBAPP_URL}/settings")
    donate_text = """
💝 Поддержать проект WiseTrack

Проект полностью бесплатный и развивается на донатной основе. Спасибо за вашу поддержку!

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

# Команда /support - Техническая поддержка
@dp.message(Command("support"))
async def cmd_support(message: types.Message):
    keyboard = get_webapp_keyboard()
    support_text = """
💬 Техническая поддержка WiseTrack

Если у вас возникли вопросы, нашли ошибку или есть предложения по улучшению приложения, пишите:

👤 @sa1to21

Постараюсь ответить как можно скорее!
"""
    await message.answer(support_text, reply_markup=keyboard)

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
    print("Bot WiseTrack started!")
    print(f"WebApp URL: {WEBAPP_URL}")
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
