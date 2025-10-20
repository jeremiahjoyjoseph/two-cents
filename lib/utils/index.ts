/**
 * Utility functions for the application
 */

export { 
  deletePersonalKey, 
  getPersonalKey, 
  hasPersonalKey, 
  setPersonalKey,
  encryptPersonalKey,
  decryptPersonalKey,
  storeEncryptedPersonalKeyInCloud,
  getEncryptedPersonalKeyFromCloud,
  type EncryptedKeyData
} from './encryption';
export { decryptAmount, encryptAmount, isEncrypted } from './transactionEncryption';

// Add other utility exports here as needed
// export { otherUtility } from './otherUtility';
