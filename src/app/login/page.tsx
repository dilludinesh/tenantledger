"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import GoogleButton from '@/components/GoogleButton';
import styles from '../dashboard/glass.module.css';

export default function LoginPage() {
  const { user, loading, signInWithGoogle, authError } = useAuth();
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

  return (
    <div className="flex flex-col h-screen justify-start">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xs">
        <div className={`${styles.glass} py-8 px-6 sm:px-8`}>
          <div className="text-center mb-8">
            <h1 
              className="text-4xl font-bold"
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

          <div className="flex flex-col items-center">
            <GoogleButton 
              onClick={signInWithGoogle}
              disabled={loading}
            />
            {authError === 'Sign in was cancelled' && (
              <div className="mt-4 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 w-full text-center">
                Sign in was cancelled. Please try again and complete the sign-in process.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
