import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, isFirebaseAvailable } from '../services/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export class NotesService {
  /**
   * Obtiene la colección de notas del usuario actual
   */
  private static getNotesCollection() {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('Usuario no autenticado en Firebase');
    }
    return collection(db, 'users', userId, 'notes');
  }

  /**
   * Obtiene todas las notas del usuario actual
   */
  static async getNotes(): Promise<Note[]> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          // Verificar si hay usuario autenticado en Firebase
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const notesRef = this.getNotesCollection();
            const q = query(notesRef, orderBy('updatedAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const notes: Note[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              notes.push({
                id: doc.id,
                title: data.title,
                content: data.content,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                isFavorite: data.isFavorite || false,
              });
            });
            
            console.log('Notas obtenidas de Firebase');
            return notes;
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
      const notesJson = await AsyncStorage.getItem('@rhyme_finder_notes');
      if (notesJson) {
        console.log('Notas obtenidas de AsyncStorage');
        return JSON.parse(notesJson);
      }
      
      console.log('No hay notas guardadas');
      return [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  /**
   * Guarda una nueva nota
   */
  static async saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          const notesRef = this.getNotesCollection();
          const newNote = {
            title: note.title,
            content: note.content,
            isFavorite: note.isFavorite,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          const docRef = await addDoc(notesRef, newNote);
          const docSnap = await getDoc(docRef);
          const data = docSnap.data();
          
          return {
            id: docRef.id,
            title: data!.title,
            content: data!.content,
            createdAt: data!.createdAt?.toDate?.()?.toISOString() || data!.createdAt,
            updatedAt: data!.updatedAt?.toDate?.()?.toISOString() || data!.updatedAt,
            isFavorite: data!.isFavorite,
          };
        } catch (error) {
          console.warn('Firebase falló, usando AsyncStorage:', error);
          // Continuar con AsyncStorage como respaldo
        }
      }

      // Fallback a AsyncStorage
      const notes = await this.getNotes();
      const newNote: Note = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      notes.push(newNote);
      await AsyncStorage.setItem('@rhyme_finder_notes', JSON.stringify(notes));
      return newNote;
    } catch (error) {
      console.error('Error saving note:', error);
      throw new Error('No se pudo guardar la nota');
    }
  }

  /**
   * Actualiza una nota existente
   */
  static async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          const notesRef = this.getNotesCollection();
          const noteRef = doc(notesRef, id);
          
          const updateData = {
            ...updates,
            updatedAt: serverTimestamp(),
          };
          
          await updateDoc(noteRef, updateData);
          
          // Obtener la nota actualizada
          const docSnap = await getDoc(noteRef);
          if (!docSnap.exists()) {
            throw new Error('Nota no encontrada');
          }
          
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title,
            content: data.content,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
            isFavorite: data.isFavorite,
          };
        } catch (error) {
          console.warn('Firebase falló, usando AsyncStorage:', error);
          // Continuar con AsyncStorage como respaldo
        }
      }

      // Fallback a AsyncStorage
      const notes = await this.getNotes();
      const noteIndex = notes.findIndex(note => note.id === id);
      
      if (noteIndex === -1) {
        throw new Error('Nota no encontrada');
      }

      notes[noteIndex] = {
        ...notes[noteIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('@rhyme_finder_notes', JSON.stringify(notes));
      return notes[noteIndex];
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('No se pudo actualizar la nota');
    }
  }

  /**
   * Elimina una nota
   */
  static async deleteNote(id: string): Promise<void> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          const notesRef = this.getNotesCollection();
          await deleteDoc(doc(notesRef, id));
          return;
        } catch (error) {
          console.warn('Firebase falló, usando AsyncStorage:', error);
          // Continuar con AsyncStorage como respaldo
        }
      }

      // Fallback a AsyncStorage
      const notes = await this.getNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      await AsyncStorage.setItem('@rhyme_finder_notes', JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('No se pudo eliminar la nota');
    }
  }

  /**
   * Obtiene una nota por ID
   */
  static async getNoteById(id: string): Promise<Note | null> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          const notesRef = this.getNotesCollection();
          const docSnap = await getDoc(doc(notesRef, id));
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              title: data.title,
              content: data.content,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
              isFavorite: data.isFavorite,
            };
          }
          
          return null;
        } catch (error) {
          console.warn('Firebase falló, usando AsyncStorage:', error);
          // Continuar con AsyncStorage como respaldo
        }
      }

      // Fallback a AsyncStorage
      const notes = await this.getNotes();
      return notes.find(note => note.id === id) || null;
    } catch (error) {
      console.error('Error getting note by id:', error);
      return null;
    }
  }

  /**
   * Cambia el estado de favorito de una nota
   */
  static async toggleFavorite(id: string): Promise<Note> {
    try {
      const note = await this.getNoteById(id);
      if (!note) {
        throw new Error('Nota no encontrada');
      }
      
      return await this.updateNote(id, { isFavorite: !note.isFavorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw new Error('No se pudo cambiar el estado de favorito');
    }
  }

  /**
   * Obtiene solo las notas marcadas como favoritas
   */
  static async getFavoriteNotes(): Promise<Note[]> {
    try {
      // Intentar usar Firebase si está disponible
      if (isFirebaseAvailable()) {
        try {
          const notesRef = this.getNotesCollection();
          const q = query(notesRef, where('isFavorite', '==', true), orderBy('updatedAt', 'desc'));
          const querySnapshot = await getDocs(q);
          
          const notes: Note[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            notes.push({
              id: doc.id,
              title: data.title,
              content: data.content,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
              isFavorite: data.isFavorite,
            });
          });
          
          return notes;
        } catch (error) {
          console.warn('Firebase falló, usando AsyncStorage:', error);
          // Continuar con AsyncStorage como respaldo
        }
      }

      // Fallback a AsyncStorage
      const notes = await this.getNotes();
      return notes.filter(note => note.isFavorite);
    } catch (error) {
      console.error('Error getting favorite notes:', error);
      return [];
    }
  }
}

