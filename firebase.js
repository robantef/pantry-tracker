// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBs8uTK18rQ6qmZtCOSaJ6dvcu4zxPUblA",
  authDomain: "pantry-tracker-7c914.firebaseapp.com",
  projectId: "pantry-tracker-7c914",
  storageBucket: "pantry-tracker-7c914.appspot.com",
  messagingSenderId: "932366461441",
  appId: "1:932366461441:web:116e861b258652546f6e00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export {firestore};