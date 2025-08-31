import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Rhyme } from '../types';

interface RhymeCardProps {
  rhyme: Rhyme;
  onFavorite: () => void;
  isFavorite: boolean;
}

export const RhymeCard: React.FC<RhymeCardProps> = ({
  rhyme,
  onFavorite,
  isFavorite,
}) => {
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(rhyme.word);
      Alert.alert('Copiado', `"${rhyme.word}" copiado al portapapeles`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'No se pudo copiar al portapapeles');
    }
  };

  const handleFavorite = () => {
    onFavorite();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.wordContainer}>
          <Text style={styles.word}>{rhyme.word}</Text>
          <Text style={styles.score}>Score: {rhyme.score}</Text>
        </View>
        
        {rhyme.syllables && (
          <Text style={styles.syllables}>
            Sílabas: {rhyme.syllables}
          </Text>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCopy}
        >
          <Ionicons name="copy-outline" size={20} color="#667eea" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#e74c3c' : '#667eea'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  wordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  word: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  score: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  syllables: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

