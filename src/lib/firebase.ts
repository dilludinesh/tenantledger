import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Your Firebase configuration - using direct environment access
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_APIKEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECTID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APPID || ''
};

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
