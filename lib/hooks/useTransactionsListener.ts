import { useAuth } from '@/contexts/AuthContext';
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
  const { getEncryptionKey } = useAuth();

  useEffect(() => {
    if (!userId) return;

    const setupListener = async () => {
      try {
        const encryptionKey = await getEncryptionKey();
        if (!encryptionKey) {
          console.error('No encryption key available for transactions');
          setLoading(false);
          return;
        }

        const unsubscribe = listenToTransactions(
          userId,
          groupId || null,
          encryptionKey,
          transactions => {
            setTransactions(transactions);
            setLoading(false);
            setRefreshing(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up transactions listener:', error);
        setLoading(false);
      }
    };

    let unsubscribe: (() => void) | undefined;
    setupListener().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, groupId, getEncryptionKey]);

  return {
    transactions,
    loading,
    refreshing,
    setRefreshing,
  };
};
