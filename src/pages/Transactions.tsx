import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import {
  Trash2, Search, Filter, ArrowUp, ArrowDown,
  FileText, Table, Users, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { exportToExcel, exportToPDF } from '../services/exportService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface TransactionsProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onDelete }) => {
  const { user } = useAuth();
  const role = user?.user_metadata?.role || 'pemilik';
  const isOwner = role === 'pemilik';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCashierId, setSelectedCashierId] = useState<string>('all');
  const [cashiers, setCashiers] = useState<{ id: string, username: string }[]>([]);

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

  useEffect(() => {
    if (isOwner && user?.id) {
      const fetchCashiers = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('owner_id', user.id)
          .eq('role', 'kasir');

        if (!error && data) {
          setCashiers(data);
        }
      };
      fetchCashiers();
    }
  }, [isOwner, user?.id]);

  // Filter Utama: Bulan + Search + Type + Cashier
  const filteredTransactions = transactions.filter(t => {
    const matchesMonth = t.date.startsWith(currentMonthStr);
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCashier = selectedCashierId === 'all' || t.user_id === selectedCashierId;
    return matchesMonth && matchesSearch && matchesType && matchesCashier;
  });

  // Hitung total HANYA untuk transaksi yang sudah difilter bulan & kriterianya
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netTotal = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi</h2>
          <p className="text-slate-500 text-sm">Semua catatan pemasukan dan pengeluaran.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Navigasi Periode Bulan */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[42px]">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 text-slate-500 border-r border-slate-100 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center px-4 space-x-2">
              <Calendar size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 min-w-[120px] text-center">
                {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-50 text-slate-500 border-l border-slate-100 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportToExcel(filteredTransactions)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
            >
              <Table size={14} />
              <span>Excel</span>
            </button>
            <button
              onClick={() => exportToPDF(filteredTransactions)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-rose-100 transition-all shadow-sm active:scale-95"
            >
              <FileText size={14} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rustic-card p-4 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Periode</p>
          <p className="text-sm font-bold text-slate-900">
            {selectedDate.toLocaleString('id-ID', { month: 'long' })}
          </p>
        </div>
        <div className="rustic-card p-4 space-y-1 border-l-4 border-l-emerald-500">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Masuk</p>
          <p className="text-sm font-bold text-emerald-600 truncate">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rustic-card p-4 space-y-1 border-l-4 border-l-rose-500">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Keluar</p>
          <p className="text-sm font-bold text-rose-500 truncate">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="rustic-card p-4 space-y-1 bg-slate-900 text-white border-none shadow-xl shadow-slate-200">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-60">Sisa Saldo</p>
          <p className="text-sm font-bold text-primary truncate">{formatCurrency(netTotal)}</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {isOwner && cashiers.length > 0 && (
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                value={selectedCashierId}
                onChange={(e) => setSelectedCashierId(e.target.value)}
                className="bg-white border border-slate-200 pl-9 pr-8 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl focus:outline-none appearance-none cursor-pointer shadow-sm"
              >
                <option value="all">Semua Kasir</option>
                {cashiers.map(c => (
                  <option key={c.id} value={c.id}>{c.username.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex p-1 bg-slate-100 rounded-xl space-x-1 shadow-inner border border-slate-200">
            <FilterTab active={filterType === 'all'} onClick={() => setFilterType('all')} label="Semua" />
            <FilterTab active={filterType === 'income'} onClick={() => setFilterType('income')} label="Masuk" />
            <FilterTab active={filterType === 'expense'} onClick={() => setFilterType('expense')} label="Keluar" />
          </div>
        </div>
      </div>

      {/* Transaction List (Tabel & Mobile View menggunakan filteredTransactions) */}
      <div className="space-y-4">
        {/* Desktop View */}
        <div className="hidden md:block rustic-card p-0 overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-50/50">
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Keterangan</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Jenis</th>
                  <th className="px-5 py-3 text-right">Jumlah</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-400 font-medium">
                      {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold text-slate-700 block">{t.description}</span>
                      {isOwner && t.profiles?.username && (
                        <span className="text-[9px] text-slate-400 font-medium">Oleh: {t.profiles.username}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "text-[10px] font-bold uppercase",
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                      )}>
                        {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className={cn(
                      "px-5 py-3 text-right text-xs font-bold font-sans",
                      t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                    )}>
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {isOwner && (
                        <button
                          onClick={() => onDelete(t.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {filteredTransactions.map((t) => (
            <div key={t.id} className="rustic-card p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  t.type === 'income' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-500"
                )}>
                  {t.type === 'income' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{t.description}</h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    <span className="text-[10px] font-bold text-slate-400">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <span className="text-[10px] font-bold text-primary uppercase">{t.category}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end space-y-2">
                <span className={cn(
                  "text-sm font-bold",
                  t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                )}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                {isOwner && (
                  <button onClick={() => onDelete(t.id)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="rustic-card p-12 text-center space-y-3 bg-white">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300 border border-slate-200">
              <Search size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-400">Tidak ada transaksi ditemukan</p>
              <p className="text-slate-300 text-[10px] uppercase font-bold tracking-widest">Coba ubah periode atau filter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FilterTab = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider",
      active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
    )}
  >
    {label}
  </button>
);