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

// Handle account creation
    document.getElementById("create-account-form").addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          alert("Account created successfully!");
          window.location.href = "/"; // go to login
        })
        .catch((error) => {
          console.error("Signup error:", error);
          alert("Signup error: " + error.message);
        });
    });
