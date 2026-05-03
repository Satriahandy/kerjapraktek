import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  LogOut,
  Tag,
  User,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { AddTransaction } from "./pages/AddTransaction";
import { Categories } from "./pages/Categories";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";
import { useTransactions } from "./hooks/useTransactions";
import { useAuth } from "./context/AuthContext";
import { signOut } from "./services/authService";
import { Toaster } from "react-hot-toast";

export default function App() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "transactions" | "add" | "categories" | "profile"
  >("dashboard");

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [initialName, setInitialName] = useState("");

  const { transactions, addTransaction, removeTransaction } = useTransactions();

  // ========================
  // INITIAL NAME
  // ========================
  useEffect(() => {
    if (!user) return;

    const fullName = user.user_metadata?.full_name;
    if (!fullName) return;

    const name = fullName.split(" ");

    if (name.length === 1) {
      setInitialName(name[0][0].toUpperCase());
    } else {
      setInitialName(name[0][0].toUpperCase() + name[1][0].toUpperCase());
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // ========================
  // LOADING
  // ========================
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ========================
  // NOT LOGIN
  // ========================
  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="mb-8 text-center">
            <h1 className="text-slate-900 font-bold text-3xl tracking-tight">
              Laporan <span className="text-primary">Keuangan</span>
            </h1>
            <p className="text-sm text-slate-500 mt-2 uppercase tracking-widest font-bold">
              Money Report
            </p>
          </div>
          <Login />
        </div>
      </>
    );
  }

  // ========================
  // NAV COMPONENTS
  // ========================
  const NavItem = ({ tab, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
        activeTab === tab
          ? "bg-primary/10 text-primary"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const MobileNavItem = ({ tab, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        "flex flex-col items-center space-y-1 transition-colors",
        activeTab === tab ? "text-primary" : "text-slate-400",
      )}
    >
      <Icon size={20} />
      <span className="text-[10px] uppercase">{label}</span>
    </button>
  );

  return (
    <>
      <Toaster position="top-center" />

      <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col border-r border-slate-800">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-white font-bold text-xl">
              Laporan <span className="text-primary">Keuangan</span>
            </h1>
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
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-xs">
                {initialName}
              </div>
              <div className="flex-1">
                <p className="text-xs text-white font-bold truncate">
                  {user.user_metadata?.full_name ??
                    user.user_metadata?.username ??
                    "User"}
                </p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">
                  {user.user_metadata?.role ?? "-"}
                </p>
              </div>
              <button onClick={() => setShowLogoutConfirm(true)}>
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Menu & Top Bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between">
          <h1 className="text-slate-900 font-bold text-lg tracking-tight">
            Laporan <span className="text-primary">Keuangan</span>
          </h1>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-slate-900 text-[10px]">
            {initialName}
          </div>
        </div>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto pt-20 pb-24 px-4">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div key="dashboard">
                <Dashboard transactions={transactions} />
              </motion.div>
            )}

            {activeTab === "transactions" && (
              <motion.div key="transactions">
                <Transactions
                  transactions={transactions}
                  onDelete={removeTransaction}
                />
              </motion.div>
            )}

            {activeTab === "add" && (
              <motion.div key="add">
                <AddTransaction
                  onAdd={async (t) => {
                    await addTransaction(t);
                    setActiveTab("dashboard");
                  }}
                />
              </motion.div>
            )}

            {activeTab === "categories" && (
              <motion.div key="categories">
                <Categories />
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div key="profile">
                <Profile />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between z-40">
          <MobileNavItem tab="dashboard" icon={LayoutDashboard} label="Home" />
          <MobileNavItem tab="transactions" icon={History} label="Riwayat" />
          <button
            onClick={() => setActiveTab("add")}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md -mt-10 border-4 border-slate-50",
              activeTab === "add"
                ? "bg-slate-900 text-white"
                : "bg-primary text-slate-900",
            )}
          >
            <PlusCircle size={24} />
          </button>
          <MobileNavItem tab="categories" icon={Tag} label="Kategori" />
          <MobileNavItem tab="profile" icon={User} label="Profil" />
        </nav>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl space-y-6 text-center border-4 border-rose-50"
              >
                <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50">
                  <AlertCircle size={32} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Konfirmasi Keluar
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Apakah Anda yakin ingin keluar dari aplikasi? Anda harus
                    masuk kembali untuk mengakses data Anda.
                  </p>
                </div>

                <div className="flex flex-col space-y-2 pt-2">
                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowLogoutConfirm(false);
                    }}
                    className="w-full p-4 bg-rose-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                  >
                    Ya, Keluar Sekarang
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
