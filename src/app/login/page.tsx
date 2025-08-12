'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GoogleButton } from '@/components/GoogleButton';

interface AuthError extends Error {
  code?: string;
  message: string;
}

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
    } catch (err) {
      const error = err as AuthError;
      setError(error.message || 'Failed to sign in');
      setIsLoading(false);
    }
  }, [signInWithGoogle]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm mx-auto mt-16">
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold" style={{
              background: 'linear-gradient(90deg, #1e40af, #3b82f6, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block',
              lineHeight: '1.2'
            }}>
              Tenant Ledger
            </h1>
          </div>
          
          <div className="space-y-4">
            <GoogleButton 
              onClick={handleSignIn}
              disabled={isLoading}
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </GoogleButton>
            
            {error && (
              <p className="text-sm text-red-600 text-center mt-2">
                {error}
              </p>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  }
