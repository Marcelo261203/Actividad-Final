import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Configuración de Firebase
// IMPORTANTE: Reemplaza estas credenciales con las de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBttnkZPmkFd1DbtJlJ1JNJsIPx8gi6WXw",
  authDomain: "rhymefinder-391ae.firebaseapp.com",
  projectId: "rhymefinder-391ae",
  storageBucket: "rhymefinder-391ae.firebasestorage.app",
  messagingSenderId: "244194956236",
  appId: "1:244194956236:web:5e50652535c6f9e1c34369"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configuración para desarrollo (opcional)
if (__DEV__) {
  // Comentar estas líneas si no tienes emuladores locales configurados
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
