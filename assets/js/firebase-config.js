// Configuración de Firebase para La Oficina Barbería.
// Reemplaza estos valores con los de tu proyecto en:
// https://console.firebase.google.com/ > Configuración del proyecto > Tus apps > SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "REEMPLAZA_TU_API_KEY",
  authDomain: "REEMPLAZA_TU_PROYECTO.firebaseapp.com",
  projectId: "REEMPLAZA_TU_PROYECTO_ID",
  storageBucket: "REEMPLAZA_TU_PROYECTO.appspot.com",
  messagingSenderId: "REEMPLAZA_TU_SENDER_ID",
  appId: "REEMPLAZA_TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
