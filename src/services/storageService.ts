import { Transaction } from '../types';
import { createClient } from '@supabase/supabase-js';

import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- TRANSAKSI ---

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Gagal ambil data Supabase:', error);
    return [];
  }
  return data || [];
};

  export const saveTransaction = async (transaction: Transaction): Promise<void> => {
    const { error } = await supabase
      .from('transactions')
      .insert([transaction]);

    if (error) {
      console.error('Gagal simpan ke Supabase:', error);
      throw error;
    }
  };

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Gagal hapus di Supabase:', error);
    throw error;
  }
};



// --- KATEGORI ---
// Kita tetap simpan kategori di LocalStorage agar simpel, 
// atau kamu bisa buat tabel baru di Supabase jika mau.

const CATEGORY_KEY = 'bakmi_jowo_categories';

export const getCategories = (): { income: string[], expense: string[] } => {
  const data = localStorage.getItem(CATEGORY_KEY);
  if (!data) return { 
    income: ['Bakmi Jowo', 'Minuman', 'Gorengan', 'GrabFood', 'QRIS'], 
    expense: ['Bahan Baku', 'Gaji Karyawan', 'Listrik & Air', 'Sewa Tempat', 'Operasional'] 
  };
  try {
    return JSON.parse(data);
  } catch (e) {
    return { income: [], expense: [] };
  }
};

export const saveCategories = (categories: { income: string[], expense: string[] }): void => {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
};

// --- CLEAN UP ---

export const clearAllData = async (): Promise<void> => {
  // Hati-hati: Ini akan menghapus semua data di tabel Supabase
  const { error } = await supabase
    .from('transactions')
    .delete()
    .neq('id', '0'); // Hapus semua yang ID-nya bukan 0

  if (error) console.error('Gagal membersihkan data:', error);
};