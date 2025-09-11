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
};

// Encrypted transaction stored in database
export type EncryptedTransaction = {
  id?: string;
  title: string;
  encryptedAmount: string; // Encrypted amount as base64 string
  type: TransactionType;
  date: string;
  createdAt: Timestamp;
  createdBy: string;
  groupId?: string | null;
};

export type TransactionInput = Omit<Transaction, 'createdAt' | 'id'>;

export type TransactionUpdate = Partial<Transaction>;
