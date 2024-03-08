import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, setDoc , getDocs ,collection,onSnapshot} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhnOgHov46jF3QgLz35h40Ck8ubZWN0uw",
  authDomain: "matchify-1bc4a.firebaseapp.com",
  projectId: "matchify-1bc4a",
  storageBucket: "matchify-1bc4a.appspot.com",
  messagingSenderId: "339786961596",
  appId: "1:339786961596:web:4377f6e9b918a01b3676b9",
  measurementId: "G-ZJBZDWRN18"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export default { firebaseApp, db, doc , setDoc , getDocs, collection,onSnapshot };