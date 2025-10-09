import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, ArrowRightLeft, Wallet, CreditCard, PiggyBank } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  categoryName: string;
  description: string;
  accountId: string;
  toAccountId?: string;
  date: string;
  time: string;
}

interface TransferPageProps {
  onBack: () => void;
  onAddTransfer: (transfer: Omit<Transaction, 'id'>) => void;
}

const accounts = [
  { id: "1", name: "Основной счёт", icon: Wallet, balance: 25430 },
  { id: "2", name: "Накопления", icon: PiggyBank, balance: 8750 },
  { id: "3", name: "Карта", icon: CreditCard, balance: 12340 },
];

export function TransferPage({ onBack, onAddTransfer }: TransferPageProps) {
  const [amount, setAmount] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [description, setDescription] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !fromAccount || !toAccount) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    if (fromAccount === toAccount) {
      toast.error("Выберите разные счета для перевода");
      return;
    }

    const transferAmount = parseFloat(amount);
    const fromAccountData = accounts.find(acc => acc.id === fromAccount);
    
    if (fromAccountData && transferAmount > fromAccountData.balance) {
      toast.error("Недостаточно средств на счёте");
      return;
    }

    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0];
    const currentTimeStr = currentTime.toTimeString().slice(0, 5);

    const transfer = {
      type: 'transfer' as const,
      amount: transferAmount,
      category: 'transfer',
      categoryName: 'Перевод',
      accountId: fromAccount,
      toAccountId: toAccount,
      description: description || `Перевод: ${fromAccountData?.name} → ${accounts.find(acc => acc.id === toAccount)?.name}`,
      date: currentDate,
      time: currentTimeStr
    };

    onAddTransfer(transfer);
    toast.success("Перевод выполнен успешно!");
    
    // Reset form
    setAmount('');
    setFromAccount('');
    setToAccount('');
    setDescription('');
    
    // Navigate back after successful submission
    setTimeout(() => {
      onBack();
    }, 1500);
  }, [amount, fromAccount, toAccount, description, onAddTransfer, onBack]);

  const swapAccounts = () => {
    const temp = fromAccount;
    setFromAccount(toAccount);
    setToAccount(temp);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
          <h1 className="text-lg font-medium text-white">Перевод между счетами</h1>
          <div className="w-8" />
        </motion.div>
      </motion.div>

      <motion.div 
        className="p-4 -mt-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <CardTitle className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Перевод средств
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* From Account */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <Label htmlFor="fromAccount" className="text-slate-700">Откуда *</Label>
                <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Select value={fromAccount} onValueChange={setFromAccount}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-gradient-to-br from-white to-blue-50/30">
                      <SelectValue placeholder="Выберите счёт списания" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => {
                        const Icon = acc.icon;
                        return (
                          <SelectItem key={acc.id} value={acc.id} disabled={acc.id === toAccount}>
                            <div className="flex items-center justify-between gap-4 w-full">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-blue-600" />
                                <span>{acc.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(acc.balance)}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>

              {/* Swap Button */}
              <motion.div 
                className="flex justify-center -my-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={swapAccounts}
                    disabled={!fromAccount || !toAccount}
                    className="rounded-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 shadow-md disabled:opacity-50"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* To Account */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <Label htmlFor="toAccount" className="text-slate-700">Куда *</Label>
                <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Select value={toAccount} onValueChange={setToAccount}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-gradient-to-br from-white to-blue-50/30">
                      <SelectValue placeholder="Выберите счёт зачисления" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => {
                        const Icon = acc.icon;
                        return (
                          <SelectItem key={acc.id} value={acc.id} disabled={acc.id === fromAccount}>
                            <div className="flex items-center justify-between gap-4 w-full">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-blue-600" />
                                <span>{acc.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(acc.balance)}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>

              {/* Amount */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Label htmlFor="amount" className="text-slate-700">Сумма перевода *</Label>
                <div className="relative">
                  <motion.div
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
                  </motion.div>
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium">
                    ₽
                  </span>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.45 }}
              >
                <Label htmlFor="description" className="text-slate-700">Описание (опционально)</Label>
                <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Textarea
                    id="description"
                    placeholder="Добавьте описание перевода..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-gradient-to-br from-white to-blue-50/30"
                  />
                </motion.div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                    transition={{ duration: 800 }}
                  />
                  <ArrowRightLeft className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10 font-medium">
                    Выполнить перевод
                  </span>
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <Card className="mt-4 border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                  <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm text-slate-600">
                  <p className="mb-1">
                    Переводы между счетами помогают отслеживать движение средств и не влияют на общий баланс.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    История переводов отображается отдельно от доходов и расходов.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}