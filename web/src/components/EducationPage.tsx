import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { BookOpen, Clock, Award, TrendingUp, PiggyBank, Shield, Target, GraduationCap, Sparkles } from "./icons";
import { motion } from "motion/react";

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
    },
    {
      id: 4,
      title: "Финансовая безопасность",
      description: "Защита от финансовых рисков",
      duration: "18 мин",
      level: "Средний",
      icon: Shield,
      progress: 0,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const tips = [
    {
      title: "Правило 50/30/20",
      description: "50% на необходимое, 30% на желания, 20% на сбережения",
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
    }
  ];

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
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 left-0 w-16 h-16 bg-blue-200/20 rounded-full blur-xl"></div>
      
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-700 px-4 py-6 relative overflow-hidden"
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
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <GraduationCap className="w-6 h-6 text-yellow-300" />
            <h1 className="text-white font-medium">Финансовая грамотность</h1>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Award className="w-6 h-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-medium text-indigo-700">Ваш прогресс</h3>
                  <p className="text-sm text-indigo-600/70">0 из 4 курсов завершено</p>
                  <div className="w-full bg-indigo-200 rounded-full h-2 mt-2 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Courses */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="font-medium text-foreground bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Курсы</h2>
          {courses.map((course, index) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.06 }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br ${
                          index === 0 ? 'from-blue-500 to-indigo-600' :
                          index === 1 ? 'from-green-500 to-emerald-600' :
                          index === 2 ? 'from-purple-500 to-pink-600' :
                          'from-orange-500 to-red-600'
                        }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-slate-800">{course.title}</h3>
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Badge 
                              variant="secondary" 
                              className={`${getLevelColor(course.level)} border shadow-sm`}
                            >
                              {course.level}
                            </Badge>
                          </motion.div>
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
              </motion.div>
            );
          })}
        </motion.div>

        {/* Daily Tips */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h2 className="font-medium text-foreground bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Советы дня</h2>
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.55 + index * 0.06 }}
              whileHover={{ scale: 1.02, x: 4 }}
            >
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-slate-800">{tip.title}</h3>
                    <motion.div whileHover={{ scale: 1.05 }}>
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
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600">
                    {tip.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Скоро
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-center py-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.75 }}
              >
                <motion.div 
                  className="w-12 h-12 mx-auto bg-gradient-to-br from-indigo-100 to-blue-200 rounded-full flex items-center justify-center mb-3 shadow-sm"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </motion.div>
                <p className="text-indigo-600/70 text-sm mb-2">
                  Интерактивные тесты
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
                    Проверьте свои знания
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