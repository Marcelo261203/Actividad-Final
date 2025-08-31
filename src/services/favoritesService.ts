import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, isFirebaseAvailable } from '../services/firebaseService';
import { Rhyme, Favorite } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class FavoritesService {
  /**
   * Obtiene la colección de favoritos del usuario actual
   */
  private static getFavoritesCollection() {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('Usuario no autenticado en Firebase');
    }
    return collection(db, 'users', userId, 'favorites');
  }

  /**
   * Obtiene todos los favoritos del usuario actual
   */
  static async getFavorites(): Promise<Favorite[]> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          // Verificar si hay usuario autenticado en Firebase
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const favoritesRef = this.getFavoritesCollection();
            const q = query(favoritesRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const favorites: Favorite[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              favorites.push({
                id: doc.id,
                word: data.word,
                rhymes: data.rhymes,
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
              });
            });
            
            console.log('Favoritos obtenidos de Firebase');
            return favorites;
          } else {
            console.log('No hay usuario de Firebase autenticado, usando AsyncStorage');
          }
        } catch (error) {
          console.warn('Firebase falló, usando AsyncStorage:', error);
          // Continuar con AsyncStorage como respaldo
        }
      } else {
        console.log('Firebase no disponible, usando AsyncStorage');
      }

      // Fallback a AsyncStorage
      const favoritesJson = await AsyncStorage.getItem('@rhymefinder_favorites');
      if (favoritesJson) {
        console.log('Favoritos obtenidos de AsyncStorage');
        return JSON.parse(favoritesJson);
      }
      
      console.log('No hay favoritos guardados');
      return [];
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return [];
    }
  }

  /**
   * Guarda un nuevo favorito
   */
  static async addFavorite(word: string, rhymes: Rhyme[]): Promise<void> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          // Verificar si hay usuario autenticado en Firebase
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const favoritesRef = this.getFavoritesCollection();
            const newFavorite = {
              word,
              rhymes,
              createdAt: serverTimestamp(),
            };
            
            await addDoc(favoritesRef, newFavorite);
            console.log('Favorito guardado en Firebase');
            return;
          } else {
            console.log('No hay usuario de Firebase autenticado, usando AsyncStorage');
          }
        } catch (error) {
          console.warn('Firebase falló, usando AsyncStorage:', error);
          // Continuar con AsyncStorage como respaldo
        }
      } else {
        console.log('Firebase no disponible, usando AsyncStorage');
      }

      // Fallback a AsyncStorage
      const favorites = await this.getFavorites();
      const newFavorite: Favorite = {
        id: Date.now().toString(),
        word,
        rhymes,
        createdAt: new Date(),
      };
      
      favorites.push(newFavorite);
      await AsyncStorage.setItem('@rhymefinder_favorites', JSON.stringify(favorites));
      console.log('Favorito guardado en AsyncStorage');
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      throw error;
    }
  }

  /**
   * Elimina un favorito por ID
   */
  static async removeFavorite(favoriteId: string): Promise<void> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          // Verificar si hay usuario autenticado en Firebase
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const favoritesRef = this.getFavoritesCollection();
            await deleteDoc(doc(favoritesRef, favoriteId));
            console.log('Favorito eliminado de Firebase');
            return;
          } else {
            console.log('No hay usuario de Firebase autenticado, usando AsyncStorage');
          }
        } catch (error) {
          console.warn('Firebase falló, usando AsyncStorage:', error);
          // Continuar con AsyncStorage como respaldo
        }
      } else {
        console.log('Firebase no disponible, usando AsyncStorage');
      }

      // Fallback a AsyncStorage
      const favorites = await this.getFavorites();
      const filteredFavorites = favorites.filter(fav => fav.id !== favoriteId);
      await AsyncStorage.setItem('@rhymefinder_favorites', JSON.stringify(filteredFavorites));
      console.log('Favorito eliminado de AsyncStorage');
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  }

  /**
   * Verifica si una palabra ya está en favoritos
   */
  static async isFavorite(word: string): Promise<boolean> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          // Verificar si hay usuario autenticado en Firebase
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const favoritesRef = this.getFavoritesCollection();
            const q = query(favoritesRef, where('word', '==', word.toLowerCase()));
            const querySnapshot = await getDocs(q);
            
            return !querySnapshot.empty;
          } else {
            console.log('No hay usuario de Firebase autenticado, usando AsyncStorage');
          }
        } catch (error) {
          console.warn('Firebase falló, usando AsyncStorage:', error);
          // Continuar con AsyncStorage como respaldo
        }
      } else {
        console.log('Firebase no disponible, usando AsyncStorage');
      }

      // Fallback a AsyncStorage
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.word.toLowerCase() === word.toLowerCase());
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      return false;
    }
  }

  /**
   * Obtiene un favorito específico por palabra
   */
  static async getFavoriteByWord(word: string): Promise<Favorite | null> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          // Verificar si hay usuario autenticado en Firebase
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const favoritesRef = this.getFavoritesCollection();
            const q = query(favoritesRef, where('word', '==', word.toLowerCase()));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const doc = querySnapshot.docs[0];
              const data = doc.data();
              return {
                id: doc.id,
                word: data.word,
                rhymes: data.rhymes,
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
              };
            }
            
            return null;
          } else {
            console.log('No hay usuario de Firebase autenticado, usando AsyncStorage');
          }
        } catch (error) {
          console.warn('Firebase falló, usando AsyncStorage:', error);
          // Continuar con AsyncStorage como respaldo
        }
      } else {
        console.log('Firebase no disponible, usando AsyncStorage');
      }

      // Fallback a AsyncStorage
      const favorites = await this.getFavorites();
      return favorites.find(fav => fav.word.toLowerCase() === word.toLowerCase()) || null;
    } catch (error) {
      console.error('Error al obtener favorito por palabra:', error);
      return null;
    }
  }

  /**
   * Elimina un favorito por palabra
   */
  static async removeFavoriteByWord(word: string): Promise<void> {
    try {
      const favorite = await this.getFavoriteByWord(word);
      if (favorite) {
        await this.removeFavorite(favorite.id);
      }
    } catch (error) {
      console.error('Error al eliminar favorito por palabra:', error);
      throw error;
    }
  }
}

