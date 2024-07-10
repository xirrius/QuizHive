// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1EEzQ9IUc1KtNC7GlFgZcyU9C1CvoKwQ",
  authDomain: "quizapp-819d8.firebaseapp.com",
  projectId: "quizapp-819d8",
  storageBucket: "quizapp-819d8.appspot.com",
  messagingSenderId: "837052813829",
  appId: "1:837052813829:web:56335644b753be1b4d426c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
