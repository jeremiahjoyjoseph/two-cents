import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'income' | 'expense' | 'transfer';

// Base transaction interface for individual users (no encryption needed)
export type Transaction = {
  id?: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  createdAt: Timestamp;
  createdBy: string;
  groupId?: string | null;
  notes?: string;
};

export type TransactionInput = Omit<Transaction, 'createdAt' | 'id'>;

export type TransactionUpdate = Partial<Transaction>;

// Encrypted transaction interface for group transactions
// Only sensitive fields are encrypted, others remain in plaintext for performance
export type EncryptedTransaction = {
  id?: string;
  // ENCRYPTED FIELDS (sensitive data)
  encryptedTitle: string; // Encrypted transaction title
  encryptedAmount: string; // Encrypted monetary amount
  encryptedNotes?: string; // Encrypted notes (optional)

  // PLAINTEXT FIELDS (non-sensitive, needed for performance)
  type: TransactionType; // For UI categorization and filtering
  date: string; // For display and UI grouping
  createdAt: Timestamp; // For sorting and sync operations
  createdBy: string; // For access control and attribution
  groupId?: string | null; // For routing and organization
};

// Group structure for encryption
export type Group = {
  id: string;
  userIds: string[]; // Array of user IDs
  encryptedGroupKeys: {
    // Group key encrypted for each user
    [uid: string]: string; // Encrypted with user's public key
  };
  createdAt: Timestamp;
};

export type EncryptedGroupKey = {
  [uid: string]: string;
};

// Field-level encryption configuration
export const ENCRYPTED_FIELDS = ['encryptedTitle', 'encryptedAmount', 'encryptedNotes'] as const;

export const PLAINTEXT_FIELDS = ['type', 'date', 'createdAt', 'createdBy', 'groupId'] as const;

export const ALLOWED_TRANSACTION_FIELDS = [
  ...ENCRYPTED_FIELDS,
  ...PLAINTEXT_FIELDS,
  'id', // Document ID is allowed
] as const;

// Type guard to ensure only allowed fields are present
export const isValidTransactionFields = (data: any): data is EncryptedTransaction => {
  const dataKeys = Object.keys(data);
  return dataKeys.every(key => ALLOWED_TRANSACTION_FIELDS.includes(key as any));
};
