// Import functions from Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBQoIEMjfuURkjNZsns7iM9Ssl4taQquAY",
    authDomain: "specialemakker-dk.firebaseapp.com",
    projectId: "specialemakker-dk",
    storageBucket: "specialemakker-dk.appspot.com",
    messagingSenderId: "1091419163341",
    appId: "1:1091419163341:web:60ef0be92806a0c8b27784",
    measurementId: "G-R9HPHY96MK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
