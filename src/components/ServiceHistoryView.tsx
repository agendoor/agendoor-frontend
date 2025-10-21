import React, { useState, useEffect } from 'react';

interface ServiceRecord {
  id: string;
  date: string;
  service: {
    name: string;
    serviceType: {
      name: string;
      icon?: string;
    };
  };
  status: string;
  value?: number;
  professional?: string;
}

interface ServiceHistoryViewProps {
  clientId: string;
  clientName: string;
}

const ServiceHistoryView: React.FC<ServiceHistoryViewProps> = ({
  clientId,
  clientName
}) => {
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceHistory = async () => {
      try {
        const response = await fetch(`/api/clients/${clientId}/service-history`);
        const data = await response.json();
        setServiceHistory(data.serviceHistory || []);
      } catch (error) {
        console.error('Erro ao buscar histórico de serviços:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceHistory();
  }, [clientId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'no_show': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'Faltou';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="service-history-loading">
        <div className="loading-spinner"></div>
        <p>Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="service-history-view">
      <div className="history-header">
        <h3>📅 Histórico de Serviços</h3>
        <p>Cliente: <strong>{clientName}</strong></p>
        <div className="stats">
          <span className="stat-item">
            Total de serviços: <strong>{serviceHistory.length}</strong>
          </span>
          <span className="stat-item">
            Valor total: <strong>
              {formatCurrency(
                serviceHistory.reduce((sum, service) => sum + (service.value || 0), 0)
              )}
            </strong>
          </span>
        </div>
      </div>

      <div className="history-list">
        {serviceHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h4>Nenhum serviço encontrado</h4>
            <p>Este cliente ainda não possui histórico de serviços.</p>
          </div>
        ) : (
          serviceHistory.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <div className="service-info">
                  <span className="service-icon">
                    {service.service.serviceType.icon || '🔧'}
                  </span>
                  <div className="service-details">
                    <h4>{service.service.name}</h4>
                    <p className="service-type">{service.service.serviceType.name}</p>
                  </div>
                </div>
                <div className="service-meta">
                  <span className="service-date">{formatDate(service.date)}</span>
                  <span 
                    className="service-status"
                    style={{ color: getStatusColor(service.status) }}
                  >
                    {getStatusLabel(service.status)}
                  </span>
                </div>
              </div>
              
              <div className="service-footer">
                {service.value && (
                  <span className="service-value">
                    {formatCurrency(service.value)}
                  </span>
                )}
                {service.professional && (
                  <span className="service-professional">
                    👤 {service.professional}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ServiceHistoryView;