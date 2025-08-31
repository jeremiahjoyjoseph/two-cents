import { firestore } from '@/config/firebase';
import {
  decryptGroupKey,
  decryptTransaction,
  encryptTransaction,
  validateTransactionFields,
} from '@/lib/crypto/encryption';
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
  getDoc,
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
 * Validates transaction input data before processing
 * Ensures only allowed fields are present
 */
const validateTransactionInput = (data: TransactionInput): void => {
  const allowedFields = ['title', 'amount', 'type', 'date', 'notes', 'createdBy', 'groupId'];
  const dataKeys = Object.keys(data);

  const invalidFields = dataKeys.filter(key => !allowedFields.includes(key));
  if (invalidFields.length > 0) {
    throw new Error(`Invalid transaction fields: ${invalidFields.join(', ')}`);
  }

  // Ensure required fields are present
  if (!data.title || data.amount === undefined || data.amount === null) {
    throw new Error('Transaction must have title and amount');
  }
};

export const addTransaction = async (
  userId: string,
  groupId: string | null,
  data: TransactionInput
) => {
  // Validate input data
  validateTransactionInput(data);

  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);

  if (groupId) {
    // For group transactions, we need to encrypt the data
    // First, get the group document to access encrypted group keys
    const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();
    const encryptedGroupKey = groupData.encryptedGroupKeys[userId];

    if (!encryptedGroupKey) {
      throw new Error('Encrypted group key not found for user');
    }

    // Decrypt the group key using user's private key
    const groupKey = await decryptGroupKey(encryptedGroupKey);

    // Encrypt the transaction data using field-level encryption
    const encryptedTransaction = encryptTransaction(
      {
        ...data,
        createdAt: Timestamp.now(),
      },
      groupKey
    );

    // Validate the encrypted transaction structure
    if (!validateTransactionFields(encryptedTransaction)) {
      throw new Error('Invalid encrypted transaction structure');
    }

    return await addDoc(ref, encryptedTransaction);
  } else {
    // For individual transactions, store as plain text
    // Validate that only plain transaction fields are present
    const plainTransaction = {
      ...data,
      createdAt: Timestamp.now(),
    };

    // Ensure no encrypted fields are present for individual transactions
    const hasEncryptedFields = Object.keys(plainTransaction).some(key =>
      key.startsWith('encrypted')
    );

    if (hasEncryptedFields) {
      throw new Error('Individual transactions should not contain encrypted fields');
    }

    return await addDoc(ref, plainTransaction);
  }
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
  // Validate update data
  if (updates.title !== undefined && !updates.title) {
    throw new Error('Transaction title cannot be empty');
  }

  if (updates.amount !== undefined && (updates.amount === null || updates.amount === undefined)) {
    throw new Error('Transaction amount cannot be null or undefined');
  }

  const path = getTransactionPath(userId, groupId);
  const ref = doc(firestore, path, transactionId);

  if (groupId) {
    // For group transactions, we need to encrypt any sensitive field updates
    const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();
    const encryptedGroupKey = groupData.encryptedGroupKeys[userId];

    if (!encryptedGroupKey) {
      throw new Error('Encrypted group key not found for user');
    }

    const groupKey = await decryptGroupKey(encryptedGroupKey);

    // Encrypt sensitive fields if they're being updated
    const encryptedUpdates: any = {};

    if (updates.title !== undefined) {
      encryptedUpdates.encryptedTitle = encryptTransaction(
        { title: updates.title, amount: 0, type: 'expense', date: '', createdBy: '' },
        groupKey
      ).encryptedTitle;
    }

    if (updates.amount !== undefined) {
      encryptedUpdates.encryptedAmount = encryptTransaction(
        { title: '', amount: updates.amount, type: 'expense', date: '', createdBy: '' },
        groupKey
      ).encryptedAmount;
    }

    if (updates.notes !== undefined) {
      if (updates.notes) {
        encryptedUpdates.encryptedNotes = encryptTransaction(
          { title: '', amount: 0, type: 'expense', date: '', createdBy: '', notes: updates.notes },
          groupKey
        ).encryptedNotes;
      } else {
        encryptedUpdates.encryptedNotes = null;
      }
    }

    // Add non-sensitive field updates
    if (updates.type !== undefined) encryptedUpdates.type = updates.type;
    if (updates.date !== undefined) encryptedUpdates.date = updates.date;

    return await updateDoc(ref, encryptedUpdates);
  } else {
    // For individual transactions, update plain fields
    return await updateDoc(ref, updates);
  }
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

  if (groupId) {
    // For group transactions, decrypt the data
    const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();
    const encryptedGroupKey = groupData.encryptedGroupKeys[userId];

    if (!encryptedGroupKey) {
      throw new Error('Encrypted group key not found for user');
    }

    // Decrypt the group key
    const groupKey = await decryptGroupKey(encryptedGroupKey);

    // Decrypt each transaction
    const decryptedTransactions = await Promise.all(
      snapshot.docs.map(async doc => {
        const encryptedData = doc.data() as EncryptedTransaction;

        // Validate the encrypted transaction structure
        if (!validateTransactionFields(encryptedData)) {
          console.error('Invalid encrypted transaction structure:', doc.id);
          return null;
        }

        try {
          const decryptedData = decryptTransaction(encryptedData, groupKey);
          return {
            id: doc.id,
            ...decryptedData,
          } as Transaction;
        } catch (error) {
          console.error('Error decrypting transaction:', doc.id, error);
          return null;
        }
      })
    );

    // Filter out failed decryptions
    return decryptedTransactions.filter(tx => tx !== null) as Transaction[];
  } else {
    // For individual transactions, return as-is
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
  }
};

export const getAllTransactions = async (
  userId: string,
  groupId: string | null
): Promise<Transaction[]> => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);
  const q = query(ref, orderBy('date', 'desc'));

  const snapshot = await getDocs(q);

  if (groupId) {
    // For group transactions, decrypt the data
    const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();
    const encryptedGroupKey = groupData.encryptedGroupKeys[userId];

    if (!encryptedGroupKey) {
      throw new Error('Encrypted group key not found for user');
    }

    // Decrypt the group key
    const groupKey = await decryptGroupKey(encryptedGroupKey);

    // Decrypt each transaction
    const decryptedTransactions = await Promise.all(
      snapshot.docs.map(async doc => {
        const encryptedData = doc.data() as EncryptedTransaction;

        // Validate the encrypted transaction structure
        if (!validateTransactionFields(encryptedData)) {
          console.error('Invalid encrypted transaction structure:', doc.id);
          return null;
        }

        try {
          const decryptedData = decryptTransaction(encryptedData, groupKey);
          return {
            id: doc.id,
            ...decryptedData,
          } as Transaction;
        } catch (error) {
          console.error('Error decrypting transaction:', doc.id, error);
          return null;
        }
      })
    );

    // Filter out failed decryptions
    return decryptedTransactions.filter(tx => tx !== null) as Transaction[];
  } else {
    // For individual transactions, return as-is
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
  }
};

export const listenToTransactions = (
  userId: string,
  groupId: string | null,
  onUpdate: (transactions: Transaction[]) => void
) => {
  const path = getTransactionPath(userId, groupId);
  const ref = collection(firestore, path);
  const q = query(ref, orderBy('date', 'desc'));

  return onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
    if (groupId) {
      // For group transactions, decrypt the data
      try {
        const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
        if (!groupDoc.exists()) {
          console.error('Group not found');
          return;
        }

        const groupData = groupDoc.data();
        const encryptedGroupKey = groupData.encryptedGroupKeys[userId];

        if (!encryptedGroupKey) {
          console.error('Encrypted group key not found for user');
          return;
        }

        // Decrypt the group key
        const groupKey = await decryptGroupKey(encryptedGroupKey);

        // Decrypt each transaction
        const decryptedTransactions = await Promise.all(
          snapshot.docs.map(async doc => {
            const encryptedData = doc.data() as EncryptedTransaction;

            // Validate the encrypted transaction structure
            if (!validateTransactionFields(encryptedData)) {
              console.error('Invalid encrypted transaction structure:', doc.id);
              return null;
            }

            try {
              const decryptedData = decryptTransaction(encryptedData, groupKey);
              return {
                id: doc.id,
                ...decryptedData,
              } as Transaction;
            } catch (error) {
              console.error('Error decrypting transaction:', doc.id, error);
              return null;
            }
          })
        );

        // Filter out failed decryptions and update
        const validTransactions = decryptedTransactions.filter(tx => tx !== null) as Transaction[];
        onUpdate(validTransactions);
      } catch (error) {
        console.error('Error decrypting transactions:', error);
        onUpdate([]);
      }
    } else {
      // For individual transactions, return as-is
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      onUpdate(transactions);
    }
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
