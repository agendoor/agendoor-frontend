import React, { useState, useEffect } from 'react';
import ClientTabForm from './ClientTabForm';
import FinalizeModal from './FinalizeModal';
import RescheduleModal from './RescheduleModal';
import '../styles/settings.css';

interface ExistingAppointmentViewProps {
  appointment: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ExistingAppointmentView: React.FC<ExistingAppointmentViewProps> = ({
  appointment,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<string>('info');
  const [businessType, setBusinessType] = useState<any>(null);
  const [tabsData, setTabsData] = useState<{ [key: string]: any }>({});
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadBusinessTypeAndTabs();
  }, []);

  const loadBusinessTypeAndTabs = async () => {
    try {
      setLoading(true);
      
      const companyConfigResponse = await fetch('/api/company/config');
      if (companyConfigResponse.ok) {
        const companyConfig = await companyConfigResponse.json();
        if (companyConfig.company?.businessType) {
          setBusinessType(companyConfig.company.businessType);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de negócio:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tabId: string) => {
    if (!appointment.clientInfo || !appointment.clientInfo.id) return;

    try {
      const response = await fetch(`/api/clients/${appointment.clientInfo.id}/tabs/${tabId}`);
      if (response.ok) {
        const data = await response.json();
        setTabsData(prev => ({ ...prev, [tabId]: data.data || {} }));
      }
    } catch (error) {
      console.error(`Erro ao carregar dados da aba ${tabId}:`, error);
    }
  };

  const handleTabData = async (tabId: string, data: any, notes?: string) => {
    if (!appointment.clientInfo || !appointment.clientInfo.id) return;

    setSaving(prev => ({ ...prev, [tabId]: true }));
    
    try {
      const response = await fetch(`/api/clients/${appointment.clientInfo.id}/tabs/${tabId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, notes, lastModifiedBy: 'Usuário' })
      });

      if (response.ok) {
        setTabsData(prev => ({ ...prev, [tabId]: data }));
      }
    } catch (error) {
      console.error('Erro ao salvar dados da aba:', error);
      alert('Erro ao salvar dados');
    } finally {
      setSaving(prev => ({ ...prev, [tabId]: false }));
    }
  };

  const handleTabChange = async (tabId: string) => {
    setActiveTab(tabId);
    
    if (tabId !== 'info' && !tabsData[tabId]) {
      await loadTabData(tabId);
    }
  };

  const getTabData = (tabId: string) => {
    return tabsData[tabId] || {};
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatStatus = (status?: string) => {
    const statusMap: { [key: string]: string } = {
      'CONFIRMED': 'Confirmado',
      'PENDING': 'Pendente',
      'CANCELLED': 'Cancelado',
      'COMPLETED': 'Concluído'
    };
    const key = status?.toUpperCase() || '';
    return statusMap[key] || status || 'Desconhecido';
  };

  const getStatusColor = (status?: string) => {
    const colorMap: { [key: string]: string } = {
      'CONFIRMED': '#22c55e',
      'PENDING': '#f59e0b',
      'CANCELLED': '#ef4444',
      'COMPLETED': '#8b5cf6'
    };
    const key = status?.toUpperCase() || '';
    return colorMap[key] || '#6b7280';
  };

  const handleConfirmAppointment = async () => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointment.id}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        if (onSave) {
          onSave({ ...appointment, status: 'CONFIRMED' });
        }
        onClose();
      } else {
        alert('Erro ao confirmar agendamento');
      }
    } catch (error) {
      console.error('Erro ao confirmar:', error);
      alert('Erro ao confirmar agendamento');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointment.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        if (onSave) {
          onSave({ ...appointment, status: 'CANCELLED' });
        }
        onClose();
      } else {
        alert('Erro ao cancelar agendamento');
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      alert('Erro ao cancelar agendamento');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-overlay">
        <div className="settings-modal">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="loading-spinner"></div>
              <p>Carregando informações...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <div className="settings-title">
            <span className="settings-icon">📋</span>
            <h2>Agendamento</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            <button 
              className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => handleTabChange('info')}
            >
              <span>ℹ️</span>
              Informações
            </button>

            {businessType?.tabs?.map((tab: any) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.name}
                {saving[tab.id] && <span style={{ marginLeft: 'auto' }}>💾</span>}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'info' && (
              <div style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '24px', color: '#1f2937', fontSize: '18px', fontWeight: 600 }}>
                  Detalhes do Agendamento
                </h3>

                <div style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        Cliente
                      </label>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: '#0c4a6e' }}>
                        {appointment.client || appointment.clientInfo?.fullName}
                      </span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        Status
                      </label>
                      <span 
                        style={{ 
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          backgroundColor: getStatusColor(appointment.status),
                          color: 'white'
                        }}
                      >
                        {formatStatus(appointment.status)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        Data
                      </label>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: '#0c4a6e' }}>
                        {formatDate(appointment.date)}
                      </span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        Horário
                      </label>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: '#0c4a6e' }}>
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: appointment.notes ? '16px' : '0' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                      Serviço
                    </label>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#0c4a6e' }}>
                      {appointment.service}
                    </span>
                  </div>

                  {appointment.notes && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        Observações
                      </label>
                      <p style={{ fontSize: '15px', color: '#0c4a6e', margin: 0 }}>
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  {appointment.urgency && (
                    <div style={{ 
                      marginTop: '16px',
                      padding: '12px',
                      background: appointment.urgency.level === 'critical' ? '#fee2e2' : '#fef3c7',
                      borderRadius: '8px'
                    }}>
                      <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        Urgência
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span 
                          style={{ 
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: appointment.urgency.level === 'critical' ? '#dc2626' : '#f59e0b',
                            color: 'white'
                          }}
                        >
                          {appointment.urgency.level.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                          {appointment.urgency.description}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                  <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ marginBottom: '16px', color: '#1f2937', fontSize: '16px', fontWeight: 600 }}>
                      Controles de Status
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {appointment.status === 'PENDING' && (
                        <button
                          onClick={handleConfirmAppointment}
                          disabled={updatingStatus}
                          style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            color: 'white',
                            cursor: updatingStatus ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            opacity: updatingStatus ? 0.6 : 1
                          }}
                        >
                          ✅ Confirmar
                        </button>
                      )}
                      <button
                        onClick={() => setShowRescheduleModal(true)}
                        disabled={updatingStatus}
                        style={{
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white',
                          cursor: updatingStatus ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: 500,
                          opacity: updatingStatus ? 0.6 : 1
                        }}
                      >
                        🔁 Reagendar
                      </button>
                      <button
                        onClick={handleCancelAppointment}
                        disabled={updatingStatus}
                        style={{
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          cursor: updatingStatus ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: 500,
                          opacity: updatingStatus ? 0.6 : 1
                        }}
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {!businessType?.tabs?.length && (
                  <div style={{
                    padding: '20px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    <p>Configure o tipo de negócio para visualizar as abas do cliente</p>
                  </div>
                )}
              </div>
            )}

            {activeTab !== 'info' && businessType?.tabs && (
              <div style={{ padding: '24px' }}>
                {(() => {
                  const currentTab = businessType.tabs.find((tab: any) => tab.id === activeTab);
                  return currentTab ? (
                    <>
                      <h3 style={{ marginBottom: '24px', color: '#1f2937', fontSize: '18px', fontWeight: 600 }}>
                        {currentTab.name}
                      </h3>
                      <ClientTabForm
                        tab={currentTab}
                        data={getTabData(currentTab.id)}
                        onDataChange={(data: any, notes?: string) => handleTabData(currentTab.id, data, notes)}
                        saving={saving[currentTab.id] || false}
                        clientId={appointment.clientInfo?.id}
                        clientName={appointment.client || appointment.clientInfo?.fullName}
                      />
                    </>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
            <button 
              className="btn-primary" 
              onClick={() => setShowFinalizeModal(true)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 600
              }}
            >
              ✅ Finalizar Atendimento
            </button>
          )}
          <button 
            className="btn-secondary" 
            onClick={onClose}
            style={{
              padding: '12px 24px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500
            }}
          >
            Fechar
          </button>
        </div>
      </div>

      {showFinalizeModal && (
        <FinalizeModal
          appointmentId={appointment.id}
          onClose={() => setShowFinalizeModal(false)}
          onSuccess={() => {
            setShowFinalizeModal(false);
            onClose();
            if (onSave) {
              onSave({ ...appointment, status: 'COMPLETED' });
            }
          }}
        />
      )}

      {showRescheduleModal && (
        <RescheduleModal
          appointment={appointment}
          onClose={() => setShowRescheduleModal(false)}
          onSuccess={() => {
            setShowRescheduleModal(false);
            onClose();
            if (onSave) {
              onSave({ ...appointment });
            }
          }}
        />
      )}
    </div>
  );
};

export default ExistingAppointmentView;
