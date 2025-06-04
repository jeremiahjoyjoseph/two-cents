import { auth, firestore } from '@/config/firebase';
import { loginUser, registerUser, updateUserData } from '@/lib/api/auth';
import { User, UserLoginData, UserRegistrationData, UserResponse } from '@/types/user';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthReady: boolean;
  login: (data: UserLoginData) => Promise<void>;
  register: (data: UserRegistrationData) => Promise<UserResponse>;
  updateUser: (uid: string) => Promise<void>;
  updateLinkedGroupId: (groupId: string | null) => void;
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

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthReady, login, register, updateUser, updateLinkedGroupId }}
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
