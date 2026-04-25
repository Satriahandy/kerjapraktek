import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  LogOut,
  Tag,
  User,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { AddTransaction } from './pages/AddTransaction';
import { Categories } from './pages/Categories';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { useTransactions } from './hooks/useTransactions';
import { useAuth } from './context/AuthContext';
import { signOut } from './services/authService';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'add' | 'categories' | 'profile'>('dashboard');
  const { transactions, addTransaction, removeTransaction } = useTransactions();
  
  // State untuk Modal Konfirmasi Logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Berhasil keluar akun');
      setShowLogoutConfirm(false); // Tutup modal setelah berhasil
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Gagal keluar akun');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <h1 className="text-slate-900 font-bold text-3xl tracking-tight">Laporan <span className="text-primary">Keuangan</span></h1>
          <p className="text-sm text-slate-500 mt-2 uppercase tracking-widest font-bold">Money Report</p>
        </div>
        <Login />
      </div>
    );
  }

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

  const userInitial = user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Toaster position="top-right" reverseOrder={false} />

      {/* --- MODAL KONFIRMASI LOGOUT --- */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                  <LogOut size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Konfirmasi Keluar</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Apakah Anda yakin ingin keluar dari akun ini?
                  </p>
                </div>
                <div className="flex w-full gap-3 pt-2">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-200 transition-all"
                  >
                    Ya, Keluar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <h1 className="text-white font-bold text-xl tracking-tight">Laporan <span className="text-primary">Keuangan</span></h1>
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
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-slate-900 text-xs uppercase">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs text-white font-bold truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">Owner</p>
            </div>
            {/* Tombol Logout Desktop */}
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="text-slate-500 hover:text-rose-500 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu & Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between">
        <h1 className="text-slate-900 font-bold text-lg tracking-tight">Laporan <span className="text-primary">Keuangan</span></h1>
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-slate-900 text-xs uppercase"
        >
          {userInitial}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-20 pb-24 lg:py-6 px-4 lg:px-6 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Dashboard transactions={transactions} user={user} />
              </motion.div>
            )}
            
            {activeTab === 'transactions' && (
              <motion.div key="transactions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Transactions transactions={transactions} onDelete={removeTransaction} />
              </motion.div>
            )}

            {activeTab === 'add' && (
              <motion.div key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <AddTransaction 
                  onAdd={async (t) => { 
                    try {
                      await addTransaction(t); 
                      toast.success('Transaksi berhasil dicatat!');
                      setActiveTab('dashboard'); 
                    } catch (err) {
                      toast.error('Gagal mencatat transaksi');
                    }
                  }} 
                  onManageCategories={() => setActiveTab('categories')}
                />
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Categories />
              </motion.div>
            )}

            {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Kirim fungsi pemicu modal ke dalam komponen Profile jika tombolnya ada di dalam sana */}
              <Profile session={user} onLogoutClick={() => setShowLogoutConfirm(true)} />
              
              {/* Atau jika tombol logoutnya ada di luar komponen Profile (di App.tsx) */}
              <div className="max-w-2xl mx-auto mt-6 px-4">
                <button 
                  onClick={() => setShowLogoutConfirm(true)} // Pemicu modal
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-white border-2 border-rose-100 text-rose-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-[0.98]"
                >
                  <LogOut size={16} />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
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