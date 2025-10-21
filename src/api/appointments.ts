import axios from './axios';

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  notes?: string;
  client?: {
    id: string;
    fullName: string;
    phone: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

export interface CreateAppointmentData {
  clientId: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
  status?: string;
  notes?: string;
}

export const appointmentsApi = {
  async getAll(date?: string): Promise<{ appointments: Appointment[] }> {
    const params = date ? { date } : {};
    const response = await axios.get('/appointments', { params });
    return response.data;
  },

  async getById(id: string): Promise<{ appointment: Appointment }> {
    const response = await axios.get(`/appointments/${id}`);
    return response.data;
  },

  async create(data: CreateAppointmentData): Promise<{ appointment: Appointment }> {
    const response = await axios.post('/appointments', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateAppointmentData>): Promise<{ appointment: Appointment }> {
    const response = await axios.put(`/appointments/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<{ appointment: Appointment }> {
    const response = await axios.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`/appointments/${id}`);
  }
};
