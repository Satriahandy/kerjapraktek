import React, { useState, useEffect } from 'react';
import { Plus, X, ArrowUpRight, ArrowDownRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast'; // Tambahkan notifikasi
import { 
  getSupabaseCategories, 
  saveSupabaseCategory, 
  deleteSupabaseCategory 
} from '../services/supabaseService';

export const Categories: React.FC = () => {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [newCatName, setNewCatName] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk konfirmasi hapus kategori
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string | number, name: string} | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSupabaseCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Gagal mengambil data kategori");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentCategories = categories.filter(cat => cat.type === type);

  const handleAddCat = async () => {
    const trimmedName = newCatName.trim();
    
    if (!trimmedName) {
      toast.error("Nama kategori tidak boleh kosong");
      return;
    }

    // Cek duplikat lokal agar hemat request ke DB
    const isDuplicate = currentCategories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      toast.error("Kategori ini sudah ada");
      return;
    }

    try {
      await saveSupabaseCategory(trimmedName, type);
      setNewCatName('');
      toast.success(`Kategori "${trimmedName}" ditambah!`);
      await fetchData();
    } catch (error) {
      toast.error("Gagal menambah kategori.");
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm) {
      const loadId = toast.loading("Menghapus...");
      try {
        await deleteSupabaseCategory(deleteConfirm.id);
        toast.success("Kategori dihapus", { id: loadId });
        setDeleteConfirm(null);
        await fetchData();
      } catch (error) {
        toast.error("Gagal menghapus kategori", { id: loadId });
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Kategori</h2>
        <p className="text-slate-500 text-sm">Sesuaikan kategori pemasukan dan pengeluaran Anda.</p>
      </header>

      {/* Modal Konfirmasi Hapus Kategori */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Hapus Kategori "{deleteConfirm.name}"?</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Tindakan ini tidak bisa dibatalkan. Transaksi lama dengan kategori ini mungkin perlu disesuaikan manual.
                  </p>
                </div>
                <div className="flex w-full gap-3 pt-2">
                  <button 
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleConfirmDelete}
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

      <div className="rustic-card p-6 md:p-8 space-y-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
        {/* Toggle Type */}
        <div className="flex p-1 bg-slate-100 rounded-lg space-x-1">
          <button
            onClick={() => setType('income')}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md font-bold transition-all text-[10px] md:text-xs uppercase tracking-wider",
              type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 font-medium'
            )}
          >
            <ArrowUpRight size={14} />
            <span>Pemasukan</span>
          </button>
          <button
            onClick={() => setType('expense')}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md font-bold transition-all text-[10px] md:text-xs uppercase tracking-wider",
              type === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 font-medium'
            )}
          >
            <ArrowDownRight size={14} />
            <span>Pengeluaran</span>
          </button>
        </div>

        {/* Input Add */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tambah Kategori Baru</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder={`Misal: ${type === 'income' ? 'Gaji, Bonus' : 'Listrik, Makan'}...`}
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

        {/* List Kategori */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Kategori Saat Ini</label>
          
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentCategories.length > 0 ? (
                currentCategories.map(cat => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={cat.id} 
                    className="flex items-center bg-white border border-slate-200 pl-4 pr-2 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:border-primary transition-all group"
                  >
                    <span>{cat.name}</span>
                    <button 
                      onClick={() => setDeleteConfirm({ id: cat.id, name: cat.name })}
                      className="ml-3 p-1 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 italic p-2 w-full text-center">Belum ada kategori {type === 'income' ? 'pemasukan' : 'pengeluaran'}.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <CheckCircle2 size={12} className="text-primary" />
        <span>Kategori disimpan aman di cloud</span>
      </div>
    </div>
  );
};