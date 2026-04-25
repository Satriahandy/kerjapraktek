import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import * as storage from '../services/storageService';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fungsi untuk ambil data dari Supabase
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await storage.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Gagal memuat transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Muat data saat pertama kali aplikasi dibuka
  useEffect(() => {
    loadTransactions();
  }, []);

  // 2. Fungsi untuk menambah transaksi
  const addTransaction = async (transaction: Transaction) => {
    try {
      await storage.saveTransaction(transaction);
      // Setelah simpan, ambil data terbaru dari server
      await loadTransactions();
    } catch (error) {
      alert("Gagal menyimpan transaksi ke database");
    }
  };

  // 3. Fungsi untuk menghapus transaksi
  const removeTransaction = async (id: string) => {
    try {
      await storage.deleteTransaction(id);
      // Update tampilan lokal agar cepat, atau panggil loadTransactions()
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      alert("Gagal menghapus transaksi");
    }
  };

  return { transactions, loading, addTransaction, removeTransaction, refresh: loadTransactions };
}