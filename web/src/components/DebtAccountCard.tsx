import { Card, CardContent } from "./ui/card";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { Progress } from "./ui/progress";
import { User, TrendingDown, AlertCircle, Clock } from "./icons";
import { getCurrencySymbol } from "../constants/currencies";
import type { Account } from "../services/accounts.service";

interface DebtAccountCardProps {
  account: Account;
  onClick?: () => void;
}

export function DebtAccountCard({ account, onClick }: DebtAccountCardProps) {
  if (!account.is_debt || !account.debt_info) return null;

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol(account.currency);
    return `${Math.abs(amount).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} ${symbol}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(account.debt_info!.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isUrgent = daysUntilDue >= 0 && daysUntilDue <= 30;

  const remaining = Math.abs(account.balance);
  const initialAmount = account.debt_info.initialAmount || 0;

  // Вычисляем процент погашения: (изначальный долг - текущий долг) / изначальный долг * 100
  const progress = initialAmount > 0
    ? Math.max(0, Math.min(100, ((initialAmount - remaining) / initialAmount) * 100))
    : 0;

  // Определяем цветовую схему карточки (в стиле AnalyticsPage)
  const colorScheme = isOverdue
    ? {
        border: 'border-red-200',
        bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
        iconBg: 'bg-gradient-to-br from-red-100 to-red-200',
        iconColor: 'text-red-600',
        amountColor: 'text-red-700',
        badgeBg: 'bg-red-500',
        badgeText: 'text-white',
        progressBg: 'bg-red-100',
        progressFill: '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-rose-500',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-red-600/70'
      }
    : isUrgent
    ? {
        border: 'border-amber-200',
        bg: 'bg-gradient-to-br from-amber-50 to-orange-100/50',
        iconBg: 'bg-gradient-to-br from-amber-100 to-orange-200',
        iconColor: 'text-amber-600',
        amountColor: 'text-amber-700',
        badgeBg: 'bg-amber-500',
        badgeText: 'text-white',
        progressBg: 'bg-amber-100',
        progressFill: '[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-amber-600/70'
      }
    : {
        border: 'border-blue-200',
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-100/50',
        iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-200',
        iconColor: 'text-blue-600',
        amountColor: 'text-blue-700',
        badgeBg: 'bg-blue-500',
        badgeText: 'text-white',
        progressBg: 'bg-blue-100',
        progressFill: '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-blue-600/70'
      };

  return (
    <div onClick={onClick} className="cursor-pointer">
      <OptimizedMotion
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Card className={`
          border ${colorScheme.border} ${colorScheme.bg}
          shadow-md hover:shadow-lg transition-all duration-300
        `}>
        <CardContent className="p-4 space-y-3">
          {/* Основная информация */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${colorScheme.iconBg} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}>
              <AlertCircle className={`w-5 h-5 ${colorScheme.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold text-base ${colorScheme.textPrimary} truncate`}>
                {account.name}
              </h3>
              <div className="flex items-center gap-1.5">
                <User className={`w-3 h-3 ${colorScheme.textSecondary}`} />
                <p className={`text-xs ${colorScheme.textSecondary} truncate font-medium`}>
                  {account.debt_info.creditorName}
                </p>
              </div>
            </div>
          </div>

          {/* Суммы */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/40 rounded-lg p-3 backdrop-blur-sm">
              <p className={`text-xs ${colorScheme.textSecondary} mb-1 font-medium`}>Задолженность</p>
              <p className={`text-xl font-bold ${colorScheme.amountColor}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
            <div className="bg-white/40 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-xs text-slate-500 mb-1 font-medium">Изначально</p>
              <p className="text-xl font-bold text-slate-700">
                {formatCurrency(initialAmount)}
              </p>
            </div>
          </div>

          {/* Срок погашения */}
          <div className="flex items-center gap-2 text-xs bg-white/30 rounded-lg p-2.5 backdrop-blur-sm">
            <Clock className={`w-4 h-4 ${colorScheme.iconColor} flex-shrink-0`} />
            <span className={`${colorScheme.textSecondary} font-medium`}>
              {isOverdue
                ? `Просрочено на ${Math.abs(daysUntilDue)} дн.`
                : daysUntilDue === 0
                ? 'Погашение сегодня!'
                : `До ${formatDate(account.debt_info.dueDate)} (${daysUntilDue} дн.)`
              }
            </span>
          </div>
        </CardContent>
      </Card>
      </OptimizedMotion>
    </div>
  );
}
