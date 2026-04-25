import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  TrendingUp, 
  LogOut,
  Utensils,
  Menu,
  X,
  Wallet,
  Tag,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { AddTransaction } from './pages/AddTransaction';
import { Categories } from './pages/Categories';
import { Profile } from './pages/Profile';
import { useTransactions } from './hooks/useTransactions';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'add' | 'categories' | 'profile'>('dashboard');
  const { transactions, loading, addTransaction, removeTransaction } = useTransactions();

  const NavItem = ({ tab, icon: Icon, label }: { tab: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
        activeTab === tab 
          ? 'bg-primary/10 text-primary' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <Icon size={18} />
      <span className={cn("text-sm font-medium", activeTab === tab ? "text-primary" : "")}>{label}</span>
    </button>
  );

  const MobileNavItem = ({ tab, icon: Icon, label }: { tab: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        "flex flex-col items-center space-y-1 transition-colors",
        activeTab === tab ? "text-primary" : "text-slate-400"
      )}
    >
      <Icon size={20} />
      <span className="text-[10px] font-medium tracking-tighter uppercase">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar - Desktop */}
      <aside 
        className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col border-r border-slate-800"
      >
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <h1 className="text-white font-bold text-xl tracking-tight">Bakmi Jowo <span className="text-primary">Ranto</span></h1>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">UMKM Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem tab="transactions" icon={History} label="Transaksi" />
          <NavItem tab="add" icon={PlusCircle} label="Tambah Data" />
          <NavItem tab="categories" icon={Tag} label="Kategori" />
          <NavItem tab="profile" icon={User} label="Profil" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-2 bg-slate-800/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-slate-900 text-xs">
              R
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-bold truncate">Mas Ranto</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">Owner</p>
            </div>
            <button className="text-slate-500 hover:text-rose-500 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu & Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between">
        <h1 className="text-slate-900 font-bold text-lg tracking-tight">Bakmi Jowo <span className="text-primary">Ranto</span></h1>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-slate-900 text-[10px]">
          R
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-20 pb-24 lg:py-6 px-4 lg:px-6 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Dashboard transactions={transactions} />
              </motion.div>
            )}
            {activeTab === 'transactions' && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Transactions transactions={transactions} onDelete={removeTransaction} />
              </motion.div>
            )}
            {activeTab === 'add' && (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AddTransaction 
                  onAdd={(t) => {
                    addTransaction(t);
                    setActiveTab('dashboard');
                  }} 
                  onManageCategories={() => setActiveTab('categories')}
                />
              </motion.div>
            )}
            {activeTab === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Categories />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Profile />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Action Floating Button - Desktop Only */}
        <div className="hidden lg:block">
          {activeTab !== 'add' && (
            <button 
              onClick={() => setActiveTab('add')}
              className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-slate-900 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-30"
            >
              <PlusCircle size={28} />
            </button>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between z-40">
        <MobileNavItem tab="dashboard" icon={LayoutDashboard} label="Home" />
        <MobileNavItem tab="transactions" icon={History} label="Riwayat" />
        <button 
          onClick={() => setActiveTab('add')}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md -mt-10 border-4 border-slate-50",
            activeTab === 'add' ? "bg-slate-900 text-white" : "bg-primary text-slate-900"
          )}
        >
          <PlusCircle size={24} />
        </button>
        <MobileNavItem tab="categories" icon={Tag} label="Kategori" />
        <MobileNavItem tab="profile" icon={User} label="Profil" />
      </nav>

    </div>
  );
}
