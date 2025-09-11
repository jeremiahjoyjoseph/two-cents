import { auth, firestore } from '@/config/firebase';
import { loginUser, registerUser, updateUserData } from '@/lib/api/auth';
import {
  getGroupEncryptionKey as getGroupKeyFromAPI,
  unlinkPartnerAndTransferTransactions,
} from '@/lib/api/pair';
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
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthReady: boolean;
  encryptionKey: string | null;
  login: (data: UserLoginData) => Promise<void>;
  register: (data: UserRegistrationData) => Promise<UserResponse>;
  updateUser: (uid: string) => Promise<void>;
  updateLinkedGroupId: (groupId: string | null) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  getEncryptionKey: () => Promise<string | null>;
  refreshEncryptionKey: () => Promise<void>;
  regenerateEncryptionKey: () => Promise<void>;
  groupEncryptionKey: string | null;
  getGroupEncryptionKey: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [groupEncryptionKey, setGroupEncryptionKey] = useState<string | null>(null);

  // Force logout when encryption key is missing
  const forceLogout = async () => {
    console.log('🔒 Encryption key missing - forcing logout');
    try {
      await signOut(auth);
      setUser(null);
      setEncryptionKey(null);
    } catch (error) {
      console.error('Error during forced logout:', error);
    }
  };

  // Load encryption key from secure store
  const loadEncryptionKey = useCallback(async (uid: string): Promise<boolean> => {
    try {
      const keyExists = await hasPersonalKey(uid);
      if (!keyExists) {
        console.log('❌ No encryption key found in secure store');
        await forceLogout();
        return false;
      }

      const key = await getPersonalKey(uid);
      if (!key) {
        console.log('❌ Failed to retrieve encryption key');
        await forceLogout();
        return false;
      }

      setEncryptionKey(key);
      console.log('✅ Encryption key loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading encryption key:', error);
      await forceLogout();
      return false;
    }
  }, []);

  // Get encryption key with fallback
  const getEncryptionKey = async (): Promise<string | null> => {
    if (encryptionKey) {
      return encryptionKey;
    }

    if (!user?.uid) {
      console.log('❌ No user UID available for encryption key');
      return null;
    }

    // Fallback: try to load from secure store
    console.log('🔄 Encryption key not in context, loading from secure store...');
    const success = await loadEncryptionKey(user.uid);
    return success ? encryptionKey : null;
  };

  // Refresh encryption key from secure store
  const refreshEncryptionKey = async (): Promise<void> => {
    if (!user?.uid) {
      console.log('❌ No user UID available for encryption key refresh');
      return;
    }

    await loadEncryptionKey(user.uid);
  };

  // Regenerate encryption key (used after pairing)
  const regenerateEncryptionKey = async (): Promise<void> => {
    if (!user?.uid) {
      console.log('❌ No user UID available for encryption key regeneration');
      return;
    }

    try {
      console.log('🔄 Regenerating encryption key for user:', user.uid);

      // Generate new 32-byte encryption key
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const newEncryptionKey = Array.from(randomBytes, byte =>
        byte.toString(16).padStart(2, '0')
      ).join('');

      // Store new key in secure store
      await setPersonalKey(user.uid, newEncryptionKey);

      // Update context with new key
      setEncryptionKey(newEncryptionKey);

      console.log('✅ Encryption key regenerated successfully');
    } catch (error) {
      console.error('❌ Error regenerating encryption key:', error);
      throw error;
    }
  };

  // Load group encryption key
  const loadGroupEncryptionKey = async (uid: string, groupId: string): Promise<boolean> => {
    try {
      console.log('🔑 Loading group encryption key...');
      const groupKey = await getGroupKeyFromAPI(uid, groupId);
      if (!groupKey) {
        console.log('❌ No group encryption key found');
        return false;
      }
      setGroupEncryptionKey(groupKey);
      console.log('✅ Group encryption key loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Error loading group encryption key:', error);
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

    console.log('🔄 Group encryption key not in context, loading from group...');
    const success = await loadGroupEncryptionKey(user.uid, user.linkedGroupId);
    return success ? groupEncryptionKey : null;
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
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [loadEncryptionKey]);

  const login = async (data: UserLoginData) => {
    await loginUser(data);
    // Note: Encryption key will be loaded automatically via onAuthStateChanged
  };

  const register = async (data: UserRegistrationData) => {
    const result = await registerUser(data);
    // Note: Encryption key is generated and stored during registration
    // and will be loaded automatically via onAuthStateChanged
    return result;
  };

  const updateUser = async (uid: string) => {
    try {
      if (!user) throw new Error('No user logged in');
      const userData = await updateUserData(uid);
      setUser({ ...userData });
      console.log('User data updated:', userData);
    } catch {
      throw new Error('Failed to update user');
    }
  };

  const updateLinkedGroupId = async (groupId: string | null) => {
    if (user) {
      setUser({ ...user, linkedGroupId: groupId });

      // Load group encryption key if linking to a group
      if (groupId) {
        console.log('🔑 Loading group encryption key after linking...');
        await loadGroupEncryptionKey(user.uid, groupId);
      } else {
        // Clear group encryption key if unlinking
        console.log('🔑 Clearing group encryption key after unlinking...');
        setGroupEncryptionKey(null);
      }
    }
  };

  const deleteAccount = async (password?: string) => {
    try {
      if (!user) throw new Error('No user logged in');
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      // If user is in a group, unlink first
      if (user.linkedGroupId) {
        // Get the group document to find the other user
        const groupDoc = await getDoc(doc(firestore, 'groups', user.linkedGroupId));
        if (!groupDoc.exists()) {
          throw new Error('Group not found');
        }

        const groupData = groupDoc.data();
        const otherUserId = groupData.userIds.find((id: string) => id !== user.uid);

        // Unlink and transfer transactions
        await unlinkPartnerAndTransferTransactions(user.uid, otherUserId, user.linkedGroupId);
      }

      // Re-authenticate if password is provided
      if (password && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
      }

      // Delete user document from Firestore
      await deleteDoc(doc(firestore, 'users', user.uid));

      // Delete encryption key from secure store
      await deletePersonalKey(user.uid);

      // Delete the Firebase Auth user
      await deleteUser(currentUser);

      setUser(null);
      setEncryptionKey(null);
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
        updateUser,
        updateLinkedGroupId,
        deleteAccount,
        getEncryptionKey,
        refreshEncryptionKey,
        regenerateEncryptionKey,
        getGroupEncryptionKey,
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
