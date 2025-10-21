import { useState, useEffect } from 'react';
import { appointmentsApi } from '../api/appointments';
import type { Appointment } from '../api/appointments';

export const useAppointments = (date?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { appointments: fetchedAppointments } = await appointmentsApi.getAll(date);
      setAppointments(fetchedAppointments);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  return {
    appointments,
    isLoading,
    error,
    refetch: fetchAppointments
  };
};
