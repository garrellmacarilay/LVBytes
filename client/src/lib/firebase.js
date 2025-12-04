// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYndcGMbg3OWQ7p5OAVo_8CzNnvfaK9xc",
  authDomain: "lvbytes-a5863.firebaseapp.com",
  projectId: "lvbytes-a5863",
  storageBucket: "lvbytes-a5863.firebasestorage.app",
  databaseURL: "https://lvbytes-a5863-default-rtdb.firebaseio.com/",
  messagingSenderId: "154663536062",
  appId: "1:154663536062:web:3e7d1249211d8ef7dfa5ef",
  measurementId: "G-29PYC71S7N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };