import { useState, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { TelegramAuthProvider, useTelegramAuth } from "./contexts/TelegramAuthContext";
import { Toaster } from "./components/ui/sonner";

// Lazy load all page components for code splitting
const WelcomePage = lazy(() => import("./components/WelcomePage").then(m => ({ default: m.WelcomePage })));
const DashboardPage = lazy(() => import("./components/DashboardPage").then(m => ({ default: m.DashboardPage })));
const AddTransactionPage = lazy(() => import("./components/AddTransactionPage").then(m => ({ default: m.AddTransactionPage })));
const CreateAccountPage = lazy(() => import("./components/CreateAccountPage").then(m => ({ default: m.CreateAccountPage })));
const ManageAccountsPage = lazy(() => import("./components/ManageAccountsPage").then(m => ({ default: m.ManageAccountsPage })));
const ManageCategoriesPage = lazy(() => import("./components/ManageCategoriesPage").then(m => ({ default: m.ManageCategoriesPage })));
const AllTransactionsPage = lazy(() => import("./components/AllTransactionsPage").then(m => ({ default: m.AllTransactionsPage })));
const TransactionDetailPage = lazy(() => import("./components/TransactionDetailPage").then(m => ({ default: m.TransactionDetailPage })));
const TransferPage = lazy(() => import("./components/TransferPage").then(m => ({ default: m.TransferPage })));
const AnalyticsPage = lazy(() => import("./components/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const EducationPage = lazy(() => import("./components/EducationPage").then(m => ({ default: m.EducationPage })));
const SettingsPage = lazy(() => import("./components/SettingsPage").then(m => ({ default: m.SettingsPage })));
const BottomNavigation = lazy(() => import("./components/BottomNavigation").then(m => ({ default: m.BottomNavigation })));

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  categoryName: string;
  description: string;
  accountId: string;
  date: string;
  time: string;
}

type AppScreen = 'welcome' | 'dashboard' | 'analytics' | 'education' | 'settings' | 'add-transaction' | 'create-account' | 'manage-accounts' | 'manage-categories' | 'all-transactions' | 'transaction-detail' | 'transfer';

function AppContent() {
  const { isAuthenticated, loading, error, isNewUser } = useTelegramAuth();
  const { t } = useTranslation('common');
  const [currentScreen, setCurrentScreen] = useState<AppScreen | null>(null);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Автоматически пропускаем Welcome Page для вернувшихся пользователей
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        const hasSeenWelcomeLS = localStorage.getItem('hasSeenWelcome');

        if (hasSeenWelcomeLS === 'true') {
          // Пользователь уже видел Welcome Page - идём сразу в Dashboard
          setHasSeenWelcome(true);
          setCurrentScreen('dashboard');
        } else {
          // Первый раз в приложении - показываем Welcome Page
          setCurrentScreen('welcome');
        }
      } else if (error) {
        // Если есть ошибка авторизации, показываем экран ошибки (обрабатывается ниже)
        // currentScreen остаётся null, что нормально
      } else {
        // Если не авторизован и нет ошибки (не должно происходить, но на всякий случай)
        setCurrentScreen('welcome');
      }
    }
  }, [loading, isAuthenticated, error]);

  const handleGetStarted = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setHasSeenWelcome(true);
    setCurrentScreen('dashboard');
  };

  const handleAddTransaction = () => {
    setCurrentScreen('add-transaction');
  };

  const handleManageAccounts = () => {
    setCurrentScreen('manage-accounts');
  };

  const handleViewAllTransactions = () => {
    setCurrentScreen('all-transactions');
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setCurrentScreen('transaction-detail');
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    // TODO: Обновить транзакцию через API
    setSelectedTransaction(updatedTransaction);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    // TODO: Удалить транзакцию через API
    setCurrentScreen('dashboard');
  };

  const handleAddNewTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    // TODO: Обработка уже происходит в AddTransactionPage через API
    // Здесь можно добавить callback для обновления Dashboard
  };

  const handleBack = () => {
    if (hasSeenWelcome) {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('welcome');
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentScreen(page as AppScreen);
  };

  const showBottomNav = hasSeenWelcome &&
    currentScreen !== 'add-transaction' &&
    currentScreen !== 'create-account' &&
    currentScreen !== 'manage-accounts' &&
    currentScreen !== 'manage-categories' &&
    currentScreen !== 'all-transactions' &&
    currentScreen !== 'transaction-detail' &&
    currentScreen !== 'welcome';

  // Показываем загрузку при проверке авторизации
  if (loading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto flex items-center justify-center animate-pulse">
            <img src="/images/Logo FinTrack-no-bg-preview (carve.photos).png" alt="WiseTrack" className="w-16 h-16 object-contain" />
          </div>
          <p className="text-lg font-medium text-slate-700">{t('app.loadingNamed', { appName: 'WiseTrack' })}</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку, если не в Telegram
  if (error && !isAuthenticated) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-lg font-medium text-red-700">{t('app.launchErrorTitle')}</p>
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-slate-600">{t('app.launchErrorHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={null}>
            {!currentScreen && !error && (
              <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center animate-pulse">
                    <img src="/images/Logo FinTrack-no-bg-preview (carve.photos).png" alt="WiseTrack" className="w-16 h-16 object-contain" />
                  </div>
                  <p className="text-lg font-medium text-slate-700">{t('app.loadingGeneric')}</p>
                </div>
              </div>
            )}
            {currentScreen === 'welcome' && (
              <WelcomePage onGetStarted={handleGetStarted} />
            )}
            {currentScreen === 'dashboard' && (
              <DashboardPage
                onAddTransaction={handleAddTransaction}
                onManageAccounts={handleManageAccounts}
                onViewAllTransactions={handleViewAllTransactions}
                onTransactionClick={handleTransactionClick}
                onTransfer={() => setCurrentScreen('transfer')}
              />
            )}
            {currentScreen === 'analytics' && <AnalyticsPage />}
            {currentScreen === 'education' && <EducationPage />}
            {currentScreen === 'settings' && <SettingsPage onNavigate={setCurrentScreen} />}
            {currentScreen === 'add-transaction' && (
              <AddTransactionPage
                onBack={handleBack}
                onAddTransaction={handleAddNewTransaction}
              />
            )}
            {currentScreen === 'create-account' && (
              <CreateAccountPage
                onBack={() => setCurrentScreen('manage-accounts')}
                onAccountCreated={() => setCurrentScreen('manage-accounts')}
              />
            )}
            {currentScreen === 'manage-accounts' && (
              <ManageAccountsPage
                onBack={handleBack}
                onNavigateToCreateAccount={() => setCurrentScreen('create-account')}
              />
            )}
            {currentScreen === 'manage-categories' && (
              <ManageCategoriesPage onBack={handleBack} />
            )}
            {currentScreen === 'all-transactions' && (
              <AllTransactionsPage
                onBack={handleBack}
                onTransactionClick={handleTransactionClick}
              />
            )}
            {currentScreen === 'transaction-detail' && selectedTransaction && (
              <TransactionDetailPage
                transaction={selectedTransaction}
                onBack={handleBack}
                onUpdate={handleUpdateTransaction}
                onDelete={handleDeleteTransaction}
              />
            )}
            {currentScreen === 'transfer' && (
              <TransferPage
                onBack={handleBack}
                onSuccess={() => {
                  handleBack();
                  // Можно добавить перезагрузку данных если нужно
                }}
              />
            )}
          </Suspense>
        </div>

        {showBottomNav && (
          <Suspense fallback={null}>
            <BottomNavigation
              currentPage={currentScreen}
              onNavigate={handleNavigate}
            />
          </Suspense>
        )}
      </div>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <TelegramAuthProvider>
      <AppContent />
    </TelegramAuthProvider>
  );
}
