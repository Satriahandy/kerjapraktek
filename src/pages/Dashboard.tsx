import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { TrendChart, ComparisonChart } from '../components/Charts';
import { motion } from 'motion/react';
import { analyzeFinancials } from '../services/aiService';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  // Process data for charts (last 7 days, using local date strings)
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // Go from 6 days ago up to today
    const dateStr = d.toISOString().split('T')[0]; // This handles current day properly for matching stored YYYY-MM-DD
    
    // Better way to get YYYY-MM-DD in local time:
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

  // Category breakdown for some variation
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

  const [aiInsight, setAiInsight] = useState<string>("Sedang menganalisis data keuangan Anda...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeFinancials(transactions);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (transactions.length > 0 && aiInsight === "Sedang menganalisis data keuangan Anda...") {
      performAIAnalysis();
    }
  }, [transactions.length > 0]);

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Halo, Mas Ranto!</h2>
          <p className="text-slate-500 text-sm">Rangkuman keuangan Bakmi Jowo Ranto hari ini.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm self-start">
          <CalendarIcon size={14} className="text-primary" />
          <span className="text-xs font-bold text-slate-700">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          label="Total Saldo" 
          value={balance} 
          icon={Wallet} 
          color="slate" 
        />
        <StatCard 
          label="Pemasukan" 
          value={totalIncome} 
          icon={TrendingUp} 
          color="emerald" 
          trend="+12%" 
        />
        <StatCard 
          label="Pengeluaran" 
          value={totalExpense} 
          icon={TrendingDown} 
          color="rose" 
          trend="-5%" 
        />
        <div className="rustic-card p-4 flex flex-col justify-between col-span-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Target</p>
          <p className="text-xl md:text-2xl font-bold text-slate-900">82%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full" style={{ width: '82%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <section className="lg:col-span-2 rustic-card bg-white flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Tren Pemasukan Mingguan</h3>
            <div className="flex space-x-2">
              <span className="flex items-center text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-primary mr-1"></span> Pemasukan
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-[250px] flex flex-col items-center justify-center">
            {transactions.length > 0 ? (
              <TrendChart data={dailyData} height={250} />
            ) : (
              <div className="text-center p-8">
                <p className="text-slate-400 text-xs font-medium mb-2">Belum ada data transaksi mingguan.</p>
                <button onClick={() => window.location.hash = '#add'} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">Tambah Data</button>
              </div>
            )}
          </div>
        </section>

        {/* AI Insight Section */}
        <section className="rustic-card bg-slate-900 border-none relative overflow-hidden flex flex-col justify-between min-h-[250px]">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2 text-primary">
              <Sparkles size={16} className={cn(isAnalyzing && "animate-pulse")} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Analisis AI Gemini</span>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold leading-tight">
                {isAnalyzing ? "Menganalisis data..." : "Wawasan Bisnis"}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mt-2">
                "{aiInsight}"
              </p>
            </div>
          </div>
          <div className="relative z-10 pt-4">
            <button 
              onClick={performAIAnalysis}
              disabled={isAnalyzing}
              className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white rounded-lg py-2 text-xs font-bold transition-colors border border-white/5"
            >
              {isAnalyzing ? "Memproses..." : "Perbarui Analisis"}
            </button>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rustic-card min-h-[250px] flex flex-col">
          <h3 className="font-bold text-sm mb-4">Perbandingan Pemasukan & Pengeluaran</h3>
          <div className="flex-1 flex items-center justify-center">
            {transactions.length > 0 ? (
              <ComparisonChart data={dailyData} height={200} />
            ) : (
              <p className="text-slate-400 text-xs font-medium">Bandingkan transaksi harian Anda di sini.</p>
            )}
          </div>
        </section>

        <section className="rustic-card flex flex-col">
          <h3 className="font-bold text-sm mb-4">Pemasukan Terbesar</h3>
          <div className="space-y-2 flex-1">
            {topCategories.map(([cat, amt]: [string, number]) => (
              <div key={cat} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{cat}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Income Source</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{formatCurrency(amt)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-[10px] text-primary font-bold italic leading-tight text-center">"Rasa autentik, untung pun makin asik!"</p>
          </div>
        </section>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: any;
  color: 'slate' | 'emerald' | 'rose' | 'primary';
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, trend }) => {
  const textColorClasses = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-600',
    rose: 'text-rose-500',
    primary: 'text-primary',
  };

  return (
    <div className="rustic-card p-3 md:p-4 flex flex-col justify-between">
      <div>
        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className={cn("text-lg md:text-2xl font-bold truncate", textColorClasses[color])}>
           {formatCurrency(value)}
        </p>
      </div>
      {trend && (
        <div className={cn(
          "text-[10px] mt-2 flex items-center font-bold",
          trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'
        )}>
            {trend.startsWith('+') ? (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7l-4 4h8l-4-4z" clipRule="evenodd" transform="rotate(180 10 10)"/></svg>
          ) : (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7l-4 4h8l-4-4z" clipRule="evenodd"/></svg>
          )}
          {trend} vs bln lalu
        </div>
      )}
    </div>
  );
};
