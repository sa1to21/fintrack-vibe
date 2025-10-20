import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { BookOpen, Clock, Award, TrendingUp, PiggyBank, Shield, Target, GraduationCap, Sparkles } from "./icons";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import { motion } from "framer-motion";

export function EducationPage() {
  const courses = [
    {
      id: 1,
      title: "Основы личного бюджета",
      description: "Научитесь планировать доходы и расходы",
      duration: "15 мин",
      level: "Новичок",
      icon: PiggyBank,
      progress: 0,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 2,
      title: "Стратегии накопления",
      description: "Эффективные методы формирования сбережений",
      duration: "20 мин",
      level: "Новичок",
      icon: Target,
      progress: 0,
      color: "bg-green-100 text-green-600"
    },
    {
      id: 3,
      title: "Инвестиции для начинающих",
      description: "Базовые принципы инвестирования",
      duration: "25 мин",
      level: "Средний",
      icon: TrendingUp,
      progress: 0,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  // All 7 tips that rotate daily
  const allTips = [
    {
      title: "Отслеживайте все расходы",
      description: "Записывайте каждую трату в течение месяца — это поможет найти «утечки» денег",
      category: "Бюджетирование"
    },
    {
      title: "Правило одной категории",
      description: "Определите одну категорию расходов для сокращения каждый месяц",
      category: "Бюджетирование"
    },
    {
      title: "Экстренный фонд",
      description: "Откладывайте 3-6 месячных расходов на случай непредвиденных ситуаций",
      category: "Накопления"
    },
    {
      title: "Сложный процент",
      description: "Начинайте инвестировать как можно раньше, время — ваш лучший союзник",
      category: "Инвестиции"
    },
    {
      title: "Правило 24 часов",
      description: "Перед крупной покупкой подождите сутки — это поможет избежать импульсивных трат",
      category: "Расходы"
    },
    {
      title: "Автоматизация сбережений",
      description: "Настройте автоматический перевод части дохода на накопительный счёт сразу после зарплаты",
      category: "Накопления"
    },
    {
      title: "Диверсификация",
      description: "Не держите все яйца в одной корзине — распределяйте активы между разными инструментами",
      category: "Инвестиции"
    }
  ];

  // Calculate day offset (0-6) based on current date
  const getDayOffset = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % 7;
  };

  // Get 3 tips for today (sliding window)
  const getTodaysTips = () => {
    const offset = getDayOffset();
    const tips = [];
    for (let i = 0; i < 3; i++) {
      tips.push(allTips[(offset + i) % 7]);
    }
    return tips;
  };

  const tips = getTodaysTips();

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Новичок":
        return "bg-green-100 text-green-700";
      case "Средний":
        return "bg-yellow-100 text-yellow-700";
      case "Продвинутый":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorations removed for performance */}
      
      {/* Header */}
      <OptimizedMotion className="bg-gradient-to-br from-indigo-500 to-pink-700 px-4 py-6 relative overflow-hidden">
        {/* Background decorations - simplified for performance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-y-12 translate-y-8"></div>

        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="w-6 h-6 text-yellow-300" />
            <h1 className="text-white font-medium">Финансовая грамотность</h1>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
        </div>
      </OptimizedMotion>

      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10">
        {/* Daily Tips - moved to top */}
        <div className="space-y-4">
          <h2 className="font-medium text-foreground bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Советы дня</h2>
          {tips.map((tip, index) => (
            <OptimizedMotion key={index}>
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-slate-800">{tip.title}</h3>
                    <Badge
                      variant="outline"
                      className={`text-xs border-purple-300 ${
                        index === 0 ? 'text-blue-700 bg-blue-50' :
                        index === 1 ? 'text-green-700 bg-green-50' :
                        'text-purple-700 bg-purple-50'
                      }`}
                    >
                      {tip.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    {tip.description}
                  </p>
                </CardContent>
              </Card>
            </OptimizedMotion>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <OptimizedMotion>
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-100 to-blue-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <GraduationCap className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="font-medium text-indigo-700 mb-2">Скоро</h3>
                <p className="text-sm text-indigo-600/70 mb-1">
                  Обучающие курсы и интерактивные тесты
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
                  <p className="text-xs text-indigo-500">
                    Следите за обновлениями
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </OptimizedMotion>

        {/* Blurred section - Progress and Courses */}
        <div className="relative rounded-lg overflow-hidden">
          {/* Blur overlay covering everything */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/50 z-10"></div>

          <div className="space-y-4">
            {/* Progress Overview */}
            <OptimizedMotion>
              <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-indigo-700">Ваш прогресс</h3>
                      <p className="text-sm text-indigo-600/70">0 из 3 курсов завершено</p>
                      <div className="w-full bg-indigo-200 rounded-full h-2 mt-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{width: '0%'}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </OptimizedMotion>

            {/* Courses */}
            <div className="space-y-4">
              <h2 className="font-medium text-foreground bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Курсы</h2>
              {courses.map((course, index) => {
                const Icon = course.icon;
                return (
                  <Card key={course.id} className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br ${
                            index === 0 ? 'from-blue-500 to-indigo-600' :
                            index === 1 ? 'from-green-500 to-emerald-600' :
                            'from-purple-500 to-pink-600'
                          }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-slate-800">{course.title}</h3>
                            <Badge
                              variant="secondary"
                              className={`${getLevelColor(course.level)} border shadow-sm`}
                            >
                              {course.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              <span>Не начат</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}