import { firestore } from '@/config/firebase';
import { decryptAmount, encryptAmount } from '@/lib/utils';
import { decryptWithAES, encryptWithAES } from '@/lib/utils/aes';
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
  deleteField,
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
  personalKey: string | null,
  groupKey: string | null
): Promise<Omit<EncryptedTransaction, 'id' | 'createdAt'>> => {
  const isGroupTransaction = !!transaction.groupId;
  const encryptionKey = isGroupTransaction ? groupKey : personalKey;

  if (!encryptionKey) {
    throw new Error(
      `Encryption key not found for ${isGroupTransaction ? 'group' : 'personal'} transaction`
    );
  }

  // Encrypt sensitive fields
  const encryptedTitle = await encryptWithAES(transaction.title, encryptionKey);
  const encryptedAmount = await encryptAmount(transaction.amount, encryptionKey);

  const encryptedData: any = {
    encryptedTitle,
    encryptedAmount,
    type: transaction.type,
    date: transaction.date,
    createdBy: transaction.createdBy,
    groupId: transaction.groupId || null,
  };

  // Only add category fields if they exist
  if (transaction.categoryName) {
    encryptedData.encryptedCategoryName = await encryptWithAES(transaction.categoryName, encryptionKey);
  }
  if (transaction.categoryId) {
    encryptedData.categoryId = transaction.categoryId;
  }
  if (transaction.categoryIcon) {
    encryptedData.categoryIcon = transaction.categoryIcon;
  }
  if (transaction.categoryColor) {
    encryptedData.categoryColor = transaction.categoryColor;
  }

  return encryptedData;
};

/**
 * Convert EncryptedTransaction to Transaction
 */
const decryptTransaction = async (
  encryptedTransaction: EncryptedTransaction,
  personalKey: string | null,
  groupKey: string | null
): Promise<Transaction> => {
  const isGroupTransaction = !!encryptedTransaction.groupId;
  const encryptionKey = isGroupTransaction ? groupKey : personalKey;

  if (!encryptionKey) {
    throw new Error(
      `Encryption key not found for ${isGroupTransaction ? 'group' : 'personal'} transaction`
    );
  }

  // Decrypt sensitive fields
  const title = await decryptWithAES(encryptedTransaction.encryptedTitle, encryptionKey);
  const amount = await decryptAmount(encryptedTransaction.encryptedAmount, encryptionKey);
  const categoryName = encryptedTransaction.encryptedCategoryName 
    ? await decryptWithAES(encryptedTransaction.encryptedCategoryName, encryptionKey) 
    : undefined;

  return {
    id: encryptedTransaction.id,
    title,
    amount,
    type: encryptedTransaction.type,
    date: encryptedTransaction.date,
    createdAt: encryptedTransaction.createdAt,
    createdBy: encryptedTransaction.createdBy,
    groupId: encryptedTransaction.groupId || null,
    // Category fields
    categoryId: encryptedTransaction.categoryId,
    categoryName,
    categoryIcon: encryptedTransaction.categoryIcon,
    categoryColor: encryptedTransaction.categoryColor,
  };
};

export const addTransaction = async (
  userId: string,
  groupId: string | null,
  data: TransactionInput,
  personalKey: string | null,
  groupKey: string | null
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);

  // Encrypt the transaction before storing
  const encryptedData = await encryptTransaction(data, personalKey, groupKey);

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
  personalKey: string | null,
  groupKey: string | null
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = doc(firestore, path, transactionId);

  const isGroupTransaction = !!groupId;
  const encryptionKey = isGroupTransaction ? groupKey : personalKey;

  if (!encryptionKey) {
    throw new Error(
      `Encryption key not found for ${isGroupTransaction ? 'group' : 'personal'} transaction`
    );
  }

  // Start with an empty object to build encrypted updates
  const encryptedUpdates: any = {};
  
  // Encrypt sensitive fields if they are being updated
  if (updates.title !== undefined) {
    encryptedUpdates.encryptedTitle = await encryptWithAES(updates.title, encryptionKey);
  }
  
  if (updates.amount !== undefined) {
    encryptedUpdates.encryptedAmount = await encryptAmount(updates.amount, encryptionKey);
  }
  
  // Only add category fields if they exist in updates
  if (updates.categoryName !== undefined) {
    if (updates.categoryName) {
      encryptedUpdates.encryptedCategoryName = await encryptWithAES(updates.categoryName, encryptionKey);
    }
    // If categoryName is empty string or null, don't include it (Firestore doesn't accept undefined)
  }
  
  // Copy over non-sensitive fields (these are not encrypted)
  if (updates.type !== undefined) {
    encryptedUpdates.type = updates.type;
  }
  if (updates.date !== undefined) {
    encryptedUpdates.date = updates.date;
  }
  if (updates.categoryId !== undefined) {
    if (updates.categoryId) {
      encryptedUpdates.categoryId = updates.categoryId;
    }
  }
  if (updates.categoryIcon !== undefined) {
    if (updates.categoryIcon) {
      encryptedUpdates.categoryIcon = updates.categoryIcon;
    }
  }
  if (updates.categoryColor !== undefined) {
    if (updates.categoryColor) {
      encryptedUpdates.categoryColor = updates.categoryColor;
    }
  }

  return await updateDoc(ref, encryptedUpdates);
};

export const getTransactionsByMonth = async (
  userId: string,
  groupId: string | null,
  month: string, // e.g. "2025-05"
  personalKey: string | null,
  groupKey: string | null
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
      decryptTransaction(encryptedTransaction, personalKey, groupKey)
    )
  );

  return decryptedTransactions;
};

export const getAllTransactions = async (
  userId: string,
  groupId: string | null,
  personalKey: string | null,
  groupKey: string | null
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
      decryptTransaction(encryptedTransaction, personalKey, groupKey)
    )
  );

  return decryptedTransactions;
};

export const listenToTransactions = (
  userId: string,
  groupId: string | null,
  getPersonalKey: () => Promise<string | null>,
  getGroupKey: () => Promise<string | null>,
  onUpdate: (transactions: Transaction[]) => void
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);
  const q = query(ref, orderBy('date', 'desc'));

  return onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
    // Fetch fresh keys on every snapshot update
    const personalKey = await getPersonalKey();
    const groupKey = groupId ? await getGroupKey() : null;
    
    const encryptedTransactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as EncryptedTransaction[];

    // Decrypt all transactions with fresh keys
    const decryptedTransactions = await Promise.all(
      encryptedTransactions.map(encryptedTransaction =>
        decryptTransaction(encryptedTransaction, personalKey, groupKey)
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

/**
 * Clear all category data from group transactions (used when deleting group category)
 */
export const clearCategoryFromGroupTransactions = async (
  groupId: string,
  categoryId: string
): Promise<void> => {
  const path = `groups/${groupId}/transactions`;
  const ref = collection(firestore, path);
  
  const q = query(ref, where('categoryId', '==', categoryId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('No group transactions found with categoryId:', categoryId);
    return;
  }
  
  console.log(`Clearing category data from ${snapshot.docs.length} group transactions`);
  
  const batch = writeBatch(firestore);
  snapshot.docs.forEach((docSnapshot) => {
    batch.update(docSnapshot.ref, {
      categoryId: deleteField(),
      categoryIcon: deleteField(),
      categoryColor: deleteField(),
      encryptedCategoryName: deleteField(),
    });
  });
  
  await batch.commit();
};
