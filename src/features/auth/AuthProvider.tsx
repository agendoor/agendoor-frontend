import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../../api/auth';
import type { User } from '../../api/auth';
import { auth } from '../../config/firebase'; // Importa a instância do auth do Firebase
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  firebaseUser: FirebaseUser | null; // Adiciona o usuário do Firebase diretamente
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userCredential) => {
      if (userCredential) {
        setFirebaseUser(userCredential);
        try {
          // Quando o usuário do Firebase está presente, tentamos obter os dados do nosso backend
          const idToken = await userCredential.getIdToken();
          const response = await authApi.me(idToken); // Passa o idToken para o backend
          setUser(response.user);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', userCredential.email || '');
        } catch (error) {
          console.error('Erro ao obter dados do usuário do backend após login Firebase:', error);
          authApi.logout(); // Limpa o estado local e desloga do Firebase se o backend falhar
          setUser(null);
          setFirebaseUser(null);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('token'); // Certifica que o token local também é removido
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authApi.login({ email, password }); // authApi agora usa signInWithEmailAndPassword
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout(); // authApi agora usa signOut do Firebase
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setUser,
    firebaseUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
