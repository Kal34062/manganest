import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

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

const logoutBtn = document.getElementById("logout-btn");

function setGuestView() {
  logoutBtn.textContent = "Login";
  logoutBtn.onclick = () => window.location.href = "signup.html";
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    logoutBtn.textContent = "Logout";
    logoutBtn.onclick = () => {
      signOut(auth)
        .then(() => setGuestView())
        .catch(err => console.error("Sign out error:", err));
    };
  } else {
    // No user logged in
    setGuestView();
  }
});