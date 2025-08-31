import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBttnkZPmkFd1DbtJlJ1JNJsIPx8gi6WXw",
  authDomain: "rhymefinder-391ae.firebaseapp.com",
  projectId: "rhymefinder-391ae",
  storageBucket: "rhymefinder-391ae.firebasestorage.app",
  messagingSenderId: "244194956236",
  appId: "1:244194956236:web:5e50652535c6f9e1c34369"
};

// Importaciones condicionales para evitar problemas de bundling
let firebase: any = null;
let auth: any = null;
let db: any = null;

// Solo cargar Firebase en entornos compatibles
if (Platform.OS !== 'web' || typeof window !== 'undefined') {
  try {
    // Usar la configuración real de Firebase
    firebase = initializeApp(firebaseConfig);
    auth = getAuth(firebase);
    db = getFirestore(firebase);
    console.log('Firebase inicializado correctamente');
  } catch (error) {
    console.warn('Firebase falló, usando AsyncStorage:', error);
  }
}

export { firebase, auth, db };

export const isFirebaseAvailable = () => {
  // Solo considerar Firebase disponible si está configurado correctamente
  return firebase !== null && auth !== null && db !== null;
};
