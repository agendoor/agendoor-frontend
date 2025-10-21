import React, { useState, useEffect } from 'react';
import ClientTabForm from './ClientTabForm';
import '../styles/client-tabs-view.css';

interface BusinessType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  tabs: BusinessTypeTab[];
}

interface BusinessTypeTab {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isRequired: boolean;
  sortOrder: number;
  fieldConfig: string;
}

interface ClientTabData {
  id: string;
  clientId: string;
  tabId: string;
  data: string;
  notes?: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  tab: BusinessTypeTab;
}

interface ClientTabsViewProps {
  clientId: string;
  clientName: string;
  onClose: () => void;
}

const ClientTabsView: React.FC<ClientTabsViewProps> = ({ 
  clientId, 
  clientName,
  onClose 
}) => {
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [clientTabsData, setClientTabsData] = useState<ClientTabData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Buscar configuração da empresa e tipos de negócio disponíveis
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar configuração da empresa
        const companyResponse = await fetch('/api/company/config');
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          
          if (companyData.company?.businessType) {
            setBusinessType(companyData.company.businessType);
            
            // Definir primeira aba como ativa
            if (companyData.company.businessType.tabs?.length > 0) {
              setActiveTab(companyData.company.businessType.tabs[0].id);
            }
          }
        }
        
        // Buscar dados das abas do cliente
        const tabDataResponse = await fetch(`/api/clients/${clientId}/tabs`);
        if (tabDataResponse.ok) {
          const tabData = await tabDataResponse.json();
          setClientTabsData(tabData.clientTabData || []);
        }
        
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  const loadClientHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clients/${clientId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClientHistory(data.history || []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadClientHistory();
    }
  }, [activeTab, clientId]);

  const handleTabData = async (tabId: string, data: any, notes?: string) => {
    setSaving({ ...saving, [tabId]: true });
    
    try {
      const response = await fetch(`/api/clients/${clientId}/tabs/${tabId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          notes,
          lastModifiedBy: 'current_user' // TODO: pegar do contexto de auth
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Atualizar dados locais
        setClientTabsData(prev => {
          const existing = prev.find(item => item.tabId === tabId);
          if (existing) {
            return prev.map(item => 
              item.tabId === tabId ? result.clientTabData : item
            );
          } else {
            return [...prev, result.clientTabData];
          }
        });
      }
    } catch (error) {
      console.error('Erro ao salvar dados da aba:', error);
    } finally {
      setSaving({ ...saving, [tabId]: false });
    }
  };

  const getTabData = (tabId: string) => {
    const tabData = clientTabsData.find(item => item.tabId === tabId);
    if (!tabData?.data) return {};
    
    try {
      return JSON.parse(tabData.data);
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="client-tabs-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados do cliente...</p>
      </div>
    );
  }

  if (!businessType) {
    return (
      <div className="client-tabs-error">
        <h3>⚠️ Configuração Necessária</h3>
        <p>Nenhum tipo de negócio configurado para esta empresa.</p>
        <p>Configure o tipo de negócio nas configurações da empresa.</p>
      </div>
    );
  }

  const activeTabData = businessType.tabs.find(tab => tab.id === activeTab);

  return (
    <div className="client-tabs-view">
      {/* Header do cliente */}
      <div className="client-header">
        <div className="client-info">
          <h2>👤 {clientName}</h2>
          <span className="business-type-badge" style={{ backgroundColor: businessType.color }}>
            {businessType.icon} {businessType.name}
          </span>
        </div>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Tabs no topo do card */}
      <div className="tabs-container">
        <div className="tabs-header">
          {businessType.tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                '--tab-color': tab.color || businessType.color || '#3b82f6'
              } as any}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
              {saving[tab.id] && (
                <span className="tab-saving">💾</span>
              )}
            </button>
          ))}
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{
              '--tab-color': '#8b5cf6'
            } as any}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-name">Histórico</span>
          </button>
        </div>

        {/* Conteúdo da aba ativa */}
        <div className="tab-content">
          {activeTabData && activeTab !== 'history' && (
            <div className="tab-panel">
              <div className="tab-panel-header">
                <h3>
                  <span className="tab-panel-icon">{activeTabData.icon}</span>
                  {activeTabData.name}
                </h3>
                {activeTabData.description && (
                  <p className="tab-panel-description">{activeTabData.description}</p>
                )}
              </div>
              
              <div className="tab-panel-content">
                <ClientTabForm
                  tab={activeTabData}
                  data={getTabData(activeTabData.id)}
                  onDataChange={(data: any, notes?: string) => handleTabData(activeTabData.id, data, notes)}
                  saving={saving[activeTabData.id] || false}
                  clientId={clientId}
                  clientName={clientName}
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-panel">
              <div className="tab-panel-header">
                <h3>
                  <span className="tab-panel-icon">📋</span>
                  Histórico de Atendimentos
                </h3>
                <p className="tab-panel-description">Registro de todos os atendimentos realizados</p>
              </div>
              
              <div className="tab-panel-content">
                {historyLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-spinner"></div>
                    <p>Carregando histórico...</p>
                  </div>
                ) : clientHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <h4>Nenhum atendimento registrado</h4>
                    <p>O histórico aparecerá aqui após o primeiro atendimento finalizado</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {clientHistory.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '20px',
                          background: 'white'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                              {new Date(item.date).toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                              {item.paymentMethod}
                            </div>
                          </div>
                          <div style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            background: item.status === 'PAID' ? '#dcfce7' : '#fef3c7',
                            color: item.status === 'PAID' ? '#15803d' : '#a16207'
                          }}>
                            {item.status === 'PAID' ? 'Pago' : 'Pendente'}
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>Serviços:</div>
                          <div style={{ fontSize: '14px', color: '#374151' }}>
                            {item.servicesData.map((s: any) => s.name).join(', ')}
                          </div>
                        </div>

                        {item.productsData && item.productsData.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>Produtos:</div>
                            <div style={{ fontSize: '14px', color: '#374151' }}>
                              {item.productsData.map((p: any) => `${p.name} (${p.qty}x)`).join(', ')}
                            </div>
                          </div>
                        )}

                        {item.notes && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>Observações:</div>
                            <div style={{ fontSize: '14px', color: '#374151' }}>{item.notes}</div>
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '16px',
                          borderTop: '1px solid #e5e7eb',
                          marginTop: '16px'
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                            R$ {item.totalValue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientTabsView;