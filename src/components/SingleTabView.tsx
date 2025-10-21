import React, { useState, useEffect } from 'react';
import ClientTabForm from './ClientTabForm';
import '../styles/single-tab-view.css';

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

interface BusinessType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  tabs: BusinessTypeTab[];
}

interface ClientTabData {
  id: string;
  clientId: string;
  tabId: string;
  data: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tab: BusinessTypeTab;
}

interface SingleTabViewProps {
  clientId: string;
  clientName: string;
  activeTabId: string;
  onDataChange?: (tabId: string, data: any) => void;
}

const SingleTabView: React.FC<SingleTabViewProps> = ({
  clientId,
  clientName,
  activeTabId,
  onDataChange
}) => {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [activeTab, setActiveTab] = useState<BusinessTypeTab | null>(null);
  const [clientTabsData, setClientTabsData] = useState<ClientTabData[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessTypesAndConfig = async () => {
      try {
        setLoading(true);
        
        // Buscar tipos de negócio disponíveis
        const businessTypesResponse = await fetch('/api/business-types');
        const businessTypesData = await businessTypesResponse.json();
        setBusinessTypes(businessTypesData.businessTypes || []);
        
        // Buscar configuração da empresa
        const companyConfigResponse = await fetch('/api/company/config');
        if (companyConfigResponse.ok) {
          const companyConfig = await companyConfigResponse.json();
          if (companyConfig.businessType) {
            setSelectedBusinessType(companyConfig.businessType);
          } else if (businessTypesData.businessTypes?.length > 0) {
            setSelectedBusinessType(businessTypesData.businessTypes[0]);
          }
        } else if (businessTypesData.businessTypes?.length > 0) {
          setSelectedBusinessType(businessTypesData.businessTypes[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar tipos de negócio:', error);
        if (businessTypes.length > 0) {
          setSelectedBusinessType(businessTypes[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessTypesAndConfig();
  }, []);

  // Find the active tab when business type and activeTabId are available
  useEffect(() => {
    if (selectedBusinessType && activeTabId) {
      const tab = selectedBusinessType.tabs.find(t => t.id === activeTabId);
      setActiveTab(tab || null);
    }
  }, [selectedBusinessType, activeTabId]);

  // Fetch client tab data
  useEffect(() => {
    const fetchClientTabsData = async () => {
      if (!clientId) return;
      
      try {
        const response = await fetch(`/api/clients/${clientId}/tabs`);
        if (response.ok) {
          const data = await response.json();
          setClientTabsData(data.clientTabs || []);
        }
      } catch (error) {
        console.error('Erro ao buscar dados das abas do cliente:', error);
      }
    };

    fetchClientTabsData();
  }, [clientId]);

  const getClientTabData = (tabId: string) => {
    const tabData = clientTabsData.find(data => data.tabId === tabId);
    if (!tabData) return {};
    
    try {
      return JSON.parse(tabData.data);
    } catch (error) {
      console.error('Erro ao fazer parse dos dados da aba:', error);
      return {};
    }
  };

  const handleTabData = async (tabId: string, data: any, notes?: string) => {
    setSaving(prev => ({ ...prev, [tabId]: true }));
    
    try {
      const response = await fetch(`/api/clients/${clientId}/tabs/${tabId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, notes }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Atualizar dados locais
        setClientTabsData(prev => {
          const existingIndex = prev.findIndex(item => item.tabId === tabId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = result.clientTab;
            return updated;
          } else {
            return [...prev, result.clientTab];
          }
        });

        // Notificar componente pai
        if (onDataChange) {
          onDataChange(tabId, data);
        }
      } else {
        console.error('Erro ao salvar dados da aba');
      }
    } catch (error) {
      console.error('Erro ao salvar dados da aba:', error);
    } finally {
      setSaving(prev => ({ ...prev, [tabId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="single-tab-view">
        <div className="tab-loading">
          <div className="loading-spinner"></div>
          <p>Carregando aba...</p>
        </div>
      </div>
    );
  }

  if (!activeTab) {
    return (
      <div className="single-tab-view">
        <div className="tab-not-found">
          <h3>Aba não encontrada</h3>
          <p>A aba selecionada não está disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="single-tab-view">
      <div className="tab-header">
        <div className="tab-info">
          <div className="tab-icon" style={{ color: activeTab.color }}>
            {activeTab.icon || '📋'}
          </div>
          <div className="tab-text">
            <h2>{activeTab.name}</h2>
            {activeTab.description && (
              <p className="tab-description">{activeTab.description}</p>
            )}
          </div>
        </div>
        {activeTab.isRequired && (
          <span className="required-badge">Obrigatório</span>
        )}
      </div>

      <div className="tab-content">
        <ClientTabForm
          tab={activeTab}
          data={getClientTabData(activeTab.id)}
          onDataChange={(data: any, notes?: string) => handleTabData(activeTab.id, data, notes)}
          saving={saving[activeTab.id] || false}
          clientId={clientId}
          clientName={clientName}
        />
      </div>
    </div>
  );
};

export default SingleTabView;