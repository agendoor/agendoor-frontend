import React, { useState, useEffect } from 'react';

interface HistoryEntry {
  timestamp: string;
  action: string;
  description: string;
  user: string;
  changes: Array<{
    field: string;
    action: string;
    oldValue: any;
    newValue: any;
  }>;
}

interface TabHistoryProps {
  clientId: string;
  tabId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TabHistory: React.FC<TabHistoryProps> = ({ clientId, tabId, isOpen, onClose }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabName, setTabName] = useState('');
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    if (isOpen && clientId && tabId) {
      fetchHistory();
    }
  }, [isOpen, clientId, tabId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/tabs/${tabId}/history`);
      const data = await response.json();
      
      if (response.ok) {
        setHistory(data.history || []);
        setTabName(data.tabName || '');
        setClientName(data.clientName || '');
      } else {
        console.error('Erro ao buscar histórico:', data.error);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '➕';
      case 'updated': return '📝';
      case 'deleted': return '🗑️';
      default: return '📋';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return '#10b981';
      case 'updated': return '#3b82f6';
      case 'deleted': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return 'vazio';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }
    return String(value);
  };

  if (!isOpen) return null;

  return (
    <div className="history-overlay">
      <div className="history-modal">
        <div className="history-header">
          <h3>Histórico: {tabName}</h3>
          <p className="history-subtitle">Cliente: {clientName}</p>
          <button className="history-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="history-content">
          {loading ? (
            <div className="history-loading">
              <div className="loading-spinner"></div>
              <p>Carregando histórico...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="history-empty">
              <p>Nenhum histórico encontrado para esta aba.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((entry, index) => (
                <div key={index} className="history-entry">
                  <div className="history-entry-header">
                    <div className="history-entry-action">
                      <span 
                        className="history-action-icon"
                        style={{ color: getActionColor(entry.action) }}
                      >
                        {getActionIcon(entry.action)}
                      </span>
                      <span className="history-action-text">{entry.description}</span>
                    </div>
                    <div className="history-entry-meta">
                      <span className="history-user">{entry.user}</span>
                      <span className="history-timestamp">{formatTimestamp(entry.timestamp)}</span>
                    </div>
                  </div>
                  
                  {entry.changes && entry.changes.length > 0 && (
                    <div className="history-changes">
                      <h4>Alterações:</h4>
                      {entry.changes.map((change, changeIndex) => (
                        <div key={changeIndex} className="history-change">
                          <div className="change-field">
                            <strong>{change.field}</strong>
                          </div>
                          <div className="change-details">
                            {change.action === 'added' && (
                              <span className="change-added">
                                + Adicionado: {formatValue(change.newValue)}
                              </span>
                            )}
                            {change.action === 'modified' && (
                              <div className="change-modified">
                                <span className="change-old">- Era: {formatValue(change.oldValue)}</span>
                                <span className="change-new">+ Agora: {formatValue(change.newValue)}</span>
                              </div>
                            )}
                            {change.action === 'removed' && (
                              <span className="change-removed">
                                - Removido: {formatValue(change.oldValue)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabHistory;