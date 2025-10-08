import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, ArrowRightLeft, Wallet, CreditCard, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import accountsService, { Account } from "../services/accounts.service";
import transfersService from "../services/transfers.service";

interface TransferPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const iconMap: Record<string, typeof Wallet> = {
  wallet: Wallet,
  credit_card: CreditCard,
  piggy_bank: PiggyBank,
};

export function TransferPage({ onBack, onSuccess }: TransferPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

    try {
      setSubmitting(true);
      await transfersService.create({
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount: amountNum,
        description: description || undefined
      });

      toast.success('Перевод выполнен успешно!');
      onSuccess();
    } catch (error: any) {
      console.error('Transfer failed:', error);

      if (error.response?.data?.error === 'Недостаточно средств') {
        toast.error('Недостаточно средств на счете');
      } else if (error.response?.data?.error === 'Нельзя перевести на тот же счет') {
        toast.error('Нельзя перевести на тот же счет');
      } else {
        toast.error('Не удалось выполнить перевод');
      }
    } finally {
      setSubmitting(false);
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

  const fromAccount = accounts.find(acc => String(acc.id) === fromAccountId);
  const toAccount = accounts.find(acc => String(acc.id) === toAccountId);

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (accounts.length < 2) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
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
        </motion.div>

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
      <motion.div
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 pb-6 relative overflow-hidden"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-y-12"></div>

        <div className="flex items-center justify-between relative z-10">
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
      </motion.div>

      {/* Form */}
      <motion.div
        className="p-4 -mt-2 max-w-md mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-blue-200 bg-white shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* From Account */}
              <div className="space-y-2">
                <Label>Откуда *</Label>
                <Select value={fromAccountId} onValueChange={setFromAccountId}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Выберите счет" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => {
                      const Icon = iconMap[account.account_type] || Wallet;
                      return (
                        <SelectItem key={account.id} value={String(account.id)}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-blue-600" />
                              <span>{account.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatCurrency(parseFloat(account.balance.toString()))}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {fromAccount && (
                  <p className="text-sm text-gray-600">
                    Баланс: {formatCurrency(parseFloat(fromAccount.balance.toString()))}
                  </p>
                )}
              </div>

              {/* Arrow Icon */}
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              {/* To Account */}
              <div className="space-y-2">
                <Label>Куда *</Label>
                <Select value={toAccountId} onValueChange={setToAccountId}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Выберите счет" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter(acc => String(acc.id) !== fromAccountId)
                      .map((account) => {
                        const Icon = iconMap[account.account_type] || Wallet;
                        return (
                          <SelectItem key={account.id} value={String(account.id)}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-blue-600" />
                                <span>{account.name}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatCurrency(parseFloat(account.balance.toString()))}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
                {toAccount && (
                  <p className="text-sm text-gray-600">
                    Баланс: {formatCurrency(parseFloat(toAccount.balance.toString()))}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>Сумма *</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="border-blue-200 focus:border-blue-400"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Описание (необязательно)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Комментарий к переводу..."
                  className="border-blue-200 focus:border-blue-400 resize-none"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={submitting}
              >
                {submitting ? 'Выполняем перевод...' : 'Перевести'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
