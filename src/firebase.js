// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwOBe5UXlBLJuIrfTbLLen9nBdU18HzE8",
  authDomain: "farm-51269.firebaseapp.com",
  projectId: "farm-51269",
  storageBucket: "farm-51269.firebasestorage.app",
  messagingSenderId: "340002771348",
  appId: "1:340002771348:web:886e3c9b33ab8e57643f81",
  measurementId: "G-BRKRDK85XW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth (email/password + Google)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ Firestore database
export const db = getFirestore(app);
