# Create default categories for expenses
expense_categories = [
  { name: "Еда и рестораны", category_type: "expense", icon: "utensils", color: "#ef4444" },
  { name: "Транспорт", category_type: "expense", icon: "car", color: "#3b82f6" },
  { name: "Покупки", category_type: "expense", icon: "shopping-bag", color: "#8b5cf6" },
  { name: "Развлечения", category_type: "expense", icon: "gamepad-2", color: "#f59e0b" },
  { name: "Здоровье", category_type: "expense", icon: "heart", color: "#10b981" },
  { name: "Образование", category_type: "expense", icon: "book", color: "#6366f1" },
  { name: "Дом и ремонт", category_type: "expense", icon: "home", color: "#84cc16" },
  { name: "Подписки", category_type: "expense", icon: "credit-card", color: "#ec4899" }
]

# Create default categories for income
income_categories = [
  { name: "Зарплата", category_type: "income", icon: "briefcase", color: "#059669" },
  { name: "Фриланс", category_type: "income", icon: "laptop", color: "#0891b2" },
  { name: "Инвестиции", category_type: "income", icon: "trending-up", color: "#7c3aed" },
  { name: "Подарки", category_type: "income", icon: "gift", color: "#dc2626" },
  { name: "Другое", category_type: "income", icon: "plus", color: "#64748b" }
]

# Create categories
(expense_categories + income_categories).each do |category_attrs|
  Category.find_or_create_by(name: category_attrs[:name]) do |category|
    category.category_type = category_attrs[:category_type]
    category.icon = category_attrs[:icon]
    category.color = category_attrs[:color]
  end
end

puts "✅ Created #{Category.count} categories"

# Create a demo user for development
if Rails.env.development?
  demo_user = User.find_or_create_by(email: "demo@fintrack.com") do |user|
    user.name = "Demo User"
    user.password = "password123"
  end

  if demo_user.persisted?
    # Create demo accounts
    cash_account = Account.find_or_create_by(user: demo_user, name: "Наличные") do |account|
      account.account_type = "cash"
      account.balance = 15000.00
      account.currency = "RUB"
    end

    card_account = Account.find_or_create_by(user: demo_user, name: "Карта Сбербанк") do |account|
      account.account_type = "debit_card"
      account.balance = 45000.00
      account.currency = "RUB"
    end

    savings_account = Account.find_or_create_by(user: demo_user, name: "Накопления") do |account|
      account.account_type = "savings"
      account.balance = 120000.00
      account.currency = "RUB"
    end

    puts "✅ Created demo user with 3 accounts"
    puts "   📧 Email: demo@fintrack.com"
    puts "   🔑 Password: password123"
  end
end
