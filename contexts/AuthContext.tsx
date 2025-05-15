import { auth, firestore } from '@/config/firebase';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  email: string;
  displayName?: string;
  uid?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; user: User; status: number }>;
  updateUser: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
      
        setUser({
          email: user.email || '',
          uid: user.uid,
          displayName: user.displayName || '',
        });

        console.log("onAuthStateChanged:", user);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error("Login error:", error.code, error.message);
      }
      throw new Error('Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        name,
        email,
        uid: response.user.uid
      };
      await setDoc(doc(firestore, "users", response.user.uid), userData);
      return { success: true, user: userData, status: 200 };
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error("Register error:", error.code, error.message);
      }
      throw new Error('Registration failed');
    }
  };

  const updateUser = async (uid: string) => {
    try { 
      if (!user) throw new Error('No user logged in');
      // TODO: Add your user update logic here
      // For now, we'll just update the local state
      const docRef = doc(firestore, "users", uid);
        const docSnap=await getDoc(docRef);

        if(docSnap.exists()){
            const data = docSnap.data()
            const userData:User = {
                uid:data?.uid,
                displayName:data?.name,
                email:data?.email,
            };
            setUser({ ...userData  });
            console.log("User data updated:", userData);
        }
      
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

export function useAuth():AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
