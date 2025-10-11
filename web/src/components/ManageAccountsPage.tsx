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
  Loader2
} from "./icons";
import { toast } from "sonner";
import { motion } from "motion/react";
import accountsService from "../services/accounts.service";
import transactionsService from "../services/transactions.service";
import categoriesService from "../services/categories.service";

interface ManageAccountsPageProps {
  onBack: () => void;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  icon: typeof Wallet;
  color: string;
  account_type: string;
}

const accountIcons = [
  { icon: Wallet, name: "Кошелёк", color: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700", type: "cash" },
  { icon: CreditCard, name: "Карта", color: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700", type: "card" },
  { icon: PiggyBank, name: "Накопления", color: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700", type: "savings" },
];

export function ManageAccountsPage({ onBack }: ManageAccountsPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccountName, setNewAccountName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(accountIcons[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [balanceChange, setBalanceChange] = useState("");
  const [balanceChangeType, setBalanceChangeType] = useState<'increase' | 'decrease'>('increase');
  const [actionLoading, setActionLoading] = useState(false);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error("Введите название счёта");
      return;
    }

    try {
      setActionLoading(true);
      await accountsService.create({
        name: newAccountName.trim(),
        balance: 0,
        currency: 'RUB',
        account_type: selectedIcon.type
      });

      // Перезагружаем счета
      await loadAccounts();
      setNewAccountName("");
      setSelectedIcon(accountIcons[0]);
      setIsAddDialogOpen(false);
      toast.success("Счёт создан!");
    } catch (error) {
      console.error('Failed to create account:', error);
      toast.error("Не удалось создать счёт");
    } finally {
      setActionLoading(false);
    }
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
        account_type: selectedIcon.type
      });

      // Перезагружаем счета
      await loadAccounts();
      setEditingAccount(null);
      setNewAccountName("");
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
    const iconData = accountIcons.find(item => item.type === account.account_type) || accountIcons[0];
    setSelectedIcon(iconData);
    setIsEditDialogOpen(true);
  };

  const openBalanceDialog = (account: Account) => {
    setEditingAccount(account);
    setIsBalanceDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="text-slate-600">Загрузка счетов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-indigo-200/30 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-0 w-16 h-16 bg-indigo-200/20 rounded-full blur-xl"></div>
      
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
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-300" />
            <h1 className="font-medium text-white">Управление счетами</h1>
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="w-8" />
        </motion.div>
      </motion.div>

      <motion.div 
        className="p-4 -mt-2 space-y-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {/* Add Account Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
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
            <DialogContent className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
              <DialogHeader>
                <DialogTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Создать новый счёт
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Добавьте новый счёт для отслеживания ваших финансов
                </DialogDescription>
              </DialogHeader>
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
                  <Label>Выберите иконку</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {accountIcons.map((iconData, index) => {
                      const Icon = iconData.icon;
                      return (
                        <motion.button
                          key={index}
                          type="button"
                          className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                            selectedIcon.icon === iconData.icon
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                              : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/30'
                          }`}
                          onClick={() => setSelectedIcon(iconData)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${iconData.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs">{iconData.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
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
        </motion.div>

        {/* Accounts List */}
        <div className="space-y-3">
          {accounts.map((account, index) => {
            const Icon = account.icon;
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
              >
                <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <motion.div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${account.color}`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-6 h-6" />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-slate-800 truncate">{account.name}</h3>
                          <p className="text-lg font-medium text-slate-700">
                            {formatCurrency(account.balance)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Balance Change Button */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openBalanceDialog(account)}
                            className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        </motion.div>
                        
                        {/* Edit Button */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(account)}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </motion.div>
                        
                        {/* Delete Button */}
                        {accounts.length > 1 && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

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
                <Label>Выберите иконку</Label>
                <div className="grid grid-cols-3 gap-2">
                  {accountIcons.map((iconData, index) => {
                    const Icon = iconData.icon;
                    return (
                      <motion.button
                        key={index}
                        type="button"
                        className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                          selectedIcon.icon === iconData.icon
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                            : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/30'
                        }`}
                        onClick={() => setSelectedIcon(iconData)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${iconData.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs">{iconData.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
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
                    {formatCurrency(editingAccount.balance)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <motion.div
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
                </motion.div>
                <motion.div
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
                </motion.div>
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
                    ₽
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
      </motion.div>
    </div>
  );
}