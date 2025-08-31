import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthState = async () => {
    try {
      console.log('🔍 [AuthContext] Verificando estado de autenticación...');
      const currentUser = await AuthService.getCurrentUser();
      console.log('🔍 [AuthContext] Usuario actual:', currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error('❌ [AuthContext] Error al verificar estado de autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    console.log('✅ [AuthContext] Login exitoso:', userData);
    setUser(userData);
  };

  const logout = async () => {
    try {
      console.log('🚪 [AuthContext] Iniciando logout...');
      await AuthService.logout();
      console.log('✅ [AuthContext] AuthService.logout() completado');
      setUser(null);
      console.log('✅ [AuthContext] Estado de usuario actualizado a null');
    } catch (error) {
      console.error('❌ [AuthContext] Error al cerrar sesión:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

