import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Wallet, TrendingUp, PieChart, Sparkles, Shield, Target } from "./icons";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";

interface WelcomePageProps {
  onGetStarted: () => void;
}

export function WelcomePage({ onGetStarted }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 flex flex-col justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-indigo-200/30 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-0 w-16 h-16 bg-purple-200/20 rounded-full blur-xl"></div>
      
      <LightMotion
        className="max-w-md mx-auto space-y-8 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <OptimizedMotion className="text-center space-y-4">
          <OptimizedMotion className="w-24 h-24 mx-auto flex items-center justify-center">
            <img src="/images/Logo FinTrack-no-bg-preview (carve.photos).png" alt="FinTrack" className="w-24 h-24 object-contain" />
          </OptimizedMotion>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            FinanceTracker
          </h1>
          <p className="text-slate-600">
            Управляй своими финансами в Telegram
          </p>
        </OptimizedMotion>

        {/* Features */}
        <OptimizedMotion className="space-y-4">
          {[
            {
              icon: TrendingUp,
              title: "Отслеживание трендов",
              description: "Видите динамику ваших финансов",
              gradient: "from-emerald-500 to-green-600",
              bgGradient: "from-emerald-50 to-green-50",
              borderColor: "border-emerald-200"
            },
            {
              icon: PieChart,
              title: "Категории расходов",
              description: "Анализируйте структуру трат",
              gradient: "from-blue-500 to-indigo-600",
              bgGradient: "from-blue-50 to-indigo-50",
              borderColor: "border-blue-200"
            },
            {
              icon: Target,
              title: "Достижение целей",
              description: "Планируйте и контролируйте бюджет",
              gradient: "from-purple-500 to-pink-600",
              bgGradient: "from-purple-50 to-pink-50",
              borderColor: "border-purple-200"
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <OptimizedMotion key={index}>
                <Card className={`${feature.borderColor} bg-gradient-to-br ${feature.bgGradient} hover:shadow-lg transition-all duration-300`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center shadow-sm`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">{feature.title}</h3>
                        <p className="text-sm text-slate-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </OptimizedMotion>
            );
          })}
        </OptimizedMotion>

        {/* CTA Button */}
        <OptimizedMotion className="pt-4">
          <LightMotion whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onGetStarted}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 font-medium">Начать отслеживание</span>
            </Button>
          </LightMotion>
        </OptimizedMotion>

        {/* Footer */}
        <OptimizedMotion className="text-center text-sm text-slate-500 flex items-center justify-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Безопасно и просто в использовании</span>
        </OptimizedMotion>
      </LightMotion>
    </div>
  );
}