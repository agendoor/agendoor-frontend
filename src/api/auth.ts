import axios from './axios';
import { auth } from '../config/firebase'; // Importa a instância do auth do Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';\nimport type { User as FirebaseUser } from 'firebase/auth';

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  companyName: string;
  companyPhone: string;
  companyCep: string;
  companyStreet: string;
  companyNumber: string;
  companyComplement?: string;
  companyNeighborhood: string;
  companyCity: string;
  companyState: string;
  businessTypeId?: string;
  businessDays: number[];
  plan: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  company?: {
    id: string;
    name: string;
    businessTypeId?: string;
  };
}

export interface AuthResponse {
  token: string; // Firebase token
  user: User; // User data from our backend after Firebase auth
  message?: string;
}

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      // Enviar o token do Firebase e outros dados do usuário para o backend para criar o perfil no Prisma
      const response = await axios.post('/auth/register', { ...data, firebaseId: firebaseUser.uid, idToken });
      return response.data;
    } catch (error: any) {
      console.error('Erro no registro com Firebase:', error.message);
      throw new Error(error.message || 'Erro ao registrar usuário com Firebase.');
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      // Enviar o token do Firebase para o backend para validação e obtenção de dados do usuário
      const response = await axios.post('/auth/login', { idToken });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token); // Este token pode ser o JWT do backend ou o idToken do Firebase
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Erro no login com Firebase:', error.message);
      throw new Error(error.message || 'Erro ao fazer login com Firebase.');
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      // Não precisamos mais chamar o backend para logout, apenas limpar o estado local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
    } catch (error: any) {
      console.error('Erro ao fazer logout com Firebase:', error.message);
      throw new Error(error.message || 'Erro ao fazer logout com Firebase.');
    }
  },

  async me(idToken: string): Promise<{ user: User }> {
    const response = await axios.get("/auth/me", { headers: { Authorization: `Bearer ${idToken}` } });
    return response.data;
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
};


