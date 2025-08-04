'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  getAuth 
} from 'firebase/auth';
import { getFirebaseApp } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { logAuthSuccess, logAuthFailure } from '@/utils/securityLogger';
import { checkRateLimit } from '@/utils/security';

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
    } catch {
      // Silent error handling for logout
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      const auth = getAuth(getFirebaseApp());

      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          logAuthSuccess(currentUser.uid);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      handleAuthError(error);
      setLoading(false);
    }
  }, [handleAuthError]);



  const signInWithGoogle = useCallback(async () => {
    // Rate limiting check
    const clientId = 'google_signin';
    if (!checkRateLimit(clientId, 5, 300000)) { // 5 attempts per 5 minutes
      const errorMsg = 'Too many sign-in attempts. Please try again later.';
      logAuthFailure('rate_limit_exceeded');
      toast.error(errorMsg);
      return;
    }

    setAuthError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Configure provider for better popup handling
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const auth = getAuth(getFirebaseApp());
      const { signInWithPopup, signInWithRedirect } = await import('firebase/auth');
      
      // Try popup first, fallback to redirect on mobile or if popup fails
      try {
        await signInWithPopup(auth, provider);
        logAuthSuccess('google_signin_popup');
      } catch (popupError: unknown) {
        // If popup fails due to blocking or mobile, try redirect
        const errorCode = popupError && typeof popupError === 'object' && 'code' in popupError 
          ? (popupError as { code: string }).code 
          : '';
        
        if (errorCode === 'auth/popup-blocked' || 
            errorCode === 'auth/popup-closed-by-user' ||
            /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
          
          toast('Redirecting to Google Sign-In...', { 
            duration: 2000,
            icon: 'ℹ️'
          });
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupError;
      }
    } catch (error) {
      logAuthFailure(error instanceof Error ? error.message : 'Unknown error');
      handleAuthError(error);
    }
  }, [handleAuthError]);

  // Handle redirect result on page load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRedirectResult = async () => {
      try {
        const auth = getAuth(getFirebaseApp());
        const { getRedirectResult } = await import('firebase/auth');
        const result = await getRedirectResult(auth);
        
        if (result) {
          logAuthSuccess('google_signin_redirect');
          toast.success('Successfully signed in!');
        }
      } catch (error) {
        logAuthFailure(error instanceof Error ? error.message : 'Redirect error');
        handleAuthError(error);
      }
    };

    handleRedirectResult();
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
