import React, { useState } from 'react';
import { History, Trash2, Search, AlertTriangle, X } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionsProps {
  transactions: Transaction[];
  onDelete: (id: string | number) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk konfirmasi hapus
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);

  const filteredTransactions = transactions.filter(t =>
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string | number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi</h2>
        <p className="text-slate-500 text-sm">Semua catatan pemasukan dan pengeluaran Anda.</p>
      </header>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Hapus Transaksi?</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Tindakan ini tidak bisa dibatalkan. Data keuangan Anda akan langsung diperbarui.
                  </p>
                </div>
                <div className="flex w-full gap-3 pt-2">
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-200 transition-all"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Cari kategori atau deskripsi..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rustic-card bg-white overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Kategori</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipe</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Jumlah</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{t.category}</span>
                    {t.description && <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{t.description}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded-md",
                      t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                    )}>
                      {t.type === 'income' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-sm font-bold",
                    t.type === 'income' ? "text-emerald-600" : "text-slate-900"
                  )}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteClick(t.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="py-20 text-center">
              <History size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm font-medium">Tidak ada transaksi ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};