// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Pega aquí tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAFQLRiizDupCXbko7XxTM4t6T-Xj-7_Jw",
  authDomain: "mango-recruiting-4ee58.firebaseapp.com",
  projectId: "mango-recruiting-4ee58",
  storageBucket: "mango-recruiting-4ee58.firebasestorage.app",
  messagingSenderId: "436100969286",
  appId: "1:436100969286:web:a72ce33af36005a39ceb47"
};

// Inicializa la app
const app = initializeApp(firebaseConfig);

// Exporta los servicios que vamos a usar
export const auth = getAuth(app);
export const db = getFirestore(app);
