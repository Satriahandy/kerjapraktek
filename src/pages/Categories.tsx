import React, { useState } from 'react';
import { Tag, Plus, X, ArrowUpRight, ArrowDownRight, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const Categories: React.FC = () => {
  const { user } = useAuth();
  const role = user?.user_metadata?.role || 'pemilik';
  const isOwner = role === 'pemilik';
  
  const { categories, addCategory, removeCategory, loading } = useCategories();
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [newCatName, setNewCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategories = type === 'income' ? categories.income : categories.expense;

  const handleAddCat = async () => {
    if (!newCatName.trim()) {
      toast.error('Nama kategori tidak boleh kosong!');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addCategory(type, newCatName.trim());
      toast.success('Kategori berhasil ditambahkan!');
      setNewCatName('');
    } catch (error) {
      toast.error('Gagal menambah kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCat = async (catName: string) => {
    try {
      await removeCategory(type, catName);
      toast.success('Kategori berhasil dihapus!');
    } catch (error) {
      toast.error('Gagal menghapus kategori.');
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
          {isOwner ? (
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
                disabled={isSubmitting}
                className="bg-primary text-slate-900 px-4 md:px-6 rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center shadow-md active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} className="md:mr-2" />} 
                <span className="hidden md:inline">Tambah</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center text-slate-400 space-x-3">
              <ShieldAlert size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Hanya Pemilik yang bisa menambah kategori</span>
            </div>
          )}
        </div>

        {/* Category Badge List */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Kategori Saat Ini</label>
          {loading ? (
            <div className="flex items-center space-x-2 text-slate-400 text-xs py-4">
              <Loader2 size={16} className="animate-spin" />
              <span>Memuat kategori...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentCategories.map(cat => (
                <div 
                  key={cat} 
                  className="flex items-center bg-white border border-slate-200 pl-4 pr-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm group hover:border-primary transition-all"
                >
                  <span>{cat}</span>
                  {isOwner && (
                    <button 
                      onClick={() => handleRemoveCat(cat)}
                      className="ml-3 p-1 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {currentCategories.length === 0 && (
                <p className="text-slate-400 text-xs py-4">Tidak ada kategori untuk jenis ini.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <CheckCircle2 size={12} className="text-primary" />
        <span>Kategori ini akan muncul di menu Tambah Transaksi</span>
      </div>
    </div>
  );
};
