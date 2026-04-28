import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Transaction } from '../types';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Ambil Data Transaksi
  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Ambil owner_id dari metadata (ini kunci agar RLS tembus)
      const ownerId = user.user_metadata?.owner_id || user.id;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('owner_id', ownerId) // Filter ini WAJIB sama dengan di SQL
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // 2. Tambah Transaksi
  const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'created_at' | 'user_id' | 'owner_id'>) => {
    if (!user) return;

    try {
      const ownerId = user.user_metadata?.owner_id || user.id;

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ 
          ...newTransaction, 
          user_id: user.id,   // Siapa yang input
          owner_id: ownerId   // Milik bisnis siapa
        }])
        .select();

      if (error) throw error;
      
      // Update state lokal agar langsung muncul
      if (data) {
        setTransactions(prev => [data[0], ...prev]);
      }
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  // 3. Hapus Transaksi
  const removeTransaction = async (id: string | number) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error removing transaction:', error);
      throw error;
    }
  };

  return { transactions, addTransaction, removeTransaction, loading, refresh: fetchTransactions };
}