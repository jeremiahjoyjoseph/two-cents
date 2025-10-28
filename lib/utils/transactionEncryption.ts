import { decryptWithAES, encryptWithAES } from './aes';

/**
 * Transaction encryption utilities
 * Handles encryption and decryption of transaction amounts using AES-256-CBC
 */

/**
 * Encrypt a transaction amount using AES-256-CBC encryption
 * @param amount - The amount to encrypt
 * @param key - The encryption key (32-byte hex string)
 * @returns Encrypted amount as base64 string
 */
export const encryptAmount = async (amount: number, key: string): Promise<string> => {
  try {
    // Convert amount to string for encryption
    const amountString = amount.toString();

    // Use AES encryption
    return await encryptWithAES(amountString, key);
  } catch (error) {
    console.error('Error encrypting amount:', error);
    throw new Error('Failed to encrypt amount');
  }
};

/**
 * Decrypt a transaction amount using AES-256-CBC
 * @param encryptedAmount - The encrypted amount as base64 string
 * @param key - The encryption key (32-byte hex string)
 * @returns Decrypted amount as number
 */
export const decryptAmount = async (encryptedAmount: string, key: string): Promise<number> => {
  try {
    // Use AES decryption
    const decryptedString = await decryptWithAES(encryptedAmount, key);

    // Convert back to number
    const amount = parseFloat(decryptedString);

    if (isNaN(amount)) {
      throw new Error('Invalid decrypted amount');
    }

    return amount;
  } catch (error) {
    console.error('Error decrypting amount:', error);
    throw new Error('Failed to decrypt amount');
  }
};

/**
 * Check if a string is encrypted (base64 format)
 * @param value - Value to check
 * @returns True if encrypted, false otherwise
 */
export const isEncrypted = (value: string): boolean => {
  try {
    // Check if it's valid base64
    const decoded = atob(value);
    // Check if it has the expected length (IV + some data)
    return decoded.length >= 16;
  } catch {
    return false;
  }
};
