import * as SecureStore from 'expo-secure-store';

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
