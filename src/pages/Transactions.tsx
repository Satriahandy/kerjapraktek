import React, { useState } from 'react';
import { Transaction } from '../types';
import { Trash2, Search, Filter, ArrowUp, ArrowDown, Download, FileText, Table } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { exportToExcel, exportToPDF } from '../services/exportService';

interface TransactionsProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi</h2>
          <p className="text-slate-500 text-sm">Semua catatan pemasukan dan pengeluaran Bakmi Jowo Ranto.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => exportToExcel(filteredTransactions)}
            className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors"
          >
            <Table size={14} />
            <span>Excel</span>
          </button>
          <button 
            onClick={() => exportToPDF(filteredTransactions)}
            className="flex items-center space-x-2 px-3 py-2 bg-rose-50 text-rose-500 border border-rose-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-colors"
          >
            <FileText size={14} />
            <span>PDF</span>
          </button>
        </div>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm shadow-slate-100 placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="flex p-1 bg-slate-100 rounded-lg space-x-1 shadow-inner">
          <FilterTab active={filterType === 'all'} onClick={() => setFilterType('all')} label="Semua" />
          <FilterTab active={filterType === 'income'} onClick={() => setFilterType('income')} label="Pemasukan" />
          <FilterTab active={filterType === 'expense'} onClick={() => setFilterType('expense')} label="Pengeluaran" />
        </div>
      </div>

      {/* Transaction List */}
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
                    <td className="px-5 py-3 text-xs text-slate-400 font-medium">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold text-slate-700">{t.description}</span>
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
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
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
                  <div className="flex items-center space-x-2 mt-1">
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
                <button 
                  onClick={() => onDelete(t.id)}
                  className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="rustic-card p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300 border border-slate-200">
              <Search size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-400">Tidak ada transaksi ditemukan</p>
              <p className="text-slate-300 text-[10px] uppercase font-bold tracking-widest">Coba ubah kata kunci atau filter</p>
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
      "px-4 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider",
      active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
    )}
  >
    {label}
  </button>
);
