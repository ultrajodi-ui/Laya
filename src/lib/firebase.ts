
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDQyJmUDiYXIRaRn-Q7ByVUpVSD8jGBMRE',
  authDomain: 'ultra-jodi-wxhoi.firebaseapp.com',
  projectId: 'ultra-jodi-wxhoi',
  storageBucket: 'ultra-jodi-wxhoi.firebasestorage.app',
  messagingSenderId: '919030326656',
  appId: '1:919030326656:web:3805fc12c3a29d30350d65',
};

// Initialize Firebase for client-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = initializeAuth(app, {
    persistence: browserLocalPersistence
});
const db = getFirestore(app);

export { app, auth, db };
