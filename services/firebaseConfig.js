// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBxuAc0UDkOug1mxsXWsjMP_SQR5dv02x8",
  authDomain: "capstone-project-2d585.firebaseapp.com",
  projectId: "capstone-project-2d585",
  storageBucket: "capstone-project-2d585.appspot.com", // ✅ FIXED domain
  messagingSenderId: "642822502580",
  appId: "1:642822502580:web:7d5de9adc2fb579926ffe1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };