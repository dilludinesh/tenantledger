import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { fallbackConfig } from './firebase-fallback';

// Helper function to get environment variables with fallbacks
const getEnvVar = (key: string, alternateKey: string, fallback: string): string => {
  return process.env[key] || process.env[alternateKey] || fallback;
};

// Your Firebase configuration - supporting both formats of environment variables
// and falling back to the fallbackConfig if environment variables are not available
const firebaseConfig = {
  apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_APIKEY', fallbackConfig.apiKey),
  authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'NEXT_PUBLIC_FIREBASE_AUTHDOMAIN', fallbackConfig.authDomain),
  projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_PROJECTID', fallbackConfig.projectId),
  storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'NEXT_PUBLIC_FIREBASE_STORAGEBUCKET', fallbackConfig.storageBucket),
  messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID', fallbackConfig.messagingSenderId),
  appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID', 'NEXT_PUBLIC_FIREBASE_APPID', fallbackConfig.appId)
};

// Log a warning if we're using fallback values
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const missingVars = [];
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_APIKEY) missingVars.push('API_KEY');
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && !process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN) missingVars.push('AUTH_DOMAIN');
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && !process.env.NEXT_PUBLIC_FIREBASE_PROJECTID) missingVars.push('PROJECT_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET && !process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET) missingVars.push('STORAGE_BUCKET');
  if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID && !process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID) missingVars.push('MESSAGING_SENDER_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID && !process.env.NEXT_PUBLIC_FIREBASE_APPID) missingVars.push('APP_ID');
  
  if (missingVars.length > 0) {
    console.warn(
      `Using fallback Firebase configuration because the following environment variables are missing: ${missingVars.join(', ')}\n` +
      'For production deployment, add these variables in your deployment platform under Environment Variables.'
    );
  }
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export const appId = firebaseConfig.projectId;