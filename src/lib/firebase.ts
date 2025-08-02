import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { validateFirebaseConfig } from '@/utils/config';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '').trim(),
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '').trim()
};



// Validate Firebase configuration
if (typeof window !== 'undefined') {
  try {
    validateFirebaseConfig(firebaseConfig);
  } catch (error) {
    throw error;
  }
}

const isBrowser = typeof window !== 'undefined';

let _firebaseApp: FirebaseApp | undefined;
let _firebaseAuth: Auth | undefined;
let _firebaseFirestore: Firestore | undefined;

export const getFirebaseApp = (): FirebaseApp => {
  if (!isBrowser) {
    throw new Error('Firebase App not available during SSR');
  }
  if (!_firebaseApp) {
    _firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }
  return _firebaseApp;
};

export const getFirebaseAuth = (): Auth => {
  if (!isBrowser) {
    throw new Error('Firebase Auth not available during SSR');
  }
  if (!_firebaseAuth) {
    try {
      const app = getFirebaseApp();
      _firebaseAuth = initializeAuth(app, {
        persistence: browserLocalPersistence,
      });
    } catch (error) {
      throw error;
    }
  }
  return _firebaseAuth;
};

export const getFirebaseFirestore = (): Firestore => {
  if (!isBrowser) {
    throw new Error('Firebase Firestore not available during SSR');
  }
  if (!_firebaseFirestore) {
    _firebaseFirestore = getFirestore(getFirebaseApp());
  }
  return _firebaseFirestore;
};