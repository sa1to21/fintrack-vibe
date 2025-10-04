import { useState } from "react";
import { TelegramAuthProvider, useTelegramAuth } from "./contexts/TelegramAuthContext";
import { WelcomePage } from "./components/WelcomePage";
import { DashboardPage } from "./components/DashboardPage";
import { AddTransactionPage } from "./components/AddTransactionPage";
import { ManageAccountsPage } from "./components/ManageAccountsPage";
import { AllTransactionsPage } from "./components/AllTransactionsPage";
import { TransactionDetailPage } from "./components/TransactionDetailPage";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { EducationPage } from "./components/EducationPage";
import { SettingsPage } from "./components/SettingsPage";
import { BottomNavigation } from "./components/BottomNavigation";
import { Toaster } from "./components/ui/sonner";

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

type AppScreen = 'welcome' | 'dashboard' | 'analytics' | 'education' | 'settings' | 'add-transaction' | 'manage-accounts' | 'all-transactions' | 'transaction-detail';

function AppContent() {
  const { isAuthenticated, loading, error } = useTelegramAuth();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Mock data for transactions - в реальном приложении это будет из Supabase
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "expense",
      amount: 350,
      category: "food",
      categoryName: "Еда",
      description: "Покупки в супермаркете",
      accountId: "1",
      date: "2025-01-20",
      time: "14:30"
    },
    {
      id: "2",
      type: "income",
      amount: 5000,
      category: "freelance",
      categoryName: "Фриланс",
      description: "Оплата за проект",
      accountId: "1",
      date: "2025-01-19",
      time: "10:15"
    },
    {
      id: "3",
      type: "expense",
      amount: 1200,
      category: "transport",
      categoryName: "Транспорт",
      description: "Заправка автомобиля",
      accountId: "3",
      date: "2025-01-18",
      time: "18:45"
    }
  ]);

  const handleGetStarted = () => {
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
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
    setSelectedTransaction(updatedTransaction);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    setCurrentScreen('dashboard');
  };

  const handleAddNewTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [...prev, transaction]);
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
    currentScreen !== 'manage-accounts' &&
    currentScreen !== 'all-transactions' &&
    currentScreen !== 'transaction-detail' &&
    currentScreen !== 'welcome';

  // Показываем загрузку при проверке авторизации
  if (loading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-lg font-medium text-slate-700">Загрузка FinTrack...</p>
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
          <p className="text-lg font-medium text-red-700">Ошибка запуска</p>
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-slate-600">Приложение должно быть открыто в Telegram Mini App</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {currentScreen === 'welcome' && (
            <WelcomePage onGetStarted={handleGetStarted} />
          )}
          {currentScreen === 'dashboard' && (
            <DashboardPage 
              onAddTransaction={handleAddTransaction}
              onManageAccounts={handleManageAccounts}
              onViewAllTransactions={handleViewAllTransactions}
              onTransactionClick={handleTransactionClick}
              transactions={transactions}
            />
          )}
          {currentScreen === 'analytics' && <AnalyticsPage />}
          {currentScreen === 'education' && <EducationPage />}
          {currentScreen === 'settings' && <SettingsPage />}
          {currentScreen === 'add-transaction' && (
            <AddTransactionPage 
              onBack={handleBack} 
              onAddTransaction={handleAddNewTransaction}
            />
          )}
          {currentScreen === 'manage-accounts' && (
            <ManageAccountsPage onBack={handleBack} />
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
        </div>
        
        {showBottomNav && (
          <BottomNavigation 
            currentPage={currentScreen} 
            onNavigate={handleNavigate}
          />
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