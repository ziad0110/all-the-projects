import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCH5Nv1ZX2ZkjzA4ySr_o43KyjoEKQWJGQ",
    authDomain: "royal-85f6c.firebaseapp.com",
    projectId: "royal-85f6c",
    storageBucket: "royal-85f6c.firebasestorage.app",
    messagingSenderId: "128030831415",
    appId: "1:128030831415:web:a6d35ed82c45575bd560b2",
    measurementId: "G-3BQ3ML8LXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export default app;
