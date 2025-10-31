import { Home, BarChart3, BookOpen, Settings } from "./icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BottomNavigation({ currentPage, onNavigate }: BottomNavigationProps) {
  const { t } = useTranslation('common');

  const navItems = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard'),
      icon: Home,
    },
    {
      id: 'analytics',
      label: t('navigation.analytics'),
      icon: BarChart3,
    },
    {
      id: 'education',
      label: t('navigation.education'),
      icon: BookOpen,
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: Settings,
    },
  ];

  return (
    <motion.div
      className="bg-gradient-to-r from-white/95 via-blue-50/95 to-indigo-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-gray-900/95 backdrop-blur-lg border-t border-blue-200 dark:border-slate-700 px-4 py-2 safe-area-inset-bottom shadow-xl flex-shrink-0"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 relative ${
                  isActive
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-slate-700 dark:via-slate-600 dark:to-gray-700 rounded-xl shadow-lg border border-blue-200/50 dark:border-slate-600/50"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <motion.div
                  className="relative z-10"
                  animate={isActive ? { 
                    scale: 1.15,
                    rotateY: [0, 5, -5, 0]
                  } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-5 h-5 mb-1" />
                </motion.div>
                <motion.span 
                  className="text-xs font-medium relative z-10"
                  animate={isActive ? { 
                    fontWeight: 600,
                    scale: 1.05
                  } : { 
                    fontWeight: 500,
                    scale: 1 
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}