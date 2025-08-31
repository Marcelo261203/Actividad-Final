import { Rhyme, ApiResponse, SearchFilters } from '../types';
import { Platform } from 'react-native';

const RHYMEBRAIN_API_BASE_URL = 'https://rhymebrain.com/talk';
// Proxy CORS para web
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Datos de prueba para cuando no hay conexión
const MOCK_RHYMES: Rhyme[] = [
  { word: 'amor', score: 100, numSyllables: 2, tags: ['n'] },
  { word: 'flor', score: 95, numSyllables: 1, tags: ['n'] },
  { word: 'dolor', score: 90, numSyllables: 2, tags: ['n'] },
  { word: 'color', score: 85, numSyllables: 2, tags: ['n'] },
  { word: 'valor', score: 80, numSyllables: 2, tags: ['n'] },
];

// Interfaz para la respuesta de RhymeBrain
interface RhymeBrainResponse {
  word: string;
  score: number;
  syllables: number;
  flags: string;
}

export class RhymeService {
  /**
   * Función para hacer peticiones con manejo de CORS
   */
  private static async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // En web, intentar primero sin proxy
    if (Platform.OS === 'web') {
      try {
        const response = await fetch(url, {
          ...options,
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
          },
        });
        
        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.log('🔄 [RhymeService] Error directo, intentando con proxy CORS...');
      }
      
      // Si falla, intentar con proxy CORS
      try {
        const proxyUrl = `${CORS_PROXY}${url}`;
        console.log('🔄 [RhymeService] Intentando con proxy:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin,
            ...options.headers,
          },
        });
        
        if (response.ok) {
          return response;
        }
      } catch (proxyError) {
        console.log('🔄 [RhymeService] Error con proxy también:', proxyError);
      }
    }
    
    // Si no es web o falló todo, intentar normal
    return fetch(url, options);
  }

  /**
   * Busca rimas para una palabra dada usando RhymeBrain
   */
  static async searchRhymes(
    word: string,
    filters: SearchFilters = {
      maxResults: 20,
      minScore: 0,
      includeSyllables: true
    }
  ): Promise<Rhyme[]> {
    try {
      const params = new URLSearchParams({
        function: 'getRhymes',
        word: word,
        maxResults: filters.maxResults.toString(),
        lang: 'es', // Especificar idioma español
      });

      const url = `${RHYMEBRAIN_API_BASE_URL}?${params}`;
      console.log('🔍 [RhymeService] Haciendo petición a:', url);
      console.log('🔍 [RhymeService] Plataforma:', Platform.OS);

      const response = await this.makeRequest(url);
      
      console.log('🔍 [RhymeService] Status de respuesta:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status} - ${response.statusText}`);
      }

      const data: RhymeBrainResponse[] = await response.json();
      
      console.log('🔍 [RhymeService] Respuesta de RhymeBrain:', data.length, 'elementos');
      console.log('🔍 [RhymeService] Primeros 3 elementos:', data.slice(0, 3));
      
      // Convertir respuesta de RhymeBrain a nuestro formato
      const filteredData = data.filter(item => item.score >= filters.minScore);
      console.log('🔍 [RhymeService] Después del filtro minScore:', filteredData.length, 'elementos');
      
      const result = filteredData.map(item => ({
        word: item.word,
        score: item.score,
        numSyllables: item.syllables,
        tags: this.parseFlags(item.flags)
      }));
      
      console.log('🔍 [RhymeService] Resultado final:', result.length, 'rimas');
      return result;
    } catch (error) {
      console.error('❌ [RhymeService] Error al buscar rimas:', error);
      
      // Si hay error de red o CORS, devolver datos de prueba
      if (error instanceof TypeError && (
        error.message.includes('fetch') || 
        error.message.includes('CORS') ||
        error.message.includes('NetworkError')
      )) {
        console.log('🔄 [RhymeService] Usando datos de prueba debido a error de red/CORS');
        return MOCK_RHYMES.filter(rhyme => 
          rhyme.word.toLowerCase().includes(word.toLowerCase()) ||
          word.toLowerCase().includes(rhyme.word.toLowerCase())
        );
      }
      
      throw error;
    }
  }

  /**
   * Busca palabras que rimen de manera aproximada
   */
  static async searchNearRhymes(
    word: string,
    filters: SearchFilters = {
      maxResults: 20,
      minScore: 0,
      includeSyllables: true
    }
  ): Promise<Rhyme[]> {
    try {
      const params = new URLSearchParams({
        function: 'getRhymes',
        word: word,
        maxResults: filters.maxResults.toString(),
        lang: 'es', // Especificar idioma español
        // RhymeBrain incluye rimas aproximadas por defecto
      });

      const response = await this.makeRequest(`${RHYMEBRAIN_API_BASE_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      const data: RhymeBrainResponse[] = await response.json();
      
      // Filtrar solo rimas aproximadas (score más bajo)
      return data
        .filter(item => item.score >= filters.minScore && item.score < 300) // Rimas aproximadas tienen score más bajo
        .map(item => ({
          word: item.word,
          score: item.score,
          numSyllables: item.syllables,
          tags: this.parseFlags(item.flags)
        }));
    } catch (error) {
      console.error('Error al buscar rimas aproximadas:', error);
      throw error;
    }
  }

  /**
   * Busca sinónimos que rimen
   */
  static async searchSynonymRhymes(
    word: string,
    filters: SearchFilters = {
      maxResults: 20,
      minScore: 0,
      includeSyllables: true
    }
  ): Promise<Rhyme[]> {
    try {
      // Primero buscar sinónimos
      const synonymParams = new URLSearchParams({
        function: 'getSynonyms',
        word: word,
        maxResults: '10',
        lang: 'es', // Especificar idioma español
      });

      const synonymResponse = await this.makeRequest(`${RHYMEBRAIN_API_BASE_URL}?${synonymParams}`);
      
      if (!synonymResponse.ok) {
        throw new Error(`Error en la API: ${synonymResponse.status}`);
      }

      const synonyms: RhymeBrainResponse[] = await synonymResponse.json();
      
      // Luego buscar rimas para cada sinónimo
      const allRhymes: Rhyme[] = [];
      
      for (const synonym of synonyms.slice(0, 3)) { // Solo los primeros 3 sinónimos
        const rhymeParams = new URLSearchParams({
          function: 'getRhymes',
          word: synonym.word,
          maxResults: '10',
          lang: 'es', // Especificar idioma español
        });

        const rhymeResponse = await this.makeRequest(`${RHYMEBRAIN_API_BASE_URL}?${rhymeParams}`);
        
        if (rhymeResponse.ok) {
          const rhymes: RhymeBrainResponse[] = await rhymeResponse.json();
          allRhymes.push(...rhymes.map(item => ({
            word: item.word,
            score: item.score,
            numSyllables: item.syllables,
            tags: this.parseFlags(item.flags)
          })));
        }
      }
      
      // Eliminar duplicados y ordenar por score
      const uniqueRhymes = allRhymes
        .filter((rhyme, index, self) => 
          index === self.findIndex(r => r.word === rhyme.word)
        )
        .filter(item => item.score >= filters.minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, filters.maxResults);
      
      return uniqueRhymes;
    } catch (error) {
      console.error('Error al buscar sinónimos que rimen:', error);
      throw error;
    }
  }

  /**
   * Busca palabras por patrón de sílabas
   */
  static async searchBySyllables(
    pattern: string,
    filters: SearchFilters = {
      maxResults: 20,
      minScore: 0,
      includeSyllables: true
    }
  ): Promise<Rhyme[]> {
    try {
      const params = new URLSearchParams({
        function: 'getWords',
        maxResults: filters.maxResults.toString(),
        lang: 'es', // Especificar idioma español
        // RhymeBrain no tiene búsqueda directa por patrón de sílabas
        // pero podemos buscar palabras y filtrar por sílabas
      });

      const response = await this.makeRequest(`${RHYMEBRAIN_API_BASE_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      const data: RhymeBrainResponse[] = await response.json();
      
      // Filtrar por número de sílabas basado en el patrón
      const syllableCount = pattern.length; // Asumimos que el patrón indica el número de sílabas
      
      return data
        .filter(item => item.syllables === syllableCount)
        .filter(item => item.score >= filters.minScore)
        .map(item => ({
          word: item.word,
          score: item.score,
          numSyllables: item.syllables,
          tags: this.parseFlags(item.flags)
        }));
    } catch (error) {
      console.error('Error al buscar por patrón de sílabas:', error);
      throw error;
    }
  }

  /**
   * Obtiene información de una palabra
   */
  static async getWordInfo(word: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        function: 'getWordInfo',
        word: word,
        lang: 'es', // Especificar idioma español
      });

      const response = await this.makeRequest(`${RHYMEBRAIN_API_BASE_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener información de la palabra:', error);
      throw error;
    }
  }

  /**
   * Parsea las flags de RhymeBrain a tags
   */
  private static parseFlags(flags: string): string[] {
    const tags: string[] = [];
    
    if (flags.includes('n')) tags.push('noun');
    if (flags.includes('v')) tags.push('verb');
    if (flags.includes('adj')) tags.push('adjective');
    if (flags.includes('adv')) tags.push('adverb');
    if (flags.includes('u')) tags.push('uncommon');
    if (flags.includes('c')) tags.push('common');
    
    return tags;
  }
}

