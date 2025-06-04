import { auth, firestore } from '@/config/firebase';
import { loginUser, registerUser, updateUserData } from '@/lib/api/auth';
import { unlinkPartnerAndTransferTransactions } from '@/lib/api/pair';
import { User, UserLoginData, UserRegistrationData, UserResponse } from '@/types/user';
import {
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthReady: boolean;
  login: (data: UserLoginData) => Promise<void>;
  register: (data: UserRegistrationData) => Promise<UserResponse>;
  updateUser: (uid: string) => Promise<void>;
  updateLinkedGroupId: (groupId: string | null) => void;
  deleteAccount: (password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              linkedGroupId: null,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const login = async (data: UserLoginData) => {
    await loginUser(data);
  };

  const register = async (data: UserRegistrationData) => {
    return await registerUser(data);
  };

  const updateUser = async (uid: string) => {
    try {
      if (!user) throw new Error('No user logged in');
      const userData = await updateUserData(uid);
      setUser({ ...userData });
      console.log('User data updated:', userData);
    } catch (error) {
      throw new Error('Failed to update user');
    }
  };

  const updateLinkedGroupId = (groupId: string | null) => {
    if (user) {
      setUser({ ...user, linkedGroupId: groupId });
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

      // Delete the Firebase Auth user
      await deleteUser(currentUser);

      setUser(null);
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
        login,
        register,
        updateUser,
        updateLinkedGroupId,
        deleteAccount,
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
