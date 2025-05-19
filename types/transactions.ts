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
};

export type TransactionInput = Omit<Transaction, 'createdAt' | 'id'>;

export type TransactionUpdate = Partial<Transaction>;
