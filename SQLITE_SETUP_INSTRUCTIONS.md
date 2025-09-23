# 🔧 Инструкции по настройке SQLite для FinTrack API

## 📋 Проблема
Rails API не может запуститься из-за отсутствия системного SQLite на Windows.

### Ошибка:
```
LoadError: cannot load such file -- sqlite3/sqlite3_native
```

## ✅ Диагностика (выполнено)
- ✅ Ruby 3.4.6 установлен и работает
- ✅ Rails 8.0.3 установлен
- ✅ SQLite gem собран с native extensions
- ✅ `ruby -e "require 'sqlite3'"` работает
- ❌ Bundler не может загрузить SQLite в Rails контексте
- ❌ Системная команда `sqlite3` отсутствует

## 🛠️ Решение: Установка SQLite системно

### Шаг 1: Скачать SQLite
1. Перейти на **https://sqlite.org/download.html**
2. В разделе **"Precompiled Binaries for Windows"** скачать:
   - `sqlite-shell-win32-x86-*.zip` (содержит sqlite3.exe)
   - `sqlite-dll-win64-x64-*.zip` (64-bit DLL библиотеки)

### Шаг 2: Установка
1. Создать папку `C:\sqlite\`
2. Извлечь все файлы в `C:\sqlite\`
3. Должны получиться файлы:
   - `C:\sqlite\sqlite3.exe`
   - `C:\sqlite\sqlite3.dll`

### Шаг 3: Добавить в PATH
1. Открыть **Системные переменные** → **Переменные среды**
2. В **Системные переменные** найти `PATH`
3. Добавить путь `C:\sqlite\`
4. **Перезапустить терминал**

### Шаг 4: Проверка
```bash
sqlite3 --version
# Должно показать версию SQLite
```

## 🔄 После установки SQLite

### Вернуться к Rails API:
```bash
cd /c/fintrack-api
export PATH="/c/Ruby34-x64/bin:$PATH"
bundle install
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails server -p 3001
```

## 📁 Альтернативные проекты
- **Основной проект:** `C:\оно\Projects\fintrack\api\` (кириллица в пути)
- **Рабочий проект:** `C:\fintrack-api\` (без кириллицы)

## 🔗 Полезные ссылки
- [SQLite Download Page](https://sqlite.org/download.html)
- [SQLite Windows Installation Guide](https://www.sqlitetutorial.net/download-install-sqlite/)

---

## ⚠️ Важные заметки
- SQLite gem работает в Ruby, проблема только с bundler
- 32-bit sqlite3.exe работает на 64-bit Windows
- После установки системного SQLite Rails API должен запуститься без проблем