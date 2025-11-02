import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { DatePicker } from "./ui/date-picker";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  CalendarIcon as Calendar,
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
  Gift,
  ArrowRightLeft,
  Loader2
} from "./icons";
import { toast } from "sonner@2.0.3";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import categoriesService, { Category } from "../services/categories.service";
import accountsService, { Account as APIAccount } from "../services/accounts.service";
import transactionsService from "../services/transactions.service";
import transfersService from "../services/transfers.service";
import { getCurrencySymbol, DEFAULT_CURRENCY } from "../constants/currencies";
import { enUS, ru } from "date-fns/locale";

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
  transferId?: string; // Для редактирования переводов
}

interface TransactionDetailPageProps {
  transaction: Transaction;
  onBack: () => void;
  onUpdate: (updatedTransaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

const iconMap: Record<string, typeof Wallet> = {
  wallet: Wallet,
  credit_card: CreditCard,
  piggy_bank: PiggyBank,
};

export function TransactionDetailPage({ transaction, onBack, onUpdate, onDelete }: TransactionDetailPageProps) {
  const { t, i18n } = useTranslation('transactions');
  const isRussian = (i18n.language || 'en').toLowerCase().startsWith('ru');
  const dateDisplayLocale = isRussian ? 'ru-RU' : 'en-US';
  const calendarLocale = isRussian ? ru : enUS;
  const [isEditing, setIsEditing] = useState(false);
  const [accounts, setAccounts] = useState<APIAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({
    amount: transaction.amount.toString(),
    type: transaction.type,
    category: transaction.category,
    accountId: transaction.accountId,
    toAccountId: transaction.toAccountId || '',
    description: transaction.description,
    date: transaction.date,
    time: transaction.time
  });

  // Загрузка счетов и категорий
  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsData, categoriesData] = await Promise.all([
          accountsService.getAll(),
          categoriesService.getAll()
        ]);
        setAccounts(accountsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error(t('messages.failedToLoadData'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t]);

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    const symbol = getCurrencySymbol(currency);
    return `${amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} ${symbol}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(dateDisplayLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Memoize category and account lookups for performance
  const { currentCategories, currentCategory, currentAccount, toAccount } = useMemo(() => {
    // Используем категории из API, фильтруем по типу
    const apiCategories = categories.filter(cat =>
      editData.type === 'expense' ? cat.category_type === 'expense' : cat.category_type === 'income'
    );

    const category = apiCategories.find(cat => String(cat.id) === String(editData.category));
    const account = accounts.find(acc => String(acc.id) === String(editData.accountId));
    const targetAccount = transaction.toAccountId
      ? accounts.find(acc => String(acc.id) === String(transaction.toAccountId))
      : undefined;

    return {
      currentCategories: apiCategories,
      currentCategory: category,
      currentAccount: account,
      toAccount: targetAccount
    };
  }, [editData.type, editData.category, editData.accountId, categories, accounts, transaction.toAccountId]);

  const handleSave = useCallback(async () => {
    // Проверка для переводов
    if (transaction.type === 'transfer') {
      if (!editData.amount || !editData.accountId || !editData.toAccountId) {
        toast.error(t('messages.fillRequired'));
        return;
      }
      if (editData.accountId === editData.toAccountId) {
        toast.error(t('detail.cannotTransferSameAccount'));
        return;
      }
    } else {
      // Проверка для обычных транзакций
      if (!editData.amount || !editData.category || !editData.accountId) {
        toast.error(t('messages.fillRequired'));
        return;
      }
    }

    try {
      if (transaction.type === 'transfer' && transaction.transferId) {
        // Обновляем перевод через transfers API
        await transfersService.update(transaction.transferId, {
          amount: parseFloat(editData.amount),
          from_account_id: editData.accountId,
          to_account_id: editData.toAccountId,
          description: editData.description,
          date: editData.date
        });

        // Обновляем локальное состояние
        const updatedTransaction: Transaction = {
          ...transaction,
          amount: parseFloat(editData.amount),
          accountId: editData.accountId,
          toAccountId: editData.toAccountId,
          description: editData.description,
          date: editData.date,
          time: editData.time
        };

        onUpdate(updatedTransaction);
        setIsEditing(false);
        toast.success(t('detail.transferUpdated'));
      } else {
        // Обновляем обычную транзакцию через transactions API
        await transactionsService.update(transaction.id, {
          amount: parseFloat(editData.amount),
          transaction_type: editData.type as 'income' | 'expense',
          description: editData.description,
          date: editData.date,
          account_id: editData.accountId,
          category_id: parseInt(editData.category)
        });

        // Обновляем локальное состояние
        const updatedTransaction: Transaction = {
          ...transaction,
          amount: parseFloat(editData.amount),
          type: editData.type as 'income' | 'expense' | 'transfer',
          category: editData.category,
          categoryName: currentCategory?.name || '',
          accountId: editData.accountId,
          description: editData.description,
          date: editData.date,
          time: editData.time
        };

        onUpdate(updatedTransaction);
        setIsEditing(false);
        toast.success(t('detail.operationUpdated'));
      }
    } catch (error: any) {
      console.error('Failed to update transaction:', error);

      // Проверяем, является ли ошибка связанной с недостатком средств
      if (error.response?.data?.error === 'Недостаточно средств') {
        toast.error(t('messages.insufficientFunds'));
      } else {
        const typeText = transaction.type === 'transfer' ? t('detail.transferType') : t('detail.operationType');
        toast.error(t('detail.failedToUpdate', { type: typeText }));
      }
    }
  }, [editData, transaction, currentCategory, onUpdate, t]);

  const handleDelete = useCallback(async () => {
    try {
      if (transaction.type === 'transfer' && transaction.transferId) {
        // Удаляем перевод через transfers API
        await transfersService.delete(transaction.transferId);
        toast.success(t('detail.transferDeleted'));
      } else {
        // Удаляем обычную транзакцию через transactions API
        await transactionsService.delete(transaction.id);
        toast.success(t('detail.operationDeleted'));
      }

      // Обновляем локальное состояние
      onDelete(transaction.id);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      const typeText = transaction.type === 'transfer' ? t('detail.transferType') : t('detail.operationType');
      toast.error(t('detail.failedToUpdate', { type: typeText }));
    }
  }, [transaction.id, transaction.type, transaction.transferId, onDelete, t]);

  const handleTypeChange = useCallback((newType: 'income' | 'expense') => {
    setEditData(prev => ({
      ...prev,
      type: newType,
      category: '' // Reset category when type changes
    }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ background: 'var(--bg-page-dashboard)' }}>
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: 'var(--bg-page-dashboard)' }}>
      {/* Background decorations removed for performance */}
      
      {/* Header */}
      <OptimizedMotion
        className="p-4 pb-6 relative overflow-hidden"
        style={{ background: 'var(--bg-header)' }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background decorations - simplified for performance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-y-12"></div>
        
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
              className="text-white hover:bg-white/20 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </LightMotion>
          <h1 className="font-medium text-white">{t('detail.title')}</h1>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <LightMotion whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </LightMotion>
                <LightMotion whileTap={{ scale: 0.95 }}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-red-500/20 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-red-200 bg-gradient-to-br from-white to-red-50/30">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700">
                          {t('detail.deleteConfirm', {
                            type: transaction.type === 'transfer' ? t('detail.transferType') : t('detail.operationType')
                          })}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600">
                          {t('detail.deleteDescription', {
                            type: transaction.type === 'transfer' ? t('detail.transferType') : t('detail.operationType'),
                            deleted: transaction.type === 'transfer' ? t('detail.transferDeleted') : t('detail.operationDeleted')
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-red-300">
                          {t('detail.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {t('detail.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </LightMotion>
              </>
            )}
            {isEditing && (
              <>
                <LightMotion whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="text-white hover:bg-green-500/20 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </LightMotion>
                <LightMotion whileTap={{ scale: 0.95 }}>
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
                        toAccountId: transaction.toAccountId || '',
                        description: transaction.description,
                        date: transaction.date,
                        time: transaction.time
                      });
                    }}
                    className="text-white hover:bg-white/20 transition-all duration-200"
                  >
                    {t('detail.cancel')}
                  </Button>
                </LightMotion>
              </>
            )}
          </div>
        </OptimizedMotion>
      </OptimizedMotion>

      <OptimizedMotion 
        className="p-4 -mt-2 space-y-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {!isEditing ? (
          // View Mode
          <OptimizedMotion
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
              <CardContent className="p-6 space-y-4">
                {/* Amount */}
                <div className="text-center py-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-2 ${
                    transaction.type === 'transfer'
                      ? 'bg-purple-100 text-purple-700'
                      : transaction.type === 'income'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {transaction.type === 'transfer' ? (
                      <ArrowRightLeft className="w-4 h-4" />
                    ) : transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {transaction.type === 'transfer' ? t('types.transfer') : transaction.type === 'income' ? t('types.income') : t('types.expense')}
                  </div>
                  <p className={`text-3xl font-medium ${
                    transaction.type === 'transfer'
                      ? 'text-purple-600'
                      : transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-'}{formatCurrency(transaction.amount, transaction.accountCurrency || DEFAULT_CURRENCY)}
                  </p>
                </div>

                {/* Category - only for non-transfers */}
                {transaction.type !== 'transfer' && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    {currentCategory && (
                      <>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
                          <span className="text-xl">{currentCategory.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{currentCategory.name}</p>
                          <p className="text-sm text-slate-600">{t('detail.category')}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Account - for transfers show "from → to" vertically */}
                {transaction.type === 'transfer' && currentAccount && toAccount ? (
                  <div className="space-y-2">
                    {/* From Account */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {(() => {
                          const Icon = iconMap[currentAccount.account_type] || Wallet;
                          return <Icon className="w-5 h-5 text-purple-600" />;
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 truncate">{currentAccount.name}</p>
                        <p className="text-xs text-purple-600">{t('detail.from')}</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                    </div>

                    {/* To Account */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {(() => {
                          const Icon = iconMap[toAccount.account_type] || Wallet;
                          return <Icon className="w-5 h-5 text-purple-600" />;
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 truncate">{toAccount.name}</p>
                        <p className="text-xs text-purple-600">{t('detail.to')}</p>
                      </div>
                    </div>
                  </div>
                ) : transaction.type !== 'transfer' && currentAccount ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const Icon = iconMap[currentAccount.account_type] || Wallet;
                        return <Icon className="w-5 h-5 text-purple-600" />;
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 truncate">{currentAccount.name}</p>
                      <p className="text-sm text-slate-600">{t('detail.account')}</p>
                    </div>
                  </div>
                ) : null}

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-800">{formatDate(transaction.date)}</p>
                      <p className="text-sm text-slate-600">{t('fields.date')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-800">{transaction.time}</p>
                      <p className="text-sm text-slate-600">{t('fields.time')}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {transaction.description && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">{t('fields.description')}</p>
                    <p className="font-medium text-slate-800">{transaction.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </OptimizedMotion>
        ) : (
          // Edit Mode
          <OptimizedMotion
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {transaction.type === 'transfer' ? t('detail.editTransfer') : t('detail.editOperation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Selection - только для обычных операций */}
                {transaction.type !== 'transfer' && (
                  <div className="flex gap-2">
                    <LightMotion className="flex-1" whileTap={{ scale: 0.98 }}>
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
                        {t('types.expense')}
                      </Button>
                    </LightMotion>
                    <LightMotion className="flex-1" whileTap={{ scale: 0.98 }}>
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
                        {t('types.income')}
                      </Button>
                    </LightMotion>
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('detail.amount')} {t('detail.required')}</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={editData.amount}
                      onChange={(e) => setEditData(prev => ({ ...prev, amount: e.target.value }))}
                      className="text-xl font-medium text-center py-4 pr-16 border-blue-200 focus:border-blue-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      step="0.01"
                      min="0"
                    />
                    {currentAccount && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium text-lg">
                        {getCurrencySymbol(currentAccount.currency)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category - только для обычных операций */}
                {transaction.type !== 'transfer' && (
                  <div className="space-y-2">
                    <Label>{t('fields.category')} {t('detail.required')}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {currentCategories.map((cat) => {
                        return (
                          <LightMotion
                            key={cat.id}
                            whileTap={{ scale: 0.97 }}
                          >
                            <button
                              type="button"
                              className={`p-3 rounded-lg border text-center transition-all duration-200 w-full ${
                                String(editData.category) === String(cat.id)
                                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                                  : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/30'
                              }`}
                              onClick={() => setEditData(prev => ({ ...prev, category: String(cat.id) }))}
                            >
                              <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 bg-gradient-to-br from-blue-100 to-indigo-200">
                                <span className="text-lg">{cat.icon}</span>
                              </div>
                              <span className="text-xs">{cat.name}</span>
                            </button>
                          </LightMotion>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Account(s) */}
                {transaction.type === 'transfer' ? (
                  // Для переводов: два селекта (откуда → куда)
                  <>
                    <div className="space-y-2">
                      <Label>{t('detail.from')} {t('detail.required')}</Label>
                      <Select value={String(editData.accountId)} onValueChange={(value) => setEditData(prev => ({ ...prev, accountId: value }))}>
                        <SelectTrigger className="border-purple-200 focus:border-purple-400">
                          <SelectValue placeholder={t('detail.selectAccount')} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts
                            .filter(acc => String(acc.id) !== String(editData.toAccountId))
                            .filter(acc => !currentAccount || acc.currency === currentAccount.currency)
                            .map((acc) => {
                            const Icon = iconMap[acc.account_type] || Wallet;
                            return (
                              <SelectItem key={acc.id} value={String(acc.id)}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-purple-600" />
                                  <span>{acc.name} ({parseFloat(acc.balance.toString()).toFixed(0)} {getCurrencySymbol(acc.currency)})</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-center">
                      <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('detail.to')} {t('detail.required')}</Label>
                      <Select value={String(editData.toAccountId)} onValueChange={(value) => setEditData(prev => ({ ...prev, toAccountId: value }))}>
                        <SelectTrigger className="border-purple-200 focus:border-purple-400">
                          <SelectValue placeholder={t('detail.selectAccount')} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts
                            .filter(acc => String(acc.id) !== String(editData.accountId))
                            .filter(acc => !currentAccount || acc.currency === currentAccount.currency)
                            .map((acc) => {
                            const Icon = iconMap[acc.account_type] || Wallet;
                            return (
                              <SelectItem key={acc.id} value={String(acc.id)}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-purple-600" />
                                  <span>{acc.name} ({parseFloat(acc.balance.toString()).toFixed(0)} {getCurrencySymbol(acc.currency)})</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {currentAccount && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('detail.transfersOnlySameCurrency', { currency: currentAccount.currency })}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  // Для обычных операций: один селект (только счета с той же валютой)
                  <div className="space-y-2">
                    <Label>{t('detail.account')} {t('detail.required')}</Label>
                    <Select value={String(editData.accountId)} onValueChange={(value) => setEditData(prev => ({ ...prev, accountId: value }))}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder={t('detail.selectAccount')} />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts
                          .filter(acc => !currentAccount || acc.currency === currentAccount.currency)
                          .map((acc) => {
                          const Icon = iconMap[acc.account_type] || Wallet;
                          return (
                            <SelectItem key={acc.id} value={String(acc.id)}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-blue-600" />
                                <span>{acc.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {currentAccount && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('detail.changeAccountCurrencyHint', { currency: currentAccount.currency })}
                      </p>
                    )}
                  </div>
                )}

                {/* Date & Time */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="date">{t('fields.date')}</Label>
                    <DatePicker
                      id="date"
                      value={editData.date}
                      onChange={(newDate) => setEditData(prev => ({ ...prev, date: newDate }))}
                      placeholder={t('fields.date')}
                      displayLocale={dateDisplayLocale}
                      calendarLocale={calendarLocale}
                      className="h-10 border-blue-200 focus-visible:ring-blue-400 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">{t('fields.time')}</Label>
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
                  <Label htmlFor="description">{t('fields.description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('detail.addDescription')}
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </CardContent>
            </Card>
          </OptimizedMotion>
        )}
      </OptimizedMotion>
    </div>
  );
}
