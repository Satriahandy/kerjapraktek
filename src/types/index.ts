/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO String
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  userId: string;
}

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  type: TransactionType;
}
