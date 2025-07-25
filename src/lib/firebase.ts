import { initializeApp, getApps, getApp } from 'firebase/app';
<<<<<<< HEAD
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
=======
import { getAuth } from 'firebase/auth';
>>>>>>> cc38116fe4f50469e6c0fa669105f6111b1e16fa
import { getFirestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

<<<<<<< HEAD
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
=======
// Your Firebase configuration - using direct environment access
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_APIKEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECTID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APPID || ''
>>>>>>> cc38116fe4f50469e6c0fa669105f6111b1e16fa
};

const isBrowser = typeof window !== 'undefined';

<<<<<<< HEAD
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
=======
// Export functions that safely handle Firebase initialization
export const getFirebaseApp = (): FirebaseApp => {
  if (!isBrowser) {
    throw new Error('Firebase not available during SSR');
  }
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
>>>>>>> cc38116fe4f50469e6c0fa669105f6111b1e16fa
};

export const getFirebaseAuth = (): Auth => {
  if (!isBrowser) {
    throw new Error('Firebase Auth not available during SSR');
  }
<<<<<<< HEAD
  if (!_firebaseAuth) {
    _firebaseAuth = initializeAuth(getFirebaseApp(), {
      persistence: browserLocalPersistence,
    });
  }
  return _firebaseAuth;
=======
  const app = getFirebaseApp();
  return getAuth(app);
>>>>>>> cc38116fe4f50469e6c0fa669105f6111b1e16fa
};

export const getFirebaseFirestore = (): Firestore => {
  if (!isBrowser) {
    throw new Error('Firebase Firestore not available during SSR');
  }
<<<<<<< HEAD
  if (!_firebaseFirestore) {
    _firebaseFirestore = getFirestore(getFirebaseApp());
  }
  return _firebaseFirestore;
};
=======
  const app = getFirebaseApp();
  return getFirestore(app);
};

// Backward compatibility exports - these will throw in SSR but that's expected
export const app = isBrowser ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : undefined;
export const auth = isBrowser ? getAuth(app as FirebaseApp) : undefined;
export const db = isBrowser ? getFirestore(app as FirebaseApp) : undefined;
export const appId = isBrowser ? firebaseConfig.projectId : 'ssr-project';
>>>>>>> cc38116fe4f50469e6c0fa669105f6111b1e16fa
