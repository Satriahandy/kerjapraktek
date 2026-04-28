import React, { useState } from 'react'; // Tambah useState
import { Transaction } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar as CalendarIcon,
  FileDown,
  FileSpreadsheet,
  ChevronLeft, // Tambah icon navigasi
  ChevronRight
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { TrendChart, ComparisonChart } from '../components/Charts';
import { useAuth } from '../context/AuthContext';
import { exportToExcel, exportToPDF } from '../services/exportService';
import toast from 'react-hot-toast';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || 'Admin';
  const role = user?.user_metadata?.role || 'pemilik';

  // --- LOGIKA PERIODE BULAN ---
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const currentMonthStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
  
  // Filter transaksi berdasarkan bulan yang dipilih
  const filteredTransactions = transactions.filter(t => t.date.startsWith(currentMonthStr));

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  // Process data for charts berdasarkan bulan terpilih
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthlyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const isoDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTransactions = filteredTransactions.filter(t => t.date === isoDateStr);
    
    return {
      date: String(day),
      income: dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
      expense: dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
    };
  });

  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) {
      toast.error('Tidak ada data di bulan ini untuk diekspor!');
      return;
    }
    exportToExcel(filteredTransactions);
    toast.success('Excel bulan ini berhasil diunduh!');
  };

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) {
      toast.error('Tidak ada data di bulan ini untuk diekspor!');
      return;
    }
    exportToPDF(filteredTransactions);
    toast.success('PDF bulan ini berhasil diunduh!');
  };

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
    <div className="space-y-6 pb-12 text-slate-900">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold tracking-tight">Halo, {displayName}!</h2>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
              role === 'pemilik' ? "bg-slate-900 text-primary" : "bg-primary text-slate-900"
            )}>
              {role}
            </span>
          </div>
          <p className="text-slate-500 text-sm">Laporan keuangan periode terpilih.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* PEMILIH BULAN */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-50 text-slate-500 border-r border-slate-100 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center px-4 space-x-2">
              <CalendarIcon size={14} className="text-primary" />
              <span className="text-xs font-bold text-slate-700 min-w-[120px] text-center">
                {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-50 text-slate-500 border-l border-slate-100 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button 
            onClick={handleExportExcel}
            className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet size={14} />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-3 py-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors"
          >
            <FileDown size={14} />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Saldo Periode Ini" value={balance} icon={Wallet} color="slate" />
        <StatCard label="Pemasukan" value={totalIncome} icon={TrendingUp} color="emerald" />
        <StatCard label="Pengeluaran" value={totalExpense} icon={TrendingDown} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rustic-card bg-white flex flex-col">
          <h3 className="font-bold text-sm mb-4 uppercase tracking-tighter">Tren Transaksi</h3>
          <div className="flex-1 min-h-[300px]">
            {filteredTransactions.length > 0 ? (
              <TrendChart data={monthlyData} height={300} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <p className="text-slate-400 text-xs font-medium italic">Tidak ada data transaksi di bulan ini.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rustic-card flex flex-col h-full">
          <h3 className="font-bold text-sm mb-4 uppercase tracking-tighter">Pemasukan Terbesar</h3>
          <div className="space-y-3 flex-1">
            {topCategories.map(([cat, amt]) => (
              <div key={cat} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{cat}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Kategori</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{formatCurrency(amt)}</div>
              </div>
            ))}
            {topCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest text-center italic">Kosong</p>
              </div>
            )}
          </div>
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
             <p className="text-[11px] text-slate-700 font-bold italic text-center">"Hanya yang tercatat yang bisa dievaluasi."</p>
          </div>
        </section>
      </div>

      <section className="rustic-card min-h-[300px] flex flex-col">
        <h3 className="font-bold text-sm mb-6 uppercase tracking-tighter">Perbandingan Harian</h3>
        <div className="flex-1">
          {filteredTransactions.length > 0 ? (
            <ComparisonChart data={monthlyData} height={250} />
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-slate-400 text-xs font-medium italic">Data tidak tersedia.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

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
    <div className="rustic-card p-5 flex items-center justify-between bg-white border border-slate-200">
      <div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className={cn("text-2xl font-bold truncate", textColorClasses[color])}>
           {formatCurrency(value)}
        </p>
      </div>
      <div className={cn("p-3 rounded-xl bg-slate-50", textColorClasses[color])}>
        <Icon size={24} />
      </div>
    </div>
  );
};