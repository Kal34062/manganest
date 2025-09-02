import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMs_QBPLVwlASvATiwRK-Qd9SuqiEPqDc",
  authDomain: "manganest343632.firebaseapp.com",
  projectId: "manganest343632",
  storageBucket: "manganest343632.appspot.com",
  messagingSenderId: "973182891353",
  appId: "1:973182891353:web:b061877af98ee34220c848",
  measurementId: "G-M7EGCX0BNH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.querySelector(".google-btn");
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user;
          alert(`Welcome ${user.displayName || "User"}!`);
          window.location.href = "index.html";
        })
        .catch((error) => {
          alert("Login/Signup failed. Please try again.");
        });
    });
  }
  
  onAuthStateChanged(auth, (user) => {
    const userInfo = document.getElementById("user-info");
    if (user && userInfo) {
      userInfo.textContent = `Logged in as: ${user.displayName} (${user.email})`;
    } else if (userInfo) {
      userInfo.textContent = "Browsing as Guest";
    }
  });
  
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          window.location.href = "signup.html";
        })
        .catch((error) => {
          console.error(error.message);
        });
    });
  }
});