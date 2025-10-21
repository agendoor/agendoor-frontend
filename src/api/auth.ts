import axios from './axios';

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
  token: string;
  user: User;
  message?: string;
}

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout(): Promise<void> {
    await axios.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
  },

  async validateToken(): Promise<{ user: User }> {
    const response = await axios.post('/auth/validate');
    return response.data;
  },

  async me(): Promise<{ user: User }> {
    const response = await axios.get('/auth/me');
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
