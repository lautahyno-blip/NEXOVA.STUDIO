import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  isAdmin: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  isAdmin: false, 
  login: async () => false, 
  logout: () => {}, 
  loading: true 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('nexova_admin');
    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const login = async (usernameInput: string, passInput: string) => {
    const username = usernameInput.trim();
    const pass = passInput.trim();

    console.log('Login Attempt:', { username: username.toLowerCase() });

    // 1. Get credentials from multiple sources
    const envUser = import.meta.env.VITE_ADMIN_USER || 'mark';
    const envPass = import.meta.env.VITE_ADMIN_PASS || 'Mayang1975';

    // 2. Check hardcoded / env variables (Emergency Fallback)
    if (username.toLowerCase() === envUser.toLowerCase() && pass === envPass) {
      console.log('Login Success: System/Env credentials used.');
      
      // Auto-initialize Firestore document if missing
      try {
        const adminRef = doc(db, 'site', 'admin');
        const adminDoc = await getDoc(adminRef);
        if (!adminDoc.exists()) {
          console.log('Target database empty. Initializing admin document...');
          const { setDoc } = await import('firebase/firestore');
          await setDoc(adminRef, { username: envUser, password: envPass });
        }
      } catch (e) {
        console.warn('Could not auto-init Firestore admin (likely permissions). Proceeding anyway.');
      }

      setIsAdmin(true);
      localStorage.setItem('nexova_admin', 'true');
      return true;
    }

    // 3. Try standard Firestore lookup
    try {
      console.log('Attempting Firestore verification...');
      const adminDoc = await getDoc(doc(db, 'site', 'admin'));
      
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        if (data.username?.toLowerCase() === username.toLowerCase() && data.password === pass) {
          console.log('Login Success: Firestore verified.');
          setIsAdmin(true);
          localStorage.setItem('nexova_admin', 'true');
          return true;
        }
      } else {
        console.warn('No admin document in Firestore. Fallback only available.');
      }
    } catch (e) {
      console.error('Auth check error:', e);
      if (e instanceof Error) {
        // Only show connectivity errors to UI for debugging
        if (e.message.includes('permission-denied') || e.message.includes('unavailable')) {
          toast.error(`Database Error: ${e.message.substring(0, 30)}`);
        }
      }
    }
    
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('nexova_admin');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
