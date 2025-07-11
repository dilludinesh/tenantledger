'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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

  useEffect(() => {
    console.log('Auth state changed listener registered');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      console.log('Logging out');
      await firebaseSignOut(auth);
      window.location.assign('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();

      // Check if popups might be blocked
      const isPopupBlocked = window.open('', '_blank') === null;
      if (isPopupBlocked) {
        throw new Error('popup-blocked');
      }

      await signInWithPopup(auth, provider);
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error('Sign in error:', error);
      let errorMessage = 'An error occurred during sign in';

      // Handle Firebase auth errors
      if (error && typeof error === 'object' && 'code' in error) {
        const err = error as { code: string; message?: string };
        switch (err.code) {
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

      // Re-throw the error so it can be caught by the login page if needed
      throw error;
    }
  }, []);

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