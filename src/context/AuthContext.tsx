'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithRedirect, // Changed back to signInWithRedirect
  getRedirectResult, // Re-added getRedirectResult
  GoogleAuthProvider,
  getAuth 
} from 'firebase/auth';
import { getFirebaseApp } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  authError: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuthError = useCallback((error: unknown) => {
    console.error('Auth error:', error);
    let errorMessage = 'An error occurred during sign in';

    if (error && typeof error === 'object' && 'code' in error) {
      const err = error as { code: string; message?: string };
      switch (err.code) {
        case 'auth/cancelled-popup-request':
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in was cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Sign in popup was blocked. Please allow popups for this site.';
          break;
        case 'auth/auth-domain-config-required':
          errorMessage = 'Authentication domain configuration is required';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Google sign-in is not enabled for this project';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized for authentication';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    }

    setAuthError(errorMessage);
    toast.error(errorMessage, { 
      duration: 6000,
      position: 'top-center'
    });

    return errorMessage;
  }, []);

  const logout = async () => {
    try {
      const auth = getAuth(getFirebaseApp());
      await firebaseSignOut(auth);
      window.location.assign('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const auth = getAuth(getFirebaseApp());

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('onAuthStateChanged - currentUser:', currentUser);
      if (currentUser) {
        console.log('User is signed in:', currentUser.uid);
        setUser(currentUser);
      } else {
        console.log('User is signed out.');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [handleAuthError]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const auth = getAuth(getFirebaseApp());
      if (!auth) {
        throw new Error('Firebase Auth object is not initialized.');
      }
      await signInWithRedirect(auth, provider); // Changed to signInWithRedirect
    } catch (error) {
      console.error('Error during signInWithRedirect:', error);
      handleAuthError(error);
    }
  }, [handleAuthError]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
