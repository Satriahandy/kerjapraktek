/// <reference types="vite/client" />
import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';
import * as storage from '../services/storageService';
import * as supabaseService from '../services/supabaseService';
import { useAuth } from '../context/AuthContext'; // Import ini

const isSupabaseConfigured = () => {
  return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
};

export function useTransactions() {
  const { user } = useAuth(); // Ambil user yang sedang login
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Jika pakai Supabase tapi user belum login, jangan fetch dulu
    if (isSupabaseConfigured() && !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const data = await supabaseService.getSupabaseTransactions();
        setTransactions(data);
      } else {
        const data = await storage.getTransactions();
        setTransactions(data.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]); // Set kosong jika error agar tidak campur data lama
    } finally {
      setLoading(false);
    }
  }, [user]); // Re-run refresh kalau user berubah (login/logout)

  useEffect(() => {
    const init = async () => {
      // Only seed if not using Supabase and storage is empty
      if (!isSupabaseConfigured()) {
        const currentData = await storage.getTransactions();
        if (currentData.length === 0) {
          storage.seedMockData();
          refresh();
        }
      }
    };
    init();
    refresh();
  }, [refresh]);

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      if (isSupabaseConfigured()) {
        // Pastikan kita tidak menambah data jika user tidak ada
        if (!user) throw new Error("User must be logged in");
        
        // Kirim data dengan ID user agar RLS mengizinkan insert
        await supabaseService.saveSupabaseTransaction({ 
          ...t, 
          user_id: user.id 
        } as any);
      } else {
        const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
        storage.saveTransaction(newTransaction);
      }
      refresh();
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      if (isSupabaseConfigured()) {
        await supabaseService.deleteSupabaseTransaction(id);
      } else {
        storage.deleteTransaction(id);
      }
      refresh();
    } catch (error) {
      console.error('Failed to remove transaction:', error);
    }
  };

  return { transactions, loading, addTransaction, removeTransaction, refresh };
}
