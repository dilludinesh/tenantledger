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

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export const appId = firebaseConfig.projectId;
