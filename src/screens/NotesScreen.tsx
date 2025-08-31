import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import { NotesService, Note } from '../services/notesService';
import { getKeyboardBehavior, getKeyboardVerticalOffset } from '../utils/platform';

export const NotesScreen: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  // Escuchar eventos del teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const notesData = await NotesService.getNotes();
      setNotes(notesData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'No se pudieron cargar las notas');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setShowModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowModal(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para la nota');
      return;
    }

    setSaving(true);
    try {
      if (editingNote) {
        await NotesService.updateNote(editingNote.id, { title: title.trim(), content: content.trim() });
        Alert.alert('Éxito', 'Nota actualizada correctamente');
      } else {
        await NotesService.saveNote({
          title: title.trim(),
          content: content.trim(),
          isFavorite: false,
        });
        Alert.alert('Éxito', 'Nota creada correctamente');
      }
      
      setShowModal(false);
      Keyboard.dismiss();
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'No se pudo guardar la nota');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    Keyboard.dismiss();
    setShowModal(false);
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      'Eliminar nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotesService.deleteNote(note.id);
              setNotes(prev => prev.filter(n => n.id !== note.id));
              Alert.alert('Éxito', 'Nota eliminada correctamente');
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'No se pudo eliminar la nota');
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (note: Note) => {
    try {
      const updatedNote = await NotesService.toggleFavorite(note.id);
      setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado de favorito');
    }
  };

  const handleCopyContent = async (note: Note) => {
    try {
      const textToCopy = `${note.title}\n\n${note.content}`;
      await Clipboard.setStringAsync(textToCopy);
      Alert.alert('Copiado', 'Contenido copiado al portapapeles');
    } catch (error) {
      console.error('Error copying content:', error);
      Alert.alert('Error', 'No se pudo copiar al portapapeles');
    }
  };

  const formatDate = (dateString: string | Date | any) => {
    try {
      let date: Date;
      
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        date = new Date(dateString);
      } else if (dateString && typeof dateString === 'object' && dateString.toDate) {
        // Firebase Timestamp
        date = dateString.toDate();
      } else if (dateString && typeof dateString === 'object' && dateString.seconds) {
        // Firebase Timestamp object
        date = new Date(dateString.seconds * 1000);
      } else {
        date = new Date(dateString);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'recientemente';
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'recientemente';
    }
  };

  const renderNoteItem = useCallback(({ item }: { item: Note }) => (
    <View style={styles.noteContainer}>
      <View style={styles.noteHeader}>
        <View style={styles.noteInfo}>
          <Text style={styles.noteTitle}>{item.title}</Text>
          <Text style={styles.noteDate}>{formatDate(item.updatedAt)}</Text>
        </View>
        <View style={styles.noteActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleFavorite(item)}
          >
            <Ionicons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={item.isFavorite ? '#e74c3c' : '#667eea'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCopyContent(item)}
          >
            <Ionicons name="copy-outline" size={20} color="#667eea" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditNote(item)}
          >
            <Ionicons name="create-outline" size={20} color="#667eea" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteNote(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.noteContent} numberOfLines={3}>
        {item.content}
      </Text>
    </View>
  ), []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No hay notas</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primera nota para guardar tus poemas y composiciones
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Mis Notas</Text>
      <Text style={styles.subtitle}>Poemas y composiciones</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        {renderHeader()}
        
        {notes.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
            </Text>
          </View>
        )}
      </LinearGradient>

      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: keyboardVisible ? 20 : 120 } // Ajustar padding según el teclado
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: keyboardVisible ? 20 : 80 } // Ajustar posición del FAB según el teclado
        ]}
        onPress={handleNewNote}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
                    behavior={getKeyboardBehavior()}
        keyboardVerticalOffset={getKeyboardVerticalOffset()}
            enabled={true}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>
                {editingNote ? 'Editar Nota' : 'Nueva Nota'}
              </Text>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveNote}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#667eea" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                    Guardar
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <TextInput
                style={styles.titleInput}
                placeholder="Título de la nota"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                returnKeyType="next"
                blurOnSubmit={false}
              />
              
              <TextInput
                style={styles.contentInput}
                placeholder="Escribe tu poema, composición o notas aquí..."
                placeholderTextColor="#999"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                returnKeyType="default"
                blurOnSubmit={true}
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradientBackground: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  statsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  noteContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  noteActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalButton: {
    padding: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: '#667eea',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
    marginBottom: 16,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});
