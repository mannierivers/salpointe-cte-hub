import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// REPLACE these values with the ones from your Firebase Console!
const firebaseConfig = {
  apiKey: "AIzaSyBrhttq9MepUX3ixZKbRvASR7BdjPVqugY",
  authDomain: "salpointe-cte-hub.firebaseapp.com",
  projectId: "salpointe-cte-hub",
  storageBucket: "salpointe-cte-hub.firebasestorage.app",
  messagingSenderId: "462271958444",
  appId: "1:462271958444:web:78ee9c184dd9985fa0be09",
  measurementId: "G-8LWL6MRFLK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Database
export const db = getFirestore(app);