import { auth, firestore } from '@/config/firebase';
import { deletePersonalKey, getPersonalKey, hasPersonalKey, setPersonalKey } from '@/lib/utils';
import { User, UserLoginData, UserRegistrationData, UserResponse } from '@/types/user';
import * as Crypto from 'expo-crypto';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const loginUser = async ({ email, password }: UserLoginData) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('Login error:', error.code, error.message);
    }
    throw new Error('Login failed');
  }
};

export const registerUser = async ({
  email,
  password,
  name,
}: UserRegistrationData): Promise<UserResponse> => {
  try {
    const response = await createUserWithEmailAndPassword(auth, email, password);

    // Generate a 32-byte encryption key using expo-crypto
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const encryptionKey = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    );

    // Log the encryption key for testing
    console.log('Generated encryption key:', encryptionKey);
    console.log('Key length:', encryptionKey.length, 'characters');

    // Store encryption key securely on device
    await setPersonalKey(response.user.uid, encryptionKey);

    const userData = {
      name,
      email,
      uid: response.user.uid,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(firestore, 'users', response.user.uid), userData);
    return { success: true, user: userData, status: 200 };
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('Register error:', error.code, error.message);
    }
    throw new Error('Registration failed');
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
