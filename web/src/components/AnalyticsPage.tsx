import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DateRangePicker } from "./DateRangePicker";
import { TrendingUp, TrendingDown, DollarSign, Target, Filter, BarChart3, Sparkles } from "./icons";
import { motion } from "framer-motion";
import { getCurrencySymbol } from "../constants/currencies";

export function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [customRange, setCustomRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // Mock data for demonstration - в реальном приложении данные будут фильтроваться по выбранному периоду
  const getStatsForPeriod = (period: string) => {
    const baseStats = {
      week: { income: 18750, expenses: 13000, savings: 5750, savingsRate: 30.7 },
      month: { income: 75000, expenses: 52000, savings: 23000, savingsRate: 30.7 },
      '3months': { income: 225000, expenses: 156000, savings: 69000, savingsRate: 30.7 },
      year: { income: 900000, expenses: 624000, savings: 276000, savingsRate: 30.7 },
      custom: { income: 50000, expenses: 35000, savings: 15000, savingsRate: 30.0 },
    };
    return baseStats[period as keyof typeof baseStats] || baseStats.month;
  };

  const currentStats = getStatsForPeriod(selectedPeriod);

  const getCategoryExpenses = (period: string) => {
    const multiplier = {
      week: 0.25,
      month: 1,
      '3months': 3,
      year: 12,
      custom: 0.67,
    };
    const factor = multiplier[period as keyof typeof multiplier] || 1;

    return [
      { name: "Еда", amount: Math.round(18000 * factor), percentage: 35, color: "bg-blue-500" },
      { name: "Транспорт", amount: Math.round(12000 * factor), percentage: 23, color: "bg-blue-600" },
      { name: "Покупки", amount: Math.round(8000 * factor), percentage: 15, color: "bg-indigo-500" },
      { name: "Дом", amount: Math.round(7000 * factor), percentage: 13, color: "bg-indigo-600" },
      { name: "Коммуналка", amount: Math.round(4000 * factor), percentage: 8, color: "bg-blue-700" },
      { name: "Здоровье", amount: Math.round(3000 * factor), percentage: 6, color: "bg-indigo-700" },
    ];
  };

  const categoryExpenses = getCategoryExpenses(selectedPeriod);

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    const symbol = getCurrencySymbol(currency);
    return `${amount.toLocaleString('ru-RU', {
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

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-indigo-200/30 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-0 w-16 h-16 bg-indigo-200/20 rounded-full blur-xl"></div>
      
      {/* Header */}
      <motion.div 
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
          <motion.div 
            className="flex items-center justify-center gap-2 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <BarChart3 className="w-6 h-6 text-yellow-300" />
            <h1 className="text-white font-medium">Аналитика</h1>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </motion.div>
          
          {/* Period Filter */}
          <motion.div 
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
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Monthly Overview */}
        <motion.div 
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-blue-600/70">Доходы</p>
                    <p className="font-medium text-blue-700">{formatCurrency(currentStats.income)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TrendingDown className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-indigo-600/70">Расходы</p>
                    <p className="font-medium text-indigo-700">{formatCurrency(currentStats.expenses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DollarSign className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-blue-600/70">Накопления</p>
                    <p className="font-medium text-blue-700">{formatCurrency(currentStats.savings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Target className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-indigo-600/70">Норма</p>
                    <p className="font-medium text-indigo-700">{currentStats.savingsRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Spending by Category */}
        <motion.div
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
                <motion.div 
                  className="flex items-center gap-1 text-sm text-indigo-600/70"
                  whileHover={{ scale: 1.05 }}
                >
                  <Filter className="w-4 h-4" />
                  <span>{getPeriodLabel(selectedPeriod)}</span>
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryExpenses.map((category, index) => (
                <motion.div 
                  key={category.name} 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.04 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-800">{category.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-700">{formatCurrency(category.amount)}</div>
                      <div className="text-xs text-slate-500">{category.percentage}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className={`h-2 rounded-full ${category.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.06, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparison with Previous Period */}
        {selectedPeriod !== 'custom' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Сравнение с предыдущим периодом
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm text-blue-600/70 mb-1">Доходы</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium text-slate-700">{formatCurrency(currentStats.income)}</span>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full"
                        whileHover={{ scale: 1.1 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>+12%</span>
                      </motion.div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm text-indigo-600/70 mb-1">Расходы</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium text-slate-700">{formatCurrency(currentStats.expenses)}</span>
                      <motion.div 
                        className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full"
                        whileHover={{ scale: 1.1 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>+8%</span>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Goals Section */}
        <motion.div
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
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <motion.div 
                  className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mb-3 shadow-sm"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Target className="w-6 h-6 text-blue-600" />
                </motion.div>
                <p className="text-blue-600/70 text-sm mb-3">
                  Установите финансовые цели
                </p>
                <motion.div
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
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}