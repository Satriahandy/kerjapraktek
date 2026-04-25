import { useState, useEffect } from 'react';
import * as storage from '../services/storageService';

export function useCategories() {
  const [categories, setCategories] = useState<{ income: string[], expense: string[] }>({ income: [], expense: [] });

  useEffect(() => {
    setCategories(storage.getCategories());
  }, []);

  const addCategory = (type: 'income' | 'expense', name: string) => {
    const updated = { ...categories };
    if (!updated[type].includes(name)) {
      updated[type] = [...updated[type], name];
      setCategories(updated);
      storage.saveCategories(updated);
    }
  };

  const removeCategory = (type: 'income' | 'expense', name: string) => {
    const updated = { ...categories };
    updated[type] = updated[type].filter(c => c !== name);
    setCategories(updated);
    storage.saveCategories(updated);
  };

  return { categories, addCategory, removeCategory };
}
