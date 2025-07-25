import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_APIKEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECTID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APPID || ''
};

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
    _firebaseAuth = initializeAuth(getFirebaseApp(), {
      persistence: browserLocalPersistence,
    });
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