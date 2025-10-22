import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, Wallet, CreditCard, PiggyBank, Eye, EyeOff, TrendingUp, TrendingDown, CalendarIcon, Filter, Sparkles, ArrowRightLeft, AlertCircle } from "./icons";
import { DebtAccountCard } from "./DebtAccountCard";
import accountsService, { type Account as ApiAccount } from "../services/accounts.service";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import dashboardService, { MonthlyStats } from "../services/dashboard.service";
import { cache } from "../utils/cache";
import { getCurrencySymbol, DEFAULT_CURRENCY } from "../constants/currencies";
import usersService from "../services/users.service";

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon: typeof Wallet;
  color: string;
  is_debt?: boolean;
}

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
  createdAt: string; // ISO timestamp для сортировки
  transferId?: string; // Для дедупликации переводов
}

interface DashboardPageProps {
  onAddTransaction: () => void;
  onManageAccounts: () => void;
  onViewAllTransactions: () => void;
  onTransactionClick: (transaction: Transaction) => void;
  onTransfer?: () => void;
}

export function DashboardPage({ onAddTransaction, onManageAccounts, onViewAllTransactions, onTransactionClick, onTransfer }: DashboardPageProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [debtAccounts, setDebtAccounts] = useState<ApiAccount[]>([]);

  // Загрузить данные дашборда одним запросом (счета + транзакции)
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Загружаем базовую валюту пользователя
        const userData = await usersService.getCurrent();
        setBaseCurrency(userData.base_currency);

        // Проверяем кеш RAW данных из API (без иконок)
        const cachedRaw = cache.get<ReturnType<typeof dashboardService.getData> extends Promise<infer T> ? T : never>('dashboard-raw');
        if (cachedRaw) {
          // Преобразуем кешированные данные с иконками
          const accountsWithIcons = cachedRaw.accounts.map(acc => ({
            id: String(acc.id),
            name: acc.name,
            balance: parseFloat(acc.balance.toString()) || 0,
            currency: acc.currency || DEFAULT_CURRENCY,
            icon: acc.account_type === 'savings' ? PiggyBank :
                  acc.account_type === 'card' ? CreditCard : Wallet,
            color: acc.account_type === 'savings' ? "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700" :
                   acc.account_type === 'card' ? "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700" :
                   "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700",
            is_debt: acc.is_debt
          }));

          const formattedTransactions: Transaction[] = cachedRaw.transactions.map(t => {
            const createdDate = new Date(t.created_at);
            const isTransfer = !!t.transfer_id;
            const type = isTransfer ? 'transfer' : t.transaction_type;

            // Находим счет для получения валюты
            const account = cachedRaw.accounts.find(acc => acc.id === t.account_id);

            return {
              id: String(t.id),
              amount: parseFloat(t.amount.toString()),
              type: type as 'income' | 'expense' | 'transfer',
              category: String(t.category_id),
              categoryName: t.category?.name || 'Без категории',
              description: t.description || '',
              accountId: String(t.account_id),
              accountCurrency: account?.currency || DEFAULT_CURRENCY,
              toAccountId: t.paired_account_id ? String(t.paired_account_id) : undefined,
              date: t.date,
              time: createdDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
              createdAt: t.created_at,
              transferId: t.transfer_id || undefined
            };
          });

          setAccounts(accountsWithIcons);
          setTransactions(formattedTransactions);
          setLoading(false);
        }

        // Загружаем свежие данные с API (в фоне если есть кеш)
        const data = await dashboardService.getData();

        // Преобразуем счета в формат компонента с иконками
        const accountsWithIcons = data.accounts.map(acc => ({
          id: String(acc.id),
          name: acc.name,
          balance: parseFloat(acc.balance.toString()) || 0,
          currency: acc.currency || DEFAULT_CURRENCY,
          icon: acc.account_type === 'savings' ? PiggyBank :
                acc.account_type === 'card' ? CreditCard : Wallet,
          color: acc.account_type === 'savings' ? "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700" :
                 acc.account_type === 'card' ? "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700" :
                 "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700",
          is_debt: acc.is_debt
        }));

        // Преобразуем транзакции в формат компонента
        const formattedTransactions: Transaction[] = data.transactions.map(t => {
          const createdDate = new Date(t.created_at);

          // Определяем тип транзакции (перевод или обычная)
          const isTransfer = !!t.transfer_id;
          const type = isTransfer ? 'transfer' : t.transaction_type;

          // Находим счет для получения валюты
          const account = data.accounts.find(acc => acc.id === t.account_id);

          return {
            id: String(t.id),
            amount: parseFloat(t.amount.toString()),
            type: type as 'income' | 'expense' | 'transfer',
            category: String(t.category_id),
            categoryName: t.category?.name || 'Без категории',
            description: t.description || '',
            accountId: String(t.account_id),
            accountCurrency: account?.currency || DEFAULT_CURRENCY,
            toAccountId: t.paired_account_id ? String(t.paired_account_id) : undefined,
            date: t.date,
            time: createdDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            createdAt: t.created_at,
            transferId: t.transfer_id || undefined
          };
        });

        setAccounts(accountsWithIcons);
        setTransactions(formattedTransactions);

        // Загружаем месячную статистику
        const stats = await dashboardService.getMonthlyStats();
        setMonthlyStats(stats);

        // Загружаем долговые счета
        const debts = await accountsService.getAll('debt');
        setDebtAccounts(debts);

        // Сохраняем RAW данные в кеш (без иконок, только сериализуемые данные)
        cache.set('dashboard-raw', data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        // Fallback на пустые данные при ошибке
        setAccounts([
          {
            id: "1",
            name: "Основной счёт",
            balance: 0,
            currency: DEFAULT_CURRENCY,
            icon: Wallet,
            color: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
          }
        ]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Recent transactions (показываем только последние 3) - memoized for performance
  const recentTransactions = useMemo(() => {
    // Дедупликация переводов: каждый перевод = 2 транзакции, показываем только одну
    const seenTransferIds = new Set<string>();
    const uniqueTransactions = transactions.filter(t => {
      if (t.type === 'transfer' && t.transferId) {
        if (seenTransferIds.has(t.transferId)) {
          return false; // Пропускаем дубликат перевода
        }
        seenTransferIds.add(t.transferId);
      }
      return true;
    });

    return uniqueTransactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [transactions]);

  // Memoize calculations for performance
  const { balancesByCurrency, currentMonthName } = useMemo(() => {
    // Level 2: Group balances by currency (no conversion)
    // Exclude debt accounts from total balance
    const balances: Record<string, number> = {};
    accounts.forEach(account => {
      // Skip debt accounts - they shouldn't be included in total balance
      if (account.is_debt) return;

      if (!balances[account.currency]) {
        balances[account.currency] = 0;
      }
      balances[account.currency] += account.balance;
    });

    // Получаем название текущего месяца
    const currentDate = new Date();
    const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long' });
    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return {
      balancesByCurrency: balances,
      currentMonthName: capitalizedMonthName
    };
  }, [accounts]);

  // Get monthly stats from API or use defaults
  const monthlyIncome = monthlyStats ? parseFloat(monthlyStats.monthly_income) : 0;
  const monthlyExpenses = monthlyStats ? parseFloat(monthlyStats.monthly_expenses) : 0;
  const monthlyChange = monthlyStats ? parseFloat(monthlyStats.monthly_change) : 0;

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    const symbol = getCurrencySymbol(currency);
    return `${amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} ${symbol}`;
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <OptimizedMotion className="bg-gradient-to-br from-blue-500 to-indigo-700 px-4 pt-6 pb-3 relative overflow-hidden">
        {/* Background decorations - simplified for performance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-y-12 translate-y-8"></div>

        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <h1 className="text-white font-medium">FinanceTracker</h1>
            </div>
            <LightMotion whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="text-white hover:bg-white/20 transition-all duration-200"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            </LightMotion>
          </div>

          {/* Total Balance */}
          <OptimizedMotion
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <p className="text-white/80 text-sm mb-1">Общий баланс</p>
            {showBalance ? (
              <OptimizedMotion
                className="space-y-1 mb-2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Object.entries(balancesByCurrency).slice(0, 2).map(([currency, balance]) => (
                  <p key={currency} className="text-white text-2xl font-medium">
                    {formatCurrency(balance, currency)}
                  </p>
                ))}
              </OptimizedMotion>
            ) : (
              <OptimizedMotion
                as="p"
                className="text-white text-3xl font-medium mb-2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                • • •
              </OptimizedMotion>
            )}
            <div className="flex items-center justify-center gap-2">
              <div
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm ${
                  monthlyChange >= 0
                    ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/30'
                    : 'bg-red-500/30 text-red-100 border border-red-400/30'
                }`}
              >
                {monthlyChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {showBalance ? formatCurrency(Math.abs(monthlyChange), baseCurrency) : "• • •"}
                </span>
              </div>
              <span className="text-white/60 text-xs">за месяц</span>
            </div>
          </OptimizedMotion>

          {/* Accounts */}
          <div className="mb-4">
            {/* First 4 accounts in 2x2 grid */}
            {accounts.length > 0 && (
              <OptimizedMotion
                className="grid grid-cols-2 gap-3"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                {accounts.slice(0, 4).map((account) => {
                  const Icon = account.icon;
                  return (
                    <OptimizedMotion
                      key={account.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                      onClick={onManageAccounts}
                    >
                      <Card className="bg-white/15 border-white/30 backdrop-blur-md hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${account.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-white/90 text-sm font-medium truncate min-w-0">
                              {account.name}
                            </span>
                          </div>
                          <p className="text-white font-medium">
                            {showBalance ? formatCurrency(account.balance, account.currency) : "• • •"}
                          </p>
                        </CardContent>
                      </Card>
                    </OptimizedMotion>
                  );
                })}
              </OptimizedMotion>
            )}
          </div>
        </div>
      </OptimizedMotion>

      {/* Content */}
      <OptimizedMotion
        className="px-4 pt-6 pb-5 max-w-md mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        {/* Quick Actions */}
        <OptimizedMotion
          className="mb-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <h2 className="font-medium mb-3 text-foreground">Быстрые действия</h2>
          <div className="space-y-3">
            <LightMotion
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={onAddTransaction}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 h-auto flex-col gap-2 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="text-sm relative z-10">Добавить операцию</span>
              </Button>
            </LightMotion>
            <div className="grid grid-cols-2 gap-3">
              {onTransfer && (
                <LightMotion
                  whileTap={accounts.length >= 2 ? { scale: 0.97 } : {}}
                >
                  <Button
                    onClick={onTransfer}
                    variant="outline"
                    disabled={accounts.length < 2}
                    className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 p-4 h-auto flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                    <span className="text-sm">Перевод</span>
                  </Button>
                </LightMotion>
              )}
              <LightMotion
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={onManageAccounts}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 p-4 h-auto flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm">Счета</span>
                </Button>
              </LightMotion>
            </div>
          </div>
        </OptimizedMotion>

        {/* Quick Stats */}
        <OptimizedMotion
          className="mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-foreground">Этот месяц</h2>
            <LightMotion whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {currentMonthName}
              </Button>
            </LightMotion>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-sm">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600/70">Доходы</p>
                      <OptimizedMotion as="p"
                        className="font-medium text-sm text-emerald-700"
                        key={showBalance ? monthlyIncome : 'hidden'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {showBalance ? formatCurrency(monthlyIncome, baseCurrency) : "• • •"}
                      </OptimizedMotion>
                    </div>
                  </div>
                </CardContent>
              </Card>
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-sm">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-red-600/70">Расходы</p>
                      <OptimizedMotion as="p"
                        className="font-medium text-sm text-red-700"
                        key={showBalance ? monthlyExpenses : 'hidden'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {showBalance ? formatCurrency(monthlyExpenses, baseCurrency) : "• • •"}
                      </OptimizedMotion>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>
        </OptimizedMotion>

        {/* Recent Transactions */}
        <OptimizedMotion
          className={debtAccounts.length > 0 ? "mb-4" : ""}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-foreground">Последние операции</h2>
            <LightMotion whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onViewAllTransactions}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
              >
                <Filter className="w-4 h-4 mr-1" />
                Все
              </Button>
            </LightMotion>
          </div>
          {recentTransactions.length > 0 ? (
            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-0">
                {recentTransactions.map((transaction, index) => (
                  <OptimizedMotion
                    key={transaction.id}
                    className={`p-4 hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer ${
                      index !== recentTransactions.length - 1 ? 'border-b border-blue-100' : ''
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.55 + index * 0.05 }}
                    onClick={() => onTransactionClick(transaction)}
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
                          <h3 className="font-medium text-sm truncate">
                            {transaction.type === 'transfer' ? 'Перевод' : transaction.categoryName}
                          </h3>
                          {transaction.type !== 'transfer' && (
                            <p className="text-xs text-muted-foreground truncate">
                              {transaction.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground truncate">
                            {new Date(transaction.date).toLocaleDateString('ru-RU')} в {transaction.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <OptimizedMotion as="p"
                          className={`font-medium ${
                            transaction.type === 'transfer'
                              ? 'text-purple-600'
                              : transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                          }`}
                          key={showBalance ? transaction.amount : 'hidden'}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {transaction.type === 'transfer'
                            ? ''
                            : transaction.type === 'income' ? '+' : '-'}
                          {showBalance ? formatCurrency(transaction.amount, transaction.accountCurrency || DEFAULT_CURRENCY) : "• • •"}
                        </OptimizedMotion>
                        <Badge
                          variant="outline"
                          className="text-xs max-w-full border-blue-300 text-blue-700"
                        >
                          <span className="truncate block">
                            {transaction.type === 'transfer' && transaction.toAccountId
                              ? (() => {
                                  const fromAccount = accounts.find(acc => String(acc.id) === String(transaction.accountId))?.name || '?';
                                  const toAccount = accounts.find(acc => String(acc.id) === String(transaction.toAccountId))?.name || '?';
                                  const maxLength = 10;
                                  const truncateText = (text: string) => text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
                                  return `${truncateText(fromAccount)} → ${truncateText(toAccount)}`;
                                })()
                              : (() => {
                                  const accountName = accounts.find(acc => String(acc.id) === String(transaction.accountId))?.name || 'Неизвестно';
                                  const maxLength = 22; // Максимальная длина для одного счета
                                  return accountName.length > maxLength ? accountName.slice(0, maxLength) + '...' : accountName;
                                })()}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </OptimizedMotion>
                ))}
                <div className="p-4 border-t border-blue-100">
                  <LightMotion
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={onViewAllTransactions}
                      variant="outline"
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
                    >
                      Показать все операции
                    </Button>
                  </LightMotion>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
              <CardContent className="p-4">
                <OptimizedMotion 
                  className="text-center py-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <Wallet className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    Операций пока нет
                  </p>
                  <LightMotion
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={onAddTransaction}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
                    >
                      Добавить первую операцию
                    </Button>
                  </LightMotion>
                </OptimizedMotion>
              </CardContent>
            </Card>
          )}
        </OptimizedMotion>

        {/* Debts Section */}
        {debtAccounts.length > 0 && (
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h2 className="font-medium text-foreground">Долги</h2>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                {debtAccounts.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {debtAccounts.map((debt) => (
                <DebtAccountCard
                  key={debt.id}
                  account={debt}
                  onClick={onManageAccounts}
                />
              ))}
            </div>
          </OptimizedMotion>
        )}
      </OptimizedMotion>
    </div>
  );
}