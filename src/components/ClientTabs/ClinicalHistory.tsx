import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import './ClinicalHistory.css';

interface ClinicalHistoryProps {
  clientId: string;
}

interface HistoryItem {
  type: 'clinical_note' | 'appointment_history' | 'record';
  date: string;
  data: any;
}

const ClinicalHistory: React.FC<ClinicalHistoryProps> = ({ clientId }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, [clientId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/clients/${clientId}/history`);
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      'ANAMNESE': '📋 Anamnese',
      'PRONTUARIO': '📝 Prontuário',
      'ODONTOGRAM_ENTRY': '🦷 Procedimento Odontológico',
      'PLANO_TRATAMENTO': '📊 Plano de Tratamento',
      'appointment_history': '📅 Histórico de Agendamento',
      'record': '📄 Registro de Atendimento'
    };
    return labels[type] || type;
  };

  const renderClinicalNote = (note: any) => {
    let content = note.content;
    try {
      content = JSON.parse(note.content);
    } catch (e) {
      // Keep as string
    }

    return (
      <div className="history-card clinical-note">
        <div className="card-header">
          <span className="type-badge">{getTypeLabel(note.type)}</span>
          <span className="date">{new Date(note.createdAt).toLocaleString('pt-BR')}</span>
        </div>
        <div className="card-body">
          <h4>{note.title}</h4>
          {note.type === 'ODONTOGRAM_ENTRY' && note.meta && (
            <div className="tooth-info">
              {(() => {
                try {
                  const meta = JSON.parse(note.meta);
                  return (
                    <>
                      <span className="tooth-number">Dente {meta.tooth}</span>
                      {meta.procedureType && (
                        <span className="procedure-type">{meta.procedureType}</span>
                      )}
                    </>
                  );
                } catch (e) {
                  return null;
                }
              })()}
            </div>
          )}
          {typeof content === 'string' ? (
            <p>{content}</p>
          ) : (
            <div className="structured-content">
              {Object.entries(content).map(([key, value]) => (
                value && (
                  <div key={key} className="field">
                    <strong>{key}:</strong> {String(value)}
                  </div>
                )
              ))}
            </div>
          )}
          {note.appointment && (
            <div className="linked-appointment">
              📅 Vinculado ao agendamento de{' '}
              {new Date(note.appointment.date).toLocaleDateString('pt-BR')} -{' '}
              {note.appointment.service?.name}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAppointmentHistory = (history: any) => (
    <div className="history-card appointment-history">
      <div className="card-header">
        <span className="type-badge">{getTypeLabel('appointment_history')}</span>
        <span className="date">{new Date(history.createdAt).toLocaleString('pt-BR')}</span>
      </div>
      <div className="card-body">
        <h4>
          {history.appointment?.service?.name || 'Atendimento'} -{' '}
          {new Date(history.date).toLocaleDateString('pt-BR')}
        </h4>
        <p>Status: {history.status}</p>
        {history.notes && <p>{history.notes}</p>}
        <div className="appointment-details">
          {history.paymentMethod && <span>💳 {history.paymentMethod}</span>}
          {history.totalValue && (
            <span>
              💰 R$ {history.totalValue.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecord = (record: any) => (
    <div className="history-card record">
      <div className="card-header">
        <span className="type-badge">{getTypeLabel('record')}</span>
        <span className="date">{new Date(record.createdAt).toLocaleString('pt-BR')}</span>
      </div>
      <div className="card-body">
        <h4>Registro de Atendimento</h4>
        {record.notes && <p>{record.notes}</p>}
        {record.services && (
          <div className="services-list">
            <strong>Serviços:</strong> {record.services}
          </div>
        )}
        {record.products && (
          <div className="products-list">
            <strong>Produtos:</strong> {record.products}
          </div>
        )}
      </div>
    </div>
  );

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => {
        if (filter === 'clinical_note') return item.type === 'clinical_note';
        if (filter === 'appointment') return item.type === 'appointment_history';
        if (filter === 'record') return item.type === 'record';
        return true;
      });

  if (loading) {
    return <div className="loading">Carregando histórico...</div>;
  }

  return (
    <div className="clinical-history">
      <div className="history-header">
        <h3>📚 Histórico Clínico</h3>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Todos ({history.length})
          </button>
          <button
            className={filter === 'clinical_note' ? 'active' : ''}
            onClick={() => setFilter('clinical_note')}
          >
            Notas Clínicas ({history.filter(h => h.type === 'clinical_note').length})
          </button>
          <button
            className={filter === 'appointment' ? 'active' : ''}
            onClick={() => setFilter('appointment')}
          >
            Agendamentos ({history.filter(h => h.type === 'appointment_history').length})
          </button>
        </div>
      </div>

      <div className="history-timeline">
        {filteredHistory.length === 0 ? (
          <div className="no-history">
            <p>Nenhum registro encontrado</p>
          </div>
        ) : (
          filteredHistory.map((item, index) => (
            <div key={index} className="timeline-item">
              {item.type === 'clinical_note' && renderClinicalNote(item.data)}
              {item.type === 'appointment_history' && renderAppointmentHistory(item.data)}
              {item.type === 'record' && renderRecord(item.data)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClinicalHistory;
