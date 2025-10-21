import axios from './axios';

export interface Client {
  id: string;
  fullName: string;
  cpf: string;
  phone: string;
  email?: string;
  birthDate?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
  registrationDate: string;
  appointments?: any[];
}

export interface CreateClientData {
  fullName: string;
  cpf: string;
  phone: string;
  email?: string;
  birthDate?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
}

export const clientsApi = {
  async getAll(): Promise<{ clients: Client[] }> {
    const response = await axios.get('/clients');
    return response.data;
  },

  async getById(id: string): Promise<{ client: Client }> {
    const response = await axios.get(`/clients/${id}`);
    return response.data;
  },

  async getByCpf(cpf: string): Promise<{ client: Client | null }> {
    const response = await axios.get(`/clients/search/${cpf}`);
    return response.data;
  },

  async create(data: CreateClientData): Promise<{ client: Client }> {
    const response = await axios.post('/clients', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateClientData>): Promise<{ client: Client }> {
    const response = await axios.put(`/clients/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`/clients/${id}`);
  }
};
