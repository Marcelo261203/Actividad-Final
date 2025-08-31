import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// EJEMPLO DE CONFIGURACIÓN DE FIREBASE
// Copia este archivo como firebase.ts y reemplaza con tus credenciales reales

const firebaseConfig = {
  apiKey: "AIzaSyC-ejemplo-de-api-key-aqui",
  authDomain: "tu-proyecto-ejemplo.firebaseapp.com",
  projectId: "tu-proyecto-ejemplo-id",
  storageBucket: "tu-proyecto-ejemplo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

