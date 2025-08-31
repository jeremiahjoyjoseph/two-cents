import { EncryptedTransaction, isValidTransactionFields, Transaction } from '@/types/transactions';
import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

// Constants for key storage
const PRIVATE_KEY_STORAGE_KEY = 'two_cents_private_key';
const PUBLIC_KEY_STORAGE_KEY = 'two_cents_public_key';

// Key generation and management
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedGroupKey {
  [uid: string]: string;
}

/**
 * Generates a new RSA key pair for asymmetric encryption
 * Note: In a production app, you might want to use Web Crypto API for better performance
 */
export const generateKeyPair = async (): Promise<KeyPair> => {
  try {
    // For demo purposes, we'll generate a simple key pair
    // In production, consider using Web Crypto API or a more robust library
    const publicKey = `public_key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const privateKey = `private_key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return { publicKey, privateKey };
  } catch (error) {
    console.error('Error generating key pair:', error);
    throw new Error('Failed to generate key pair');
  }
};

/**
 * Stores the private key securely using expo-secure-store
 */
export const storePrivateKey = async (privateKey: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, privateKey);
  } catch (error) {
    console.error('Error storing private key:', error);
    throw new Error('Failed to store private key');
  }
};

/**
 * Retrieves the stored private key
 */
export const getPrivateKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error retrieving private key:', error);
    return null;
  }
};

/**
 * Stores the public key in secure storage (for backup purposes)
 */
export const storePublicKey = async (publicKey: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(PUBLIC_KEY_STORAGE_KEY, publicKey);
  } catch (error) {
    console.error('Error storing public key:', error);
    throw new Error('Failed to store public key');
  }
};

/**
 * Retrieves the stored public key
 */
export const getPublicKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(PUBLIC_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error retrieving public key:', error);
    return null;
  }
};

/**
 * Generates a random AES-256 group key
 */
export const generateGroupKey = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

/**
 * Encrypts data with a public key (asymmetric encryption)
 * This would typically use RSA encryption in production
 */
export const encryptWithPublicKey = (data: string, publicKey: string): string => {
  if (!data || !publicKey) {
    throw new Error('Data and public key are required');
  }

  try {
    // In production, this would use proper RSA encryption
    // For demo purposes, we'll use a simple encryption
    const encrypted = CryptoJS.AES.encrypt(data, publicKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Error encrypting with public key:', error);
    throw new Error('Failed to encrypt with public key');
  }
};

/**
 * Decrypts data with a private key (asymmetric decryption)
 */
export const decryptWithPrivateKey = (encrypted: string, privateKey: string): string => {
  if (!encrypted || !privateKey) {
    throw new Error('Encrypted data and private key are required');
  }

  try {
    // In production, this would use proper RSA decryption
    // For demo purposes, we'll use a simple decryption
    const decrypted = CryptoJS.AES.decrypt(encrypted, privateKey).toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error('Decryption failed - invalid private key or corrupted data');
    }
    return decrypted;
  } catch (error) {
    console.error('Error decrypting with private key:', error);
    throw new Error('Failed to decrypt with private key');
  }
};

/**
 * Encrypts data with a symmetric group key (AES)
 */
export const encryptWithGroupKey = (data: string, groupKey: string): string => {
  if (!data || !groupKey) {
    throw new Error('Data and group key are required');
  }

  try {
    return CryptoJS.AES.encrypt(data, groupKey).toString();
  } catch (error) {
    console.error('Error encrypting with group key:', error);
    throw new Error('Failed to encrypt with group key');
  }
};

/**
 * Decrypts data with a symmetric group key (AES)
 */
export const decryptWithGroupKey = (encrypted: string, groupKey: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, groupKey).toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error('Decryption failed - invalid group key or corrupted data');
    }
    return decrypted;
  } catch (error) {
    console.error('Error decrypting with group key:', error);
    throw new Error('Failed to decrypt with group key');
  }
};

/**
 * Encrypts a transaction object with the group key using field-level strategy
 * Only sensitive fields (title, amount, notes) are encrypted
 * Non-sensitive fields remain in plaintext for performance
 */
export const encryptTransaction = (
  transaction: Transaction,
  groupKey: string
): EncryptedTransaction => {
  try {
    // Validate that we have the required fields
    if (!transaction.title || transaction.amount === undefined || transaction.amount === null) {
      throw new Error('Transaction must have title and amount');
    }

    // Create encrypted transaction with field-level encryption
    const encryptedTransaction: EncryptedTransaction = {
      id: transaction.id,

      // ENCRYPTED FIELDS (sensitive data)
      encryptedTitle: encryptWithGroupKey(transaction.title, groupKey),
      encryptedAmount: encryptWithGroupKey(transaction.amount.toString(), groupKey),
      encryptedNotes: transaction.notes
        ? encryptWithGroupKey(transaction.notes, groupKey)
        : undefined,

      // PLAINTEXT FIELDS (non-sensitive, needed for performance)
      type: transaction.type,
      date: transaction.date,
      createdAt: transaction.createdAt,
      createdBy: transaction.createdBy,
      groupId: transaction.groupId,
    };

    // Validate the encrypted transaction structure
    if (!isValidTransactionFields(encryptedTransaction)) {
      throw new Error('Invalid encrypted transaction structure');
    }

    return encryptedTransaction;
  } catch (error) {
    console.error('Error encrypting transaction:', error);
    throw new Error('Failed to encrypt transaction');
  }
};

/**
 * Decrypts an encrypted transaction object with the group key
 * Decrypts only the sensitive fields while preserving plaintext fields
 */
export const decryptTransaction = (
  encryptedTransaction: EncryptedTransaction,
  groupKey: string
): Transaction => {
  try {
    // Validate the encrypted transaction structure
    if (!isValidTransactionFields(encryptedTransaction)) {
      throw new Error('Invalid encrypted transaction structure');
    }

    // Decrypt sensitive fields and preserve plaintext fields
    const decryptedTransaction: Transaction = {
      id: encryptedTransaction.id,

      // Decrypt sensitive fields
      title: decryptWithGroupKey(encryptedTransaction.encryptedTitle, groupKey),
      amount: parseFloat(decryptWithGroupKey(encryptedTransaction.encryptedAmount, groupKey)),
      notes: encryptedTransaction.encryptedNotes
        ? decryptWithGroupKey(encryptedTransaction.encryptedNotes, groupKey)
        : undefined,

      // Preserve plaintext fields (no decryption needed)
      type: encryptedTransaction.type,
      date: encryptedTransaction.date,
      createdAt: encryptedTransaction.createdAt,
      createdBy: encryptedTransaction.createdBy,
      groupId: encryptedTransaction.groupId,
    };

    // Validate the decrypted transaction
    if (
      !decryptedTransaction.title ||
      decryptedTransaction.amount === undefined ||
      decryptedTransaction.amount === null
    ) {
      throw new Error('Decrypted transaction missing required fields');
    }

    return decryptedTransaction;
  } catch (error) {
    console.error('Error decrypting transaction:', error);
    throw new Error('Failed to decrypt transaction');
  }
};

/**
 * Encrypts the group key for each user using their public key
 */
export const encryptGroupKeyForUsers = (
  groupKey: string,
  userPublicKeys: { [uid: string]: string }
): EncryptedGroupKey => {
  try {
    const encryptedKeys: EncryptedGroupKey = {};

    Object.entries(userPublicKeys).forEach(([uid, publicKey]) => {
      encryptedKeys[uid] = encryptWithPublicKey(groupKey, publicKey);
    });

    return encryptedKeys;
  } catch (error) {
    console.error('Error encrypting group key for users:', error);
    throw new Error('Failed to encrypt group key for users');
  }
};

/**
 * Decrypts the group key using the current user's private key
 */
export const decryptGroupKey = async (encryptedGroupKey: string): Promise<string> => {
  try {
    const privateKey = await getPrivateKey();
    if (!privateKey) {
      throw new Error('Private key not found');
    }

    return decryptWithPrivateKey(encryptedGroupKey, privateKey);
  } catch (error) {
    console.error('Error decrypting group key:', error);
    throw new Error('Failed to decrypt group key');
  }
};

/**
 * Cleans up stored keys (useful for logout or account deletion)
 */
export const cleanupKeys = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY);
    await SecureStore.deleteItemAsync(PUBLIC_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error cleaning up keys:', error);
    throw new Error('Failed to cleanup keys');
  }
};

/**
 * Validates that a transaction object contains only allowed fields
 * This helps enforce the field-level encryption strategy
 */
export const validateTransactionFields = (data: any): boolean => {
  return isValidTransactionFields(data);
};
