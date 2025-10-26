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
        border: 'border-red-300',
        bg: 'bg-gradient-to-br from-red-50 via-red-50/90 to-rose-100/80',
        iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
        iconColor: 'text-white',
        amountColor: 'text-red-700',
        badgeBg: 'bg-red-500',
        badgeText: 'text-white',
        progressBg: 'bg-red-100',
        progressFill: '[&>div]:bg-gradient-to-r [&>div]:from-red-400 [&>div]:to-rose-500',
        textAccent: 'text-red-600',
        shadowColor: 'shadow-red-200/50',
        hoverShadow: 'hover:shadow-red-300/60'
      }
    : isUrgent
    ? {
        border: 'border-amber-300',
        bg: 'bg-gradient-to-br from-amber-50 via-amber-50/90 to-yellow-100/80',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        iconColor: 'text-white',
        amountColor: 'text-amber-700',
        badgeBg: 'bg-amber-500',
        badgeText: 'text-white',
        progressBg: 'bg-amber-100',
        progressFill: '[&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-orange-500',
        textAccent: 'text-amber-600',
        shadowColor: 'shadow-amber-200/50',
        hoverShadow: 'hover:shadow-amber-300/60'
      }
    : {
        border: 'border-blue-300',
        bg: 'bg-gradient-to-br from-blue-50 via-blue-50/90 to-indigo-100/80',
        iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        iconColor: 'text-white',
        amountColor: 'text-blue-700',
        badgeBg: 'bg-blue-500',
        badgeText: 'text-white',
        progressBg: 'bg-blue-100',
        progressFill: '[&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-indigo-500',
        textAccent: 'text-blue-600',
        shadowColor: 'shadow-blue-200/50',
        hoverShadow: 'hover:shadow-blue-300/60'
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
          relative overflow-hidden border-2 transition-all duration-300
          ${colorScheme.border} ${colorScheme.bg} ${colorScheme.shadowColor}
          shadow-lg ${colorScheme.hoverShadow} hover:shadow-xl
        `}>
        {/* Декоративные элементы фона */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-y-12 -translate-x-12" />

        <CardContent className="p-5 space-y-4 relative">
          {/* Header с большей иконкой */}
          <div className="flex items-start gap-4">
            {/* Крупная иконка слева */}
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
              ${colorScheme.iconBg} ${colorScheme.iconColor}
              shadow-lg transform transition-transform duration-300
            `}>
              <TrendingDown className="w-7 h-7" strokeWidth={2.5} />
            </div>

            {/* Информация и бейдж */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg text-slate-900 truncate leading-tight">
                  {account.name}
                </h3>
                {(isOverdue || isUrgent) && (
                  <span className={`
                    px-2.5 py-1 ${colorScheme.badgeBg} ${colorScheme.badgeText}
                    text-xs font-bold rounded-full whitespace-nowrap
                    shadow-md flex items-center gap-1
                  `}>
                    <AlertCircle className="w-3 h-3" />
                    {isOverdue ? 'Просрочен' : 'Срочно'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-slate-600" />
                </div>
                <span className="truncate font-medium">{account.debt_info.creditorName}</span>
              </div>
            </div>
          </div>

          {/* Прогресс-бар с улучшенным дизайном */}
          <div className="space-y-2 bg-white/40 backdrop-blur-sm rounded-xl p-3 border border-white/50">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-700">Погашено долга</span>
              <span className={`text-sm font-bold ${colorScheme.textAccent}`}>
                {progress.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={progress}
              className={`h-2.5 ${colorScheme.progressBg} ${colorScheme.progressFill} rounded-full overflow-hidden`}
            />
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Суммы - более визуально выразительные */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/60">
              <p className="text-xs font-semibold text-slate-500 mb-1.5">Задолженность</p>
              <p className={`text-2xl font-bold ${colorScheme.amountColor} leading-tight`}>
                {formatCurrency(remaining)}
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/60">
              <p className="text-xs font-semibold text-slate-500 mb-1.5">Изначально</p>
              <p className="text-2xl font-bold text-slate-700 leading-tight">
                {formatCurrency(initialAmount)}
              </p>
            </div>
          </div>

          {/* Дата погашения - более заметная */}
          <div className={`
            flex items-center gap-2.5 p-3 rounded-xl
            bg-white/50 backdrop-blur-sm border border-white/60
            ${colorScheme.textAccent}
          `}>
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${isOverdue || isUrgent ? colorScheme.badgeBg : 'bg-slate-200'}
              ${isOverdue || isUrgent ? 'text-white' : 'text-slate-600'}
            `}>
              {isOverdue ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-500 mb-0.5">Срок погашения</p>
              <p className="font-bold text-sm truncate">
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
