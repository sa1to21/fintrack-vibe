import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { BookOpen, Clock, Award, TrendingUp, PiggyBank, Shield, Target, GraduationCap, Sparkles } from "./icons";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function EducationPage() {
  const { t } = useTranslation('education');

  const courses = [
    {
      id: 1,
      titleKey: "courses.list.budgetBasics.title",
      descriptionKey: "courses.list.budgetBasics.description",
      duration: 15,
      levelKey: "courses.level.beginner",
      icon: PiggyBank,
      progress: 0,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 2,
      titleKey: "courses.list.savingStrategies.title",
      descriptionKey: "courses.list.savingStrategies.description",
      duration: 20,
      levelKey: "courses.level.beginner",
      icon: Target,
      progress: 0,
      color: "bg-green-100 text-green-600"
    },
    {
      id: 3,
      titleKey: "courses.list.investmentBasics.title",
      descriptionKey: "courses.list.investmentBasics.description",
      duration: 25,
      levelKey: "courses.level.intermediate",
      icon: TrendingUp,
      progress: 0,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  // All 7 tips that rotate daily - using translation keys
  const allTipKeys = [
    "trackExpenses",
    "oneCategory",
    "emergencyFund",
    "compoundInterest",
    "wait24Hours",
    "autoSavings",
    "diversification"
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
      tips.push(allTipKeys[(offset + i) % 7]);
    }
    return tips;
  };

  const tipKeys = getTodaysTips();

  const getLevelColor = (levelKey: string) => {
    const level = t(levelKey);
    if (level.includes("Beginner") || level.includes("Новичок")) {
      return "bg-green-100 text-green-700";
    } else if (level.includes("Intermediate") || level.includes("Средний")) {
      return "bg-yellow-100 text-yellow-700";
    } else if (level.includes("Advanced") || level.includes("Продвинутый")) {
      return "bg-red-100 text-red-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: 'var(--bg-page-education)' }}>
      {/* Background decorations removed for performance */}
      
      {/* Header */}
      <OptimizedMotion className="px-4 py-6 relative overflow-hidden" style={{ background: 'var(--bg-header)' }}>
        {/* Background decorations - simplified for performance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-y-12 translate-y-8"></div>

        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="w-6 h-6 text-yellow-300" />
            <h1 className="text-white font-medium">{t('title')}</h1>
          </div>
        </div>
      </OptimizedMotion>

      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10">
        {/* Daily Tips - moved to top */}
        <div className="space-y-4">
          <h2 className="font-medium text-foreground bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('dailyTips')}</h2>
          {tipKeys.map((tipKey, index) => (
            <OptimizedMotion key={index}>
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-slate-800">{t(`tips.${tipKey}.title`)}</h3>
                    <Badge
                      variant="outline"
                      className={`text-xs border-blue-300 ${
                        index === 0 ? 'text-blue-700 bg-blue-100' :
                        index === 1 ? 'text-green-700 bg-green-100' :
                        'text-indigo-700 bg-indigo-100'
                      }`}
                    >
                      {t(`tips.${tipKey}.category`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    {t(`tips.${tipKey}.description`)}
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
                <h3 className="font-medium text-indigo-700 mb-2">{t('comingSoon.title')}</h3>
                <p className="text-sm text-indigo-600/70 mb-1">
                  {t('comingSoon.description')}
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
                    {t('comingSoon.followUpdates')}
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
                      <h3 className="font-medium text-indigo-700">{t('progress.title')}</h3>
                      <p className="text-sm text-indigo-600/70">{t('progress.completed', { count: 0, total: 3 })}</p>
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
              <h2 className="font-medium text-foreground bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('coursesTitle')}</h2>
              {courses.map((course, index) => {
                const Icon = course.icon;
                return (
                  <Card key={course.id} className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br ${
                            index === 0 ? 'from-blue-500 to-indigo-600' :
                            index === 1 ? 'from-green-500 to-emerald-600' :
                            'from-indigo-500 to-blue-600'
                          }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-slate-800">{t(course.titleKey)}</h3>
                            <Badge
                              variant="secondary"
                              className={`${getLevelColor(course.levelKey)} border shadow-sm`}
                            >
                              {t(course.levelKey)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">
                            {t(course.descriptionKey)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{course.duration} {t('courses.duration')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              <span>{t('courses.notStarted')}</span>
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