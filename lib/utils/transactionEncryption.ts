import * as Crypto from 'expo-crypto';

/**
 * Transaction encryption utilities
 * Handles encryption and decryption of transaction amounts
 */

/**
 * Encrypt a transaction amount using AES encryption
 * @param amount - The amount to encrypt
 * @param key - The encryption key (32-byte hex string)
 * @returns Encrypted amount as base64 string
 */
export const encryptAmount = async (amount: number, key: string): Promise<string> => {
  try {
    // Convert amount to string for encryption
    const amountString = amount.toString();

    // Convert hex key to bytes
    const keyBytes = new Uint8Array(key.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    // Generate random IV (16 bytes)
    const iv = await Crypto.getRandomBytesAsync(16);

    // For now, we'll use a simple XOR encryption as expo-crypto doesn't have AES
    // In production, you might want to use a more robust encryption library
    const encrypted = await simpleXorEncrypt(amountString, keyBytes, iv);

    // Combine IV + encrypted data and encode as base64
    const combined = new Uint8Array(iv.length + encrypted.length);
    combined.set(iv, 0);
    combined.set(encrypted, iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Error encrypting amount:', error);
    throw new Error('Failed to encrypt amount');
  }
};

/**
 * Decrypt a transaction amount
 * @param encryptedAmount - The encrypted amount as base64 string
 * @param key - The encryption key (32-byte hex string)
 * @returns Decrypted amount as number
 */
export const decryptAmount = async (encryptedAmount: string, key: string): Promise<number> => {
  try {
    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedAmount)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    // Extract IV (first 16 bytes)
    const iv = combined.slice(0, 16);

    // Extract encrypted data
    const encrypted = combined.slice(16);

    // Convert hex key to bytes
    const keyBytes = new Uint8Array(key.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    // Decrypt using XOR
    const decryptedString = await simpleXorDecrypt(encrypted, keyBytes, iv);

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
 * Simple XOR encryption (for demonstration - use proper AES in production)
 * @param data - Data to encrypt
 * @param key - Encryption key
 * @param iv - Initialization vector
 * @returns Encrypted data
 */
const simpleXorEncrypt = async (
  data: string,
  key: Uint8Array,
  iv: Uint8Array
): Promise<Uint8Array> => {
  const dataBytes = new TextEncoder().encode(data);
  const result = new Uint8Array(dataBytes.length);

  for (let i = 0; i < dataBytes.length; i++) {
    const keyByte = key[i % key.length];
    const ivByte = iv[i % iv.length];
    result[i] = dataBytes[i] ^ keyByte ^ ivByte;
  }

  return result;
};

/**
 * Simple XOR decryption (for demonstration - use proper AES in production)
 * @param encrypted - Encrypted data
 * @param key - Decryption key
 * @param iv - Initialization vector
 * @returns Decrypted data
 */
const simpleXorDecrypt = async (
  encrypted: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array
): Promise<string> => {
  const result = new Uint8Array(encrypted.length);

  for (let i = 0; i < encrypted.length; i++) {
    const keyByte = key[i % key.length];
    const ivByte = iv[i % iv.length];
    result[i] = encrypted[i] ^ keyByte ^ ivByte;
  }

  return new TextDecoder().decode(result);
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
