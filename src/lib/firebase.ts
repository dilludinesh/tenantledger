import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Helper function to get environment variables with fallback for build time
const getEnvVar = (key: string, alternateKey: string): string => {
  const value = process.env[key] || process.env[alternateKey];
  if (!value || value === 'your_api_key_here' || value === 'your_project_id_here') {
    // Return dummy values for build time to prevent errors
    if (key.includes('API_KEY')) return 'dummy-api-key-for-build';
    if (key.includes('AUTH_DOMAIN')) return 'dummy-project.firebaseapp.com';
    if (key.includes('PROJECT_ID')) return 'dummy-project-id';
    if (key.includes('STORAGE_BUCKET')) return 'dummy-project.appspot.com';
    if (key.includes('MESSAGING_SENDER_ID')) return '123456789';
    if (key.includes('APP_ID')) return '1:123456789:web:abcdef123456';
    return 'dummy-value';
  }
  return value;
};

// Your Firebase configuration - supporting both formats of environment variables
const firebaseConfig = {
  apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_APIKEY'),
  authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'NEXT_PUBLIC_FIREBASE_AUTHDOMAIN'),
  projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_PROJECTID'),
  storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'NEXT_PUBLIC_FIREBASE_STORAGEBUCKET'),
  messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID'),
  appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID', 'NEXT_PUBLIC_FIREBASE_APPID')
};

// Initialize Firebase only in browser environment
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const isBrowser = typeof window !== 'undefined';

// Export functions that safely handle Firebase initialization
export const getFirebaseApp = (): FirebaseApp => {
  if (!isBrowser) {
    throw new Error('Firebase not available during SSR');
  }
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
};

export const getFirebaseAuth = (): Auth => {
  if (!isBrowser) {
    throw new Error('Firebase Auth not available during SSR');
  }
  const app = getFirebaseApp();
  return getAuth(app);
};

export const getFirebaseFirestore = (): Firestore => {
  if (!isBrowser) {
    throw new Error('Firebase Firestore not available during SSR');
  }
  const app = getFirebaseApp();
  return getFirestore(app);
};

// Backward compatibility exports - these will throw in SSR but that's expected
export const app = isBrowser ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : undefined;
export const auth = isBrowser ? getAuth(app as FirebaseApp) : undefined;
export const db = isBrowser ? getFirestore(app as FirebaseApp) : undefined;
export const appId = isBrowser ? firebaseConfig.projectId : 'ssr-project';
