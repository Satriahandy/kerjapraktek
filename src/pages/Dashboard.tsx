import React, { useState } from 'react';
import { Transaction, Profile } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { TrendChart, ComparisonChart } from '../components/Charts';

interface DashboardProps {
  transactions: Transaction[];
  profile: Profile | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, profile }) => {
  // --- 1. STATE UNTUK FILTER BULAN DI DASHBOARD ---
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  // --- 2. FILTER TRANSAKSI BERDASARKAN BULAN YANG DIPILIH ---
  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentDate.getMonth() && 
           tDate.getFullYear() === currentDate.getFullYear();
  });

  // --- 3. HITUNG TOTAL DARI DATA YANG SUDAH DIFILTER ---
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  // Nama User & Bisnis
  const displayName = profile?.full_name ? profile.full_name.split(' ')[0] : 'User';
  const businessDisplayName = profile?.business_name || 'Bisnis Anda';

  // --- 4. PROSES DATA GRAFIK (HANYA BULAN TERPILIH) ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthlyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateObj = new Date(year, month, day);
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const isoDateStr = `${y}-${m}-${d}`;
    
    const dayTransactions = filteredTransactions.filter(t => t.date.startsWith(isoDateStr));
    
    return {
      date: String(day),
      income: dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
      expense: dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
    };
  });

  const topCategories = Object.entries(
    filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  )
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Halo, {displayName}!</h2>
          <p className="text-slate-500 text-sm">Laporan keuangan {businessDisplayName}.</p>
        </div>

        {/* --- NAVIGASI BULAN DI DASHBOARD --- */}
        <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-sm self-start">
          <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center px-2 space-x-2">
            <CalendarIcon size={14} className="text-primary" />
            <span className="text-xs font-bold text-slate-700 min-w-[100px] text-center">
              {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {/* Stats Grid - OTOMATIS RESET TIAP BULAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label={`Saldo (${currentDate.toLocaleString('id-ID', {month: 'short'})})`} 
          value={balance} 
          icon={Wallet} 
          color="slate" 
        />
        <StatCard 
          label="Pemasukan" 
          value={totalIncome} 
          icon={TrendingUp} 
          color="emerald" 
        />
        <StatCard 
          label="Pengeluaran" 
          value={totalExpense} 
          icon={TrendingDown} 
          color="rose" 
        />
      </div>

      {/* Tren Pemasukan - Mengikuti Bulan Terpilih */}
      <div className="grid grid-cols-1 gap-6">
        <section className="rustic-card bg-white flex flex-col">
          <h3 className="font-bold text-sm mb-4">Grafik Transaksi: {currentDate.toLocaleString('id-ID', { month: 'long' })}</h3>
          <div className="flex-1 min-h-[300px]">
            {filteredTransactions.length > 0 ? (
              <TrendChart data={monthlyData} height={300} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <p className="text-slate-400 text-xs font-medium">Belum ada data untuk bulan ini.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rustic-card min-h-[250px] flex flex-col">
          <h3 className="font-bold text-sm mb-4">Perbandingan Harian</h3>
          <div className="flex-1 flex items-center justify-center">
            {filteredTransactions.length > 0 ? (
              <ComparisonChart data={monthlyData} height={200} />
            ) : (
              <p className="text-slate-400 text-xs font-medium">Tidak ada data.</p>
            )}
          </div>
        </section>

        <section className="rustic-card flex flex-col">
          <h3 className="font-bold text-sm mb-4">Pemasukan Terbesar</h3>
          <div className="space-y-2 flex-1">
            {topCategories.length > 0 ? topCategories.map(([cat, amt]: [string, number]) => (
              <div key={cat} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{cat}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sumber</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{formatCurrency(amt)}</div>
              </div>
            )) : (
              <p className="text-[10px] text-slate-400 text-center py-4">Belum ada data masuk.</p>
            )}
          </div>
          <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg text-center">
             <p className="text-[10px] text-primary font-bold italic">"Catat rapi, bisnis makin hoki!"</p>
          </div>
        </section>
      </div>
    </div>
  );
};

// StatCard Sub-component
interface StatCardProps {
  label: string;
  value: number;
  icon: any;
  color: 'slate' | 'emerald' | 'rose' | 'primary';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  const textColorClasses = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-600',
    rose: 'text-rose-500',
    primary: 'text-primary',
  };

  return (
    <div className="rustic-card p-4 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className={cn("text-xl md:text-2xl font-bold truncate", textColorClasses[color])}>
             {formatCurrency(value)}
          </p>
        </div>
        <div className={cn("p-2 rounded-lg bg-slate-50", textColorClasses[color])}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};