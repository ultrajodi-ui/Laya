
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "ultra-jodi-wxhoi",
  "appId": "1:919030326656:web:575ef44228abd511350d65",
  "storageBucket": "ultra-jodi-wxhoi.firebasestorage.app",
  "apiKey": "AIzaSyDQyJmUDiYXIRaRn-Q7ByVUpVSD8jGBMRE",
  "authDomain": "ultra-jodi-wxhoi.firebaseapp.com",
  "messagingSenderId": "919030326656"
};

// Initialize Firebase for client-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use initializeAuth for robust persistence
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
