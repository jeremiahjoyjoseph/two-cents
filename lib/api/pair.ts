import { firestore } from '@/config/firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
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
  console.log('Checking for existing code for uid:', uid);

  // Start cleanup in background
  cleanupExpiredCodes(uid).catch(console.error);

  // Step 1: Check for existing unexpired and unused code
  const existingCode = await findExistingCode(uid);
  if (existingCode) {
    console.log('Found existing code:', existingCode);
    return existingCode;
  }

  console.log('No existing code found, generating new code');
  let code = generateRandomCode(6); // Initialize with first attempt
  let attempts = 1; // Start at 1 since we already generated once
  let isUnique = await isCodeUnique(code);

  // Keep generating codes until we find a unique one or hit max attempts
  while (!isUnique && attempts < MAX_ATTEMPTS) {
    code = generateRandomCode(6);
    isUnique = await isCodeUnique(code);
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique code after multiple attempts');
  }

  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(new Date(now.toDate().getTime() + 10 * 60 * 1000));

  console.log('Generated new code:', code);

  await setDoc(doc(firestore, 'pairCodes', code), {
    generatedBy: uid,
    createdAt: now,
    expiresAt,
    used: false,
  });

  return code;
};
