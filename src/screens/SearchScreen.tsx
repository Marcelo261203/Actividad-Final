import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RhymeService } from '../services/rhymeService';
import { FavoritesService } from '../services/favoritesService';
import { Rhyme } from '../types';

export const SearchScreen: React.FC = () => {
  const [searchWord, setSearchWord] = useState('');
  const [rhymes, setRhymes] = useState<Rhyme[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const userFavorites = await FavoritesService.getFavorites();
      const favoriteWords = new Set(userFavorites.map(fav => fav.word.toLowerCase()));
      setFavorites(favoriteWords);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchWord.trim()) {
      Alert.alert('Error', 'Por favor ingresa una palabra para buscar');
      return;
    }

    console.log('🔍 Iniciando búsqueda para:', searchWord.trim());
    setLoading(true);
    try {
      const results = await RhymeService.searchRhymes(searchWord.trim(), {
        maxResults: 20,
        minScore: 50,
        includeSyllables: true
      });
      console.log('✅ Resultados obtenidos:', results.length, 'rimas');
      console.log('📝 Primeras 3 rimas:', results.slice(0, 3));
      setRhymes(results);
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      Alert.alert('Error', 'No se pudo realizar la búsqueda. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (rhyme: Rhyme) => {
    try {
      const isFavorite = favorites.has(rhyme.word.toLowerCase());
      
      if (isFavorite) {
        await FavoritesService.removeFavoriteByWord(rhyme.word);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(rhyme.word.toLowerCase());
          return newSet;
        });
      } else {
        await FavoritesService.addFavorite(rhyme.word, [rhyme]);
        setFavorites(prev => new Set(prev).add(rhyme.word.toLowerCase()));
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
      Alert.alert('Error', 'No se pudo actualizar el favorito');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    if (searchWord.trim()) {
      await handleSearch();
    }
    setRefreshing(false);
  };

  const renderRhymeItem = ({ item }: { item: Rhyme }) => {
    const isFavorite = favorites.has(item.word.toLowerCase());
    
    return (
      <View style={styles.rhymeItem}>
        <View style={styles.rhymeInfo}>
          <Text style={styles.rhymeWord}>{item.word}</Text>
          {item.numSyllables && (
            <Text style={styles.syllables}>{item.numSyllables} sílabas</Text>
          )}
          <Text style={styles.score}>Score: {item.score}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#e74c3c' : '#666'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Buscar Rimas</Text>
      <Text style={styles.subtitle}>Encuentra la rima perfecta</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        {renderHeader()}

        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="search" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Escribe una palabra..."
              value={searchWord}
              onChangeText={setSearchWord}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={rhymes}
        renderItem={renderRhymeItem}
        keyExtractor={(item) => item.word}
        style={styles.resultsList}
        contentContainerStyle={styles.resultsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && searchWord.trim() ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No se encontraron rimas</Text>
              <Text style={styles.emptySubtext}>Intenta con otra palabra</Text>
            </View>
          ) : null
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
  },
  resultsList: {
    flex: 1,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  rhymeItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rhymeInfo: {
    flex: 1,
  },
  rhymeWord: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  syllables: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  score: {
    fontSize: 12,
    color: '#999',
  },
  favoriteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

