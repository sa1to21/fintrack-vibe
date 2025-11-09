import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { DatePicker } from "./ui/date-picker";
import { ArrowLeft, Loader2 } from "./icons";
import { toast } from "sonner";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import accountsService from "../services/accounts.service";
import { CURRENCIES, DEFAULT_CURRENCY, getCurrencySymbol } from "../constants/currencies";
import { handleNumberInput } from "../utils/numberInput";
import { enUS, ru } from "date-fns/locale";

interface CreateAccountPageProps {
  onBack: () => void;
  onAccountCreated: () => void;
}

const accountIcons = [
  { icon: "💰", nameKey: "icons.wallet", type: "cash" },
  { icon: "💳", nameKey: "icons.card", type: "card" },
  { icon: "🐷", nameKey: "icons.savings", type: "savings" },
  { icon: "💵", nameKey: "icons.cash", type: "cash" },
  { icon: "🏦", nameKey: "icons.bankAccount", type: "card" },
  { icon: "💎", nameKey: "icons.investment", type: "savings" },
];

export function CreateAccountPage({ onBack, onAccountCreated }: CreateAccountPageProps) {
  const { t, i18n } = useTranslation('accounts');
  const isRussian = (i18n.language || 'en').startsWith('ru');
  const dateDisplayLocale = isRussian ? 'ru-RU' : 'en-US';
  const calendarLocale = isRussian ? ru : enUS;

  const [accountName, setAccountName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);
  const [selectedIcon, setSelectedIcon] = useState(accountIcons[0]);
  const [initialBalance, setInitialBalance] = useState("");
  const [isDebt, setIsDebt] = useState(false);
  const [debtCreditor, setDebtCreditor] = useState("");
  const [debtInitialAmount, setDebtInitialAmount] = useState("");
  const [debtDueDate, setDebtDueDate] = useState("");
  const [debtNotes, setDebtNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      toast.error(t('messages.enterName'));
      return;
    }

    if (isDebt) {
      if (!debtCreditor.trim()) {
        toast.error(t('messages.enterCreditor'));
        return;
      }
      if (!debtInitialAmount || parseFloat(debtInitialAmount) <= 0) {
        toast.error(t('messages.enterDebtAmount'));
        return;
      }
      if (!debtDueDate) {
        toast.error(t('messages.enterDueDate'));
        return;
      }
    }

    try {
      setLoading(true);

      const accountData: any = {
        name: accountName.trim(),
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
      toast.success(t('messages.created'));
      onAccountCreated();
    } catch (error) {
      console.error('Failed to create account:', error);
      toast.error(t('messages.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page-dashboard)' }}>
      {/* Header */}
      <OptimizedMotion
        className="p-4 pb-6 relative overflow-hidden flex-shrink-0"
        style={{ background: 'var(--bg-header)' }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-y-12"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

        <OptimizedMotion
          className="flex items-center justify-between relative z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <LightMotion whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
              disabled={loading}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </LightMotion>
          <h1 className="font-medium text-white">{t('createNewAccount')}</h1>
          <div className="w-8" />
        </OptimizedMotion>
      </OptimizedMotion>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="account-name">{t('fields.accountName')}</Label>
            <Input
              id="account-name"
              placeholder={t('placeholders.enterName')}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="account-currency">{t('fields.currency')}</Label>
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

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="account-icon">{t('fields.icon')}</Label>
            <Select
              value={accountIcons.findIndex(icon => icon.type === selectedIcon.type && icon.nameKey === selectedIcon.nameKey).toString()}
              onValueChange={(value) => setSelectedIcon(accountIcons[parseInt(value)])}
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-400">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedIcon.icon}</span>
                    <span>{t(selectedIcon.nameKey)}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {accountIcons.map((iconData, index) => (
                  <SelectItem key={index} value={index.toString()} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{iconData.icon}</span>
                      <span>{t(iconData.nameKey)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Initial Balance - only if not debt */}
          {!isDebt && (
            <div className="space-y-2">
              <Label htmlFor="initial-balance">{t('fields.initialBalance')}</Label>
              <div className="relative">
                <Input
                  id="initial-balance"
                  type="number"
                  placeholder="0"
                  value={initialBalance}
                  onChange={handleNumberInput(setInitialBalance)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="border-blue-200 focus:border-blue-400 pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                  {getCurrencySymbol(selectedCurrency)}
                </span>
              </div>
            </div>
          )}

          {/* Debt Account Checkbox */}
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
              💳 {t('debt.title')}
            </Label>
          </div>

          {/* Debt Fields */}
          {isDebt && (
            <div className="space-y-3 p-4 bg-amber-50/50 rounded-lg border border-amber-200">
              <div className="space-y-2">
                <Label htmlFor="debt-creditor">{t('debt.creditor')}</Label>
                <Input
                  id="debt-creditor"
                  placeholder={t('debt.creditorPlaceholder')}
                  value={debtCreditor}
                  onChange={(e) => setDebtCreditor(e.target.value)}
                  className="border-amber-200 focus:border-amber-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt-amount">{t('debt.amount')}</Label>
                <div className="relative">
                  <Input
                    id="debt-amount"
                    type="number"
                    placeholder={t('placeholders.enterAmount')}
                    value={debtInitialAmount}
                    onChange={handleNumberInput(setDebtInitialAmount)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="border-amber-200 focus:border-amber-400 pr-10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    step="0.01"
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                    {getCurrencySymbol(selectedCurrency)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt-due-date">{t('debt.dueDate')}</Label>
                <DatePicker
                  id="debt-due-date"
                  value={debtDueDate}
                  onChange={setDebtDueDate}
                  placeholder={t('messages.enterDueDate')}
                  displayLocale={dateDisplayLocale}
                  calendarLocale={calendarLocale}
                  className="h-10 border-amber-200 focus-visible:ring-amber-400/70 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt-notes">{t('debt.notes')}</Label>
                <Textarea
                  id="debt-notes"
                  placeholder={t('debt.notesPlaceholder')}
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  className="border-amber-200 focus:border-amber-400 resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="flex-shrink-0 p-4 border-t bg-white/80 backdrop-blur-sm">
        <Button
          onClick={handleCreateAccount}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t('actions.creating')}
            </>
          ) : (
            t('actions.create')
          )}
        </Button>
      </div>
    </div>
  );
}
