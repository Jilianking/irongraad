// lib/firebaseAdmin.js
import admin from 'firebase-admin';
import serviceAccount from '../firebaseAdmin.json'; // adjust path if needed

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();

export { admin, firestore };
