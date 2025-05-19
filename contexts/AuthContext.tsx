import { auth } from '@/config/firebase';
import { loginUser, registerUser, updateUserData } from '@/lib/api/auth';
import { User, UserLoginData, UserRegistrationData, UserResponse } from '@/types/user';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (data: UserLoginData) => Promise<void>;
  register: (data: UserRegistrationData) => Promise<UserResponse>;
  updateUser: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser({
          email: user.email || '',
          uid: user.uid,
          displayName: user.displayName || '',
        });

        console.log('onAuthStateChanged:', user.uid);
      } else {
        setUser(null);
        router.replace('/(auth)');
      }
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

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, updateUser }}>
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
