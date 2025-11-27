import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// PASTE YOUR KEYS HERE FROM THE PREVIOUS FILE
const firebaseConfig = {
  apiKey: "AIzaSyBrhttq9MepUX3ixZKbRvASR7BdjPVqugY",
  authDomain: "salpointe-cte-hub.firebaseapp.com",
  projectId: "salpointe-cte-hub",
  storageBucket: "salpointe-cte-hub.appspot.com",
  messagingSenderId: "462271958444",
  appId: "1:462271958444:web:78ee9c184dd9985fa0be09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();