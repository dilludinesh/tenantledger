'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithRedirect, 
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider 
} from 'firebase/auth';
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

  // Helper function to handle authentication errors consistently
  const handleAuthError = useCallback((error: unknown) => {
    console.error('Auth error:', error);
    let errorMessage = 'An error occurred during sign in';

    // Handle Firebase auth errors
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
      await firebaseSignOut(auth);
      window.location.assign('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Skip Firebase initialization during build time
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Check if Firebase config is valid (not dummy values)
    const isValidConfig = !(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('dummy') ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here' ||
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    );

    if (!isValidConfig) {
      console.warn('Invalid Firebase configuration detected');
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        console.log('Initializing authentication...');
        console.log('Current URL:', window.location.href);
        
        // Check if we just returned from a redirect
        const redirectInitiated = sessionStorage.getItem('authRedirectInitiated');
        if (redirectInitiated) {
          console.log('Detected return from auth redirect');
          sessionStorage.removeItem('authRedirectInitiated');
        }
        
        // Set up auth state listener first
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          console.log('Auth state changed - User:', currentUser ? `Authenticated: ${currentUser.email}` : 'Not authenticated');
          if (isMounted) {
            setUser(currentUser);
            setLoading(false);
          }
        });

        // Check for redirect result with extended timeout
        const checkRedirectResult = async () => {
          try {
            const result = await getRedirectResult(auth);
            
            if (result && result.user && isMounted) {
              console.log('Redirect authentication successful:', result.user.email);
              toast.success('Successfully signed in!');
              return true;
            }
            return false;
          } catch (error) {
            console.error('Error checking redirect result:', error);
            if (isMounted) {
              handleAuthError(error);
            }
            return false;
          }
        };

        // Only check for redirect result if we detected a return from redirect
        if (redirectInitiated) {
          await checkRedirectResult();
        } else {
          console.log('No redirect detected, normal page load');
        }
        
        return unsubscribe;
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
        return () => {};
      }
    };

    const unsubscribePromise = initAuth();

    return () => {
      isMounted = false;
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, [handleAuthError]);

  // Use redirect authentication method only
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes to ensure we get user info
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('Starting redirect authentication...');
      console.log('Current URL before redirect:', window.location.href);
      console.log('Auth instance:', auth);
      console.log('Auth app name:', auth.app.name);
      console.log('Auth config:', auth.config);
      console.log('Provider:', provider);
      
      // Store a flag to indicate we initiated a redirect
      sessionStorage.setItem('authRedirectInitiated', 'true');
      
      try {
        // Use redirect method - user will be redirected to Google and back
        await signInWithRedirect(auth, provider);
        console.log('Redirect initiated successfully');
      } catch (redirectError) {
        console.error('Redirect failed, trying popup as fallback:', redirectError);
        sessionStorage.removeItem('authRedirectInitiated');
        
        // Fallback to popup if redirect fails
        const result = await signInWithPopup(auth, provider);
        console.log('Popup authentication successful:', result.user.email);
        toast.success('Successfully signed in!');
      }
      // Note: The result will be handled by getRedirectResult in the useEffect
    } catch (error) {
      console.error('Sign in error:', error);
      sessionStorage.removeItem('authRedirectInitiated');
      handleAuthError(error);
      // Re-throw the error so it can be caught by the login page if needed
      throw error;
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
