import { auth, firestore } from '@/config/firebase';
import { User, UserLoginData, UserRegistrationData, UserResponse } from '@/types/user';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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
    const userData = {
      name,
      email,
      uid: response.user.uid,
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
        displayName: data?.name,
        email: data?.email,
      };
      return userData;
    }
    throw new Error('User not found');
  } catch (error) {
    throw new Error('Failed to update user');
  }
};
