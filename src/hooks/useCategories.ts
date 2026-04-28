import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // Pastikan path ini benar
import { useAuth } from '../context/AuthContext';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<{ income: string[], expense: string[] }>({ 
    income: [], 
    expense: [] 
  });
  const [loading, setLoading] = useState(true);

  // 1. Ambil Data Langsung (Tidak lewat Service agar lebih akurat)
  const refreshCategories = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Ambil owner_id dari metadata
      const ownerId = user.user_metadata?.owner_id || user.id;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('owner_id', ownerId); // Filter sesuai SQL baru

      if (error) throw error;

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

  // 2. Tambah Kategori
  const addCategory = async (type: 'income' | 'expense', name: string) => {
    if (!user) return;
    
    try {
      const ownerId = user.user_metadata?.owner_id || user.id;

      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name, 
          type, 
          owner_id: ownerId // WAJIB ada agar muncul di UI
        }]);

      if (error) throw error;
      
      await refreshCategories(); // Paksa ambil data terbaru
    } catch (error) {
      console.error('Error adding category:', error);
      throw error; // Lempar error agar toast di UI muncul
    }
  };

  // 3. Hapus Kategori
  const removeCategory = async (type: 'income' | 'expense', name: string) => {
    if (!user) return;

    try {
      const ownerId = user.user_metadata?.owner_id || user.id;

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', name)
        .eq('type', type)
        .eq('owner_id', ownerId);

      if (error) throw error;
      
      await refreshCategories();
    } catch (error) {
      console.error('Error removing category:', error);
      throw error;
    }
  };

  return { categories, addCategory, removeCategory, loading };
}