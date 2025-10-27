import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
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
import { ArrowLeft, ArrowRightLeft, Loader2 } from "./icons";
import { toast } from "sonner";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import accountsService, { Account } from "../services/accounts.service";
import transfersService from "../services/transfers.service";
import { getAccountIconComponent } from "../utils/accountIcons";
import { getCurrencySymbol } from "../constants/currencies";

interface TransferPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function TransferPage({ onBack, onSuccess }: TransferPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [debtAccount, setDebtAccount] = useState<{ id: string; name: string; balance: number } | null>(null);

  const swapAccounts = () => {
    const temp = fromAccountId;
    setFromAccountId(toAccountId);
    setToAccountId(temp);
  };

  const handleDeleteDebtAccount = async () => {
    if (!debtAccount) return;

    try {
      await accountsService.delete(debtAccount.id);
      toast.success(`Счёт задолженности "${debtAccount.name}" удалён`);
      setShowDebtDialog(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Не удалось удалить счет');
    }
  };

  const handleKeepDebtAccount = () => {
    toast.success('Перевод выполнен успешно!');
    setShowDebtDialog(false);
    onSuccess();
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await accountsService.getAll();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Не удалось загрузить счета');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromAccountId || !toAccountId || !amount) {
      toast.error('Заполните все поля');
      return;
    }

    if (fromAccountId === toAccountId) {
      toast.error('Выберите разные счета');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      toast.error('Сумма должна быть больше нуля');
      return;
    }

    // Level 2: Check if currencies match
    const fromAccount = accounts.find(a => a.id === fromAccountId);
    const toAccount = accounts.find(a => a.id === toAccountId);

    if (fromAccount && toAccount && fromAccount.currency !== toAccount.currency) {
      toast.error(
        `Перевод между разными валютами невозможен. Счета используют ${fromAccount.currency} и ${toAccount.currency}.`,
        { duration: 5000 }
      );
      return;
    }

    try {
      setSubmitting(true);

      const result = await transfersService.create({
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount: amountNum,
        description: description || undefined
      });

      // Проверяем, был ли полностью погашен долг
      if (result.debt_fully_repaid && result.debt_account) {
        setDebtAccount(result.debt_account);
        setShowDebtDialog(true);
      } else {
        toast.success('Перевод выполнен успешно!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Transfer failed:', error);

      if (error.response?.data?.error === 'Недостаточно средств') {
        toast.error('Недостаточно средств на счете');
      } else if (error.response?.data?.error === 'Нельзя перевести на тот же счет') {
        toast.error('Нельзя перевести на тот же счет');
      } else if (error.response?.data?.error === 'Перевод между разными валютами невозможен') {
        const details = error.response?.data?.details?.[0] || 'Счета используют разные валюты';
        toast.error(details, { duration: 5000 });
      } else if (error.response?.data?.error === 'Долговой счет не может иметь положительный баланс') {
        const details = error.response?.data?.details?.[0] || 'Долговой счет нельзя пополнить сверх нуля';
        toast.error(details, { duration: 5000 });
      } else {
        toast.error('Не удалось выполнить перевод');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    const symbol = getCurrencySymbol(currency);
    return `${amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} ${symbol}`;
  };

  const fromAccount = accounts.find(acc => String(acc.id) === fromAccountId);
  const toAccount = accounts.find(acc => String(acc.id) === toAccountId);

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

  if (accounts.length < 2) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <OptimizedMotion
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 relative overflow-hidden"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-medium text-white">Перевод между счетами</h1>
            <div className="w-8" />
          </div>
        </OptimizedMotion>

        <div className="p-4 max-w-md mx-auto mt-8 text-center">
          <ArrowRightLeft className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-lg font-medium mb-2">Недостаточно счетов</h2>
          <p className="text-gray-600 mb-4">
            Для перевода между счетами необходимо минимум 2 счета
          </p>
          <Button onClick={onBack} variant="outline">
            Вернуться назад
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
          <OptimizedMotion
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
          </OptimizedMotion>
          <h1 className="font-medium text-white">Перевод между счетами</h1>
          <div className="w-8" />
        </OptimizedMotion>
      </OptimizedMotion>

      {/* Form */}
      <OptimizedMotion
        className="p-4 -mt-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* From Account */}
              <OptimizedMotion
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <Label htmlFor="fromAccount" className="text-slate-700">Откуда *</Label>
                <OptimizedMotion whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Select value={fromAccountId} onValueChange={setFromAccountId}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-gradient-to-br from-white to-blue-50/30">
                      <SelectValue placeholder="Выберите счёт списания" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => {
                        const Icon = getAccountIconComponent(account.account_type);
                        const isDebt = account.is_debt;
                        return (
                          <SelectItem key={account.id} value={String(account.id)} disabled={String(account.id) === toAccountId || isDebt}>
                            <div className="flex items-center justify-between gap-4 w-full">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${isDebt ? 'text-amber-600' : 'text-blue-600'}`} />
                                <span className={isDebt ? 'text-amber-700' : ''}>
                                  {account.name}
                                  {isDebt && ' 💳'}
                                </span>
                              </div>
                              <span className={`text-xs ${isDebt ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                {formatCurrency(Math.abs(parseFloat(account.balance.toString())), account.currency)}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </OptimizedMotion>
              </OptimizedMotion>

              {/* Swap Button */}
              <OptimizedMotion
                className="flex justify-center py-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <OptimizedMotion
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={swapAccounts}
                    disabled={!fromAccountId || !toAccountId}
                    className="rounded-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 shadow-md disabled:opacity-50"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                  </Button>
                </OptimizedMotion>
              </OptimizedMotion>

              {/* To Account */}
              <OptimizedMotion
                className="space-y-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <Label htmlFor="toAccount" className="text-slate-700">Куда *</Label>
                <OptimizedMotion whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Select value={toAccountId} onValueChange={setToAccountId}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-gradient-to-br from-white to-blue-50/30">
                      <SelectValue placeholder="Выберите счёт зачисления" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter(acc => String(acc.id) !== fromAccountId)
                        .map((account) => {
                          const Icon = getAccountIconComponent(account.account_type);
                          const isDebt = account.is_debt;
                          return (
                            <SelectItem key={account.id} value={String(account.id)}>
                              <div className="flex items-center justify-between gap-4 w-full">
                                <div className="flex items-center gap-2">
                                  <Icon className={`w-4 h-4 ${isDebt ? 'text-amber-600' : 'text-blue-600'}`} />
                                  <span className={isDebt ? 'text-amber-700' : ''}>
                                    {account.name}
                                    {isDebt && ' 📋'}
                                  </span>
                                </div>
                                <span className={`text-xs ${isDebt ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                                  {isDebt ? `Задолженность: ${formatCurrency(Math.abs(parseFloat(account.balance.toString())), account.currency)}` : formatCurrency(parseFloat(account.balance.toString()), account.currency)}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </OptimizedMotion>
              </OptimizedMotion>

              {/* Amount */}
              <OptimizedMotion
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Label htmlFor="amount" className="text-slate-700">Сумма перевода *</Label>
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

              {/* Description */}
              <OptimizedMotion
                className="space-y-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.45 }}
              >
                <Label htmlFor="description" className="text-slate-700">Описание (опционально)</Label>
                <OptimizedMotion whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Textarea
                    id="description"
                    placeholder="Добавьте описание перевода..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-gradient-to-br from-white to-blue-50/30"
                  />
                </OptimizedMotion>
              </OptimizedMotion>

              {/* Submit Button */}
              <OptimizedMotion
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  disabled={submitting}
                >
                  <OptimizedMotion
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                    transition={{ duration: 800 }}
                  />
                  <ArrowRightLeft className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10 font-medium">
                    {submitting ? 'Выполняем перевод...' : 'Выполнить перевод'}
                  </span>
                </Button>
              </OptimizedMotion>
            </form>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Debt Repayment Dialog */}
      <AlertDialog open={showDebtDialog} onOpenChange={setShowDebtDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm border-blue-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              🎉 Задолженность полностью погашена!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 space-y-3 pt-2">
              <p>
                Поздравляем! Вы полностью погасили задолженность по счёту <span className="font-semibold text-slate-800">"{debtAccount?.name}"</span>.
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
