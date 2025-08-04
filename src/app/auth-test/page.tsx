'use client';

import { useAuth } from '@/context/AuthContext';
import { getBestAuthMethod, hasCOOPRestrictions, isMobileDevice } from '@/utils/authHelpers';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthTestPage() {
  const { user, loading, signInWithGoogle, logout, authError } = useAuth();
  const [authMethod, setAuthMethod] = useState<string>('');
  const [environmentInfo, setEnvironmentInfo] = useState<{
    hasCOOP: boolean;
    isMobile: boolean;
    userAgent: string;
  }>({ hasCOOP: false, isMobile: false, userAgent: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthMethod(getBestAuthMethod());
      setEnvironmentInfo({
        hasCOOP: hasCOOPRestrictions(),
        isMobile: isMobileDevice(),
        userAgent: navigator.userAgent
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Firebase Auth Test
          </h1>

          {/* Environment Information */}
          <div className="mb-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Environment Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Recommended Auth Method:</strong> {authMethod}</p>
              <p><strong>COOP Restrictions:</strong> {environmentInfo.hasCOOP ? 'Yes' : 'No'}</p>
              <p><strong>Mobile Device:</strong> {environmentInfo.isMobile ? 'Yes' : 'No'}</p>
              <p><strong>User Agent:</strong> <span className="text-xs break-all">{environmentInfo.userAgent}</span></p>
            </div>
          </div>

          {/* Authentication Status */}
          {user ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Authentication Successful!</h2>
                <p className="text-gray-600">You are signed in as:</p>
              </div>

              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  {user.photoURL && (
                    <Image 
                      src={user.photoURL} 
                      alt="Profile" 
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-lg">{user.displayName}</p>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">UID: {user.uid}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
                <p className="text-gray-600 mb-6">Please sign in to test Firebase authentication</p>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 text-sm">{authError}</p>
                  </div>
                </div>
              )}

              <button
                onClick={signInWithGoogle}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center mx-auto"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google ({authMethod})
              </button>

              <p className="text-xs text-gray-500 mt-4">
                This will use {authMethod} authentication based on your browser environment
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}