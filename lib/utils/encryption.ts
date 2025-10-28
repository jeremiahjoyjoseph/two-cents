import { firestore } from '@/config/firebase';
import * as SecureStore from 'expo-secure-store';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { decryptWithAES, deriveKEK, encryptWithAES, generateSalt } from './aes';

/**
 * Encryption utilities for secure key management
 */

const PERSONAL_KEY_STORAGE_KEY = 'personal_encryption_key';

/**
 * Get the personal encryption key from secure store
 * @param uid - User ID to construct the storage key
 * @returns The encryption key as a string, or null if not found
 */
export const getPersonalKey = async (uid: string): Promise<string | null> => {
  try {
    const key = await SecureStore.getItemAsync(`${PERSONAL_KEY_STORAGE_KEY}_${uid}`);
    return key;
  } catch (error) {
    console.error('Failed to retrieve personal encryption key:', error);
    return null;
  }
};

/**
 * Store the personal encryption key in secure store
 * @param uid - User ID to construct the storage key
 * @param key - The encryption key to store
 * @returns Promise that resolves when key is stored
 */
export const setPersonalKey = async (uid: string, key: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(`${PERSONAL_KEY_STORAGE_KEY}_${uid}`, key);
  } catch (error) {
    console.error('Failed to store personal encryption key:', error);
    throw error;
  }
};

/**
 * Delete the personal encryption key from secure store
 * @param uid - User ID to construct the storage key
 * @returns Promise that resolves when key is deleted
 */
export const deletePersonalKey = async (uid: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(`${PERSONAL_KEY_STORAGE_KEY}_${uid}`);
  } catch (error) {
    console.error('Failed to delete personal encryption key:', error);
    throw error;
  }
};

/**
 * Check if personal encryption key exists in secure store
 * @param uid - User ID to construct the storage key
 * @returns Promise that resolves to true if key exists, false otherwise
 */
export const hasPersonalKey = async (uid: string): Promise<boolean> => {
  try {
    const key = await SecureStore.getItemAsync(`${PERSONAL_KEY_STORAGE_KEY}_${uid}`);
    return key !== null;
  } catch (error) {
    console.error('Failed to check personal encryption key:', error);
    return false;
  }
};

/**
 * Cloud storage functions for encrypted personal keys
 */

export interface EncryptedKeyData {
  encryptedPersonalKey: string;
  keySalt: string;
}

/**
 * Store encrypted personal key in Firestore
 * @param uid - User ID
 * @param encryptedKey - AES-encrypted personal key
 * @param salt - Salt used for PBKDF2 key derivation
 */
export const storeEncryptedPersonalKeyInCloud = async (
  uid: string,
  encryptedKey: string,
  salt: string
): Promise<void> => {
  try {
    const userRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Update existing user document
      await updateDoc(userRef, {
        encryptedPersonalKey: encryptedKey,
        keySalt: salt,
      });
    } else {
      // This shouldn't happen, but handle it gracefully
      console.warn('User document does not exist, creating with encrypted key');
      await setDoc(userRef, {
        uid,
        encryptedPersonalKey: encryptedKey,
        keySalt: salt,
      });
    }
    console.log('✅ Encrypted personal key stored in cloud');
  } catch (error) {
    console.error('Failed to store encrypted personal key in cloud:', error);
    throw error;
  }
};

/**
 * Get encrypted personal key from Firestore
 * @param uid - User ID
 * @returns Encrypted key data or null if not found
 */
export const getEncryptedPersonalKeyFromCloud = async (
  uid: string
): Promise<EncryptedKeyData | null> => {
  try {
    const userRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('User document not found');
      return null;
    }

    const data = userDoc.data();
    if (!data.encryptedPersonalKey || !data.keySalt) {
      console.error('Encrypted personal key or salt not found in user document');
      return null;
    }

    return {
      encryptedPersonalKey: data.encryptedPersonalKey,
      keySalt: data.keySalt,
    };
  } catch (error) {
    console.error('Failed to get encrypted personal key from cloud:', error);
    return null;
  }
};

/**
 * Encrypt personal key with PIN-derived KEK
 * @param personalKey - The raw personal encryption key (hex string)
 * @param pin - User's 6-digit PIN
 * @returns Object with encrypted key and salt
 */
export const encryptPersonalKey = async (
  personalKey: string,
  pin: string
): Promise<EncryptedKeyData> => {
  try {
    // Generate salt for PBKDF2
    const salt = await generateSalt();

    // Derive KEK from PIN
    const kek = await deriveKEK(pin, salt);

    // Encrypt personal key with KEK
    const encryptedKey = await encryptWithAES(personalKey, kek);

    return {
      encryptedPersonalKey: encryptedKey,
      keySalt: salt,
    };
  } catch (error) {
    console.error('Failed to encrypt personal key:', error);
    throw new Error('Failed to encrypt personal key');
  }
};

/**
 * Decrypt personal key using PIN-derived KEK
 * @param encryptedData - Encrypted key data from cloud
 * @param pin - User's 6-digit PIN
 * @returns Decrypted personal key (hex string)
 */
export const decryptPersonalKey = async (
  encryptedData: EncryptedKeyData,
  pin: string
): Promise<string> => {
  try {
    // Derive KEK from PIN using stored salt
    const kek = await deriveKEK(pin, encryptedData.keySalt);

    // Decrypt personal key with KEK
    const personalKey = await decryptWithAES(encryptedData.encryptedPersonalKey, kek);

    return personalKey;
  } catch (error) {
    console.error('Failed to decrypt personal key:', error);
    throw new Error('Failed to decrypt personal key - incorrect PIN or corrupted data');
  }
};

/**
 * Validate PIN format
 * @param pin - PIN to validate
 * @returns True if valid, false otherwise
 */
export const validatePIN = (pin: string): boolean => {
  // Must be exactly 6 digits
  return /^\d{6}$/.test(pin);
};
