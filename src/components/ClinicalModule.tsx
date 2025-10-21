import React, { useState } from 'react';
import Odontogram from './Odontogram/Odontogram';
import AnamneseForm from './ClientTabs/AnamneseForm';
import ProntuarioForm from './ClientTabs/ProntuarioForm';
import ClinicalHistory from './ClientTabs/ClinicalHistory';
import './ClinicalModule.css';

interface ClinicalModuleProps {
  clientId: string;
  appointmentId?: string;
  readOnly?: boolean;
}

const ClinicalModule: React.FC<ClinicalModuleProps> = ({ 
  clientId, 
  appointmentId, 
  readOnly = false 
}) => {
  const [activeTab, setActiveTab] = useState('anamnese');

  const tabs = [
    { id: 'anamnese', label: '📋 Anamnese', show: !appointmentId },
    { id: 'prontuario', label: '📝 Prontuário', show: true },
    { id: 'odontograma', label: '🦷 Odontograma', show: true },
    { id: 'historico', label: '📚 Histórico', show: !appointmentId }
  ].filter(tab => tab.show);

  return (
    <div className="clinical-module">
      <div className="clinical-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="clinical-content">
        {activeTab === 'anamnese' && <AnamneseForm clientId={clientId} />}
        {activeTab === 'prontuario' && (
          <ProntuarioForm clientId={clientId} appointmentId={appointmentId} />
        )}
        {activeTab === 'odontograma' && (
          <Odontogram clientId={clientId} readOnly={readOnly} />
        )}
        {activeTab === 'historico' && <ClinicalHistory clientId={clientId} />}
      </div>
    </div>
  );
};

export default ClinicalModule;
