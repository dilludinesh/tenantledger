"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import styles from '../dashboard/glass.module.css';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { user, signInWithGoogle, authError } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Show error toast if there's an auth error
  useEffect(() => {
    if (authError) {
      toast.error(authError, { 
        duration: 5000,
        position: 'bottom-center'
      });
    }
  }, [authError]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // No need to redirect here, the useEffect will handle it when user changes
    } catch (error) {
      console.error('Error in Google sign in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-start">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`${styles.glass} py-8 px-6 sm:px-10`}>
          <div className="text-center mb-8">
            <h1 
              className="text-3xl font-bold"
              style={{
                background: 'linear-gradient(90deg, #3b82f6, rgb(167, 41, 240))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                textShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              Tenant Ledger
            </h1>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-[250px]">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`${styles.glassButton} !rounded-full w-full inline-flex justify-center py-2 px-4 shadow-sm text-sm font-medium text-white`}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.28-1.93-6.14-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.86 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.68-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.68 2.84c.86-2.6 3.28-4.53 6.14-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
