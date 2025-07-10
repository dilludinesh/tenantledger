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
    } catch (error: any) {
      console.error('Sign in error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      // Handle different error cases
      if (error.code === 'auth/popup-closed-by-user') {
        const message = 'Sign in was cancelled';
        setAuthError(message);
        toast.error(message);
      } else if (error.code === 'auth/popup-blocked' || error.message === 'popup-blocked') {
        const message = 'Please allow popups for this site to sign in with Google';
        setAuthError(message);
        toast.error(message, { 
          duration: 6000,
          icon: '🔔',
          style: {
            background: '#FEE2E2',
            color: '#B91C1C',
          }
        });
      } else {
        // Handle other errors with more detailed information
        let message = 'Failed to sign in with Google';
        
        if (error.code) {
          // Handle Firebase auth errors
          switch (error.code) {
            case 'auth/account-exists-with-different-credential':
              message = 'An account already exists with the same email but different sign-in credentials';
              break;
            case 'auth/auth-domain-config-required':
              message = 'Authentication domain configuration is required';
              break;
            case 'auth/operation-not-allowed':
              message = 'Google sign-in is not enabled for this project';
              break;
            case 'auth/unauthorized-domain':
              message = 'This domain is not authorized for authentication';
              break;
            default:
              message = error.message || message;
          }
        } else if (error.message) {
          message = error.message;
        }
        
        setAuthError(message);
        toast.error(message, {
          duration: 5000,
          position: 'bottom-center'
        });
      }
      
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
