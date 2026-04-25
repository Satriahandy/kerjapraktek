import { Transaction } from '../types';

const STORAGE_KEY = 'bakmi_jowo_transactions';

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse transactions', e);
    return [];
  }
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

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

export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Initial mock data if empty
export const seedMockData = () => {
  const existing = getTransactions();
  if (existing.length > 0) return;

  const now = new Date();
  const mockData: Transaction[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Some income
    mockData.push({
      id: `mock-income-${i}`,
      date: date.toISOString().split('T')[0],
      type: 'income',
      category: 'Bakmi Jowo',
      description: 'Penjualan Bakmi',
      amount: 500000 + Math.random() * 200000,
      userId: 'test-user'
    });

    // Some expense
    mockData.push({
      id: `mock-expense-${i}`,
      date: date.toISOString().split('T')[0],
      type: 'expense',
      category: 'Bahan Baku',
      description: 'Belanja Sayur & Ayam',
      amount: 100000 + Math.random() * 50000,
      userId: 'test-user'
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
};
