import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// TODO: For security, move these credentials to environment variables and do not commit them to public repositories.
const firebaseConfig = {
  apiKey: "AIzaSyAswyBBqVVdV9_ext83khlYHPdNgLaBaDY",
  authDomain: "tenantledgerio.firebaseapp.com",
  projectId: "tenantledgerio",
  storageBucket: "tenantledgerio.appspot.com",
  messagingSenderId: "1097222749597",
  appId: "1:1097222749597:web:219662b60453e025d20385"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export const appId = firebaseConfig.projectId;
