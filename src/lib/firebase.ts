
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDQyJmUDiYXIRaRn-Q7ByVUpVSD8jGBMRE',
  authDomain: 'ultra-jodi-wxhoi.firebaseapp.com',
  projectId: 'ultra-jodi-wxhoi',
  storageBucket: 'ultra-jodi-wxhoi.appspot.com',
  messagingSenderId: '919030326656',
  appId: '1:919030326656:web:3805fc12c3a29d30350d65',
};

// Initialize Firebase for client-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
