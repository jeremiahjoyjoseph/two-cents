import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id?: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  createdAt?: Timestamp;
  createdBy: string;
};

export type TransactionInput = Omit<Transaction, 'createdAt'>;

export type TransactionUpdate = Partial<Transaction>;
