import React from 'react';
import '../styles/urgent-panel.css';





interface UrgentPanelProps {
  appointments: any[]; // Use any para evitar conflitos de tipo
  onAppointmentClick?: (appointment: any) => void;
  onClose?: () => void;
}

const UrgentPanel: React.FC<UrgentPanelProps> = ({ appointments, onAppointmentClick, onClose }) => {
  // Filtrar apenas appointments com urgência
  const urgentAppointments = appointments.filter(apt => apt.urgency);

  // Ordenar por criticidade e depois por data/hora
  const sortedUrgentAppointments = urgentAppointments.sort((a, b) => {
    // Definir ordem de criticidade: critical (vermelho) > high/medium (amarelo) > low
    const urgencyOrder = { critical: 1, high: 2, medium: 2, low: 3 };
    
    const aOrder = urgencyOrder[a.urgency!.level as keyof typeof urgencyOrder] || 999;
    const bOrder = urgencyOrder[b.urgency!.level as keyof typeof urgencyOrder] || 999;
    
    // Se níveis diferentes, ordenar por criticidade
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // Se mesmo nível, ordenar por data/hora de reporte (mais antigos primeiro)
    return new Date(a.urgency!.reportedAt).getTime() - new Date(b.urgency!.reportedAt).getTime();
  });

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffMinutes}min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d atrás`;
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#dc2626'; // Vermelho
      case 'high':
      case 'medium':
        return '#f59e0b'; // Amarelo/Laranja
      default:
        return '#6b7280'; // Cinza
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'critical':
        return 'CRÍTICO';
      case 'high':
        return 'URGENTE';
      case 'medium':
        return 'NORMAL';
      default:
        return 'BAIXO';
    }
  };

  return (
    <div className="urgent-panel">
      <div className="urgent-panel-header">
        <div className="urgent-header-content">
          <div className="urgent-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
          <h3>Sala de Espera - Urgências</h3>
        </div>
        <div className="urgent-header-actions">
          <div className="urgent-count">
            {sortedUrgentAppointments.length}
          </div>
          {onClose && (
            <button className="urgent-close-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="urgent-panel-content">
        {sortedUrgentAppointments.length === 0 ? (
          <div className="no-urgent-appointments">
            <div className="no-urgent-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="9 12l2 2 4-4"/>
              </svg>
            </div>
            <p>Nenhum atendimento urgente</p>
            <span>Todos os clientes estão sendo atendidos normalmente</span>
          </div>
        ) : (
          <div className="urgent-appointments-list">
            {sortedUrgentAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className={`urgent-appointment-card ${appointment.urgency!.level === 'critical' ? 'critical-card' : ''}`}
                onClick={() => onAppointmentClick?.(appointment)}
                style={{ borderLeftColor: getUrgencyColor(appointment.urgency!.level) }}
              >
                <div className="urgent-card-content">
                  <div className="client-name">
                    {appointment.client}
                  </div>
                  
                  <div className="urgency-description">
                    {appointment.urgency!.description}
                  </div>
                  
                  <div className="card-footer">
                    <div 
                      className="urgency-badge"
                      style={{ backgroundColor: getUrgencyColor(appointment.urgency!.level) }}
                    >
                      {getUrgencyLabel(appointment.urgency!.level)}
                    </div>
                    <div className="reported-time">
                      {formatDateTime(appointment.urgency!.reportedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UrgentPanel;