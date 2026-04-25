import React from 'react';
import { Transaction } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar as CalendarIcon
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { TrendChart, ComparisonChart } from '../components/Charts';

interface DashboardProps {
  transactions: Transaction[];
  user: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, user }) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  // Nama dinamis
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;
    
    const dayTransactions = transactions.filter(t => t.date.startsWith(localDateStr));
    
    return {
      date: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      income: dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
      expense: dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
    };
  });

  const topCategories = Object.entries(
    transactions
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
          <p className="text-slate-500 text-sm">Rangkuman keuangan hari ini.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm self-start">
          <CalendarIcon size={14} className="text-primary" />
          <span className="text-xs font-bold text-slate-700">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
        </div>
      </header>

      {/* Stats Grid - 3 Kolom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Saldo" value={balance} icon={Wallet} color="slate" />
        <StatCard label="Pemasukan" value={totalIncome} icon={TrendingUp} color="emerald" trend="+12%" />
        <StatCard label="Pengeluaran" value={totalExpense} icon={TrendingDown} color="rose" trend="-5%" />
      </div>

      {/* Main Charts - Sekarang Tren Pemasukan Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <section className="rustic-card bg-white flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Tren Pemasukan Mingguan</h3>
            <span className="flex items-center text-[10px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-primary mr-1"></span> Pemasukan
            </span>
          </div>
          <div className="flex-1 min-h-[300px]">
            {transactions.length > 0 ? (
              <TrendChart data={dailyData} height={300} />
            ) : (
              <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                <p className="text-slate-400 text-xs font-medium">Belum ada data transaksi.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Perbandingan Chart */}
        <section className="lg:col-span-2 rustic-card min-h-[300px]">
          <h3 className="font-bold text-sm mb-4">Perbandingan Pemasukan & Pengeluaran</h3>
          {transactions.length > 0 ? (
            <ComparisonChart data={dailyData} height={250} />
          ) : (
            <p className="text-slate-400 text-xs font-medium text-center py-10">Data belum tersedia.</p>
          )}
        </section>

        {/* Top Categories */}
        <section className="rustic-card flex flex-col">
          <h3 className="font-bold text-sm mb-4">Pemasukan Terbesar</h3>
          <div className="space-y-2 flex-1">
            {topCategories.map(([cat, amt]) => (
              <div key={cat} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{cat}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sumber</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{formatCurrency(amt)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg text-center">
            <p className="text-[10px] text-primary font-bold italic">"Rasa autentik, untung pun makin asik!"</p>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, trend }: any) => {
  const textColor = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-600',
    rose: 'text-rose-500',
    primary: 'text-primary',
  };

  return (
    <div className="rustic-card p-4">
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className={cn("text-xl md:text-2xl font-bold truncate", textColor[color as keyof typeof textColor])}>
        {formatCurrency(value)}
      </p>
      {trend && (
        <p className={cn("text-[10px] mt-2 font-bold", trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-500')}>
          {trend} vs bln lalu
        </p>
      )}
    </div>
  );
};