import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ArrowLeft, Plus, Minus, Home, Car, ShoppingBag, Coffee, Zap, Heart, Wallet, CreditCard, PiggyBank, DollarSign, Briefcase, TrendingUp, Gift, Loader2 } from "./icons";
import { toast } from "sonner@2.0.3";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import categoriesService, { Category } from "../services/categories.service";
import transactionsService from "../services/transactions.service";
import accountsService, { Account } from "../services/accounts.service";
import { getAccountIconComponent } from "../utils/accountIcons";
import { getCurrencySymbol } from "../constants/currencies";

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

interface AddTransactionPageProps {
  onBack: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const expenseCategories = [
  { id: "food", name: "Еда", icon: Coffee, color: "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700" },
  { id: "transport", name: "Транспорт", icon: Car, color: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700" },
  { id: "shopping", name: "Покупки", icon: ShoppingBag, color: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700" },
  { id: "home", name: "Дом", icon: Home, color: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700" },
  { id: "utilities", name: "Коммуналка", icon: Zap, color: "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700" },
  { id: "health", name: "Здоровье", icon: Heart, color: "bg-gradient-to-br from-red-100 to-red-200 text-red-700" },
];

const incomeCategories = [
  { id: "salary", name: "Зарплата", icon: DollarSign, color: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700" },
  { id: "freelance", name: "Фриланс", icon: Briefcase, color: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700" },
  { id: "business", name: "Бизнес", icon: TrendingUp, color: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700" },
  { id: "investment", name: "Инвестиции", icon: TrendingUp, color: "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700" },
  { id: "gift", name: "Подарок", icon: Gift, color: "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700" },
  { id: "other", name: "Другое", icon: Plus, color: "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700" },
];

const accounts = [
  { id: "1", name: "Основной счёт", icon: Wallet },
  { id: "2", name: "Накопления", icon: PiggyBank },
  { id: "3", name: "Карта", icon: CreditCard },
];

export function AddTransactionPage({ onBack, onAddTransaction }: AddTransactionPageProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  const [description, setDescription] = useState('');
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiAccounts, setApiAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [debtAccount, setDebtAccount] = useState<{ id: string; name: string; balance: number } | null>(null);

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    const symbol = getCurrencySymbol(currency);
    return `${amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} ${symbol}`;
  };

  // Загрузить категории и счета из API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categories, accounts] = await Promise.all([
          categoriesService.getAll(),
          accountsService.getAll()
        ]);

        // Проверяем что данные - массивы
        if (Array.isArray(categories) && categories.length > 0) {
          setApiCategories(categories);
        } else {
          console.error('[AddTransaction] Categories is not an array or empty:', categories);
          toast.error('Не удалось загрузить категории. Попробуйте перезапустить приложение.');
        }

        if (Array.isArray(accounts) && accounts.length > 0) {
          setApiAccounts(accounts);
          setAccount(accounts[0].id.toString());
        } else {
          console.error('[AddTransaction] Accounts is not an array or empty:', accounts);
          toast.error('Не удалось загрузить счета. Попробуйте перезапустить приложение.');
        }
      } catch (error: any) {
        console.error('[AddTransaction] Failed to load data:', error);

        if (error.response?.status === 401) {
          toast.error('Ошибка авторизации. Перезапустите приложение.');
        } else {
          toast.error('Не удалось загрузить данные. Проверьте подключение к интернету.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Небольшая задержка чтобы токен успел сохраниться
    const timer = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback на хардкод категории если API не ответил
  const expenseCategoriesFromAPI = useMemo(() => {
    return apiCategories.filter(cat => cat.category_type === 'expense');
  }, [apiCategories]);

  const incomeCategoriesFromAPI = useMemo(() => {
    return apiCategories.filter(cat => cat.category_type === 'income');
  }, [apiCategories]);

  // Используем только API категории (без fallback на хардкод)
  const currentCategories = useMemo(() => {
    return type === 'expense' ? expenseCategoriesFromAPI : incomeCategoriesFromAPI;
  }, [type, expenseCategoriesFromAPI, incomeCategoriesFromAPI]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !account) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0];
    const currentTimeStr = currentTime.toTimeString().slice(0, 5);

    try {
      // Создать транзакцию через API (account_id передается в URL, не в теле)
      const response = await transactionsService.create(account, {
        amount: parseFloat(amount),
        transaction_type: type,
        description: description || '',
        date: currentDate,
        time: currentTimeStr,
        category_id: parseInt(category)
      });

      // Также вызвать старый callback для обновления UI (пока моки используются)
      const categoryName = currentCategories
        .find(cat => String(cat.id) === category)?.name || '';

      const transaction = {
        type: type as 'income' | 'expense',
        amount: parseFloat(amount),
        category,
        categoryName,
        accountId: account,
        description,
        date: currentDate,
        time: currentTimeStr
      };

      onAddTransaction(transaction);

      // Проверяем, был ли полностью погашен долг
      if (response.debt_fully_repaid && response.debt_account) {
        setDebtAccount(response.debt_account);
        setShowDebtDialog(true);

        // Reset form
        setAmount('');
        setCategory('');
        setAccount('');
        setDescription('');
      } else {
        toast.success(`${type === 'income' ? 'Доход' : 'Расход'} добавлен!`);

        // Reset form
        setAmount('');
        setCategory('');
        setAccount('');
        setDescription('');

        // Navigate back after successful submission
        setTimeout(() => {
          onBack();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Failed to create transaction:', error);

      // Проверяем, является ли ошибка связанной с недостатком средств
      if (error.response?.data?.error === 'Недостаточно средств') {
        toast.error('Недостаточно средств на счете');
      } else if (error.response?.data?.error === 'Долговой счет не может иметь положительный баланс') {
        const details = error.response?.data?.details?.[0] || 'Долговой счет нельзя пополнить сверх нуля';
        toast.error(details, { duration: 5000 });
      } else {
        toast.error('Не удалось сохранить транзакцию');
      }
    }
  }, [amount, category, account, type, description, currentCategories, onAddTransaction, onBack]);

  const handleDeleteDebtAccount = async () => {
    if (!debtAccount) return;

    try {
      await accountsService.delete(debtAccount.id);
      toast.success(`Долговой счет "${debtAccount.name}" удален`);
      setShowDebtDialog(false);
      onBack();
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Не удалось удалить счет');
    }
  };

  const handleKeepDebtAccount = () => {
    toast.success('Транзакция добавлена!');
    setShowDebtDialog(false);
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  // Показываем экран загрузки
  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="text-slate-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если категории не загрузились - показываем ошибку
  if (apiCategories.length === 0) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Не удалось загрузить категории</h2>
          <p className="text-slate-600 mb-4">Проверьте подключение к интернету и попробуйте снова</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Обновить страницу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <OptimizedMotion 
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 pb-6 relative overflow-hidden"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-y-12"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <OptimizedMotion 
          className="flex items-center justify-between relative z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <LightMotion
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
          </LightMotion>
          <h1 className="text-lg font-medium text-white">Новая операция</h1>
          <div className="w-8" />
        </OptimizedMotion>
      </OptimizedMotion>

      <OptimizedMotion 
        className="p-4 -mt-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <OptimizedMotion
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <CardTitle className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Добавить операцию
              </CardTitle>
            </OptimizedMotion>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type Selection */}
            <OptimizedMotion 
              className="flex gap-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <LightMotion
                className="flex-1"
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  variant={type === 'expense' ? 'default' : 'outline'}
                  className={`w-full transition-all duration-300 ${type === 'expense'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
                    : 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400'
                  }`}
                  onClick={() => setType('expense')}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Расход
                </Button>
              </LightMotion>
              <LightMotion
                className="flex-1"
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  variant={type === 'income' ? 'default' : 'outline'}
                  className={`w-full transition-all duration-300 ${type === 'income' 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg' 
                    : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400'
                  }`}
                  onClick={() => setType('income')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Доход
                </Button>
              </LightMotion>
            </OptimizedMotion>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <OptimizedMotion 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Label htmlFor="amount" className="text-slate-700">Сумма *</Label>
                <div className="relative">
                  <OptimizedMotion
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-2xl font-medium text-center py-6 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-gradient-to-br from-white to-blue-50/30 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      step="0.01"
                      min="0"
                    />
                  </OptimizedMotion>
                </div>
              </OptimizedMotion>

              {/* Category */}
              <OptimizedMotion 
                className="space-y-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <Label htmlFor="category" className="text-slate-700">
                  {type === 'expense' ? 'Категория *' : 'Источник дохода *'}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {currentCategories.map((cat, index) => {
                    // Если категория из API - используем эмодзи icon, иначе Lucide Icon
                    const isApiCategory = 'icon' in cat && typeof cat.icon === 'string';
                    const Icon = !isApiCategory && 'icon' in cat ? cat.icon : null;
                    const categoryId = String(cat.id);

                    return (
                      <LightMotion
                        key={categoryId}
                        whileTap={{ scale: 0.97 }}
                      >
                        <button
                          type="button"
                          className={`p-3 rounded-lg border text-center transition-all duration-200 w-full h-[88px] flex flex-col items-center justify-center ${
                            category === categoryId
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                              : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/30'
                          }`}
                          onClick={() => setCategory(categoryId)}
                        >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-gradient-to-br from-blue-100 to-indigo-200 shadow-sm flex-shrink-0">
                          {isApiCategory ? (
                            <span className="text-lg">{cat.icon}</span>
                          ) : Icon ? (
                            <Icon className={`w-4 h-4 ${
                              type === 'expense' ? 'text-red-600' : 'text-emerald-600'
                            }`} />
                          ) : null}
                        </div>
                        <span className="text-xs text-slate-700 truncate w-full px-1">{cat.name}</span>
                        </button>
                      </LightMotion>
                    );
                  })}
                </div>
              </OptimizedMotion>

              {/* Account Selection */}
              <OptimizedMotion 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Label htmlFor="account" className="text-slate-700">Счёт *</Label>
                <OptimizedMotion whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Select value={account} onValueChange={setAccount}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-gradient-to-br from-white to-blue-50/30">
                      <SelectValue placeholder="Выберите счёт" />
                    </SelectTrigger>
                    <SelectContent>
                      {(apiAccounts.length > 0 ? apiAccounts : accounts).map((acc) => {
                        const Icon = 'account_type' in acc ? getAccountIconComponent(acc.account_type) : ('icon' in acc ? acc.icon : Wallet);
                        const balance = 'balance' in acc ? parseFloat(acc.balance.toString()) : 0;
                        const currency = 'currency' in acc ? acc.currency : 'RUB';
                        return (
                          <SelectItem key={acc.id} value={String(acc.id)}>
                            <div className="flex items-center justify-between gap-4 w-full">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-blue-600" />
                                <span>{acc.name}</span>
                              </div>
                              {'balance' in acc && (
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(balance, currency)}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </OptimizedMotion>
              </OptimizedMotion>

              {/* Description */}
              <OptimizedMotion 
                className="space-y-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.55 }}
              >
                <Label htmlFor="description" className="text-slate-700">Описание</Label>
                <OptimizedMotion whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Textarea
                    id="description"
                    placeholder="Добавьте описание..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-gradient-to-br from-white to-blue-50/30"
                  />
                </OptimizedMotion>
              </OptimizedMotion>

              {/* Submit Button */}
              <LightMotion
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10 font-medium">
                    Добавить {type === 'income' ? 'доход' : 'расход'}
                  </span>
                </Button>
              </LightMotion>
            </form>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Debt Repayment Dialog */}
      <AlertDialog open={showDebtDialog} onOpenChange={setShowDebtDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm border-blue-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              🎉 Долг полностью погашен!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 space-y-3 pt-2">
              <p>
                Поздравляем! Вы полностью погасили долговой счет <span className="font-semibold text-slate-800">"{debtAccount?.name}"</span>.
              </p>
              <p className="text-sm">
                Хотите удалить этот счет из списка? Вы всегда сможете создать его снова при необходимости.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={handleKeepDebtAccount}
              className="border-blue-200 text-slate-700 hover:bg-blue-50"
            >
              Оставить счет
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDebtAccount}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Удалить счет
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}