import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useClients } from '../hooks/useClients';
import { clientsApi } from '../api/clients';
import type { Client, CreateClientData } from '../api/clients';
import { ClientForm } from '../features/clients';
import ClientTabsView from '../components/ClientTabsView';
import TopBar from '../components/TopBar';
import '../styles/dashboard.css';
import '../styles/client-module.css';
import '../styles/clients-chatgpt-layout.css';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { clients, isLoading, refetch } = useClients();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'new'>('all');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      navigate('/login', { replace: true });
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleSubmitClient = async (data: CreateClientData) => {
    if (editingClient) {
      await clientsApi.update(editingClient.id, data);
    } else {
      await clientsApi.create(data);
    }
    await refetch();
    handleCloseForm();
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  const handleCloseClientView = () => {
    setSelectedClient(null);
  };

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.cpf.includes(searchTerm) ||
                         client.phone.includes(searchTerm);
    
    if (!matchesSearch) return false;

    const registrationDate = new Date(client.registrationDate);
    const daysSinceRegistration = (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (filterType === 'new') {
      return daysSinceRegistration <= 30;
    } else if (filterType === 'recent') {
      return (client.appointments?.length || 0) > 0;
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="dashboard">
      <TopBar 
        onLogout={handleLogout}
        userWelcome={user ? `Olá, ${user.fullName.split(' ')[0]}!` : 'Olá!'}
      />

      <div className="clients-chatgpt-layout">
        {/* Sidebar Esquerda */}
        <div className="clients-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">
              <h3>👥 Clientes</h3>
              <span className="clients-count">{filteredClients.length}</span>
            </div>
            <button className="btn-add-client" onClick={handleAddClient} title="Novo Cliente">
              +
            </button>
          </div>

          {/* Filtros */}
          <div className="sidebar-filters">
            <input
              type="text"
              placeholder="🔍 Buscar clientes..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                Todos
              </button>
              <button
                className={`filter-btn ${filterType === 'new' ? 'active' : ''}`}
                onClick={() => setFilterType('new')}
              >
                🆕 Novos
              </button>
              <button
                className={`filter-btn ${filterType === 'recent' ? 'active' : ''}`}
                onClick={() => setFilterType('recent')}
              >
                🔁 Recorrentes
              </button>
            </div>
          </div>

          {/* Lista de Clientes */}
          <div className="clients-list">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Carregando...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="empty-state-sidebar">
                <p>Nenhum cliente encontrado</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`client-item ${selectedClient?.id === client.id ? 'active' : ''}`}
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="client-avatar">
                    {client.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="client-item-info">
                    <div className="client-name">{client.fullName}</div>
                    <div className="client-meta">
                      <span className="client-phone">{formatPhone(client.phone)}</span>
                    </div>
                    <div className="client-date">
                      Cadastro: {formatDate(client.registrationDate)}
                    </div>
                  </div>
                  <button
                    className="client-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClient(client);
                    }}
                    title="Editar cliente"
                  >
                    ✏️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área Principal */}
        <div className="clients-main-area">
          {selectedClient ? (
            <ClientTabsView
              clientId={selectedClient.id}
              clientName={selectedClient.fullName}
              onClose={handleCloseClientView}
            />
          ) : (
            <div className="clients-cards-container">
              <div className="cards-header">
                <h2>Todos os Clientes</h2>
                <p className="subtitle">Selecione um cliente na barra lateral para ver detalhes</p>
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Carregando clientes...</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>Nenhum cliente cadastrado</h3>
                  <p>Comece adicionando seu primeiro cliente ao sistema</p>
                  <button className="btn-primary" onClick={handleAddClient}>
                    + Adicionar Primeiro Cliente
                  </button>
                </div>
              ) : (
                <div className="clients-cards-grid">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="client-card"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="card-header">
                        <div className="card-avatar">
                          {client.fullName.charAt(0).toUpperCase()}
                        </div>
                        <button
                          className="card-edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClient(client);
                          }}
                          title="Editar"
                        >
                          ✏️
                        </button>
                      </div>
                      <div className="card-body">
                        <h3 className="card-name">{client.fullName}</h3>
                        <div className="card-info">
                          <div className="info-row">
                            <span className="info-label">📱</span>
                            <span className="info-value">{formatPhone(client.phone)}</span>
                          </div>
                          {client.email && (
                            <div className="info-row">
                              <span className="info-label">📧</span>
                              <span className="info-value">{client.email}</span>
                            </div>
                          )}
                          <div className="info-row">
                            <span className="info-label">📅</span>
                            <span className="info-value">Cadastro: {formatDate(client.registrationDate)}</span>
                          </div>
                          {client.appointments && client.appointments.length > 0 && (
                            <div className="info-row">
                              <span className="info-label">🔁</span>
                              <span className="info-value">{client.appointments.length} agendamento(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-footer">
                        <span className="view-details">Ver detalhes →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ClientForm
        client={editingClient}
        onSubmit={handleSubmitClient}
        onCancel={handleCloseForm}
        isOpen={isFormOpen}
      />
    </div>
  );
};

export default Clients;
