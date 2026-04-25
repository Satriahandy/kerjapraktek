import React, { useState } from 'react';
import { Tag, Plus, X, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { cn } from '../lib/utils';

export const Categories: React.FC = () => {
  const { categories, addCategory, removeCategory } = useCategories();
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [newCatName, setNewCatName] = useState('');

  const currentCategories = type === 'income' ? categories.income : categories.expense;

  const handleAddCat = () => {
    if (newCatName.trim()) {
      addCategory(type, newCatName.trim());
      setNewCatName('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Kategori</h2>
        <p className="text-slate-500 text-sm">Sesuaikan kategori pemasukan dan pengeluaran Anda.</p>
      </header>

      <div className="rustic-card p-6 md:p-8 space-y-8">
        {/* Toggle Type */}
        <div className="flex p-1 bg-slate-100 rounded-lg space-x-1">
          <button
            onClick={() => setType('income')}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md font-bold transition-all text-[10px] md:text-xs uppercase tracking-wider",
              type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
            )}
          >
            <ArrowUpRight size={14} />
            <span className="hidden sm:inline">Kategori Pemasukan</span>
            <span className="sm:hidden">Pemasukan</span>
          </button>
          <button
            onClick={() => setType('expense')}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md font-bold transition-all text-[10px] md:text-xs uppercase tracking-wider",
              type === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'
            )}
          >
            <ArrowDownRight size={14} />
            <span className="hidden sm:inline">Kategori Pengeluaran</span>
            <span className="sm:hidden">Pengeluaran</span>
          </button>
        </div>

        {/* Add New Category Input */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tambah Kategori Baru</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder={`Misal: ${type === 'income' ? 'GrabFood, ShopeeFood' : 'Bahan Pokok, Kebersihan'}...`}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCat()}
            />
            <button 
              onClick={handleAddCat}
              className="bg-primary text-slate-900 px-4 md:px-6 rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center shadow-md active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus size={16} className="md:mr-2" /> 
              <span className="hidden md:inline">Tambah</span>
            </button>
          </div>
        </div>

        {/* Category Badge List */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Kategori Saat Ini</label>
          <div className="flex flex-wrap gap-2">
            {currentCategories.map(cat => (
              <div 
                key={cat} 
                className="flex items-center bg-white border border-slate-200 pl-4 pr-2 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm group hover:border-primary transition-all"
              >
                <span>{cat}</span>
                <button 
                  onClick={() => removeCategory(type, cat)}
                  className="ml-3 p-1 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <CheckCircle2 size={12} className="text-primary" />
        <span>Kategori ini akan muncul di menu Tambah Transaksi</span>
      </div>
    </div>
  );
};
