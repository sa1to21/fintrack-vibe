import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Wallet,
  CreditCard,
  PiggyBank,
  Coffee,
  Car,
  ShoppingBag,
  Home,
  Zap,
  Heart,
  DollarSign,
  Briefcase,
  Gift,
  Plus
} from "lucide-react";
import { motion } from "motion/react";

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  categoryName: string;
  description: string;
  accountId: string;
  date: string;
  time: string;
}

interface AllTransactionsPageProps {
  onBack: () => void;
  onTransactionClick: (transaction: Transaction) => void;
}

const accounts = [
  { id: "1", name: "Основной счёт", icon: Wallet },
  { id: "2", name: "Накопления", icon: PiggyBank },
  { id: "3", name: "Карта", icon: CreditCard },
];

const categoryIcons: { [key: string]: typeof Coffee } = {
  food: Coffee,
  transport: Car,
  shopping: ShoppingBag,
  home: Home,
  utilities: Zap,
  health: Heart,
  salary: DollarSign,
  freelance: Briefcase,
  business: TrendingUp,
  investment: TrendingUp,
  gift: Gift,
  other: Plus,
};

export function AllTransactionsPage({ onBack, onTransactionClick }: AllTransactionsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Mock data - расширенный список операций
  const [allTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "expense",
      amount: 350,
      category: "food",
      categoryName: "Еда",
      description: "Покупки в супермаркете",
      accountId: "1",
      date: "2025-01-20",
      time: "14:30"
    },
    {
      id: "2",
      type: "income",
      amount: 5000,
      category: "freelance",
      categoryName: "Фриланс",
      description: "Оплата за проект",
      accountId: "1",
      date: "2025-01-19",
      time: "10:15"
    },
    {
      id: "3",
      type: "expense",
      amount: 1200,
      category: "transport",
      categoryName: "Транспорт",
      description: "Заправка автомобиля",
      accountId: "3",
      date: "2025-01-18",
      time: "18:45"
    },
    {
      id: "4",
      type: "expense",
      amount: 2500,
      category: "shopping",
      categoryName: "Покупки",
      description: "Одежда и обувь",
      accountId: "1",
      date: "2025-01-17",
      time: "16:20"
    },
    {
      id: "5",
      type: "income",
      amount: 45000,
      category: "salary",
      categoryName: "Зарплата",
      description: "Зарплата за январь",
      accountId: "1",
      date: "2025-01-15",
      time: "09:00"
    },
    {
      id: "6",
      type: "expense",
      amount: 850,
      category: "utilities",
      categoryName: "Коммуналка",
      description: "Оплата за свет и газ",
      accountId: "1",
      date: "2025-01-14",
      time: "12:30"
    },
    {
      id: "7",
      type: "expense",
      amount: 1500,
      category: "health",
      categoryName: "Здоровье",
      description: "Визит к врачу и лекарства",
      accountId: "2",
      date: "2025-01-12",
      time: "11:45"
    },
    {
      id: "8",
      type: "income",
      amount: 3000,
      category: "gift",
      categoryName: "Подарок",
      description: "Подарок от родителей",
      accountId: "2",
      date: "2025-01-10",
      time: "15:30"
    },
    {
      id: "9",
      type: "expense",
      amount: 680,
      category: "food",
      categoryName: "Еда",
      description: "Ужин в ресторане",
      accountId: "3",
      date: "2025-01-08",
      time: "19:00"
    },
    {
      id: "10",
      type: "expense",
      amount: 450,
      category: "transport",
      categoryName: "Транспорт",
      description: "Такси и метро",
      accountId: "3",
      date: "2025-01-05",
      time: "08:15"
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Memoized filtering and grouping for performance
  const { filteredTransactions, groupedTransactions, sortedDates, totalIncome, totalExpenses } = useMemo(() => {
    // Фильтрация операций
    const filtered = allTransactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           transaction.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || transaction.type === selectedType;
      const matchesAccount = selectedAccount === 'all' || transaction.accountId === selectedAccount;
      const matchesMonth = selectedMonth === 'all' || transaction.date.startsWith(`2025-${selectedMonth}`);
      
      return matchesSearch && matchesType && matchesAccount && matchesMonth;
    });

    // Группировка по дням
    const grouped = filtered.reduce((groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as { [key: string]: Transaction[] });

    // Сортировка дат по убыванию
    const sorted = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Статистика по отфильтрованным операциям
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      filteredTransactions: filtered,
      groupedTransactions: grouped,
      sortedDates: sorted,
      totalIncome: income,
      totalExpenses: expenses
    };
  }, [allTransactions, searchQuery, selectedType, selectedAccount, selectedMonth]);

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-indigo-200/30 rounded-full blur-2xl"></div>
      
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 pb-6 relative overflow-hidden"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-y-12"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <motion.div 
          className="flex items-center justify-between relative z-10 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          <h1 className="font-medium text-white">Все операции</h1>
          <div className="w-8" />
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 gap-3 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="bg-white/15 border-white/30 backdrop-blur-md">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-xs text-white/70">Доходы</p>
                  <p className="font-medium text-white">{formatCurrency(totalIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/15 border-white/30 backdrop-blur-md">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-300" />
                <div>
                  <p className="text-xs text-white/70">Расходы</p>
                  <p className="font-medium text-white">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        className="p-4 -mt-2 space-y-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Search and Filters */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по описанию или категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400 bg-white"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedType} onValueChange={(value: 'all' | 'income' | 'expense') => setSelectedType(value)}>
              <SelectTrigger className="border-blue-200 focus:border-blue-400 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все операции</SelectItem>
                <SelectItem value="income">Только доходы</SelectItem>
                <SelectItem value="expense">Только расходы</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="border-blue-200 focus:border-blue-400 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все счета</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="border-blue-200 focus:border-blue-400 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все месяцы</SelectItem>
              <SelectItem value="01">Январь 2025</SelectItem>
              <SelectItem value="12">Декабрь 2024</SelectItem>
              <SelectItem value="11">Ноябрь 2024</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground">
            Найдено операций: {filteredTransactions.length}
          </p>
        </motion.div>

        {/* Transactions List */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          {sortedDates.length > 0 ? (
            sortedDates.map((date, dateIndex) => (
              <motion.div 
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + dateIndex * 0.05 }}
              >
                {/* Date Header */}
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium text-slate-700">
                    {new Date(date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                </div>

                {/* Transactions for this date */}
                <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm">
                  <CardContent className="p-0">
                    {groupedTransactions[date].map((transaction, transactionIndex) => {
                      const CategoryIcon = categoryIcons[transaction.category] || Coffee;
                      const account = accounts.find(acc => acc.id === transaction.accountId);
                      
                      return (
                        <motion.div
                          key={transaction.id}
                          className={`p-4 hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer ${
                            transactionIndex !== groupedTransactions[date].length - 1 ? 'border-b border-blue-100' : ''
                          }`}
                          onClick={() => onTransactionClick(transaction)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.45 + dateIndex * 0.05 + transactionIndex * 0.02 }}
                          whileHover={{ x: 4, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <motion.div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                                  transaction.type === 'income' 
                                    ? 'bg-gradient-to-br from-emerald-100 to-emerald-200' 
                                    : 'bg-gradient-to-br from-red-100 to-red-200'
                                }`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CategoryIcon className={`w-5 h-5 ${
                                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                                }`} />
                              </motion.div>
                              <div>
                                <h4 className="font-medium text-sm">{transaction.categoryName}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {transaction.time}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${
                                transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                {account?.name || 'Неизвестно'}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
                <CardContent className="p-8">
                  <div className="text-center">
                    <motion.div 
                      className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-3 shadow-sm"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Search className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <p className="text-muted-foreground text-sm">
                      Операции не найдены
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Попробуйте изменить фильтры поиска
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}