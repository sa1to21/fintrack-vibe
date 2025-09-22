import { useState, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Save, 
  Calendar,
  Clock,
  Wallet,
  CreditCard,
  PiggyBank,
  Plus, 
  Minus, 
  Home, 
  Car, 
  ShoppingBag, 
  Coffee, 
  Zap, 
  Heart,
  DollarSign,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Gift
} from "lucide-react";
import { toast } from "sonner@2.0.3";
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

interface Account {
  id: string;
  name: string;
  icon: typeof Wallet;
  balance: number;
}

interface TransactionDetailPageProps {
  transaction: Transaction;
  onBack: () => void;
  onUpdate: (updatedTransaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

const expenseCategories = [
  { id: "food", name: "Еда", icon: Coffee },
  { id: "transport", name: "Транспорт", icon: Car },
  { id: "shopping", name: "Покупки", icon: ShoppingBag },
  { id: "home", name: "Дом", icon: Home },
  { id: "utilities", name: "Коммуналка", icon: Zap },
  { id: "health", name: "Здоровье", icon: Heart },
];

const incomeCategories = [
  { id: "salary", name: "Зарплата", icon: DollarSign },
  { id: "freelance", name: "Фриланс", icon: Briefcase },
  { id: "business", name: "Бизнес", icon: TrendingUp },
  { id: "investment", name: "Инвестиции", icon: TrendingUp },
  { id: "gift", name: "Подарок", icon: Gift },
  { id: "other", name: "Другое", icon: Plus },
];

const accounts: Account[] = [
  { id: "1", name: "Основной счёт", icon: Wallet, balance: 25430 },
  { id: "2", name: "Накопления", icon: PiggyBank, balance: 8750 },
  { id: "3", name: "Карта", icon: CreditCard, balance: 12340 },
];

export function TransactionDetailPage({ transaction, onBack, onUpdate, onDelete }: TransactionDetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    amount: transaction.amount.toString(),
    type: transaction.type,
    category: transaction.category,
    accountId: transaction.accountId,
    description: transaction.description,
    date: transaction.date,
    time: transaction.time
  });

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
      month: 'long',
      year: 'numeric'
    });
  };

  // Memoize category and account lookups for performance
  const { currentCategories, currentCategory, currentAccount } = useMemo(() => {
    const categories = editData.type === 'expense' ? expenseCategories : incomeCategories;
    const category = categories.find(cat => cat.id === editData.category);
    const account = accounts.find(acc => acc.id === editData.accountId);
    
    return {
      currentCategories: categories,
      currentCategory: category,
      currentAccount: account
    };
  }, [editData.type, editData.category, editData.accountId]);

  const handleSave = useCallback(() => {
    if (!editData.amount || !editData.category || !editData.accountId) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    const updatedTransaction: Transaction = {
      ...transaction,
      amount: parseFloat(editData.amount),
      type: editData.type as 'income' | 'expense',
      category: editData.category,
      categoryName: currentCategory?.name || '',
      accountId: editData.accountId,
      description: editData.description,
      date: editData.date,
      time: editData.time
    };

    onUpdate(updatedTransaction);
    setIsEditing(false);
    toast.success("Операция обновлена!");
  }, [editData, transaction, currentCategory, onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete(transaction.id);
    toast.success("Операция удалена!");
  }, [transaction.id, onDelete]);

  const handleTypeChange = useCallback((newType: 'income' | 'expense') => {
    setEditData(prev => ({
      ...prev,
      type: newType,
      category: '' // Reset category when type changes
    }));
  }, []);

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
          className="flex items-center justify-between relative z-10"
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
          <h1 className="font-medium text-white">Детали операции</h1>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-red-500/20 backdrop-blur-sm transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-red-200 bg-gradient-to-br from-white to-red-50/30">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700">
                          Удалить операцию?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600">
                          Это действие нельзя отменить. Операция будет удалена навсегда.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-red-300">
                          Отмена
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              </>
            )}
            {isEditing && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="text-white hover:bg-green-500/20 backdrop-blur-sm transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        amount: transaction.amount.toString(),
                        type: transaction.type,
                        category: transaction.category,
                        accountId: transaction.accountId,
                        description: transaction.description,
                        date: transaction.date,
                        time: transaction.time
                      });
                    }}
                    className="text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                  >
                    Отмена
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="p-4 -mt-2 space-y-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {!isEditing ? (
          // View Mode
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
              <CardContent className="p-6 space-y-4">
                {/* Amount */}
                <div className="text-center py-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-2 ${
                    transaction.type === 'income' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {transaction.type === 'income' ? 'Доход' : 'Расход'}
                  </div>
                  <p className={`text-3xl font-medium ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>

                {/* Category */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  {currentCategory && (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
                        <currentCategory.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{transaction.categoryName}</p>
                        <p className="text-sm text-slate-600">Категория</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Account */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  {currentAccount && (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                        <currentAccount.icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{currentAccount.name}</p>
                        <p className="text-sm text-slate-600">Счёт</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-800">{formatDate(transaction.date)}</p>
                      <p className="text-sm text-slate-600">Дата</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-800">{transaction.time}</p>
                      <p className="text-sm text-slate-600">Время</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {transaction.description && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Описание</p>
                    <p className="font-medium text-slate-800">{transaction.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Edit Mode
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Редактировать операцию
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Selection */}
                <div className="flex gap-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant={editData.type === 'expense' ? 'default' : 'outline'}
                      className={`w-full transition-all duration-300 ${editData.type === 'expense' 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg' 
                        : 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400'
                      }`}
                      onClick={() => handleTypeChange('expense')}
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Расход
                    </Button>
                  </motion.div>
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant={editData.type === 'income' ? 'default' : 'outline'}
                      className={`w-full transition-all duration-300 ${editData.type === 'income' 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg' 
                        : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400'
                      }`}
                      onClick={() => handleTypeChange('income')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Доход
                    </Button>
                  </motion.div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Сумма *</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={editData.amount}
                      onChange={(e) => setEditData(prev => ({ ...prev, amount: e.target.value }))}
                      className="text-xl font-medium text-center py-4 border-blue-200 focus:border-blue-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      step="0.01"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium">
                      ₽
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Категория *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {currentCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <motion.button
                          key={cat.id}
                          type="button"
                          className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                            editData.category === cat.id
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                              : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/30'
                          }`}
                          onClick={() => setEditData(prev => ({ ...prev, category: cat.id }))}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 bg-gradient-to-br from-blue-100 to-indigo-200">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-xs">{cat.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Account */}
                <div className="space-y-2">
                  <Label>Счёт *</Label>
                  <Select value={editData.accountId} onValueChange={(value) => setEditData(prev => ({ ...prev, accountId: value }))}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Выберите счёт" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => {
                        const Icon = acc.icon;
                        return (
                          <SelectItem key={acc.id} value={acc.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-blue-600" />
                              <span>{acc.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="date">Дата</Label>
                    <Input
                      id="date"
                      type="date"
                      value={editData.date}
                      onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Время</Label>
                    <Input
                      id="time"
                      type="time"
                      value={editData.time}
                      onChange={(e) => setEditData(prev => ({ ...prev, time: e.target.value }))}
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Добавьте описание..."
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}