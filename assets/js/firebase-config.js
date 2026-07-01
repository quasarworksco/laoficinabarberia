// Configuración de Firebase para La Oficina Barbería.
// Reemplaza estos valores con los de tu proyecto en:
// https://console.firebase.google.com/ > Configuración del proyecto > Tus apps > SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4G6Mhcl0v_BD9T-kDaWxzBflab2l_238",
  authDomain: "laoficinabarberia-f9116.firebaseapp.com",
  projectId: "laoficinabarberia-f9116",
  storageBucket: "laoficinabarberia-f9116.firebasestorage.app",
  messagingSenderId: "2201088717",
  appId: "1:2201088717:web:acc7bc624765f7a6f7af84",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
