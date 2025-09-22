import { useState } from "react";
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

export default function App() {
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