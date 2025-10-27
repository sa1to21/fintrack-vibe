import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Wallet,
  CreditCard,
  PiggyBank,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Settings,
  Sparkles,
  Loader2,
  GripVertical
} from "./icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from "sonner";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import accountsService from "../services/accounts.service";
import transactionsService from "../services/transactions.service";
import categoriesService from "../services/categories.service";
import { CURRENCIES, DEFAULT_CURRENCY, getCurrencySymbol } from "../constants/currencies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";

interface ManageAccountsPageProps {
  onBack: () => void;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon: typeof Wallet;
  color: string;
  account_type: string;
}

const accountIcons = [
  { icon: Wallet, name: "Кошелёк", emoji: "💰", color: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700", type: "cash" },
  { icon: CreditCard, name: "Карта", emoji: "💳", color: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700", type: "card" },
  { icon: PiggyBank, name: "Накопления", emoji: "🐷", color: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700", type: "savings" },
  { icon: DollarSign, name: "Наличные", emoji: "💵", color: "bg-gradient-to-br from-green-100 to-green-200 text-green-700", type: "cash" },
  { icon: Wallet, name: "Банковский счёт", emoji: "🏦", color: "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700", type: "card" },
  { icon: CreditCard, name: "Инвестиции", emoji: "💎", color: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700", type: "savings" },
];

interface SortableAccountItemProps {
  account: Account;
  accounts: Account[];
  formatCurrency: (amount: number, currency: string) => string;
  openBalanceDialog: (account: Account) => void;
  openEditDialog: (account: Account) => void;
  handleDeleteAccount: (accountId: string) => void;
}

function SortableAccountItem({ account, accounts, formatCurrency, openBalanceDialog, openEditDialog, handleDeleteAccount }: SortableAccountItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = account.icon;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-lg transition-all duration-300 ${isDragging ? 'ring-2 ring-blue-400' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Drag Handle */}
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
              >
                <GripVertical className="w-5 h-5" />
              </div>

              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${account.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-slate-800 truncate">{account.name}</h3>
                <p className="text-lg font-medium text-slate-700">
                  {formatCurrency(account.balance, account.currency)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Balance Change Button */}
              <LightMotion whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBalanceDialog(account)}
                  className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
                >
                  <DollarSign className="w-4 h-4" />
                </Button>
              </LightMotion>

              {/* Edit Button */}
              <LightMotion whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(account)}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </LightMotion>

              {/* Delete Button */}
              {accounts.length > 1 && (
                <LightMotion whileTap={{ scale: 0.95 }}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-red-200 bg-gradient-to-br from-white to-red-50/30">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700">
                          Удалить счёт?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600">
                          Это действие нельзя отменить. Счёт "{account.name}" и все связанные операции будут удалены.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-red-300">
                          Отмена
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAccount(account.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </LightMotion>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ManageAccountsPage({ onBack }: ManageAccountsPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccountName, setNewAccountName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);
  const [selectedIcon, setSelectedIcon] = useState(accountIcons[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [balanceChange, setBalanceChange] = useState("");
  const [balanceChangeType, setBalanceChangeType] = useState<'increase' | 'decrease'>('increase');
  const [actionLoading, setActionLoading] = useState(false);
  const [isDebt, setIsDebt] = useState(false);
  const [debtCreditor, setDebtCreditor] = useState("");
  const [debtInitialAmount, setDebtInitialAmount] = useState("");
  const [debtDueDate, setDebtDueDate] = useState("");
  const [debtNotes, setDebtNotes] = useState("");
  const [initialBalance, setInitialBalance] = useState("");

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Загрузка счетов и категорий из API
  useEffect(() => {
    loadAccounts();
    loadCategories();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountsService.getAll();

      // Преобразуем API данные в формат компонента
      const accountsWithIcons = data.map(acc => ({
        id: acc.id,
        name: acc.name,
        balance: parseFloat(acc.balance.toString()),
        currency: acc.currency || DEFAULT_CURRENCY,
        account_type: acc.account_type,
        icon: acc.account_type === 'savings' ? PiggyBank :
              acc.account_type === 'card' ? CreditCard : Wallet,
        color: acc.account_type === 'savings' ? "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700" :
               acc.account_type === 'card' ? "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700" :
               "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
      }));

      setAccounts(accountsWithIcons);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Не удалось загрузить счета');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    const symbol = getCurrencySymbol(currency);
    return `${amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} ${symbol}`;
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error("Введите название счёта");
      return;
    }

    if (isDebt) {
      if (!debtCreditor.trim()) {
        toast.error("Введите имя кредитора");
        return;
      }
      if (!debtInitialAmount || parseFloat(debtInitialAmount) <= 0) {
        toast.error("Введите корректную сумму долга");
        return;
      }
      if (!debtDueDate) {
        toast.error("Укажите дату погашения");
        return;
      }
    }

    try {
      setActionLoading(true);

      const accountData: any = {
        name: newAccountName.trim(),
        balance: isDebt
          ? -Math.abs(parseFloat(debtInitialAmount))
          : (initialBalance ? parseFloat(initialBalance) : 0),
        currency: selectedCurrency,
        account_type: selectedIcon.type,
        is_debt: isDebt
      };

      if (isDebt) {
        accountData.debt_info = {
          initialAmount: parseFloat(debtInitialAmount),
          creditorName: debtCreditor.trim(),
          dueDate: debtDueDate,
          notes: debtNotes.trim() || undefined
        };
      }

      await accountsService.create(accountData);

      // Перезагружаем счета
      await loadAccounts();
      resetForm();
      setIsAddDialogOpen(false);
      toast.success("Счёт создан!");
    } catch (error) {
      console.error('Failed to create account:', error);
      toast.error("Не удалось создать счёт");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setNewAccountName("");
    setSelectedCurrency(DEFAULT_CURRENCY);
    setSelectedIcon(accountIcons[0]);
    setIsDebt(false);
    setDebtCreditor("");
    setDebtInitialAmount("");
    setDebtDueDate("");
    setDebtNotes("");
    setInitialBalance("");
  };

  const handleEditAccount = async () => {
    if (!editingAccount || !newAccountName.trim()) {
      toast.error("Введите название счёта");
      return;
    }

    try {
      setActionLoading(true);
      await accountsService.update(editingAccount.id, {
        name: newAccountName.trim(),
        currency: selectedCurrency,
        account_type: selectedIcon.type
      });

      // Перезагружаем счета
      await loadAccounts();
      setEditingAccount(null);
      setNewAccountName("");
      setSelectedCurrency(DEFAULT_CURRENCY);
      setSelectedIcon(accountIcons[0]);
      setIsEditDialogOpen(false);
      toast.success("Счёт обновлён!");
    } catch (error) {
      console.error('Failed to update account:', error);
      toast.error("Не удалось обновить счёт");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      setActionLoading(true);
      await accountsService.delete(accountId);

      // Перезагружаем счета
      await loadAccounts();
      toast.success("Счёт удалён!");
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error("Не удалось удалить счёт");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBalanceChange = async () => {
    if (!editingAccount || !balanceChange || parseFloat(balanceChange) <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    const changeAmount = parseFloat(balanceChange);

    try {
      setActionLoading(true);

      // Находим подходящую категорию для корректировки баланса
      const categoryType = balanceChangeType === 'increase' ? 'income' : 'expense';
      const suitableCategory = categories.find(cat => cat.category_type === categoryType);

      if (!suitableCategory) {
        toast.error("Не найдена подходящая категория");
        return;
      }

      // Создаём транзакцию для изменения баланса
      const now = new Date();
      await transactionsService.create(editingAccount.id, {
        amount: changeAmount,
        transaction_type: categoryType,
        description: `${balanceChangeType === 'increase' ? 'Пополнение' : 'Снятие'} средств`,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().substring(0, 5),
        category_id: suitableCategory.id
      });

      // Перезагружаем счета чтобы получить обновлённый баланс
      await loadAccounts();

      setEditingAccount(null);
      setBalanceChange("");
      setBalanceChangeType('increase');
      setIsBalanceDialogOpen(false);
      toast.success(`Баланс ${balanceChangeType === 'increase' ? 'пополнен' : 'уменьшен'}!`);
    } catch (error) {
      console.error('Failed to change balance:', error);
      toast.error("Не удалось изменить баланс");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (account: Account) => {
    setEditingAccount(account);
    setNewAccountName(account.name);
    setSelectedCurrency(account.currency || DEFAULT_CURRENCY);
    const iconData = accountIcons.find(item => item.type === account.account_type) || accountIcons[0];
    setSelectedIcon(iconData);
    setIsEditDialogOpen(true);
  };

  const openBalanceDialog = (account: Account) => {
    setEditingAccount(account);
    setIsBalanceDialogOpen(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = accounts.findIndex((acc) => acc.id === active.id);
    const newIndex = accounts.findIndex((acc) => acc.id === over.id);

    const newAccounts = arrayMove(accounts, oldIndex, newIndex);

    // Оптимистичное обновление UI
    setAccounts(newAccounts);

    try {
      // Отправляем обновленный порядок на сервер
      const accountOrders = newAccounts.map((acc, index) => ({
        id: acc.id,
        position: index
      }));

      await accountsService.reorder(accountOrders);
      toast.success("Порядок счетов обновлён");
    } catch (error) {
      console.error('Failed to reorder accounts:', error);
      toast.error("Не удалось сохранить порядок счетов");
      // Откатываем изменения при ошибке
      await loadAccounts();
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ background: 'var(--bg-page-dashboard)' }}>
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="text-slate-600">Загрузка счетов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: 'var(--bg-page-dashboard)' }}>
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-indigo-200/30 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-0 w-16 h-16 bg-indigo-200/20 rounded-full blur-xl"></div>
      
      {/* Header */}
      <OptimizedMotion
        className="p-4 pb-6 relative overflow-hidden"
        style={{ background: 'var(--bg-header)' }}
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
          <div className="flex items-center gap-2">
            <h1 className="font-medium text-white">Управление счетами</h1>
          </div>
          <div className="w-8" />
        </OptimizedMotion>
      </OptimizedMotion>

      <OptimizedMotion 
        className="p-4 -mt-2 space-y-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {/* Add Account Button */}
        <LightMotion
          whileTap={{ scale: 0.98 }}
        >
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 h-auto gap-2 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Добавить новый счёт</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 p-0 gap-0 max-h-[90vh]" style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
              <DialogHeader className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
                <DialogTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Создать новый счёт
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Добавьте новый счёт для отслеживания ваших финансов
                </DialogDescription>
              </DialogHeader>
              <div className="px-4 sm:px-6 py-2" style={{ flex: '1 1 0%', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', minHeight: 0 }}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-name">Название счёта</Label>
                      <Input
                        id="account-name"
                        placeholder="Введите название..."
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                <div className="space-y-2">
                  <Label htmlFor="account-currency">Валюта</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span>{currency.flag}</span>
                            <span>{currency.code}</span>
                            <span className="text-slate-500">({currency.symbol})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-icon">Иконка счёта</Label>
                  <Select
                    value={accountIcons.findIndex(icon => icon.type === selectedIcon.type && icon.name === selectedIcon.name).toString()}
                    onValueChange={(value) => setSelectedIcon(accountIcons[parseInt(value)])}
                  >
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{selectedIcon.emoji}</span>
                          <span>{selectedIcon.name}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accountIcons.map((iconData, index) => (
                        <SelectItem key={index} value={index.toString()} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{iconData.emoji}</span>
                            <span>{iconData.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!isDebt && (
                  <div className="space-y-2">
                    <Label htmlFor="initial-balance">Начальный баланс</Label>
                    <div className="relative">
                      <Input
                        id="initial-balance"
                        type="number"
                        placeholder=""
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        className="border-blue-200 focus:border-blue-400 pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        step="0.01"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                        {getCurrencySymbol(selectedCurrency)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Checkbox
                    id="is-debt"
                    checked={isDebt}
                    onCheckedChange={(checked) => setIsDebt(checked as boolean)}
                  />
                  <Label
                    htmlFor="is-debt"
                    className="text-sm font-medium text-amber-800 cursor-pointer"
                  >
                    💳 Это счёт задолженности (кредит, займ)
                  </Label>
                </div>

                {isDebt && (
                  <div className="space-y-3 p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                    <div className="space-y-2">
                      <Label htmlFor="debt-creditor">Кредитор *</Label>
                      <Input
                        id="debt-creditor"
                        placeholder="Банк, МФО или имя"
                        value={debtCreditor}
                        onChange={(e) => setDebtCreditor(e.target.value)}
                        className="border-amber-200 focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="debt-amount">Сумма задолженности *</Label>
                      <Input
                        id="debt-amount"
                        type="number"
                        placeholder="0"
                        value={debtInitialAmount}
                        onChange={(e) => setDebtInitialAmount(e.target.value)}
                        className="border-amber-200 focus:border-amber-400"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="debt-due-date">Дата погашения *</Label>
                      <Input
                        id="debt-due-date"
                        type="date"
                        value={debtDueDate}
                        onChange={(e) => setDebtDueDate(e.target.value)}
                        className="border-amber-200 focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="debt-notes">Заметки (необязательно)</Label>
                      <Textarea
                        id="debt-notes"
                        placeholder="Дополнительная информация..."
                        value={debtNotes}
                        onChange={(e) => setDebtNotes(e.target.value)}
                        className="border-amber-200 focus:border-amber-400 resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
                  </div>
                </div>
                <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t border-blue-100" style={{ flexShrink: 0 }}>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="border-blue-300"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleAddAccount}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Создать
                  </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </LightMotion>

        {/* Accounts List with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={accounts.map(acc => acc.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {accounts.map((account) => (
                <SortableAccountItem
                  key={account.id}
                  account={account}
                  accounts={accounts}
                  formatCurrency={formatCurrency}
                  openBalanceDialog={openBalanceDialog}
                  openEditDialog={openEditDialog}
                  handleDeleteAccount={handleDeleteAccount}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Edit Account Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
            <DialogHeader>
              <DialogTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Редактировать счёт
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Измените название и иконку вашего счёта
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-account-name">Название счёта</Label>
                <Input
                  id="edit-account-name"
                  placeholder="Введите название..."
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-account-currency">Валюта</Label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code}</span>
                          <span className="text-slate-500">({currency.symbol})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-account-icon">Иконка счёта</Label>
                <Select
                  value={accountIcons.findIndex(icon => icon.type === selectedIcon.type && icon.name === selectedIcon.name).toString()}
                  onValueChange={(value) => setSelectedIcon(accountIcons[parseInt(value)])}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{selectedIcon.emoji}</span>
                        <span>{selectedIcon.name}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accountIcons.map((iconData, index) => (
                      <SelectItem key={index} value={index.toString()} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{iconData.emoji}</span>
                          <span>{iconData.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="border-blue-300"
              >
                Отмена
              </Button>
              <Button 
                onClick={handleEditAccount}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Balance Change Dialog */}
        <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
          <DialogContent className="border-green-200 bg-gradient-to-br from-white to-green-50/30">
            <DialogHeader>
              <DialogTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Изменить баланс
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Пополните счёт или снимите средства с записью операции
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {editingAccount && (
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600">Текущий баланс</p>
                  <p className="text-xl font-medium text-blue-700">
                    {formatCurrency(editingAccount.balance, editingAccount.currency)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <OptimizedMotion
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant={balanceChangeType === 'increase' ? 'default' : 'outline'}
                    className={`w-full transition-all duration-300 ${balanceChangeType === 'increase' 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg' 
                      : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400'
                    }`}
                    onClick={() => setBalanceChangeType('increase')}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Пополнить
                  </Button>
                </OptimizedMotion>
                <OptimizedMotion
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant={balanceChangeType === 'decrease' ? 'default' : 'outline'}
                    className={`w-full transition-all duration-300 ${balanceChangeType === 'decrease' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg' 
                      : 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400'
                    }`}
                    onClick={() => setBalanceChangeType('decrease')}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Снять
                  </Button>
                </OptimizedMotion>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance-change">Сумма</Label>
                <div className="relative">
                  <Input
                    id="balance-change"
                    type="number"
                    placeholder="0"
                    value={balanceChange}
                    onChange={(e) => setBalanceChange(e.target.value)}
                    className="text-xl font-medium text-center py-4 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                    step="0.01"
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-600 font-medium">
                    {editingAccount ? getCurrencySymbol(editingAccount.currency) : '₽'}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsBalanceDialogOpen(false)}
                className="border-green-300"
              >
                Отмена
              </Button>
              <Button 
                onClick={handleBalanceChange}
                className={`${balanceChangeType === 'increase' 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                }`}
              >
                {balanceChangeType === 'increase' ? 'Пополнить' : 'Снять'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </OptimizedMotion>
    </div>
  );
}