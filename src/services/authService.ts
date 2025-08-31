import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseAvailable } from './firebaseService';
import { LoginCredentials, RegisterCredentials, User } from '../types';

const USER_STORAGE_KEY = '@rhymefinder_user';

export class AuthService {
  static async register(credentials: RegisterCredentials): Promise<User> {
    if (isFirebaseAvailable()) {
      try {
        // Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );

        // Crear documento de usuario en Firestore
        const userData: User = {
          id: userCredential.user.uid,
          email: credentials.email,
          username: credentials.username,
          createdAt: new Date(),
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        
        // Guardar en AsyncStorage también para persistencia
        await this.saveSession(userData);
        
        console.log('Usuario registrado exitosamente en Firebase');
        return userData;
      } catch (error: any) {
        console.error('Error en registro con Firebase:', error);
        throw new Error(error.message);
      }
    } else {
      // Fallback a AsyncStorage
      try {
        const existingUsers = await AsyncStorage.getItem('@rhymefinder_users');
        const users = existingUsers ? JSON.parse(existingUsers) : {};
        
        if (users[credentials.email]) {
          throw new Error('El usuario ya existe');
        }

        const userData: User = {
          id: Date.now().toString(),
          email: credentials.email,
          username: credentials.username,
          createdAt: new Date(),
        };

        users[credentials.email] = userData;
        await AsyncStorage.setItem('@rhymefinder_users', JSON.stringify(users));
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        
        console.log('Usuario registrado exitosamente en AsyncStorage');
        return userData;
      } catch (error: any) {
        console.error('Error en registro con AsyncStorage:', error);
        throw new Error(error.message);
      }
    }
  }

  static async login(credentials: LoginCredentials): Promise<User> {
    if (isFirebaseAvailable()) {
      try {
        // Login con Firebase Auth
        const userCredential = await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );

        // Obtener datos del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userData: User = {
            id: data.id,
            email: data.email,
            username: data.username,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
          };
          
          // Guardar en AsyncStorage para persistencia
          await this.saveSession(userData);
          
          console.log('Usuario logueado exitosamente en Firebase');
          return userData;
        } else {
          throw new Error('Datos de usuario no encontrados');
        }
      } catch (error: any) {
        console.error('Error en login con Firebase:', error);
        throw new Error(error.message);
      }
    } else {
      // Fallback a AsyncStorage
      try {
        const existingUsers = await AsyncStorage.getItem('@rhymefinder_users');
        const users = existingUsers ? JSON.parse(existingUsers) : {};
        
        const user = users[credentials.email];
        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        // Convertir la fecha si es necesario
        const userData: User = {
          ...user,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        };

        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        console.log('Usuario logueado exitosamente en AsyncStorage');
        return userData;
      } catch (error: any) {
        console.error('Error en login con AsyncStorage:', error);
        throw new Error(error.message);
      }
    }
  }

  static async logout(): Promise<void> {
    console.log('🚪 [AuthService] Iniciando logout...');
    console.log('🚪 [AuthService] Firebase disponible:', isFirebaseAvailable());
    
    if (isFirebaseAvailable()) {
      try {
        console.log('🚪 [AuthService] Cerrando sesión en Firebase...');
        await signOut(auth);
        console.log('✅ [AuthService] Logout exitoso en Firebase');
      } catch (error) {
        console.error('❌ [AuthService] Error al cerrar sesión en Firebase:', error);
      }
    }
    
    // Siempre limpiar AsyncStorage
    try {
      console.log('🚪 [AuthService] Limpiando AsyncStorage...');
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      console.log('✅ [AuthService] Logout exitoso en AsyncStorage');
    } catch (error) {
      console.error('❌ [AuthService] Error al cerrar sesión en AsyncStorage:', error);
    }
    
    console.log('✅ [AuthService] Logout completado');
  }

  static async getCurrentUser(): Promise<User | null> {
    // Primero intentar con Firebase
    if (isFirebaseAvailable()) {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const userData: User = {
              id: data.id,
              email: data.email,
              username: data.username,
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
            };
            console.log('Usuario actual obtenido de Firebase');
            return userData;
          }
        }
      } catch (error) {
        console.error('Error al obtener usuario actual de Firebase:', error);
      }
    }
    
    // Fallback a AsyncStorage
    try {
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        // Convertir la fecha si es necesario
        const userWithDate: User = {
          ...user,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        };
        console.log('Usuario actual obtenido de AsyncStorage');
        return userWithDate;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario actual de AsyncStorage:', error);
      return null;
    }
  }

  static async saveSession(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }
  }
}

