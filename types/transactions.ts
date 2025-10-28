import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type Transaction = {
  id?: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  createdAt: Timestamp;
  createdBy: string;
  groupId?: string | null;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
};

// Encrypted transaction stored in database
export type EncryptedTransaction = {
  id?: string;
  encryptedTitle: string; // Encrypted title as base64 string
  encryptedAmount: string; // Encrypted amount as base64 string
  encryptedCategoryName?: string; // Encrypted category name as base64 string
  type: TransactionType;
  date: string;
  createdAt: Timestamp;
  createdBy: string;
  groupId?: string | null;
  categoryId?: string;
  categoryIcon?: string;
  categoryColor?: string;
};

export type TransactionInput = Omit<Transaction, 'createdAt' | 'id'>;

export type TransactionUpdate = Partial<Transaction>;
