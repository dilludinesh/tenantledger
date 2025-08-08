"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';


import GoogleButton from '@/components/GoogleButton';
import styles from '../dashboard/glass.module.css';

interface AuthError extends Error {
  code?: string;
  message: string;
}

export default function LoginPage() {
  useAuthRedirect();
  const { loading, signInWithGoogle, authError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Set document title
  useEffect(() => {
    document.title = 'Login - Tenant Ledger';
  }, []);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setSigningIn(false);
      setLocalError(authError);
      
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        setLocalError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [authError]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setLocalError(null);
    
    try {
      await signInWithGoogle();
      // Redirect is handled by useAuthRedirect
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign in error:', authError);
      setLocalError(authError.message || 'Failed to sign in. Please try again.');
      setSigningIn(false);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-start px-4" role="main">
      <div className="mt-8 mx-auto w-full max-w-xs">
        <div 
          className={`${styles.glass} py-8 px-6 sm:px-8`}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="text-center mb-8">
            <h1 
              className="text-4xl font-bold"
              aria-label="Tenant Ledger"
              style={{
                background: 'linear-gradient(90deg, var(--login-title-gradient-start), var(--login-title-gradient-end))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                textShadow: '0 2px 4px var(--login-title-shadow)'
              }}
            >
              Tenant Ledger
            </h1>
            <p className="sr-only">Secure login to access your tenant management dashboard</p>
          </div>

          <div className="flex flex-col items-center">
            <GoogleButton 
              onClick={handleSignIn}
              disabled={loading || signingIn}
              loading={signingIn}
              aria-busy={signingIn}
              aria-live="polite"
            >
              {signingIn ? 'Signing in...' : 'Sign in with Google'}
            </GoogleButton>
            
            {(localError || authError) && (
              <div 
                className="mt-4 w-full flex justify-center transition-opacity duration-300"
                role="alert"
                aria-live="assertive"
              >
                <div
                  className={`bg-gradient-to-r from-[var(--cancelled-signin-background-start)] to-[var(--cancelled-signin-background-end)] 
                  border border-[var(--cancelled-signin-border)] rounded-lg px-4 py-3 shadow-sm 
                  flex flex-col items-center gap-2 w-full max-w-xs`}
                >
                  <div className="flex items-center gap-2">
                    <svg 
                      className="w-5 h-5 text-[var(--cancelled-signin-icon)] flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" 
                      />
                    </svg>
                    <span className="text-[var(--cancelled-signin-text)] text-sm font-medium text-center">
                      {localError || authError}
                    </span>
                  </div>
                  <button 
                    onClick={handleSignIn} 
                    className="btn btn-primary text-sm px-3 py-1"
                    disabled={signingIn}
                    aria-label="Try signing in again"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
