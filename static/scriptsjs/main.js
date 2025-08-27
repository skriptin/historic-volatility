import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
  
const firebaseConfig = {
apiKey: "AIzaSyAdIFpfDS5gFbxMgZJ2cKNWh1QTXrZae2U",
authDomain: "volatility-models-67019.firebaseapp.com",
projectId: "volatility-models-67019",
storageBucket: "volatility-models-67019.firebasestorage.app",
messagingSenderId: "190771080240",
appId: "1:190771080240:web:0295317bcdd7a20475d1f5",
measurementId: "G-5Y3P1JY245"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login form submit
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => userCredential.user.getIdToken())
    .then(idToken => 
      fetch("/protected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken })
      })
    )
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = "/index"; 
      } else {
        alert("Login failed");
      }
    })
    .catch(console.error);
});