import { auth, firestore } from '@/config/firebase';
import { loginUser, registerUser, sendPasswordReset, updateUserData } from '@/lib/api/auth';
import { getGroupEncryptionKey as getGroupKeyFromAPI } from '@/lib/api/pair';
import { deletePersonalKey, getPersonalKey, hasPersonalKey, setPersonalKey } from '@/lib/utils';
import { User, UserLoginData, UserRegistrationData, UserResponse } from '@/types/user';
import * as Crypto from 'expo-crypto';
import {
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthReady: boolean;
  encryptionKey: string | null;
  login: (data: UserLoginData & { pin?: string }) => Promise<void>;
  register: (data: UserRegistrationData & { pin: string }) => Promise<UserResponse>;
  forgotPassword: (email: string) => Promise<void>;
  updateUser: (uid: string) => Promise<void>;
  updateLinkedGroupId: (groupId: string | null) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  getEncryptionKey: () => Promise<string | null>;
  refreshEncryptionKey: () => Promise<void>;
  regenerateEncryptionKey: () => Promise<void>;
  groupEncryptionKey: string | null;
  getGroupEncryptionKey: () => Promise<string | null>;
  // PIN verification
  isPINRequired: boolean;
  setIsPINRequired: (required: boolean) => void;
  verifyPIN: (pin: string) => Promise<boolean>;
  lastPINVerification: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [groupEncryptionKey, setGroupEncryptionKey] = useState<string | null>(null);
  const [isPINRequired, setIsPINRequired] = useState(false);
  const [lastPINVerification, setLastPINVerification] = useState<Date | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Force logout when encryption key is missing
  const forceLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setEncryptionKey(null);
    } catch (error) {
      console.error('Error during forced logout:', error);
    }
  };

  // Load encryption key from secure store
  const loadEncryptionKey = useCallback(async (uid: string, skipLogoutOnError = false, retryCount = 0): Promise<boolean> => {
    try {
      const keyExists = await hasPersonalKey(uid);
      if (!keyExists) {
        // Retry once after a short delay (in case SecureStore write is still in progress)
        if (retryCount === 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return loadEncryptionKey(uid, skipLogoutOnError, 1);
        }
        
        if (!skipLogoutOnError) {
          await forceLogout();
        }
        return false;
      }

      const key = await getPersonalKey(uid);
      if (!key) {
        if (!skipLogoutOnError) {
          await forceLogout();
        }
        return false;
      }

      setEncryptionKey(key);
      return true;
    } catch (error) {
      console.error('Error loading encryption key:', error);
      if (!skipLogoutOnError) {
        await forceLogout();
      }
      return false;
    }
  }, []);

  // Get encryption key with fallback
  const getEncryptionKey = async (): Promise<string | null> => {
    if (encryptionKey) {
      return encryptionKey;
    }

    if (!user?.uid) {
      return null;
    }

    // Fallback: try to load from secure store
    const success = await loadEncryptionKey(user.uid);
    if (success) {
      // Return the key directly from secure store since state update is async
      const key = await getPersonalKey(user.uid);
      return key;
    }
    return null;
  };

  // Refresh encryption key from secure store
  const refreshEncryptionKey = async (): Promise<void> => {
    if (!user?.uid) {
      return;
    }

    await loadEncryptionKey(user.uid);
  };

  // Regenerate encryption key (used after pairing)
  const regenerateEncryptionKey = async (): Promise<void> => {
    if (!user?.uid) {
      return;
    }

    try {
      // Generate new 32-byte encryption key
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const newEncryptionKey = Array.from(randomBytes, byte =>
        byte.toString(16).padStart(2, '0')
      ).join('');

      // Store new key in secure store
      await setPersonalKey(user.uid, newEncryptionKey);

      // Update context with new key
      setEncryptionKey(newEncryptionKey);
    } catch (error) {
      console.error('Error regenerating encryption key:', error);
      throw error;
    }
  };

  // Load group encryption key
  const loadGroupEncryptionKey = async (uid: string, groupId: string): Promise<boolean> => {
    try {
      const groupKey = await getGroupKeyFromAPI(uid, groupId);
      if (!groupKey) {
        return false;
      }
      setGroupEncryptionKey(groupKey);
      return true;
    } catch (error) {
      console.error('Error loading group encryption key:', error);
      return false;
    }
  };

  // Get group encryption key with fallback
  const getGroupEncryptionKey = async (): Promise<string | null> => {
    if (!user?.uid || !user.linkedGroupId) {
      return null;
    }

    if (groupEncryptionKey) {
      return groupEncryptionKey;
    }

    // Load key directly from API since state updates are async
    const groupKey = await getGroupKeyFromAPI(user.uid, user.linkedGroupId);
    if (groupKey) {
      setGroupEncryptionKey(groupKey);
    }
    return groupKey;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          let userData: User;

          if (userDoc.exists()) {
            userData = userDoc.data() as User;
          } else {
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              linkedGroupId: null,
            };
          }

          setUser(userData);

          // Load encryption key - this is critical for app access
          // Skip during registration to avoid race condition
          if (isRegistering) {
            return;
          }
          
          // Retry logic built into loadEncryptionKey handles race conditions
          const keyLoaded = await loadEncryptionKey(firebaseUser.uid);
          if (!keyLoaded) {
            // Key loading failed, user will be logged out
            return;
          }

          // Load group encryption key if user is linked to a group
          if (userData.linkedGroupId) {
            await loadGroupEncryptionKey(firebaseUser.uid, userData.linkedGroupId);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setEncryptionKey(null);
        }
      } else {
        setUser(null);
        setEncryptionKey(null);
        setLastPINVerification(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [loadEncryptionKey, isRegistering]);

  // Periodic PIN verification check (every 15 minutes)
  useEffect(() => {
    if (!user || !lastPINVerification) {
      return;
    }

    const PIN_VERIFICATION_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
    const CHECK_INTERVAL = 60 * 1000; // Check every minute

    const intervalId = setInterval(() => {
      const timeSinceLastVerification = Date.now() - lastPINVerification.getTime();
      
      if (timeSinceLastVerification > PIN_VERIFICATION_INTERVAL) {
        setIsPINRequired(true);
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [user, lastPINVerification]);

  const login = async (data: UserLoginData & { pin?: string }) => {
    await loginUser(data);
    // Note: Encryption key will be loaded automatically via onAuthStateChanged
    // Update PIN verification timestamp on successful login
    setLastPINVerification(new Date());
  };

  const register = async (data: UserRegistrationData & { pin: string }) => {
    try {
      setIsRegistering(true);
      const result = await registerUser(data);
      
      // Explicitly set the encryption key in state
      if (result.personalKey) {
        setEncryptionKey(result.personalKey);
      }
      
      // Set initial PIN verification timestamp
      setLastPINVerification(new Date());
      return result;
    } finally {
      // Clear registration flag after a delay to ensure onAuthStateChanged completes
      setTimeout(() => setIsRegistering(false), 1000);
    }
  };

  // Verify PIN by attempting to decrypt the encryption key
  const verifyPIN = async (pin: string): Promise<boolean> => {
    try {
      if (!user?.uid) {
        console.error('No user UID available for PIN verification');
        return false;
      }

      // Import encryption utilities
      const { getEncryptedPersonalKeyFromCloud, decryptPersonalKey } = await import('@/lib/utils');
      
      // Fetch encrypted key from cloud
      const encryptedKeyData = await getEncryptedPersonalKeyFromCloud(user.uid);
      if (!encryptedKeyData) {
        console.error('Encrypted key not found');
        return false;
      }

      // Try to decrypt with provided PIN
      const decryptedKey = await decryptPersonalKey(encryptedKeyData, pin);
      
      // If decryption succeeds, update verification timestamp
      if (decryptedKey) {
        setLastPINVerification(new Date());
        setIsPINRequired(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PIN verification failed:', error);
      return false;
    }
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  const updateUser = async (uid: string) => {
    try {
      if (!user) throw new Error('No user logged in');
      const userData = await updateUserData(uid);
      setUser({ ...userData });
    } catch {
      throw new Error('Failed to update user');
    }
  };

  const updateLinkedGroupId = async (groupId: string | null) => {
    if (user) {
      setUser({ ...user, linkedGroupId: groupId });

      // Load group encryption key if linking to a group
      if (groupId) {
        await loadGroupEncryptionKey(user.uid, groupId);
      } else {
        // Clear group encryption key if unlinking
        setGroupEncryptionKey(null);
      }
    }
  };

  const deleteAccount = async (password?: string) => {
    try {
      if (!user) throw new Error('No user logged in');
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      // Step 1: Delete all user's personal transactions
      const { deleteAllTransactions } = await import('@/lib/api/transactions');
      await deleteAllTransactions(user.uid, null);

      // Step 2: Delete all user's custom categories
      const { deleteAllUserCategories } = await import('@/lib/api/categories');
      await deleteAllUserCategories(user.uid);

      // Step 3: If user is in a group, delete group data
      if (user.linkedGroupId) {
        // Get the group document to find the other user
        const groupDoc = await getDoc(doc(firestore, 'groups', user.linkedGroupId));
        if (groupDoc.exists()) {
          const groupData = groupDoc.data();
          const otherUserId = groupData.userIds.find((id: string) => id !== user.uid);

          // Delete all group transactions
          await deleteAllTransactions(user.uid, user.linkedGroupId);

          // Update partner's user document to remove linkedGroupId
          if (otherUserId) {
            const partnerRef = doc(firestore, 'users', otherUserId);
            await updateDoc(partnerRef, { linkedGroupId: null });
          }

          // Delete the group document
          await deleteDoc(doc(firestore, 'groups', user.linkedGroupId));
        }
      }

      // Step 4: Re-authenticate if password is provided
      if (password && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
      }

      // Step 5: Delete user document from Firestore
      await deleteDoc(doc(firestore, 'users', user.uid));

      // Step 6: Delete encryption key from secure store
      await deletePersonalKey(user.uid);

      // Step 7: Delete the Firebase Auth user
      await deleteUser(currentUser);

      setUser(null);
      setEncryptionKey(null);
      setGroupEncryptionKey(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error instanceof Error && error.message.includes('requires-recent-login')) {
        throw new Error('Please re-authenticate to delete your account');
      }
      throw new Error('Failed to delete account');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthReady,
        encryptionKey,
        groupEncryptionKey,
        login,
        register,
        forgotPassword,
        updateUser,
        updateLinkedGroupId,
        deleteAccount,
        getEncryptionKey,
        refreshEncryptionKey,
        regenerateEncryptionKey,
        getGroupEncryptionKey,
        isPINRequired,
        setIsPINRequired,
        verifyPIN,
        lastPINVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
