import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Upload, 
  Trash2, 
  Tags,
  DollarSign,
  ChevronRight,
  Moon,
  Globe,
  Settings as SettingsIcon,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

export function SettingsPage() {
  const settingsGroups = [
    {
      title: "Аккаунт",
      items: [
        {
          icon: User,
          label: "Профиль",
          description: "Управление личными данными",
          action: "navigate",
          color: "bg-blue-100 text-blue-600"
        },
        {
          icon: Shield,
          label: "Безопасность",
          description: "Пароли и двухфакторная аутентификация",
          action: "navigate",
          color: "bg-green-100 text-green-600"
        }
      ]
    },
    {
      title: "Финансы",
      items: [
        {
          icon: Tags,
          label: "Управление категориями",
          description: "Добавить, изменить или удалить категории",
          action: "navigate",
          color: "bg-purple-100 text-purple-600"
        },
        {
          icon: DollarSign,
          label: "Счета и карты",
          description: "Управление финансовыми счетами",
          action: "navigate",
          color: "bg-orange-100 text-orange-600"
        }
      ]
    },
    {
      title: "Приложение",
      items: [
        {
          icon: Bell,
          label: "Уведомления",
          description: "Напоминания о расходах и целях",
          action: "toggle",
          value: true,
          color: "bg-yellow-100 text-yellow-600"
        },
        {
          icon: Moon,
          label: "Тёмная тема",
          description: "Переключить на тёмное оформление",
          action: "toggle",
          value: false,
          color: "bg-gray-100 text-gray-600"
        },
        {
          icon: Globe,
          label: "Язык",
          description: "Русский",
          action: "navigate",
          color: "bg-indigo-100 text-indigo-600"
        },
        {
          icon: Palette,
          label: "Цветовая схема",
          description: "Настройка внешнего вида",
          action: "navigate",
          color: "bg-pink-100 text-pink-600"
        }
      ]
    },
    {
      title: "Данные",
      items: [
        {
          icon: Upload,
          label: "Экспорт данных",
          description: "Скачать все ваши данные",
          action: "button",
          color: "bg-cyan-100 text-cyan-600"
        },
        {
          icon: Download,
          label: "Импорт данных",
          description: "Загрузить данные из файла",
          action: "button",
          color: "bg-teal-100 text-teal-600"
        }
      ]
    }
  ];

  const dangerousActions = [
    {
      icon: Trash2,
      label: "Удалить все данные",
      description: "Безвозвратно удалить все операции",
      color: "bg-red-100 text-red-600"
    }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-0 w-16 h-16 bg-indigo-200/20 rounded-full blur-xl"></div>
      
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 px-4 py-6 relative overflow-hidden"
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
            <SettingsIcon className="w-6 h-6 text-yellow-300" />
            <h1 className="text-white font-medium">Настройки</h1>
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
        {settingsGroups.map((group, groupIndex) => (
          <motion.div 
            key={group.title} 
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + groupIndex * 0.06 }}
          >
            <h2 className="font-medium text-sm uppercase tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {group.title}
            </h2>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  {group.items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        className={`flex items-center justify-between p-4 hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer ${
                          index !== group.items.length - 1 ? 'border-b border-blue-100' : ''
                        }`}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-100 to-indigo-200"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon className={`w-5 h-5 ${
                              groupIndex === 0 ? 'text-blue-600' :
                              groupIndex === 1 ? 'text-purple-600' :
                              groupIndex === 2 ? 'text-indigo-600' :
                              'text-teal-600'
                            }`} />
                          </motion.div>
                          <div>
                            <h3 className="font-medium text-slate-800">{item.label}</h3>
                            <p className="text-sm text-slate-600">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {item.action === 'toggle' && (
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Switch checked={item.value} />
                            </motion.div>
                          )}
                          {item.action === 'navigate' && (
                            <motion.div
                              whileHover={{ x: 2 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-5 h-5 text-slate-500" />
                            </motion.div>
                          )}
                          {item.action === 'button' && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                                Открыть
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}

        {/* Dangerous Actions */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h2 className="font-medium text-sm uppercase tracking-wide bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Осторожно
          </h2>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                {dangerousActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      className="flex items-center justify-between p-4 hover:bg-red-50/70 transition-colors duration-200"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 shadow-sm"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="font-medium text-red-700">{item.label}</h3>
                          <p className="text-sm text-red-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="destructive" size="sm" className="shadow-sm hover:shadow-md transition-all duration-200">
                          Удалить
                        </Button>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* App Info */}
        <motion.div 
          className="text-center pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <motion.p 
            className="text-xs text-slate-500"
            whileHover={{ scale: 1.05 }}
          >
            FinanceTracker v1.0.0
          </motion.p>
          <motion.p 
            className="text-xs text-slate-500 mt-1"
            whileHover={{ scale: 1.05 }}
          >
            Сделано с ❤️ для вашего финансового благополучия
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}