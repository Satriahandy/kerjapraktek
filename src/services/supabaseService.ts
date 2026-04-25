import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

/** * TRANSAKSI SECTION 
 */

// 1. Ambil data transaksi (Otomatis terfilter RLS)
export const getSupabaseTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data as Transaction[];
};

// 2. Simpan transaksi baru
export const saveSupabaseTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: Number(transaction.amount), // Pastikan angka
        user_id: user.id 
      }
    ])
    .select();

  if (error) throw error;
  return data[0];
};

// 3. Hapus transaksi
export const deleteSupabaseTransaction = async (id: string | number) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};


/** * KATEGORI SECTION (Agar tidak campur antar User)
 */

// 4. Ambil kategori milik user sendiri
export const getSupabaseCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data;
};

// 5. Simpan kategori baru khusus untuk user ini
export const saveSupabaseCategory = async (name: string, type: 'income' | 'expense') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('categories')
    .insert([{ 
      name, 
      type, 
      user_id: user.id // Stempel ID user agar tidak muncul di orang lain
    }])
    .select();

  if (error) throw error;
  return data[0];
};

// 6. Hapus kategori
export const deleteSupabaseCategory = async (id: number | string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};