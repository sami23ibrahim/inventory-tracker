// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIy33V8VlcGwZBDcNYP1iGKfMB2EvZ-6o",
  authDomain: "inventorytracker-f7847.firebaseapp.com",
  projectId: "inventorytracker-f7847",
  storageBucket: "inventorytracker-f7847.appspot.com", // ⚡ fixed: must be .appspot.com not .app
  messagingSenderId: "106433243335",
  appId: "1:106433243335:web:f9d433cc419fac85ba36e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);
