"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('page.tsx: useEffect - user:', user, 'loading:', loading);
    if (!loading) {
      if (user) {
        console.log('page.tsx: Redirecting to /dashboard');
        router.push('/dashboard');
      } else {
        console.log('page.tsx: Redirecting to /login');
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Tenant Ledger...</p>
      </div>
    </div>
  );
}
