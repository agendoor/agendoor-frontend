import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../../api/auth';
import type { User } from '../../api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authApi.getStoredUser();
      const token = authApi.getStoredToken();

      if (storedUser && token) {
        try {
          const { user: validatedUser } = await authApi.me();
          setUser(validatedUser);
        } catch (error) {
          console.error('Token inválido:', error);
          authApi.logout();
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao fazer login');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
