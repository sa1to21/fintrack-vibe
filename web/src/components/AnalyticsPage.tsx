import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DateRangePicker } from "./DateRangePicker";
import { TrendingUp, TrendingDown, DollarSign, CalendarIcon, Filter, BarChart3, Sparkles, Target } from "./icons";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import { getCurrencySymbol } from "../constants/currencies";
import analyticsService, {
  AnalyticsSummary,
  CategoriesResponse,
  ComparisonResponse
} from "../services/analytics.service";

export function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [customRange, setCustomRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // API data states
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate date range based on selected period
  const getDateRange = () => {
    const today = new Date();
    let dateFrom: Date;
    let dateTo = today;

    switch (selectedPeriod) {
      case 'week':
        dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - 7);
        break;
      case 'month':
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case '3months':
        dateFrom = new Date(today);
        dateFrom.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        dateFrom = new Date(today.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (customRange.from && customRange.to) {
          return {
            date_from: customRange.from.toISOString().split('T')[0],
            date_to: customRange.to.toISOString().split('T')[0],
          };
        }
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return {
      date_from: dateFrom.toISOString().split('T')[0],
      date_to: dateTo.toISOString().split('T')[0],
    };
  };

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = getDateRange();

      const [summaryData, categoriesData, comparisonData] = await Promise.all([
        analyticsService.getSummary(dateRange),
        analyticsService.getCategoriesExpenses({ ...dateRange, limit: 6 }),
        selectedPeriod !== 'custom' ? analyticsService.getComparison(dateRange) : Promise.resolve(null),
      ]);

      setSummary(summaryData);
      setCategories(categoriesData);
      setComparison(comparisonData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Не удалось загрузить данные аналитики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, customRange]);

  // Get average expense per day
  const getAvgExpensePerDay = () => {
    if (!summary) return 0;
    return parseFloat(summary.avg_expense_per_day);
  };

  // Get color classes for categories (cycle through colors)
  const getColorClass = (index: number) => {
    const colors = [
      "bg-blue-500", "bg-blue-600", "bg-indigo-500",
      "bg-indigo-600", "bg-blue-700", "bg-indigo-700"
    ];
    return colors[index % colors.length];
  };

  const formatCurrency = (amount: number | string, currency: string = 'RUB') => {
    const symbol = getCurrencySymbol(currency);
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${numAmount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} ${symbol}`;
  };

  const getPeriodLabel = (period: string) => {
    const labels = {
      week: 'За неделю',
      month: 'За месяц',
      '3months': 'За 3 месяца',
      year: 'За год',
      custom: 'За период',
    };
    return labels[period as keyof typeof labels] || 'За месяц';
  };

  // Show loading or error state
  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600">Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  if (error || !summary || !categories) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Не удалось загрузить данные'}</p>
            <button
              onClick={loadAnalyticsData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Попробовать снова
            </button>
          </CardContent>
        </Card>
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
      <OptimizedMotion 
        className="bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 px-4 py-6 relative overflow-hidden"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-y-12 translate-y-8"></div>
        <div className="absolute top-4 right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-8 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="max-w-md mx-auto relative">
          <OptimizedMotion 
            className="flex items-center justify-center gap-2 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <BarChart3 className="w-6 h-6 text-yellow-300" />
            <h1 className="text-white font-medium">Аналитика</h1>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </OptimizedMotion>
          
          {/* Period Filter */}
          <OptimizedMotion 
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <DateRangePicker
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
          </OptimizedMotion>
        </div>
      </OptimizedMotion>

      <OptimizedMotion 
        className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Monthly Overview */}
        <OptimizedMotion 
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <OptimizedMotion
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600/70">Доходы</p>
                    <p className="font-medium text-sm text-emerald-700">{formatCurrency(summary.income)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </OptimizedMotion>

          <OptimizedMotion
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-sm">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-red-600/70">Расходы</p>
                    <p className="font-medium text-sm text-red-700">{formatCurrency(summary.expenses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </OptimizedMotion>

          <OptimizedMotion
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <OptimizedMotion
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DollarSign className="w-4 h-4 text-white" />
                  </OptimizedMotion>
                  <div>
                    <p className="text-xs text-blue-600/70">Баланс</p>
                    <p className="font-medium text-sm text-blue-700">{formatCurrency(summary.savings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </OptimizedMotion>

          <OptimizedMotion
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <OptimizedMotion
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </OptimizedMotion>
                  <div>
                    <p className="text-xs text-blue-600/70">В день</p>
                    <p className="font-medium text-sm text-blue-700">{formatCurrency(getAvgExpensePerDay())}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </OptimizedMotion>
        </OptimizedMotion>

        {/* Spending by Category */}
        <OptimizedMotion
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Расходы по категориям
                </span>
                <OptimizedMotion 
                  className="flex items-center gap-1 text-sm text-indigo-600/70"
                  whileHover={{ scale: 1.05 }}
                >
                  <Filter className="w-4 h-4" />
                  <span>{getPeriodLabel(selectedPeriod)}</span>
                </OptimizedMotion>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.categories.length === 0 ? (
                <p className="text-center text-slate-500 py-4">Нет расходов за выбранный период</p>
              ) : (
                categories.categories.map((category, index) => (
                  <OptimizedMotion
                    key={category.id}
                    className="space-y-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.04 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium text-slate-800">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-700">{formatCurrency(category.amount)}</div>
                        <div className="text-xs text-slate-500">{category.percentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <OptimizedMotion
                        className={`h-2 rounded-full ${getColorClass(index)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ duration: 0.6, delay: 0.5 + index * 0.06, ease: "easeOut" }}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </OptimizedMotion>
                ))
              )}
            </CardContent>
          </Card>
        </OptimizedMotion>

        {/* Comparison with Previous Period */}
        {selectedPeriod !== 'custom' && comparison && (
          <OptimizedMotion
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center shadow-sm">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Сравнение с предыдущим периодом
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Income Comparison */}
                <OptimizedMotion
                  className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-sm">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-xs text-emerald-600/70">Доходы</span>
                    </div>
                    <p className="font-medium text-sm text-emerald-700">{formatCurrency(comparison.current.income)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-emerald-600/70">
                      Предыдущий период: {formatCurrency(comparison.previous.income)}
                    </div>
                    {comparison.change.income_percent !== 0 && (
                      <OptimizedMotion
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          comparison.change.income_percent > 0
                            ? 'text-emerald-700 bg-emerald-200/60'
                            : 'text-red-600 bg-red-100'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        {comparison.change.income_percent > 0 ? '↗' : '↘'}
                        <span>{comparison.change.income_percent > 0 ? '+' : ''}{comparison.change.income_percent}%</span>
                      </OptimizedMotion>
                    )}
                  </div>
                </OptimizedMotion>

                {/* Expenses Comparison */}
                <OptimizedMotion
                  className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-sm">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-xs text-red-600/70">Расходы</span>
                    </div>
                    <p className="font-medium text-sm text-red-700">{formatCurrency(comparison.current.expenses)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-red-600/70">
                      Предыдущий период: {formatCurrency(comparison.previous.expenses)}
                    </div>
                    {comparison.change.expenses_percent !== 0 && (
                      <OptimizedMotion
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          comparison.change.expenses_percent > 0
                            ? 'text-red-700 bg-red-200/60'
                            : 'text-emerald-600 bg-emerald-100'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        {comparison.change.expenses_percent > 0 ? '↗' : '↘'}
                        <span>{comparison.change.expenses_percent > 0 ? '+' : ''}{comparison.change.expenses_percent}%</span>
                      </OptimizedMotion>
                    )}
                  </div>
                </OptimizedMotion>
              </CardContent>
            </Card>
          </OptimizedMotion>
        )}

        {/* Goals Section */}
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Финансовые цели
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OptimizedMotion 
                className="text-center py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <OptimizedMotion 
                  className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mb-3 shadow-sm"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Target className="w-6 h-6 text-blue-600" />
                </OptimizedMotion>
                <p className="text-blue-600/70 text-sm mb-3">
                  Установите финансовые цели
                </p>
                <OptimizedMotion
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <p className="text-xs text-blue-500">
                    Скоро доступно
                  </p>
                </OptimizedMotion>
              </OptimizedMotion>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </OptimizedMotion>
    </div>
  );
}