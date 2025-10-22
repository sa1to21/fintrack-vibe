import { Card, CardContent } from "./ui/card";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { Progress } from "./ui/progress";
import { Calendar, User } from "./icons";
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

  const progress = typeof account.debt_progress === 'number' ? account.debt_progress : 0;
  const remaining = Math.abs(account.balance);
  const initialAmount = account.debt_info.initialAmount || 0;

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={`border-2 transition-all duration-300 ${
        isOverdue
          ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100/50 shadow-red-100'
          : isUrgent
          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-amber-100'
          : 'border-blue-200 bg-gradient-to-br from-white to-blue-50/30'
      } hover:shadow-lg`}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{account.name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-0.5">
                <User className="w-3.5 h-3.5" />
                <span className="truncate">{account.debt_info.creditorName}</span>
              </div>
            </div>
            {isOverdue && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                Просрочен
              </span>
            )}
            {!isOverdue && isUrgent && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full">
                Срочно
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Погашено</span>
              <span className="font-medium text-slate-700">{progress.toFixed(1)}%</span>
            </div>
            <Progress
              value={progress}
              className={`h-2 ${
                progress >= 75 ? 'bg-emerald-100' : progress >= 50 ? 'bg-blue-100' : 'bg-amber-100'
              }`}
            />
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <p className="text-xs text-slate-500">Осталось</p>
              <p className={`text-lg font-bold ${
                isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-blue-600'
              }`}>
                {formatCurrency(remaining)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Всего</p>
              <p className="text-lg font-medium text-slate-700">
                {formatCurrency(initialAmount)}
              </p>
            </div>
          </div>

          {/* Due Date */}
          <div className={`flex items-center gap-2 text-sm pt-1 pb-0.5 ${
            isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-slate-600'
          }`}>
            <Calendar className="w-4 h-4" />
            <span>
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
  );
}
