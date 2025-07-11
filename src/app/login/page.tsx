"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import styles from '../dashboard/glass.module.css';
// Removed GoogleButton import

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

          {/* Removed GoogleButton */}
        </div>
      </div>
    </div>
  );
}
