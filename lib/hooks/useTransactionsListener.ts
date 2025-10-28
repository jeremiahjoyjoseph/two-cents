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
  const { getEncryptionKey, getGroupEncryptionKey } = useAuth();

  useEffect(() => {
    if (!userId) return;

    const setupListener = async () => {
      try {
        // Check if at least one key is available initially
        const personalKey = await getEncryptionKey();
        const groupKey = groupId ? await getGroupEncryptionKey() : null;

        if (!personalKey && !groupKey) {
          console.error('No encryption key available for transactions');
          setLoading(false);
          return;
        }

        // Pass functions directly so keys are fetched fresh on each snapshot
        const unsubscribe = listenToTransactions(
          userId,
          groupId || null,
          getEncryptionKey,
          getGroupEncryptionKey,
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
  }, [userId, groupId, getEncryptionKey, getGroupEncryptionKey]);

  return {
    transactions,
    loading,
    refreshing,
    setRefreshing,
  };
};
