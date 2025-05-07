// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCv63dTmcKWPs9Qm2xK5eS7HPyyl_wp43U",
  authDomain: "irongraad-progress.firebaseapp.com",
  projectId: "irongraad-progress",
  storageBucket: "irongraad-progress.appspot.com", // NOTE: fix here
  messagingSenderId: "686542281338",
  appId: "1:686542281338:web:d08b2f9fe5ffa53ef0f9c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore DB
const db = getFirestore(app);

export { db };
