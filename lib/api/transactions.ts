import { firestore } from '@/config/firebase';
import { decryptAmount, encryptAmount } from '@/lib/utils';
import {
  EncryptedTransaction,
  Transaction,
  TransactionInput,
  TransactionUpdate,
} from '@/types/transactions';
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
  writeBatch,
} from 'firebase/firestore';

const getTransactionPath = (userId: string, groupId: string | null) => {
  return groupId ? `groups/${groupId}/transactions` : `users/${userId}/transactions`;
};

/**
 * Convert Transaction to EncryptedTransaction
 */
const encryptTransaction = async (
  transaction: TransactionInput,
  encryptionKey: string
): Promise<Omit<EncryptedTransaction, 'id' | 'createdAt'>> => {
  const encryptedAmount = await encryptAmount(transaction.amount, encryptionKey);

  return {
    title: transaction.title,
    encryptedAmount,
    type: transaction.type,
    date: transaction.date,
    createdBy: transaction.createdBy,
    groupId: transaction.groupId || null,
  };
};

/**
 * Convert EncryptedTransaction to Transaction
 */
const decryptTransaction = async (
  encryptedTransaction: EncryptedTransaction,
  encryptionKey: string
): Promise<Transaction> => {
  const amount = await decryptAmount(encryptedTransaction.encryptedAmount, encryptionKey);

  return {
    id: encryptedTransaction.id,
    title: encryptedTransaction.title,
    amount,
    type: encryptedTransaction.type,
    date: encryptedTransaction.date,
    createdAt: encryptedTransaction.createdAt,
    createdBy: encryptedTransaction.createdBy,
    groupId: encryptedTransaction.groupId || null,
  };
};

export const addTransaction = async (
  userId: string,
  groupId: string | null,
  data: TransactionInput,
  encryptionKey: string
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);

  // Encrypt the transaction before storing
  const encryptedData = await encryptTransaction(data, encryptionKey);

  return await addDoc(ref, {
    ...encryptedData,
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
  updates: TransactionUpdate,
  encryptionKey: string
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = doc(firestore, path, transactionId);

  // If amount is being updated, encrypt it
  const encryptedUpdates: any = { ...updates };
  if (updates.amount !== undefined) {
    encryptedUpdates.encryptedAmount = await encryptAmount(updates.amount, encryptionKey);
    delete encryptedUpdates.amount; // Remove the unencrypted amount
  }

  return await updateDoc(ref, encryptedUpdates);
};

export const getTransactionsByMonth = async (
  userId: string,
  groupId: string | null,
  month: string, // e.g. "2025-05"
  encryptionKey: string
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
  const encryptedTransactions = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as EncryptedTransaction[];

  // Decrypt all transactions
  const decryptedTransactions = await Promise.all(
    encryptedTransactions.map(encryptedTransaction =>
      decryptTransaction(encryptedTransaction, encryptionKey)
    )
  );

  return decryptedTransactions;
};

export const getAllTransactions = async (
  userId: string,
  groupId: string | null,
  encryptionKey: string
): Promise<Transaction[]> => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);
  const q = query(ref, orderBy('date', 'desc'));

  const snapshot = await getDocs(q);
  const encryptedTransactions = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as EncryptedTransaction[];

  // Decrypt all transactions
  const decryptedTransactions = await Promise.all(
    encryptedTransactions.map(encryptedTransaction =>
      decryptTransaction(encryptedTransaction, encryptionKey)
    )
  );

  return decryptedTransactions;
};

export const listenToTransactions = (
  userId: string,
  groupId: string | null,
  encryptionKey: string,
  onUpdate: (transactions: Transaction[]) => void
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);
  const q = query(ref, orderBy('date', 'desc'));

  return onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
    const encryptedTransactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as EncryptedTransaction[];

    // Decrypt all transactions
    const decryptedTransactions = await Promise.all(
      encryptedTransactions.map(encryptedTransaction =>
        decryptTransaction(encryptedTransaction, encryptionKey)
      )
    );

    onUpdate(decryptedTransactions);
  });
};

export const deleteAllTransactions = async (userId: string, groupId: string | null) => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);

  // Get all transactions
  const snapshot = await getDocs(ref);

  // Create a batch to delete all transactions
  const batch = writeBatch(firestore);
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};
