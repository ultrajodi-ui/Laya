// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "ultra-jodi-wxhoi",
  "appId": "1:919030326656:web:575ef44228abd511350d65",
  "storageBucket": "ultra-jodi-wxhoi.firebasestorage.app",
  "apiKey": "AIzaSyDQyJmUDiYXIRaRn-Q7ByVUpVSD8jGBMRE",
  "authDomain": "ultra-jodi-wxhoi.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "919030326656"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
