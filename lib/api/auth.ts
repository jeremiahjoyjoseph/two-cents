import { auth, firestore } from '@/config/firebase';
import { initializeDefaultCategories } from '@/lib/api/categories';
import {
  decryptPersonalKey,
  deletePersonalKey,
  encryptPersonalKey,
  getEncryptedPersonalKeyFromCloud,
  getPersonalKey,
  hasPersonalKey,
  setPersonalKey,
  storeEncryptedPersonalKeyInCloud
} from '@/lib/utils';
import { generateEncryptionKey } from '@/lib/utils/aes';
import { User, UserLoginData, UserRegistrationData, UserResponse } from '@/types/user';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const loginUser = async ({ email, password, pin }: UserLoginData & { pin?: string }) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Authenticate with Firebase
    const response = await signInWithEmailAndPassword(auth, email, password);
    const uid = response.user.uid;
    
    // Check if personal key is already cached in device
    const cachedKey = await getPersonalKey(uid);
    if (cachedKey) {
      return;
    }
    
    // If not cached, require PIN to decrypt from cloud
    if (!pin) {
      throw new Error('PIN_REQUIRED');
    }
    
    // Fetch encrypted personal key from Firestore
    const encryptedKeyData = await getEncryptedPersonalKeyFromCloud(uid);
    
    if (!encryptedKeyData) {
      throw new Error('Encryption key not found. Please contact support.');
    }
    
    // Decrypt personal key using PIN
    const personalKey = await decryptPersonalKey(encryptedKeyData, pin);
    
    // Store decrypted key in local SecureStore for fast access
    await setPersonalKey(uid, personalKey);
    
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('Login error:', error.code, error.message);
      
      // Handle specific Firebase authentication errors
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email address. Please sign up first.');
        case 'auth/wrong-password':
          throw new Error('Incorrect password. Please try again.');
        case 'auth/invalid-email':
          throw new Error('Invalid email address. Please check and try again.');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled. Please contact support.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection and try again.');
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        default:
          throw new Error('Login failed. Please try again.');
      }
    }
    throw error;
  }
};

export const registerUser = async ({
  email,
  password,
  name,
  pin,
}: UserRegistrationData & { pin: string }): Promise<UserResponse & { personalKey: string }> => {
  try {
    const response = await createUserWithEmailAndPassword(auth, email, password);
    const uid = response.user.uid;

    // Generate a 32-byte personal encryption key using AES utility
    const personalKey = await generateEncryptionKey();

    // Encrypt personal key with PIN-derived KEK
    const encryptedKeyData = await encryptPersonalKey(personalKey, pin);

    // Store encrypted key in Firestore (cloud)
    await storeEncryptedPersonalKeyInCloud(uid, encryptedKeyData.encryptedPersonalKey, encryptedKeyData.keySalt);

    // Also store decrypted key locally in SecureStore for fast access
    await setPersonalKey(uid, personalKey);

    const userData = {
      name,
      email,
      uid,
      createdAt: new Date().toISOString(),
    };
    
    // Note: User document is created by storeEncryptedPersonalKeyInCloud or we update it here
    const userRef = doc(firestore, 'users', uid);
    await setDoc(userRef, userData, { merge: true });
    
    // Initialize default categories for the new user
    await initializeDefaultCategories(uid);
    
    return { success: true, user: userData, status: 200, personalKey };
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('Register error:', error.code, error.message);
      
      // Handle specific Firebase authentication errors
      switch (error.code) {
        case 'auth/weak-password':
          throw new Error('Password should be at least 6 characters. Please choose a stronger password.');
        case 'auth/email-already-in-use':
          throw new Error('An account with this email already exists. Please sign in or use a different email.');
        case 'auth/invalid-email':
          throw new Error('Invalid email address. Please check and try again.');
        case 'auth/operation-not-allowed':
          throw new Error('Registration is currently disabled. Please contact support.');
        case 'auth/too-many-requests':
          throw new Error('Too many requests. Please try again later.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection and try again.');
        default:
          throw new Error('Registration failed. Please try again.');
      }
    }
    throw error;
  }
};

export const updateUserData = async (uid: string): Promise<User> => {
  try {
    const docRef = doc(firestore, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const userData: User = {
        uid: data?.uid,
        name: data?.name,
        email: data?.email,
        linkedGroupId: data?.linkedGroupId,
        createdAt: data?.createdAt,
      };
      return userData;
    }
    throw new Error('User not found');
  } catch {
    throw new Error('Failed to update user');
  }
};

// Helper function to get encryption key from secure store
export const getEncryptionKey = async (uid: string): Promise<string | null> => {
  return await getPersonalKey(uid);
};

// Helper function to delete encryption key from secure store (useful for logout)
export const deleteEncryptionKey = async (uid: string): Promise<void> => {
  await deletePersonalKey(uid);
};

// Helper function to verify if encryption key exists in secure store
export const verifyEncryptionKey = async (uid: string): Promise<boolean> => {
  const exists = await hasPersonalKey(uid);
  console.log(`Encryption key exists for user ${uid}:`, exists);
  if (exists) {
    const key = await getPersonalKey(uid);
    console.log('Key length:', key?.length || 0, 'characters');
    console.log(
      'Key preview:',
      key?.substring(0, 8) + '...' + key?.substring((key?.length || 0) - 8)
    );
  }
  return exists;
};

// Forgot password functionality
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('Password reset error:', error.code, error.message);
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later');
      }
    }
    throw new Error('Failed to send password reset email');
  }
};
