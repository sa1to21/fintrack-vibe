import os
import asyncio
import aiohttp
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, CallbackQuery, FSInputFile
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL', 'https://financetrack21.netlify.app')
API_URL = os.getenv('API_URL', 'http://localhost:3000')

# Инициализация бота
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Словарь переводов
TEXTS = {
    'ru': {
        'start_welcome': '🦉 Добро пожаловать в WiseTrack!',
        'start_description': '''Управляй финансами легко и удобно через приложение в Telegram.

📌 Полезные команды:
• /help - Список всех команд бота
• /guide - Руководство по функциям приложения
• /tips - Полезные советы по использованию
• /why - Зачем нужен учёт финансов?

Нажми кнопку ниже, чтобы начать 👇''',
        'button_open': '💰 Открыть WiseTrack',
        'button_help': '❓ Помощь',
        'language_select': '🌐 Выберите язык / Select language:',
        'language_changed': '✅ Язык изменён на русский',
        'button_lang_ru': '🇷🇺 Русский',
        'button_lang_en': '🇬🇧 English',
        'help_text': '''📚 Список команд WiseTrack:

/start - Запустить приложение
/help - Список команд
/guide - Руководство по функциям
/why - Зачем нужен учёт финансов
/tips - Полезные советы
/language - Сменить язык
/version - Информация о версии
/donate - Поддержать проект
/support - Техническая поддержка

Нажмите кнопку ниже, чтобы открыть приложение 👇''',
        'tips_text': '''💡 Несколько полезных советов:

📌 Закрепи чат со мной вверху списка Telegram, чтобы я был всегда под рукой.

✍️ Записывай операции сразу, как только они произошли. Это займет пару секунд!

📊 Постоянство - ключ к успеху в учете финансов. Заноси траты регулярно.

🤝 <a href="https://t.me/share/url?url=https://t.me/WiseTrackAppBot">Поделись ботом с друзьями</a> - вместе управлять финансами веселее!

💬 Есть вопросы или нашёл ошибку? Пиши @sa1to21''',
        'why_text': '''🎯 Зачем нужен учёт финансов?

💪 <b>Контроль над деньгами</b>
Ты всегда знаешь, сколько у тебя денег и куда они уходят. Никаких сюрпризов в конце месяца.

🎁 <b>Достижение целей</b>
Хочешь накопить на отпуск, машину или квартиру? Учёт финансов помогает планировать и откладывать нужные суммы.

✂️ <b>Избавление от лишних трат</b>
Когда видишь статистику, сразу понятно, на что уходят деньги впустую. Это помогает экономить без ущерба для качества жизни.''',
        'guide_title': '''📖 Руководство по функциям WiseTrack

Выберите интересующую вас тему:''',
        'guide_accounts_btn': '💳 Счета и порядок отображения',
        'guide_currency_btn': '💱 Валюта и статистика',
        'guide_debt_btn': '📉 Погашение задолженностей',
        'guide_categories_btn': '🏷️ Управление категориями',
        'guide_filters_btn': '🔍 Фильтры и поиск',
        'guide_export_btn': '💾 Экспорт данных',
        'guide_edit_btn': '✏️ Редактирование операций',
        'guide_notifications_btn': '🔔 Напоминания о финансах',
        'guide_back_btn': '← Назад к темам',
        'guide_accounts': '''💳 Счета и порядок отображения

• На главном экране отображаются первые 4 счета
• Чтобы изменить порядок:
  Настройки → Управление счетами → перетащите карточки
• Все счета доступны на странице "Управление счетами"''',
        'guide_currency': '''💱 Валюта и статистика

• Статистика считается только по операциям в валюте из настроек
• Валюта по умолчанию: рубль (₽)
• Операции в другой валюте не учитываются в графиках и аналитике
• Вы всегда можете изменить валюту для статистики в настройках''',
        'guide_debt': '''📉 Погашение задолженностей

Правильный способ погашения долга:
1. Откройте функцию "Перевод между счетами"
2. Выберите счет, с которого гасите долг (источник)
3. Выберите долговой счет (получатель)
4. Укажите сумму погашения

⚠️ Важно: Такие переводы учитываются в статистике расходов''',
        'guide_categories': '''🏷️ Управление категориями

Как настроить категории:
• Настройки → Управление категориями
• Можно создавать новые категории
• Можно редактировать существующие
• Можно удалять (если нет привязанных транзакций)

Возможности кастомизации:
• 60+ эмодзи на выбор
• Раздельные категории для доходов и расходов''',
        'guide_filters': '''🔍 Фильтры и поиск

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
• Комбинирование всех фильтров''',
        'guide_export': '''💾 Экспорт данных

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
Использование: Excel, Google Sheets, Numbers''',
        'guide_edit': '''✏️ Редактирование операций

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
• Описание (если есть)''',
        'guide_notifications': '''🔔 Напоминания о финансах

Настройте ежедневные уведомления о записи трат, чтобы не забывать вести учёт:

Как настроить:
1. Откройте Настройки → Настройка напоминаний
2. Включите напоминания
3. Выберите удобное время (в вашем локальном часовом поясе)
4. Укажите дни недели для напоминаний

Что будет в уведомлении:
• Напоминание записать траты за день
• Последняя транзакция

⏰ Важно: Время определяется автоматически по часовому поясу вашего устройства''',
        'version_text': '''WiseTrack v1.0 (BETA) 🚀
Последнее обновление: 30 октября 2025
Приложение находится в стадии бета-тестирования. Ваши отзывы очень важны!

Нажмите кнопку ниже, чтобы открыть приложение 👇''',
        'donate_text': '''💝 Поддержать проект WiseTrack

Проект полностью бесплатный и развивается на донатной основе. Спасибо за вашу поддержку!

Способы поддержки:

💳 СБП (Т-банк)
`+79939009598`

🏦 TBC Bank IBAN (только GEL)
`GE15TB7537945061200012`

💎 TON
`UQBagnAhrTd6AJbQg8zfP9oyIFU_8a5RgX_78k64jBVxLLEJ`

💵 USDT (TRC20)
`TSG71BQmZL2E6q46u39PfUQSjaWNcENmRm`''',
        'support_text': '''💬 Техническая поддержка WiseTrack

Если у вас возникли вопросы, нашли ошибку или есть предложения по улучшению приложения, пишите:

👤 @sa1to21

Постараюсь ответить как можно скорее!''',
        'any_message_text': 'Используйте /help для справки или откройте приложение 👇',
    },
    'en': {
        'start_welcome': '🦉 Welcome to WiseTrack!',
        'start_description': '''Manage your finances easily and conveniently through the Telegram app.

📌 Useful commands:
• /help - List of all bot commands
• /guide - Guide to app features
• /tips - Useful tips for using
• /why - Why track your finances?

Click the button below to get started 👇''',
        'button_open': '💰 Open WiseTrack',
        'button_help': '❓ Help',
        'language_select': '🌐 Выберите язык / Select language:',
        'language_changed': '✅ Language changed to English',
        'button_lang_ru': '🇷🇺 Русский',
        'button_lang_en': '🇬🇧 English',
        'help_text': '''📚 WiseTrack Commands List:

/start - Launch the app
/help - Commands list
/guide - Feature guide
/why - Why track finances
/tips - Useful tips
/language - Change language
/version - Version information
/donate - Support the project
/support - Technical support

Click the button below to open the app 👇''',
        'tips_text': '''💡 Some useful tips:

📌 Pin this chat at the top of your Telegram list to keep me handy.

✍️ Record transactions right away when they happen. It only takes a few seconds!

📊 Consistency is key to successful finance tracking. Record expenses regularly.

🤝 <a href="https://t.me/share/url?url=https://t.me/WiseTrackAppBot">Share the bot with friends</a> - managing finances together is more fun!

💬 Have questions or found a bug? Contact @sa1to21''',
        'why_text': '''🎯 Why track your finances?

💪 <b>Control over money</b>
You always know how much money you have and where it goes. No surprises at the end of the month.

🎁 <b>Achieving goals</b>
Want to save for a vacation, car, or apartment? Finance tracking helps you plan and save the right amounts.

✂️ <b>Eliminating unnecessary expenses</b>
When you see the statistics, it's immediately clear where money is wasted. This helps you save without compromising your quality of life.''',
        'guide_title': '''📖 WiseTrack Feature Guide

Choose a topic of interest:''',
        'guide_accounts_btn': '💳 Accounts and display order',
        'guide_currency_btn': '💱 Currency and statistics',
        'guide_debt_btn': '📉 Debt repayment',
        'guide_categories_btn': '🏷️ Category management',
        'guide_filters_btn': '🔍 Filters and search',
        'guide_export_btn': '💾 Data export',
        'guide_edit_btn': '✏️ Editing transactions',
        'guide_notifications_btn': '🔔 Finance reminders',
        'guide_back_btn': '← Back to topics',
        'guide_accounts': '''💳 Accounts and display order

• The main screen displays the first 4 accounts
• To change the order:
  Settings → Account Management → drag cards
• All accounts are available on the "Account Management" page''',
        'guide_currency': '''💱 Currency and statistics

• Statistics are calculated only for transactions in the currency from settings
• Default currency: ruble (₽)
• Transactions in other currencies are not included in charts and analytics
• You can always change the currency for statistics in settings''',
        'guide_debt': '''📉 Debt repayment

The correct way to repay debt:
1. Open "Transfer between accounts" function
2. Select the account from which you repay the debt (source)
3. Select the debt account (recipient)
4. Specify the repayment amount

⚠️ Important: Such transfers are included in expense statistics''',
        'guide_categories': '''🏷️ Category management

How to customize categories:
• Settings → Category Management
• You can create new categories
• You can edit existing ones
• You can delete them (if there are no linked transactions)

Customization options:
• 60+ emojis to choose from
• Separate categories for income and expenses''',
        'guide_filters': '''🔍 Filters and search

Available in the "Transaction History" section:

Period filters:
• All time / Week / Month / 3 months / Year
• Custom period (date selection)

Type filters:
• All transactions
• Income only
• Expenses only
• Transfers only

Additionally:
• Filter by accounts (one or several)
• Search by description and category
• Combination of all filters''',
        'guide_export': '''💾 Data export

How to export transactions:
1. Open the app
2. Go to Settings
3. Find the "Data" section
4. Click "Export data"

What's included in the export:
• Transaction date and time
• Type (income/expense/transfer)
• Category
• Account
• Amount
• Description

Format: CSV (UTF-8)
Usage: Excel, Google Sheets, Numbers''',
        'guide_edit': '''✏️ Editing transactions

How to edit or delete a transaction:
1. Open "Transaction History"
2. Click on the desired transaction
3. In the opened window you can:
   • View all details
   • Click "Delete transaction" button

What you can view:
• Transaction date and time
• Type and category
• Account and amount
• Description (if any)''',
        'guide_notifications': '''🔔 Finance reminders

Set up daily notifications to record expenses so you don't forget to keep track:

How to set up:
1. Open Settings → Notification Settings
2. Enable notifications
3. Choose a convenient time (in your local timezone)
4. Specify days of the week for reminders

What will be in the notification:
• Reminder to record daily expenses
• Last transaction

⏰ Important: Time is automatically determined by your device's timezone''',
        'version_text': '''WiseTrack v1.0 (BETA) 🚀
Last update: October 30, 2025
The app is in beta testing. Your feedback is very important!

Click the button below to open the app 👇''',
        'donate_text': '''💝 Support WiseTrack Project

The project is completely free and developed through donations. Thank you for your support!

Support methods:

💳 SBP (T-Bank)
`+79939009598`

🏦 TBC Bank IBAN (GEL only)
`GE15TB7537945061200012`

💎 TON
`UQBagnAhrTd6AJbQg8zfP9oyIFU_8a5RgX_78k64jBVxLLEJ`

💵 USDT (TRC20)
`TSG71BQmZL2E6q46u39PfUQSjaWNcENmRm`''',
        'support_text': '''💬 WiseTrack Technical Support

If you have questions, found a bug, or have suggestions for improving the app, contact:

👤 @sa1to21

I'll try to respond as soon as possible!''',
        'any_message_text': 'Use /help for reference or open the app 👇',
    }
}

# Функция для получения текста на нужном языке
def get_text(user_lang: str, key: str) -> str:
    """Возвращает текст на русском если язык ru, иначе на английском"""
    lang = 'ru' if user_lang == 'ru' else 'en'
    return TEXTS[lang].get(key, '')

# Функция для получения языка пользователя из БД
async def get_user_language(telegram_id: int) -> str:
    """Получает сохранённый язык пользователя из БД или автоопределяет"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_URL}/api/v1/users/telegram/{telegram_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('language_code', None)
    except Exception as e:
        print(f"Error fetching user language: {e}")
    return None

# Функция для сохранения языка пользователя в БД
async def save_user_language(telegram_id: int, language_code: str) -> bool:
    """Сохраняет выбранный язык пользователя в БД"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.patch(
                f"{API_URL}/api/v1/users/telegram/{telegram_id}",
                json={"language_code": language_code}
            ) as response:
                return response.status == 200
    except Exception as e:
        print(f"Error saving user language: {e}")
        return False

# Кеш для file_id изображений
welcome_photo_file_id = None

# Функция для создания кнопки открытия приложения
def get_webapp_keyboard(lang: str = 'ru', url: str = WEBAPP_URL, show_help: bool = True) -> InlineKeyboardMarkup:
    buttons = [[InlineKeyboardButton(
        text=get_text(lang, 'button_open'),
        web_app=WebAppInfo(url=url)
    )]]

    if show_help:
        buttons.append([InlineKeyboardButton(
            text=get_text(lang, 'button_help'),
            callback_data="show_help"
        )])

    return InlineKeyboardMarkup(inline_keyboard=buttons)

# Команда /start
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    global welcome_photo_file_id

    telegram_id = message.from_user.id

    # Сначала пытаемся получить сохранённый язык из БД
    lang = await get_user_language(telegram_id)

    # Если язык не сохранён (новый пользователь или None), используем автоопределение
    if not lang:
        detected_lang = message.from_user.language_code or 'en'
        lang = 'ru' if detected_lang == 'ru' else 'en'
        # Сохраняем автоопределённый язык
        await save_user_language(telegram_id, lang)

    # Создаём клавиатуру с переводами
    keyboard = get_webapp_keyboard(lang)

    # Формируем текст сообщения
    caption_text = f"{get_text(lang, 'start_welcome')}\n\n{get_text(lang, 'start_description')}"

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

    # Всегда отправляем сообщение с выбором языка
    language_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=get_text(lang, 'button_lang_ru'), callback_data="set_lang_ru")],
        [InlineKeyboardButton(text=get_text(lang, 'button_lang_en'), callback_data="set_lang_en")]
    ])
    await message.answer(get_text(lang, 'language_select'), reply_markup=language_keyboard)

# Команда /language - Смена языка
@dp.message(Command("language"))
async def cmd_language(message: types.Message):
    telegram_id = message.from_user.id
    lang = await get_user_language(telegram_id)

    # Создаём клавиатуру выбора языка
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=get_text(lang, 'button_lang_ru'), callback_data="set_lang_ru")],
        [InlineKeyboardButton(text=get_text(lang, 'button_lang_en'), callback_data="set_lang_en")]
    ])

    await message.answer(get_text(lang, 'language_select'), reply_markup=keyboard)

# Обработчик смены языка
@dp.callback_query(F.data.startswith("set_lang_"))
async def handle_language_change(callback: CallbackQuery):
    telegram_id = callback.from_user.id
    new_lang = callback.data.split("_")[2]  # set_lang_ru -> ru

    # Сохраняем новый язык
    success = await save_user_language(telegram_id, new_lang)

    if success:
        await callback.message.edit_text(get_text(new_lang, 'language_changed'))
    else:
        await callback.message.edit_text("❌ Error saving language")

    await callback.answer()

# Команда /help - Справка
@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    telegram_id = message.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    keyboard = get_webapp_keyboard(lang, show_help=False)
    await message.answer(get_text(lang, 'help_text'), reply_markup=keyboard)

# Команда /tips - Полезные советы
@dp.message(Command("tips"))
async def cmd_tips(message: types.Message):
    telegram_id = message.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    keyboard = get_webapp_keyboard(lang)
    await message.answer(
        get_text(lang, 'tips_text'),
        reply_markup=keyboard,
        parse_mode="HTML"
    )

# Команда /why - Зачем нужен учёт финансов
@dp.message(Command("why"))
async def cmd_why(message: types.Message):
    telegram_id = message.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    keyboard = get_webapp_keyboard(lang)
    await message.answer(
        get_text(lang, 'why_text'),
        reply_markup=keyboard,
        parse_mode="HTML"
    )

# Команда /guide - Руководство по функциям
@dp.message(Command("guide"))
async def cmd_guide(message: types.Message):
    telegram_id = message.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=get_text(lang, 'guide_accounts_btn'), callback_data="guide_accounts")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_currency_btn'), callback_data="guide_currency")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_debt_btn'), callback_data="guide_debt")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_categories_btn'), callback_data="guide_categories")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_filters_btn'), callback_data="guide_filters")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_export_btn'), callback_data="guide_export")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_edit_btn'), callback_data="guide_edit")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_notifications_btn'), callback_data="guide_notifications")],
        [InlineKeyboardButton(text=get_text(lang, 'button_open'), web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton(text=get_text(lang, 'button_help'), callback_data="show_help")]
    ])
    await message.answer(
        get_text(lang, 'guide_title'),
        reply_markup=keyboard
    )

# Обработка кнопки "Помощь"
@dp.callback_query(F.data == "show_help")
async def handle_help_callback(callback: CallbackQuery):
    telegram_id = callback.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    keyboard = get_webapp_keyboard(lang, show_help=False)
    await callback.message.answer(get_text(lang, 'help_text'), reply_markup=keyboard)
    await callback.answer()

# Обработка callback-запросов от inline-кнопок
@dp.callback_query(F.data.startswith("guide_") & ~F.data.in_(["guide_back"]))
async def handle_guide_callback(callback: CallbackQuery):
    telegram_id = callback.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    topic = callback.data.split("_")[1]

    back_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=get_text(lang, 'guide_back_btn'), callback_data="guide_back")],
        [InlineKeyboardButton(text=get_text(lang, 'button_open'), web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton(text=get_text(lang, 'button_help'), callback_data="show_help")]
    ])

    await callback.message.edit_text(
        get_text(lang, f'guide_{topic}'),
        reply_markup=back_keyboard
    )
    await callback.answer()

# Обработка кнопки "Назад" в руководстве
@dp.callback_query(F.data == "guide_back")
async def handle_guide_back(callback: CallbackQuery):
    telegram_id = callback.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=get_text(lang, 'guide_accounts_btn'), callback_data="guide_accounts")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_currency_btn'), callback_data="guide_currency")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_debt_btn'), callback_data="guide_debt")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_categories_btn'), callback_data="guide_categories")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_filters_btn'), callback_data="guide_filters")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_export_btn'), callback_data="guide_export")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_edit_btn'), callback_data="guide_edit")],
        [InlineKeyboardButton(text=get_text(lang, 'guide_notifications_btn'), callback_data="guide_notifications")],
        [InlineKeyboardButton(text=get_text(lang, 'button_open'), web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton(text=get_text(lang, 'button_help'), callback_data="show_help")]
    ])
    await callback.message.edit_text(
        get_text(lang, 'guide_title'),
        reply_markup=keyboard
    )
    await callback.answer()

# Команда /version - Информация о версии
@dp.message(Command("version"))
async def cmd_version(message: types.Message):
    telegram_id = message.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    keyboard = get_webapp_keyboard(lang)
    await message.answer(get_text(lang, 'version_text'), reply_markup=keyboard)

# Команда /donate - Поддержать проект
@dp.message(Command("donate"))
async def cmd_donate(message: types.Message):
    telegram_id = message.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    keyboard = get_webapp_keyboard(lang, f"{WEBAPP_URL}/settings")
    await message.answer(get_text(lang, 'donate_text'), parse_mode="Markdown", reply_markup=keyboard)

# Команда /support - Техническая поддержка
@dp.message(Command("support"))
async def cmd_support(message: types.Message):
    telegram_id = message.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    keyboard = get_webapp_keyboard(lang)
    await message.answer(get_text(lang, 'support_text'), reply_markup=keyboard)

# Обработка всех остальных сообщений
@dp.message()
async def handle_any_message(message: types.Message):
    telegram_id = message.from_user.id
    lang = await get_user_language(telegram_id) or 'en'

    keyboard = get_webapp_keyboard(lang)
    await message.answer(
        get_text(lang, 'any_message_text'),
        reply_markup=keyboard
    )

# Главная функция запуска бота
async def main():
    print("Bot WiseTrack started!")
    print(f"WebApp URL: {WEBAPP_URL}")
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
