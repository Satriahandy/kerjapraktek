import React, { useState } from 'react';
import { TransactionType } from '../types';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Tag, 
  AlignLeft,
  Calendar,
  CheckCircle2,
  Settings2,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useCategories } from '../hooks/useCategories';

interface AddTransactionProps {
  onAdd: (t: any) => void;
  onManageCategories: () => void;
}

export const AddTransaction: React.FC<AddTransactionProps> = ({ onAdd, onManageCategories }) => {
  const { categories } = useCategories();
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const currentCategories = type === 'income' ? categories.income : categories.expense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    onAdd({
      date: new Date(date).toISOString(),
      type,
      category,
      description,
      amount: parseFloat(amount),
      userId: 'user-1'
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div className="text-center md:text-left w-full">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Catat Transaksi Baru</h2>
          <p className="text-slate-500 text-xs md:text-sm">Catat setiap pengeluaran dan pemasukan untuk analisis yang akurat.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="rustic-card space-y-6 p-6 md:p-8 relative overflow-hidden">
        {/* Toggle Type */}
        <div className="flex p-1 bg-slate-100 rounded-lg space-x-1 relative z-10">
          <button
            type="button"
            onClick={() => { setType('income'); setCategory(''); }}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md font-bold transition-all text-xs uppercase tracking-wider",
              type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
            )}
          >
            <ArrowUpRight size={14} />
            <span>Pemasukan</span>
          </button>
          <button
            type="button"
            onClick={() => { setType('expense'); setCategory(''); }}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md font-bold transition-all text-xs uppercase tracking-wider",
              type === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'
            )}
          >
            <ArrowDownRight size={14} />
            <span>Pengeluaran</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Amount Field */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Jumlah (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-300">Rp</span>
              <input 
                type="number" 
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-lg text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
              <AlignLeft size={12} className="mr-2" /> Keterangan
            </label>
            <input 
              type="text" 
              placeholder="Contoh: Pesanan Bakmi 5 Porsi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
              <Calendar size={12} className="mr-2" /> Tanggal
            </label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          {/* Categories */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Tag size={12} className="mr-2" /> Pilih Kategori
              </label>
              <button 
                type="button"
                onClick={onManageCategories}
                className="text-[9px] font-black text-primary uppercase tracking-tighter hover:underline"
              >
                + Kelola Kategori
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {currentCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-2 py-2.5 rounded-lg text-[9px] md:text-[10px] font-bold border transition-all uppercase tracking-tight md:tracking-wide truncate",
                    category === cat 
                      ? 'bg-primary border-primary text-slate-900 shadow-md' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full rustic-button flex items-center justify-center space-x-2 py-4 group"
        >
          <Plus size={18} />
          <span className="text-sm uppercase tracking-widest">Simpan Transaksi</span>
        </button>
      </form>

      <div className="flex items-center justify-center space-x-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <CheckCircle2 size={12} className="text-primary" />
        <span>Data tersimpan secara lokal di browser Anda</span>
      </div>
    </div>
  );
};
