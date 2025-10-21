import { useState, useEffect } from 'react';
import { clientsApi } from '../api/clients';
import type { Client } from '../api/clients';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { clients: fetchedClients } = await clientsApi.getAll();
      setClients(fetchedClients);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    isLoading,
    error,
    refetch: fetchClients
  };
};
