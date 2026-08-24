import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, storage } from '../services/api';

export interface User {
  id: string;
  nombre: string;
  email: string;
  foto_url?: string | null;
  creado_en?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const token = await storage.getItem('accessToken');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (_error) {
      await storage.removeItem('accessToken');
      await storage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, tokens } = response.data;

    await storage.setItem('accessToken', tokens.accessToken);
    await storage.setItem('refreshToken', tokens.refreshToken);

    setUser(userData);
  };

  const register = async (nombre: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { nombre, email, password });
    const { user: userData, tokens } = response.data;

    await storage.setItem('accessToken', tokens.accessToken);
    await storage.setItem('refreshToken', tokens.refreshToken);

    setUser(userData);
  };

  const logout = async () => {
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
