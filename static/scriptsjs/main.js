import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAdIFpfDS5gFbxMgZJ2cKNWh1QTXrZae2U",
  authDomain: "volatility-models-67019.firebaseapp.com",
  projectId: "volatility-models-67019",
  storageBucket: "volatility-models-67019.appspot.com", 
  messagingSenderId: "190771080240",
  appId: "1:190771080240:web:0295317bcdd7a20475d1f5",
  measurementId: "G-5Y3P1JY245"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);