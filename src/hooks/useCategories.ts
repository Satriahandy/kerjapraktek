import { useState, useEffect, useCallback } from 'react';
import { 
  getSupabaseCategories, 
  saveSupabaseCategory, 
  deleteSupabaseCategory 
} from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<{ income: string[], expense: string[] }>({ 
    income: [], 
    expense: [] 
  });
  const [loading, setLoading] = useState(true);

  // 1. Fungsi Fetch Data dari Supabase
  const refreshCategories = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getSupabaseCategories();
      
      // Transformasi data dari flat array (database) ke object {income, expense}
      const formatted = data.reduce((acc: any, curr: any) => {
        if (curr.type === 'income') acc.income.push(curr.name);
        if (curr.type === 'expense') acc.expense.push(curr.name);
        return acc;
      }, { income: [], expense: [] });

      setCategories(formatted);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  // 2. Tambah Kategori ke Supabase
  const addCategory = async (type: 'income' | 'expense', name: string) => {
    if (!user) return;
    
    try {
      // Cek agar tidak duplikat di UI
      if (!categories[type].includes(name)) {
        await saveSupabaseCategory(name, type);
        await refreshCategories(); // Ambil data terbaru dari DB
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  // 3. Hapus Kategori dari Supabase
  const removeCategory = async (type: 'income' | 'expense', name: string) => {
    if (!user) return;

    try {
      // Karena kita butuh ID untuk hapus di DB, kita cari dulu itemnya
      const allData = await getSupabaseCategories();
      const target = allData.find((c: any) => c.name === name && c.type === type);
      
      if (target) {
        await deleteSupabaseCategory(target.id);
        await refreshCategories();
      }
    } catch (error) {
      console.error('Error removing category:', error);
    }
  };

  return { categories, addCategory, removeCategory, loading };
}