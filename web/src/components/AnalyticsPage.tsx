import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DateRangePicker } from "./DateRangePicker";
import { TrendingUp, TrendingDown, DollarSign, CalendarIcon, Filter, BarChart3, Sparkles, AlertCircle } from "./icons";
import accountsService, { type DebtStats } from "../services/accounts.service";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import { getCurrencySymbol } from "../constants/currencies";
import analyticsService, {
  AnalyticsSummary,
  CategoriesResponse,
  ComparisonResponse,
  InsightsResponse
} from "../services/analytics.service";

export function AnalyticsPage() {
  const { t, i18n } = useTranslation('analytics');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [customRange, setCustomRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // API data states
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [debtStats, setDebtStats] = useState<DebtStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  type DateRangeParams = { date_from: string; date_to: string };
  type FetchParams = Partial<DateRangeParams & { period: string }>;
  const isAllPeriod = selectedPeriod === 'all';

  const formatDateForApi = (date: Date): string => {
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjusted = new Date(date.getTime() - timezoneOffset);
    return adjusted.toISOString().split('T')[0];
  };

  // Calculate date range based on selected period
  const getDateRange = (): DateRangeParams | null => {
    if (isAllPeriod) {
      return null;
    }

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
        dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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
            date_from: formatDateForApi(customRange.from),
            date_to: formatDateForApi(customRange.to),
          };
        }
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return {
      date_from: formatDateForApi(dateFrom),
      date_to: formatDateForApi(dateTo),
    };
  };

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = getDateRange();
      const baseParams: FetchParams = dateRange ? { ...dateRange } : {};
      if (isAllPeriod) {
        baseParams.period = 'all';
      }

      const [summaryData, categoriesData, comparisonData, insightsData, debtStatsData] = await Promise.all([
        analyticsService.getSummary(baseParams),
        analyticsService.getCategoriesExpenses({ ...baseParams, limit: 6 }),
        selectedPeriod !== 'custom' && !isAllPeriod ? analyticsService.getComparison(baseParams) : Promise.resolve(null),
        analyticsService.getInsights(baseParams),
        accountsService.getDebtStats().catch(() => null),
      ]);

      setSummary(summaryData);
      const filteredCategories = (() => {
        const transferNames = new Set(['перевод', 'transfer']);
        const cleaned = categoriesData.categories.filter((category) => {
          const normalized = category.name?.trim().toLowerCase() || '';
          return !transferNames.has(normalized);
        });

        if (cleaned.length === categoriesData.categories.length) {
          return categoriesData;
        }

        const total = cleaned.reduce((sum, category) => sum + parseFloat(category.amount), 0);
        let recalculated = cleaned.map((category) => {
          const amount = parseFloat(category.amount);
          const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
          return {
            ...category,
            percentage,
          };
        });

        const percentageSum = recalculated.reduce((sum, category) => sum + category.percentage, 0);
        if (percentageSum !== 100 && recalculated.length > 0 && total > 0) {
          const diff = 100 - percentageSum;
          const maxIndex = recalculated.reduce(
            (maxIdx, category, idx, arr) =>
              category.percentage > arr[maxIdx].percentage ? idx : maxIdx,
            0,
          );
          recalculated = recalculated.map((category, idx) =>
            idx === maxIndex
              ? { ...category, percentage: Math.max(0, category.percentage + diff) }
              : category,
          );
        }

        return {
          ...categoriesData,
          categories: recalculated,
          total_expenses: total.toString(),
        };
      })();

      setCategories(filteredCategories);
      setComparison(comparisonData);
      setInsights(insightsData);
      setDebtStats(debtStatsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(t('error.loadFailed'));
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
    const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
    return `${numAmount.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} ${symbol}`;
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      all: t('period.all'),
      week: t('period.week'),
      month: t('period.month'),
      '3months': t('period.threeMonths'),
      year: t('period.year'),
      custom: t('period.custom'),
    };
    return labels[period] || t('period.month');
  };

  // Show loading or error state
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ background: 'var(--bg-page-analytics)' }}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !summary || !categories) {
    return (
      <div className="min-h-full flex items-center justify-center p-4" style={{ background: 'var(--bg-page-analytics)' }}>
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || t('error.noData')}</p>
            <button
              onClick={loadAnalyticsData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t('error.tryAgain')}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: 'var(--bg-page-analytics)' }}>
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-indigo-200/30 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-0 w-16 h-16 bg-indigo-200/20 rounded-full blur-xl"></div>
      
      {/* Header */}
      <OptimizedMotion
        className="px-4 py-6 relative overflow-hidden"
        style={{ background: 'var(--bg-header)' }}
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
            <h1 className="text-white font-medium">{t('title')}</h1>
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
                    <p className="text-xs text-emerald-600/70">{t('income')}</p>
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
                    <p className="text-xs text-red-600/70">{t('expenses')}</p>
                    <p className="font-medium text-sm text-red-700">{formatCurrency(summary.expenses)}</p>
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
                <span className="text-foreground font-medium">
                  {t('expensesByCategory')}
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
                <p className="text-center text-slate-500 py-4">{t('noExpenses')}</p>
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
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-lg flex-shrink-0">{category.icon}</span>
                        <span className="text-sm font-medium text-slate-800 truncate">{category.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
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
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-sm">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-foreground font-medium">
                    {t('comparison.title')}
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
                      <span className="text-xs text-emerald-600/70">{t('income')}</span>
                    </div>
                    <p className="font-medium text-sm text-emerald-700">{formatCurrency(comparison.current.income)}</p>
                  </div>
                  <div className="text-xs text-emerald-600/70">
                    {t('comparison.previous')}: {formatCurrency(comparison.previous.income)}
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
                      <span className="text-xs text-red-600/70">{t('expenses')}</span>
                    </div>
                    <p className="font-medium text-sm text-red-700">{formatCurrency(comparison.current.expenses)}</p>
                  </div>
                  <div className="text-xs text-red-600/70">
                    {t('comparison.previous')}: {formatCurrency(comparison.previous.expenses)}
                  </div>
                </OptimizedMotion>
              </CardContent>
            </Card>
          </OptimizedMotion>
        )}

        {/* Debts Section */}
        {debtStats && debtStats.debts.length > 0 && (
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.53 }}
          >
            <Card className="border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center shadow-sm">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                  </div>
                  <span className="text-foreground font-medium">
                    {t('debts.title')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const progressValue = parseFloat(String(debtStats.overall_progress || 0));
                  console.log('Overall progress from API:', debtStats.overall_progress);
                  console.log('Parsed progress value:', progressValue);
                  console.log('Width for progress bar:', `${progressValue}%`);

                  return (
                    <OptimizedMotion
                      className="space-y-2"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.58 }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-800">{t('debts.progress')}</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-amber-700">
                            {progressValue.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all duration-600 ease-out"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                    </OptimizedMotion>
                  );
                })()}

                {debtStats.debts.slice(0, 3).map((debt, index) => {
                  const progress = parseFloat(String(debt.progress || 0));
                  return (
                    <OptimizedMotion
                      key={debt.id}
                      className="space-y-2"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.64 + index * 0.04 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚠️</span>
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-slate-800 block truncate">{debt.name}</span>
                            <span className="text-xs text-slate-500 block truncate">{debt.creditor}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-amber-700">{formatCurrency(debt.balance, debt.currency)}</div>
                          <div className="text-xs text-slate-500">{progress.toFixed(0)}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${getColorClass(index)} transition-all duration-600 ease-out`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </OptimizedMotion>
                  );
                })}
              </CardContent>
            </Card>
          </OptimizedMotion>
        )}

        {/* Insights Section */}
        {insights && insights.total_transactions > 0 && (
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-foreground font-medium">
                    {t('insights.title')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.biggest_expense && (
                  <OptimizedMotion
                    className="space-y-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏆</span>
                        <span className="text-sm font-medium text-slate-800">{t('insights.biggestExpense')}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-700">{formatCurrency(insights.biggest_expense.amount)}</div>
                        <div className="text-xs text-slate-500">{insights.biggest_expense.category}, {insights.biggest_expense.date}</div>
                      </div>
                    </div>
                  </OptimizedMotion>
                )}

                {insights.total_transactions > 0 && (
                  <OptimizedMotion
                    className="space-y-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.64 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <span className="text-sm font-medium text-slate-800">{t('insights.avgTransaction')}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-700">{formatCurrency(insights.avg_transaction)}</div>
                        <div className="text-xs text-slate-500">{insights.total_transactions} {insights.total_transactions === 1 ? t('insights.transactions.one') : insights.total_transactions < 5 ? t('insights.transactions.few') : t('insights.transactions.many')}</div>
                      </div>
                    </div>
                  </OptimizedMotion>
                )}

                {insights.busiest_day && (
                  <OptimizedMotion
                    className="space-y-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.68 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔥</span>
                        <span className="text-sm font-medium text-slate-800">{t('insights.busiestDay')}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-700">{insights.busiest_day}</div>
                      </div>
                    </div>
                  </OptimizedMotion>
                )}

                {insights.top_category && (
                  <OptimizedMotion
                    className="space-y-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.72 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-lg flex-shrink-0">⚡</span>
                        <span className="text-sm font-medium text-slate-800 truncate">{insights.top_category.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-sm font-medium text-slate-700">{insights.top_category.percentage}%</div>
                        <div className="text-xs text-slate-500">{t('insights.topCategory')}</div>
                      </div>
                    </div>
                  </OptimizedMotion>
                )}
              </CardContent>
            </Card>
          </OptimizedMotion>
        )}
      </OptimizedMotion>
    </div>
  );
}
