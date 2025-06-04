import { listenToTransactions } from '@/lib/api/transactions';
import { Transaction } from '@/types/transactions';
import { useEffect, useState } from 'react';

interface UseTransactionsListenerResult {
  transactions: Transaction[];
  loading: boolean;
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
}

export const useTransactionsListener = (
  userId: string | undefined,
  groupId: string | null | undefined
): UseTransactionsListenerResult => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToTransactions(userId, groupId || null, transactions => {
      setTransactions(transactions);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [userId, groupId]);

  return {
    transactions,
    loading,
    refreshing,
    setRefreshing,
  };
};
