import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';
import * as storage from '../services/storageService';
import * as supabaseService from '../services/supabaseService';

const isSupabaseConfigured = () => {
  return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
};

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const data = await supabaseService.getSupabaseTransactions();
        setTransactions(data);
      } else {
        setTransactions(storage.getTransactions().sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Fallback on error
      setTransactions(storage.getTransactions().sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      storage.seedMockData(); // Just for demo when using localStorage
    }
    refresh();
  }, [refresh]);

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      if (isSupabaseConfigured()) {
        await supabaseService.saveSupabaseTransaction(t);
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
