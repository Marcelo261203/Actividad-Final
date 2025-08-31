export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

// Tipos para la API de rimas
export interface ApiResponse {
  word: string;
  score: number;
  numSyllables?: number;
  tags?: string[];
}

export interface SearchFilters {
  maxResults: number;
  minScore: number;
  includeSyllables: boolean;
}

export interface Rhyme {
  word: string;
  score: number;
  numSyllables?: number;
  tags: string[];
}

export interface Favorite {
  id: string;
  word: string;
  rhymes: Rhyme[];
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
