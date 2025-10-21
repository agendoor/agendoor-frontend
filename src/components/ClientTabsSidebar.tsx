import React, { useState, useEffect } from 'react';
import '../styles/client-tabs-sidebar.css';

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

interface ClientTabsSidebarProps {
  clientName: string;
  activeTab: string | null;
  onTabSelect: (tabId: string) => void;
  onClose: () => void;
}

const ClientTabsSidebar: React.FC<ClientTabsSidebarProps> = ({
  clientName,
  activeTab,
  onTabSelect,
  onClose
}) => {
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessTypesAndConfig = async () => {
      try {
        setLoading(true);
        
        // Buscar tipos de negócio disponíveis
        const businessTypesResponse = await fetch('/api/business-types');
        const businessTypesData = await businessTypesResponse.json();
        
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
        // Set to null on error - will show empty state
        setSelectedBusinessType(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessTypesAndConfig();
  }, []);

  // Note: Removed auto-select first tab behavior to allow client profile to be shown first

  if (loading) {
    return (
      <div className="client-tabs-sidebar">
        <div className="sidebar-header">
          <div className="client-info">
            <h3>Carregando...</h3>
          </div>
        </div>
        <div className="sidebar-loading">
          <div className="loading-spinner"></div>
          <p>Carregando abas...</p>
        </div>
      </div>
    );
  }

  if (!selectedBusinessType) {
    return (
      <div className="client-tabs-sidebar">
        <div className="sidebar-header">
          <div className="client-info">
            <h3>{clientName}</h3>
          </div>
          <button className="close-sidebar-btn" onClick={onClose}>
            ←
          </button>
        </div>
        <div className="sidebar-empty">
          <p>Nenhuma aba configurada</p>
        </div>
      </div>
    );
  }

  const sortedTabs = [...selectedBusinessType.tabs]
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="client-tabs-sidebar">
      <div className="sidebar-header">
        <div className="client-info">
          <h3>{clientName}</h3>
          <p className="business-type">
            {selectedBusinessType.icon} {selectedBusinessType.name}
          </p>
        </div>
        <button className="close-sidebar-btn" onClick={onClose} title="Voltar à lista">
          ←
        </button>
      </div>

      <div className="tabs-list">
        {sortedTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-sidebar-btn ${activeTab === tab.id ? 'active' : ''} ${
              tab.isRequired ? 'required' : ''
            }`}
            onClick={() => onTabSelect(tab.id)}
            style={{ '--tab-color': tab.color } as React.CSSProperties}
          >
            <div className="tab-sidebar-icon">
              {tab.icon || '📋'}
            </div>
            <div className="tab-sidebar-content">
              <span className="tab-sidebar-name">{tab.name}</span>
              {tab.description && (
                <span className="tab-sidebar-description">{tab.description}</span>
              )}
            </div>
            {tab.isRequired && (
              <span className="required-indicator">*</span>
            )}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="profile-btn" onClick={() => onTabSelect('')}>
          👤 Ver Perfil
        </button>
      </div>
    </div>
  );
};

export default ClientTabsSidebar;