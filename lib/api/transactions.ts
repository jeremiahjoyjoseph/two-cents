import { firestore } from '@/config/firebase';
import { Transaction, TransactionInput, TransactionUpdate } from '@/types/transactions';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const getTransactionPath = (userId: string, groupId: string | null) => {
  return groupId ? `groups/${groupId}/transactions` : `users/${userId}/transactions`;
};

export const addTransaction = async (
  userId: string,
  groupId: string | null,
  data: TransactionInput
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);
  return await addDoc(ref, {
    ...data,
    createdAt: Timestamp.now(),
  });
};

export const deleteTransaction = async (
  userId: string,
  groupId: string | null,
  transactionId: string
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = doc(firestore, path, transactionId);
  return await deleteDoc(ref);
};

export const updateTransaction = async (
  userId: string,
  groupId: string | null,
  transactionId: string,
  updates: TransactionUpdate
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = doc(firestore, path, transactionId);
  return await updateDoc(ref, updates);
};

export const getTransactionsByMonth = async (
  userId: string,
  groupId: string | null,
  month: string // e.g. "2025-05"
): Promise<Transaction[]> => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);
  const q = query(
    ref,
    where('date', '>=', `${month}-01`),
    where('date', '<=', `${month}-31`),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Transaction[];
};

export const getAllTransactions = async (
  userId: string,
  groupId: string | null
): Promise<Transaction[]> => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);
  const q = query(ref, orderBy('date', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Transaction[];
};

export const listenToTransactions = (
  userId: string,
  groupId: string | null,
  onUpdate: (transactions: Transaction[]) => void
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);
  const q = query(ref, orderBy('date', 'desc'));

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
    onUpdate(transactions);
  });
};
