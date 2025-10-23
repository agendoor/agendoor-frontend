import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLD4kl2oguvqeu0Aj9Yikh050kL_Ay0HA",
  authDomain: "agendoor-793f9.firebaseapp.com",
  projectId: "agendoor-793f9",
  storageBucket: "agendoor-793f9.firebasestorage.app",
  messagingSenderId: "974794947887",
  appId: "1:974794947887:web:8233fd11c056e8ba7835da",
  measurementId: "G-YWNWDM2YST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

