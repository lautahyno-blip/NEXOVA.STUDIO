import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

  const login = async (username: string, pass: string) => {
    try {
      const adminDoc = await getDoc(doc(db, 'site', 'admin'));
      const data = adminDoc.data();
      
      if (data && data.username === username && data.password === pass) {
        setIsAdmin(true);
        localStorage.setItem('nexova_admin', 'true');
        return true;
      }
      
      // Fallback for first time setup
      if (username === 'mark' && pass === 'Mayang1975') {
        setIsAdmin(true);
        localStorage.setItem('nexova_admin', 'true');
        return true;
      }
    } catch (e) {
      console.error('Login error:', e);
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
