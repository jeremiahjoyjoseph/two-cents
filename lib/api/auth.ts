import { auth, firestore } from '@/config/firebase';
import { 
  deletePersonalKey, 
  getPersonalKey, 
  hasPersonalKey, 
  setPersonalKey,
  encryptPersonalKey,
  decryptPersonalKey,
  storeEncryptedPersonalKeyInCloud,
  getEncryptedPersonalKeyFromCloud
} from '@/lib/utils';
import { generateEncryptionKey } from '@/lib/utils/aes';
import { User, UserLoginData, UserRegistrationData, UserResponse } from '@/types/user';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const loginUser = async ({ email, password }: UserLoginData) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Authenticate with Firebase
    const response = await signInWithEmailAndPassword(auth, email, password);
    const uid = response.user.uid;
    
    // Fetch encrypted personal key from Firestore
    console.log('🔑 Fetching encrypted personal key from cloud...');
    const encryptedKeyData = await getEncryptedPersonalKeyFromCloud(uid);
    
    if (!encryptedKeyData) {
      throw new Error('Encryption key not found. Please contact support.');
    }
    
    // Decrypt personal key using password
    console.log('🔓 Decrypting personal key...');
    const personalKey = await decryptPersonalKey(encryptedKeyData, password);
    
    // Store decrypted key in local SecureStore for fast access
    await setPersonalKey(uid, personalKey);
    console.log('✅ Personal key decrypted and cached locally');
    
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('Login error:', error.code, error.message);
      
      // Handle specific Firebase authentication errors
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email address');
        case 'auth/wrong-password':
          throw new Error('Incorrect password');
        case 'auth/invalid-email':
          throw new Error('Invalid email address');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled');
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection');
        default:
          throw new Error('Login failed: ' + error.message);
      }
    }
    throw error;
  }
};

export const registerUser = async ({
  email,
  password,
  name,
}: UserRegistrationData): Promise<UserResponse> => {
  try {
    const response = await createUserWithEmailAndPassword(auth, email, password);
    const uid = response.user.uid;

    // Generate a 32-byte personal encryption key using AES utility
    console.log('🔑 Generating personal encryption key...');
    const personalKey = await generateEncryptionKey();
    console.log('Key length:', personalKey.length, 'characters (64 hex = 32 bytes)');

    // Encrypt personal key with password-derived KEK
    console.log('🔐 Encrypting personal key with password...');
    const encryptedKeyData = await encryptPersonalKey(personalKey, password);

    // Store encrypted key in Firestore (cloud)
    console.log('☁️ Storing encrypted key in cloud...');
    await storeEncryptedPersonalKeyInCloud(uid, encryptedKeyData.encryptedPersonalKey, encryptedKeyData.keySalt);

    // Also store decrypted key locally in SecureStore for fast access
    await setPersonalKey(uid, personalKey);
    console.log('✅ Personal key stored locally and in cloud');

    const userData = {
      name,
      email,
      uid,
      createdAt: new Date().toISOString(),
    };
    
    // Note: User document is created by storeEncryptedPersonalKeyInCloud or we update it here
    const userRef = doc(firestore, 'users', uid);
    await setDoc(userRef, userData, { merge: true });
    
    return { success: true, user: userData, status: 200 };
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('Register error:', error.code, error.message);
      
      // Handle specific Firebase authentication errors
      switch (error.code) {
        case 'auth/weak-password':
          throw new Error('Password should be at least 6 characters');
        case 'auth/email-already-in-use':
          throw new Error('An account with this email already exists');
        case 'auth/invalid-email':
          throw new Error('Invalid email address');
        case 'auth/operation-not-allowed':
          throw new Error('Email/password accounts are not enabled');
        case 'auth/too-many-requests':
          throw new Error('Too many requests. Please try again later');
        default:
          throw new Error('Registration failed: ' + error.message);
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
