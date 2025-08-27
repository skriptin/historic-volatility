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

// Handle login
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => userCredential.user.getIdToken())
      .then(idToken => {
        return new Promise(resolve => setTimeout(() => resolve(idToken), 2000)); // 2 second delay
      })
      .then(idToken =>
        fetch("/protected", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken })
        })
      )
      .then(res => res.json())
      .then(data => {
        console.log("Server response:", data);
        if (data.message) {
          window.location.href = "/index";
        } else {
          alert("Login failed");
        }
      })
      .catch(error => {
        console.error("Login error:", error);
        alert("Login error: " + error.message);
      });
});
