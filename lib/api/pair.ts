import { firestore } from '@/config/firebase';
import { deleteAllTransactions } from '@/lib/api/transactions';
import { getPersonalKey } from '@/lib/utils';
import { encryptWithAES, decryptWithAES, generateEncryptionKey } from '@/lib/utils/aes';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_ATTEMPTS = 5; // Prevent infinite loops

/**
 * Encrypt a group key using a user's personal key with AES-256-CBC
 */
const encryptGroupKey = async (groupKey: string, personalKey: string): Promise<string> => {
  return await encryptWithAES(groupKey, personalKey);
};

/**
 * Decrypt a group key using a user's personal key with AES-256-CBC
 */
const decryptGroupKey = async (encryptedGroupKey: string, personalKey: string): Promise<string> => {
  return await decryptWithAES(encryptedGroupKey, personalKey);
};

/**
 * Get and decrypt the group encryption key for a user
 */
export const getGroupEncryptionKey = async (
  uid: string,
  groupId: string
): Promise<string | null> => {
  try {
    console.log('Getting group encryption key...');

    // Get group document
    const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
    if (!groupDoc.exists()) {
      console.error('Group not found');
      return null;
    }

    const groupData = groupDoc.data();
    const encryptedKeys = groupData.encryptedKeys || {};
    const userEncryptedKey = encryptedKeys[uid];

    if (!userEncryptedKey) {
      console.error('User encrypted group key not found');
      return null;
    }

    // Get user's personal key
    const personalKey = await getPersonalKey(uid);
    if (!personalKey) {
      console.error('Personal encryption key not found');
      return null;
    }

    // Decrypt group key
    const decryptedGroupKey = await decryptGroupKey(userEncryptedKey, personalKey);
    console.log('✅ Group encryption key retrieved');

    return decryptedGroupKey;
  } catch (error) {
    console.error('❌ Error getting group encryption key:', error);
    return null;
  }
};

/**
 * Clear all transactions for a user (used when pairing up)
 * This is necessary because users can't decrypt each other's transactions
 */
const clearUserTransactions = async (userId: string): Promise<void> => {
  try {
    console.log('Clearing user transactions...');
    await deleteAllTransactions(userId, null);
    console.log('✅ User transactions cleared');
  } catch (error) {
    console.error('❌ Error clearing transactions:', error);
    throw error;
  }
};

const generateRandomCode = (length: number): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    result += CHARACTERS[randomIndex];
  }
  return result;
};

const isCodeUnique = async (code: string): Promise<boolean> => {
  const codeDoc = await getDoc(doc(firestore, 'pairCodes', code));
  return !codeDoc.exists();
};

const cleanupExpiredCodes = async (uid: string) => {
  try {
    const now = Timestamp.now();
    const codesRef = collection(firestore, 'pairCodes');
    const q = query(codesRef, where('generatedBy', '==', uid), where('expiresAt', '<', now));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      console.log(`Cleaning up ${querySnapshot.size} expired codes...`);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log('✅ Expired codes cleaned up');
    }
  } catch (error) {
    console.log('Error cleaning up expired codes:', error);
  }
};

const findExistingCode = async (uid: string): Promise<string | null> => {
  try {
    const now = Timestamp.now();
    const codesRef = collection(firestore, 'pairCodes');
    const q = query(
      codesRef,
      where('generatedBy', '==', uid),
      where('used', '==', false),
      where('expiresAt', '>', now)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
  } catch {
    // No existing codes found
  }
  return null;
};

export const generatePairCode = async (uid: string) => {
  console.log('Generating pair code...');

  // Start cleanup in background
  cleanupExpiredCodes(uid).catch(() => {});

  // Check for existing unexpired and unused code
  const existingCode = await findExistingCode(uid);
  if (existingCode) {
    console.log('✅ Using existing valid code');
    return existingCode;
  }

  // Generate new unique code
  let code = generateRandomCode(6);
  let attempts = 1;
  let isUnique = await isCodeUnique(code);

  while (!isUnique && attempts < MAX_ATTEMPTS) {
    code = generateRandomCode(6);
    isUnique = await isCodeUnique(code);
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique code after multiple attempts');
  }

  // Generate group encryption key using AES utility
  console.log('Creating group encryption key...');
  const groupKey = await generateEncryptionKey();

  // Get user's personal key to encrypt the group key
  const personalKey = await getPersonalKey(uid);
  if (!personalKey) {
    throw new Error('Personal encryption key not found');
  }

  // Encrypt group key with user's personal key using AES
  const encryptedGroupKey = await encryptGroupKey(groupKey, personalKey);

  // Create group document
  const groupRef = await addDoc(collection(firestore, 'groups'), {
    userIds: [uid],
    createdAt: Timestamp.now(),
    isLinked: false,
    groupKey: groupKey, // Store raw key temporarily for User B
    encryptedKeys: {
      [uid]: encryptedGroupKey, // User A's encrypted version
    },
  });

  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(new Date(now.toDate().getTime() + 10 * 60 * 1000));

  await setDoc(doc(firestore, 'pairCodes', code), {
    generatedBy: uid,
    groupId: groupRef.id,
    createdAt: now,
    expiresAt,
    used: false,
  });

  console.log('✅ Pair code generated successfully');
  return code;
};

export const redeemPartnerCode = async (
  uid: string,
  code: string,
  updateLinkedGroupId: (groupId: string | null) => void
): Promise<string> => {
  console.log('Redeeming partner code...');

  try {
    // Validate the pair code
    const codeDoc = await getDoc(doc(firestore, 'pairCodes', code));

    if (!codeDoc.exists()) {
      throw new Error('Invalid partner code');
    }

    const codeData = codeDoc.data();
    const now = Timestamp.now();

    if (codeData.expiresAt.toDate() < now.toDate()) {
      throw new Error('Partner code has expired');
    }

    if (codeData.used) {
      throw new Error('Partner code has already been used');
    }

    // Get the existing group
    const groupId = codeData.groupId;
    const groupDoc = await getDoc(doc(firestore, 'groups', groupId));

    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();
    const rawGroupKey = groupData.groupKey;
    const encryptedKeys = groupData.encryptedKeys || {};

    if (!rawGroupKey) {
      throw new Error('Group key not found - group may already be linked');
    }

    // Get User B's personal key
    const personalKey = await getPersonalKey(uid);
    if (!personalKey) {
      throw new Error('Personal encryption key not found');
    }

    // Encrypt the raw group key with User B's personal key
    console.log('Encrypting group key for User B...');
    const userBEncryptedKey = await encryptGroupKey(rawGroupKey, personalKey);

    // Update group with both users and both encrypted keys
    console.log('Linking users to group...');
    const batch = writeBatch(firestore);

    // Update group document - add User B's encrypted key and remove raw key
    batch.update(doc(firestore, 'groups', groupId), {
      userIds: [codeData.generatedBy, uid],
      isLinked: true,
      encryptedKeys: {
        ...encryptedKeys,
        [uid]: userBEncryptedKey, // Add User B's encrypted version
      },
      // Remove raw group key for security after User B has encrypted it
      groupKey: null,
    });

    // Update both users with the group ID
    batch.update(doc(firestore, 'users', codeData.generatedBy), {
      linkedGroupId: groupId,
    });

    batch.update(doc(firestore, 'users', uid), {
      linkedGroupId: groupId,
    });

    // Clear all transactions (both users start fresh due to encryption key mismatch)
    console.log('Clearing transactions for fresh start...');
    await Promise.all([clearUserTransactions(codeData.generatedBy), clearUserTransactions(uid)]);

    // Delete the pair code
    batch.delete(doc(firestore, 'pairCodes', code));

    // Execute the batch
    await batch.commit();
    console.log('✅ Partner code redeemed successfully');

    // Update user data in auth context and load group encryption key
    await updateLinkedGroupId(groupId);

    return groupId;
  } catch (error) {
    console.error('❌ Error redeeming partner code:', error);
    throw error;
  }
};

/**
 * Unlinks a partner group, deletes it, and clears all group transactions
 */
export const unlinkPartnerAndTransferTransactions = async (
  userA: string,
  userB: string,
  groupId: string
) => {
  console.log('Unlinking partners...');

  const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
  if (!groupDoc.exists()) {
    throw new Error('Group not found');
  }

  const transactionSnap = await getDocs(collection(firestore, 'groups', groupId, 'transactions'));
  const batch = writeBatch(firestore);

  // Remove groupId from both users
  batch.update(doc(firestore, 'users', userA), { linkedGroupId: null });
  batch.update(doc(firestore, 'users', userB), { linkedGroupId: null });

  // Clear all group transactions
  transactionSnap.forEach(docSnap => {
    batch.delete(docSnap.ref);
  });

  // Delete the group doc
  batch.delete(doc(firestore, 'groups', groupId));

  await batch.commit();
  console.log('✅ Partners unlinked successfully');
};

/**
 * Handles the complete process of unlinking a partner
 */
export const unlinkPartner = async (
  uid: string,
  updateLinkedGroupId: (groupId: string | null) => Promise<void>
) => {
  if (!uid) {
    throw new Error('User not authenticated');
  }

  // Get the user document to find the linked group
  const userDoc = await getDoc(doc(firestore, 'users', uid));
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  if (!userData.linkedGroupId) {
    throw new Error('User not linked to a group');
  }

  // Get the group document to find the other user
  const groupDoc = await getDoc(doc(firestore, 'groups', userData.linkedGroupId));
  if (!groupDoc.exists()) {
    throw new Error('Group not found');
  }

  const groupData = groupDoc.data();
  const otherUserId = groupData.userIds.find((id: string) => id !== uid);

  await unlinkPartnerAndTransferTransactions(uid, otherUserId, userData.linkedGroupId);

  // Update the user context and clear group encryption key
  await updateLinkedGroupId(null);

  return otherUserId;
};
