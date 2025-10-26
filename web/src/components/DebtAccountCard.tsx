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

  // Определяем цветовую схему карточки
  const colorScheme = isOverdue
    ? {
        border: 'border-red-200',
        bg: 'bg-white',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        amountColor: 'text-red-600',
        badgeBg: 'bg-red-500',
        badgeText: 'text-white',
        progressBg: 'bg-red-100',
        progressFill: '[&>div]:bg-gradient-to-r [&>div]:from-red-400 [&>div]:to-rose-500',
        textAccent: 'text-red-600',
        shadowColor: 'shadow-red-100/50',
        hoverShadow: 'hover:shadow-red-200/70',
        accentBorder: 'border-red-200'
      }
    : isUrgent
    ? {
        border: 'border-amber-200',
        bg: 'bg-white',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        amountColor: 'text-amber-600',
        badgeBg: 'bg-amber-500',
        badgeText: 'text-white',
        progressBg: 'bg-amber-100',
        progressFill: '[&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-orange-500',
        textAccent: 'text-amber-600',
        shadowColor: 'shadow-amber-100/50',
        hoverShadow: 'hover:shadow-amber-200/70',
        accentBorder: 'border-amber-200'
      }
    : {
        border: 'border-blue-200',
        bg: 'bg-white',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        amountColor: 'text-blue-600',
        badgeBg: 'bg-blue-500',
        badgeText: 'text-white',
        progressBg: 'bg-blue-100',
        progressFill: '[&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-indigo-500',
        textAccent: 'text-blue-600',
        shadowColor: 'shadow-blue-100/50',
        hoverShadow: 'hover:shadow-blue-200/70',
        accentBorder: 'border-blue-200'
      };

  return (
    <div onClick={onClick} className="cursor-pointer">
      <OptimizedMotion
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -3 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Card className={`
          relative overflow-hidden border transition-all duration-300
          ${colorScheme.border} ${colorScheme.bg} ${colorScheme.shadowColor}
          shadow-md ${colorScheme.hoverShadow} hover:shadow-lg
        `}>
        <CardContent className="p-4 space-y-3.5 relative">
          {/* Header с иконкой */}
          <div className="flex items-start gap-3">
            {/* Иконка слева */}
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
              ${colorScheme.iconBg} ${colorScheme.iconColor}
              shadow-sm
            `}>
              <TrendingDown className="w-6 h-6" strokeWidth={2.5} />
            </div>

            {/* Информация и бейдж */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-slate-900 truncate leading-tight">
                  {account.name}
                </h3>
                {(isOverdue || isUrgent) && (
                  <span className={`
                    px-2 py-0.5 ${colorScheme.badgeBg} ${colorScheme.badgeText}
                    text-xs font-bold rounded-full whitespace-nowrap
                    shadow-sm flex items-center gap-1
                  `}>
                    <AlertCircle className="w-3 h-3" />
                    {isOverdue ? 'Просрочен' : 'Срочно'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                <User className="w-3.5 h-3.5" />
                <span className="truncate font-medium">{account.debt_info.creditorName}</span>
              </div>
            </div>
          </div>

          {/* Прогресс-бар */}
          <div className={`space-y-2 bg-slate-50 rounded-lg p-3 border ${colorScheme.accentBorder}`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-700">Погашено долга</span>
              <span className={`text-sm font-bold ${colorScheme.textAccent}`}>
                {progress.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={progress}
              className={`h-2 ${colorScheme.progressBg} ${colorScheme.progressFill} rounded-full`}
            />
          </div>

          {/* Суммы */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className={`bg-slate-50 rounded-lg p-3 border ${colorScheme.accentBorder}`}>
              <p className="text-xs font-semibold text-slate-500 mb-1">Задолженность</p>
              <p className={`text-xl font-bold ${colorScheme.amountColor} leading-tight`}>
                {formatCurrency(remaining)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-1">Изначально</p>
              <p className="text-xl font-bold text-slate-700 leading-tight">
                {formatCurrency(initialAmount)}
              </p>
            </div>
          </div>

          {/* Дата погашения */}
          <div className={`
            flex items-center gap-2.5 p-3 rounded-lg
            bg-slate-50 border ${colorScheme.accentBorder}
          `}>
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${colorScheme.iconBg} ${colorScheme.iconColor}
            `}>
              {isOverdue || isUrgent ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-500 mb-0.5">Срок погашения</p>
              <p className={`font-bold text-sm truncate ${colorScheme.textAccent}`}>
                {isOverdue
                  ? `Просрочено на ${Math.abs(daysUntilDue)} дн.`
                  : daysUntilDue === 0
                  ? 'Погашение сегодня!'
                  : `До ${formatDate(account.debt_info.dueDate)} (${daysUntilDue} дн.)`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </OptimizedMotion>
    </div>
  );
}
