'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from './firebase';
import { db } from './firebase';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  // user: undefined = loading, null = not authenticated, object = authenticated
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const profile = userSnap.exists() ? userSnap.data() : {};
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: profile.displayName || firebaseUser.displayName || '',
            role: profile.role || 'recruiter'
          });
        } catch (error) {
          console.error('Error cargando perfil de usuario:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            role: 'recruiter'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
