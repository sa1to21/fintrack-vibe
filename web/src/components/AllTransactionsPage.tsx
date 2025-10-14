import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { DateRangePicker } from "./DateRangePicker";
import accountsService from "../services/accounts.service";
import transactionsService, { Transaction as APITransaction } from "../services/transactions.service";
import {
  ArrowLeft,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  CalendarIcon as Calendar,
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
  Plus,
  ArrowRightLeft,
  Loader2
} from "./icons";
import { motion } from "motion/react";
import { getCurrencySymbol } from "../constants/currencies";

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  categoryName: string;
  description: string;
  accountId: string;
  accountCurrency?: string;
  toAccountId?: string;
  date: string;
  time: string;
  createdAt: string;
  transferId?: string; // Для дедупликации переводов
}

interface AllTransactionsPageProps {
  onBack: () => void;
  onTransactionClick: (transaction: Transaction) => void;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon: typeof Wallet;
}

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
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [customRange, setCustomRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка счетов и транзакций из API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Загружаем счета
        const accountsData = await accountsService.getAll();
        const accountsWithIcons = accountsData.map(acc => ({
          id: acc.id,
          name: acc.name,
          balance: parseFloat(acc.balance.toString()),
          currency: acc.currency || 'RUB',
          icon: acc.account_type === 'savings' ? PiggyBank :
                acc.account_type === 'card' ? CreditCard : Wallet
        }));
        setAccounts(accountsWithIcons);

        // Загружаем транзакции со всех счетов
        const allTransactionsPromises = accountsData.map(acc =>
          transactionsService.getAll(acc.id)
        );
        const transactionsArrays = await Promise.all(allTransactionsPromises);
        const allTransactionsData = transactionsArrays.flat();

        // Преобразуем в формат компонента
        const formattedTransactions: Transaction[] = allTransactionsData.map(t => {
          const createdDate = new Date(t.created_at);

          // Определяем тип транзакции (перевод или обычная)
          const isTransfer = !!t.transfer_id;
          const type = isTransfer ? 'transfer' : t.transaction_type;

          // Находим счет для получения валюты
          const account = accountsData.find(acc => acc.id === t.account_id);

          return {
            id: t.id,
            amount: parseFloat(t.amount.toString()),
            type: type as 'income' | 'expense' | 'transfer',
            category: t.category_id,
            categoryName: t.category?.name || 'Без категории',
            description: t.description || '',
            accountId: t.account_id,
            accountCurrency: account?.currency || 'RUB',
            toAccountId: t.paired_account_id,
            date: t.date,
            time: createdDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            createdAt: t.created_at,
            transferId: t.transfer_id
          };
        });

        // Дедупликация переводов: каждый перевод = 2 транзакции, показываем только одну
        const seenTransferIds = new Set<string>();
        const uniqueTransactions = formattedTransactions.filter(t => {
          if (t.type === 'transfer' && t.transferId) {
            if (seenTransferIds.has(t.transferId)) {
              return false; // Пропускаем дубликат перевода
            }
            seenTransferIds.add(t.transferId);
          }
          return true;
        });

        setAllTransactions(uniqueTransactions);
      } catch (error) {
        console.error('Failed to load data:', error);
        setAccounts([]);
        setAllTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    const symbol = getCurrencySymbol(currency);
    return `${amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} ${symbol}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Вычисление диапазона дат на основе выбранного периода
  const getDateRange = () => {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (selectedPeriod) {
      case 'all':
        // Без фильтрации по дате
        return null;
      case 'week':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (customRange.from && customRange.to) {
          return { from: customRange.from, to: customRange.to };
        }
        return null;
      default:
        return null;
    }

    return { from, to };
  };

  // Memoized filtering and grouping for performance
  const { filteredTransactions, groupedTransactions, sortedDates, totalIncome, totalExpenses } = useMemo(() => {
    const dateRange = getDateRange();

    // Фильтрация операций
    const filtered = allTransactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           transaction.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || transaction.type === selectedType;
      const matchesAccount = selectedAccount === 'all' || transaction.accountId === selectedAccount;

      // Фильтр по дате (только если dateRange не null)
      let matchesDate = true;
      if (dateRange) {
        const transactionDate = new Date(transaction.date);
        matchesDate = transactionDate >= dateRange.from && transactionDate <= dateRange.to;
      }

      return matchesSearch && matchesType && matchesAccount && matchesDate;
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

    // Сортировка транзакций внутри каждой группы по createdAt
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

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
  }, [allTransactions, searchQuery, selectedType, selectedAccount, selectedPeriod, customRange]);

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="text-slate-600">Загрузка операций...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorations removed for performance */}
      
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 pb-6 relative overflow-hidden"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background decorations - simplified for performance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-y-12"></div>
        
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
              className="text-white hover:bg-white/20 transition-all duration-200"
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
          <Card className="bg-white/15 border-white/30">
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
          <Card className="bg-white/15 border-white/30">
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
            <Select value={selectedType} onValueChange={(value: 'all' | 'income' | 'expense' | 'transfer') => setSelectedType(value)}>
              <SelectTrigger className="border-blue-200 focus:border-blue-400 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все операции</SelectItem>
                <SelectItem value="income">Только доходы</SelectItem>
                <SelectItem value="expense">Только расходы</SelectItem>
                <SelectItem value="transfer">Только переводы</SelectItem>
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

          <DateRangePicker
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
          />
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
                      const toAccount = transaction.toAccountId
                        ? accounts.find(acc => acc.id === transaction.toAccountId)
                        : undefined;

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
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${
                                  transaction.type === 'transfer'
                                    ? 'bg-gradient-to-br from-purple-100 to-purple-200'
                                    : transaction.type === 'income'
                                    ? 'bg-gradient-to-br from-emerald-100 to-emerald-200'
                                    : 'bg-gradient-to-br from-red-100 to-red-200'
                                }`}
                              >
                                {transaction.type === 'transfer' ? (
                                  <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                                ) : transaction.type === 'income' ? (
                                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <TrendingDown className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-sm truncate">
                                  {transaction.type === 'transfer' ? 'Перевод' : transaction.categoryName}
                                </h4>
                                {transaction.type !== 'transfer' && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {transaction.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground truncate">
                                  {transaction.time}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`font-medium ${
                                transaction.type === 'transfer'
                                  ? 'text-purple-600'
                                  : transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-'}
                                {formatCurrency(transaction.amount, transaction.accountCurrency)}
                              </p>
                              <Badge variant="outline" className="text-xs max-w-full border-blue-300 text-blue-700">
                                <span className="truncate block">
                                  {transaction.type === 'transfer' && toAccount
                                    ? (() => {
                                        const fromName = account?.name || '?';
                                        const toName = toAccount.name || '?';
                                        const maxLength = 10;
                                        const truncateText = (text: string) => text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
                                        return `${truncateText(fromName)} → ${truncateText(toName)}`;
                                      })()
                                    : (() => {
                                        const accountName = account?.name || 'Неизвестно';
                                        const maxLength = 22;
                                        return accountName.length > maxLength ? accountName.slice(0, maxLength) + '...' : accountName;
                                      })()}
                                </span>
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