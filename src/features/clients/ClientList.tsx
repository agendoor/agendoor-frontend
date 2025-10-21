import React from 'react';
import type { Client } from '../../api/clients';

interface ClientListProps {
  clients: Client[];
  isLoading: boolean;
  onClientSelect?: (client: Client) => void;
  onAddClient: () => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, isLoading, onClientSelect, onAddClient }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  };

  if (isLoading) {
    return (
      <div className="clients-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clients-container">
      <div className="clients-header">
        <div>
          <h1>Clientes</h1>
          <p className="subtitle">{clients.length} cliente(s) cadastrado(s)</p>
        </div>
        <button className="btn-primary" onClick={onAddClient}>
          + Novo Cliente
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>Nenhum cliente cadastrado</h3>
          <p>Comece adicionando seu primeiro cliente ao sistema</p>
          <button className="btn-primary" onClick={onAddClient}>
            + Adicionar Primeiro Cliente
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} onClick={() => onClientSelect?.(client)}>
                  <td>
                    <div className="client-name">
                      <div className="client-avatar">
                        {client.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span>{client.fullName}</span>
                    </div>
                  </td>
                  <td>{formatCPF(client.cpf)}</td>
                  <td>{formatPhone(client.phone)}</td>
                  <td>{client.email || '-'}</td>
                  <td>{formatDate(client.registrationDate)}</td>
                  <td>
                    <button 
                      className="btn-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClientSelect?.(client);
                      }}
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientList;
