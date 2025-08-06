"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

import GoogleButton from '@/components/GoogleButton';
import styles from '../dashboard/glass.module.css';

export default function LoginPage() {
  useAuthRedirect();
  const { loading, signInWithGoogle, authError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  // Show error toast if there's an auth error
  useEffect(() => {
    if (authError) {
      setSigningIn(false); // Reset signing in state on error
    }
  }, [authError]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setSigningIn(false);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-start px-4">
      <div className="mt-8 mx-auto w-full max-w-xs">
        <div className={`${styles.glass} py-8 px-6 sm:px-8`}>
          <div className="text-center mb-8">
            <h1 
              className="text-4xl font-bold"
              style={{
                background: 'linear-gradient(90deg, var(--login-title-gradient-start), var(--login-title-gradient-end))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                textShadow: `0 2px 4px var(--login-title-shadow)`
              }}
            >
              Tenant Ledger
            </h1>
          </div>

          <div className="flex flex-col items-center">
            <GoogleButton 
              onClick={handleSignIn}
              disabled={loading || signingIn}
              loading={signingIn}
            />
            {authError === 'Sign in was cancelled' && (
              <div className="mt-4 w-full flex justify-center">
                <div
                  className="bg-gradient-to-r from-[var(--cancelled-signin-background-start)] to-[var(--cancelled-signin-background-end)] border border-[var(--cancelled-signin-border)] rounded-lg px-4 py-3 shadow-sm flex flex-col items-center gap-2"
                  style={{ maxWidth: 340 }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--cancelled-signin-icon)] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                    <span className="text-[var(--cancelled-signin-text)] text-sm font-medium text-center">
                      Sign-in was cancelled.
                    </span>
                  </div>
                  <button onClick={handleSignIn} className="btn btn-primary">
                    Please try again.
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
