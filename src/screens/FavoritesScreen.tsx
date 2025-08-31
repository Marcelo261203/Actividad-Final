import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesService } from '../services/favoritesService';
import { Favorite, Rhyme } from '../types';

export const FavoritesScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const userFavorites = await FavoritesService.getFavorites();
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      Alert.alert('Error', 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const removeFavorite = async (favorite: Favorite) => {
    Alert.alert(
      'Eliminar Favorito',
      `¿Estás seguro de que quieres eliminar "${favorite.word}" de tus favoritos?`,
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
              await FavoritesService.removeFavorite(favorite.id);
              setFavorites(prev => prev.filter(fav => fav.id !== favorite.id));
            } catch (error) {
              console.error('Error al eliminar favorito:', error);
              Alert.alert('Error', 'No se pudo eliminar el favorito');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date | string | any): string => {
    try {
      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date && typeof date === 'object' && date.toDate) {
        // Firebase Timestamp
        dateObj = date.toDate();
      } else if (date && typeof date === 'object' && date.seconds) {
        // Firebase Timestamp object
        dateObj = new Date(date.seconds * 1000);
      } else {
        dateObj = new Date(date);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        return 'recientemente';
      }
      
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'recientemente';
    }
  };

  const renderFavoriteItem = ({ item }: { item: Favorite }) => (
    <View style={styles.favoriteItem}>
      <View style={styles.favoriteHeader}>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteWord}>{item.word}</Text>
          <Text style={styles.favoriteDate}>
            Agregado el {formatDate(item.createdAt)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
      
      {item.rhymes && item.rhymes.length > 0 && (
        <View style={styles.rhymesContainer}>
          <Text style={styles.rhymesTitle}>Rimas encontradas:</Text>
          <View style={styles.rhymesList}>
            {item.rhymes.slice(0, 3).map((rhyme: Rhyme, index: number) => (
              <View key={index} style={styles.rhymeTag}>
                <Text style={styles.rhymeText}>{rhyme.word}</Text>
                {rhyme.numSyllables && (
                  <Text style={styles.syllablesText}>{rhyme.numSyllables}s</Text>
                )}
              </View>
            ))}
            {item.rhymes.length > 3 && (
              <Text style={styles.moreRhymes}>+{item.rhymes.length - 3} más</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Mis Favoritos</Text>
      <Text style={styles.subtitle}>
        {favorites.length} {favorites.length === 1 ? 'palabra guardada' : 'palabras guardadas'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Cargando favoritos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        {renderHeader()}
      </LinearGradient>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        style={styles.favoritesList}
        contentContainerStyle={styles.favoritesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No tienes favoritos</Text>
            <Text style={styles.emptyText}>
              Las palabras que marques como favoritas aparecerán aquí
            </Text>
            <Text style={styles.emptySubtext}>
              Ve a la pestaña "Buscar" para encontrar rimas
            </Text>
          </View>
        }
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
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
  favoritesList: {
    flex: 1,
  },
  favoritesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  favoriteItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteWord: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  favoriteDate: {
    fontSize: 14,
    color: '#999',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  rhymesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  rhymesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  rhymesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rhymeTag: {
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rhymeText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  syllablesText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  moreRhymes: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

