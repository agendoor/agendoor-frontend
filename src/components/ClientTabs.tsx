import React, { useState, useEffect } from 'react';
import ClientTabForm from './ClientTabForm';
import '../styles/client-tabs.css';

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

interface ClientTabsProps {
  clientId: string;
  clientName?: string;
  businessTypeId?: string;
  onDataChange?: (tabId: string, data: any) => void;
}

const ClientTabs: React.FC<ClientTabsProps> = ({ 
  clientId, 
  clientName,
  businessTypeId, 
  onDataChange 
}) => {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [clientTabsData, setClientTabsData] = useState<ClientTabData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  // Buscar configuração da empresa e tipos de negócio disponíveis
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar tipos de negócio disponíveis
        const businessTypesResponse = await fetch('/api/business-types');
        const businessTypesData = await businessTypesResponse.json();
        setBusinessTypes(businessTypesData.businessTypes);
        
        // Buscar configuração da empresa
        const companyResponse = await fetch('/api/company/config');
        const companyData = await companyResponse.json();
        
        let typeToSelect = null;
        
        // Prioridade de seleção:
        // 1. businessTypeId passado como prop (override)
        // 2. Tipo de negócio configurado da empresa
        // 3. Nenhum selecionado (usuário escolhe)
        if (businessTypeId) {
          typeToSelect = businessTypesData.businessTypes.find((type: BusinessType) => type.id === businessTypeId);
        } else if (companyData.company?.businessType) {
          typeToSelect = companyData.company.businessType;
        }
        
        if (typeToSelect) {
          setSelectedBusinessType(typeToSelect);
          if (typeToSelect.tabs.length > 0) {
            setActiveTab(typeToSelect.tabs[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [businessTypeId]);

  // Buscar dados das abas do cliente
  useEffect(() => {
    if (clientId) {
      const fetchClientTabsData = async () => {
        try {
          const response = await fetch(`/api/clients/${clientId}/tabs`);
          const data = await response.json();
          setClientTabsData(data.clientTabData);
        } catch (error) {
          console.error('Erro ao buscar dados das abas do cliente:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchClientTabsData();
    }
  }, [clientId]);

  const handleBusinessTypeChange = (businessType: BusinessType) => {
    setSelectedBusinessType(businessType);
    if (businessType.tabs.length > 0) {
      setActiveTab(businessType.tabs[0].id);
    }
  };

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
          lastModifiedBy: 'current-user' // TODO: pegar do contexto de usuário
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

        // Notificar o componente pai
        if (onDataChange) {
          onDataChange(tabId, data);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar dados da aba:', error);
    } finally {
      setSaving({ ...saving, [tabId]: false });
    }
  };

  const getClientTabData = (tabId: string): any => {
    const tabData = clientTabsData.find(item => item.tabId === tabId);
    if (tabData && tabData.data) {
      try {
        return JSON.parse(tabData.data);
      } catch {
        return {};
      }
    }
    return {};
  };

  if (loading) {
    return (
      <div className="client-tabs-loading">
        <div className="loading-spinner"></div>
        <p>Carregando abas do cliente...</p>
      </div>
    );
  }

  return (
    <div className="client-tabs">
      {!businessTypeId && (
        <div className="business-type-selector">
          <h3>Selecione o tipo de negócio:</h3>
          <div className="business-types-grid">
            {businessTypes.map((businessType) => (
              <div
                key={businessType.id}
                className={`business-type-card ${
                  selectedBusinessType?.id === businessType.id ? 'selected' : ''
                }`}
                onClick={() => handleBusinessTypeChange(businessType)}
                style={{ '--business-color': businessType.color } as React.CSSProperties}
              >
                <div className="business-type-icon">
                  {businessType.icon}
                </div>
                <h4>{businessType.name}</h4>
                <p>{businessType.description}</p>
                <div className="tabs-count">
                  {businessType.tabs.length} abas disponíveis
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedBusinessType && (
        <div className="tabs-container">
          <div className="tabs-header">
            <h3>
              <span className="business-icon">{selectedBusinessType.icon}</span>
              {selectedBusinessType.name}
            </h3>
            <p className="business-description">{selectedBusinessType.description}</p>
          </div>

          <div className="tabs-navigation">
            {selectedBusinessType.tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''} ${
                  tab.isRequired ? 'required' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
                style={{ '--tab-color': tab.color } as React.CSSProperties}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-name">{tab.name}</span>
                {tab.isRequired && <span className="required-indicator">*</span>}
              </button>
            ))}
          </div>

          <div className="tabs-content">
            {selectedBusinessType.tabs
              .filter(tab => tab.id === activeTab)
              .map((tab) => (
                <div key={tab.id} className="tab-content">
                  <div className="tab-content-header">
                    <h4>
                      <span className="tab-icon">{tab.icon}</span>
                      {tab.name}
                    </h4>
                    <p className="tab-description">{tab.description}</p>
                  </div>

                  <ClientTabForm
                    tab={tab}
                    data={getClientTabData(tab.id)}
                    onDataChange={(data: any, notes?: string) => handleTabData(tab.id, data, notes)}
                    saving={saving[tab.id] || false}
                    clientId={clientId}
                    clientName={clientName}
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientTabs;