import { firestore } from '@/config/firebase';
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
    console.log('Found expired codes:', querySnapshot.size);

    // Log details of each expired code
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log('Expired code:', {
        id: doc.id,
        generatedBy: data.generatedBy,
        expiresAt: data.expiresAt?.toDate(),
        used: data.used,
        createdAt: data.createdAt?.toDate(),
      });
    });

    const deletePromises = querySnapshot.docs.map(doc => {
      console.log('Attempting to delete code:', doc.id);
      return deleteDoc(doc.ref);
    });

    await Promise.all(deletePromises);
    console.log('Successfully deleted all expired codes');
  } catch (error) {
    console.log('Error cleaning up expired codes:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.log('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
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
  } catch (error) {
    console.log('No existing codes found, proceeding with new code generation');
  }
  return null;
};

export const generatePairCode = async (uid: string) => {
  console.log('[generatePairCode] Starting code generation for user:', uid);

  // Start cleanup in background
  cleanupExpiredCodes(uid).catch(error => {
    console.error('[generatePairCode] Error during cleanup:', error);
  });

  // Step 1: Check for existing unexpired and unused code
  console.log('[generatePairCode] Checking for existing valid code...');
  const existingCode = await findExistingCode(uid);
  if (existingCode) {
    console.log('[generatePairCode] Found existing valid code:', existingCode);
    return existingCode;
  }

  console.log('[generatePairCode] No existing code found, generating new code');
  let code = generateRandomCode(6); // Initialize with first attempt
  let attempts = 1; // Start at 1 since we already generated once
  let isUnique = await isCodeUnique(code);
  console.log('[generatePairCode] Initial code generation attempt:', { code, isUnique });

  // Keep generating codes until we find a unique one or hit max attempts
  while (!isUnique && attempts < MAX_ATTEMPTS) {
    code = generateRandomCode(6);
    isUnique = await isCodeUnique(code);
    attempts++;
    console.log('[generatePairCode] Retry attempt:', { attempt: attempts, code, isUnique });
  }

  if (!isUnique) {
    console.error(
      '[generatePairCode] Failed to generate unique code after',
      MAX_ATTEMPTS,
      'attempts'
    );
    throw new Error('Failed to generate unique code after multiple attempts');
  }

  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(new Date(now.toDate().getTime() + 10 * 60 * 1000));

  console.log('[generatePairCode] Generated new code:', {
    code,
    expiresAt: expiresAt.toDate(),
    generatedBy: uid,
  });

  await setDoc(doc(firestore, 'pairCodes', code), {
    generatedBy: uid,
    createdAt: now,
    expiresAt,
    used: false,
  });

  console.log('[generatePairCode] Successfully saved code to database');
  return code;
};

export const redeemPartnerCode = async (uid: string, code: string): Promise<string> => {
  console.log('[redeemPartnerCode] Starting code redemption:', { uid, code });

  try {
    // Step 1: Validate the pair code
    console.log('[redeemPartnerCode] Validating code...');
    const codeDoc = await getDoc(doc(firestore, 'pairCodes', code));

    if (!codeDoc.exists()) {
      console.error('[redeemPartnerCode] Invalid code - document does not exist');
      throw new Error('Invalid partner code');
    }

    const codeData = codeDoc.data();
    const now = Timestamp.now();
    console.log('[redeemPartnerCode] Code data:', {
      generatedBy: codeData.generatedBy,
      expiresAt: codeData.expiresAt.toDate(),
      used: codeData.used,
    });

    if (codeData.expiresAt.toDate() < now.toDate()) {
      console.error('[redeemPartnerCode] Code expired at:', codeData.expiresAt.toDate());
      throw new Error('Partner code has expired');
    }

    if (codeData.used) {
      console.error('[redeemPartnerCode] Code already used');
      throw new Error('Partner code has already been used');
    }

    // Step 2: Create a new group
    console.log('[redeemPartnerCode] Creating new group...');
    const groupRef = await addDoc(collection(firestore, 'groups'), {
      userIds: [codeData.generatedBy, uid],
      createdAt: now,
    });

    const groupId = groupRef.id;
    console.log('[redeemPartnerCode] Created new group:', groupId);

    // Step 3: Update both users with the group ID
    console.log('[redeemPartnerCode] Updating user documents...');
    const batch = writeBatch(firestore);

    // Update the code generator's user document
    batch.update(doc(firestore, 'users', codeData.generatedBy), {
      linkedGroupId: groupId,
    });

    // Update the redeemer's user document
    batch.update(doc(firestore, 'users', uid), {
      linkedGroupId: groupId,
    });

    // Step 4: Migrate transactions
    console.log('[redeemPartnerCode] Starting transaction migration...');
    const transactionsRef = collection(firestore, 'users', uid, 'transactions');
    const transactionsSnapshot = await getDocs(transactionsRef);
    console.log('[redeemPartnerCode] Found transactions to migrate:', transactionsSnapshot.size);

    // Create a new batch for transaction migration
    const transactionBatch = writeBatch(firestore);

    // Copy each transaction to the group
    transactionsSnapshot.docs.forEach(docSnapshot => {
      const transactionData = docSnapshot.data();
      const newTransactionRef = doc(collection(firestore, 'groups', groupId, 'transactions'));

      transactionBatch.set(newTransactionRef, {
        ...transactionData,
        createdBy: uid,
      });
    });

    // Step 5: Delete the pair code
    console.log('[redeemPartnerCode] Deleting used code...');
    batch.delete(doc(firestore, 'pairCodes', code));

    // Execute all batches
    console.log('[redeemPartnerCode] Committing all changes...');
    await Promise.all([batch.commit(), transactionBatch.commit()]);
    console.log('[redeemPartnerCode] Successfully completed all operations');

    return groupId;
  } catch (error) {
    console.error('[redeemPartnerCode] Error during redemption:', error);
    if (error instanceof Error) {
      console.error('[redeemPartnerCode] Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};
