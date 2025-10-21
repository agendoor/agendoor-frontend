import React, { useState, useEffect } from 'react';
import '../styles/medical-record.css';

interface MedicalRecordEntry {
  id: string;
  date: string;
  time: string;
  type: 'consultation' | 'procedure' | 'exam' | 'observation';
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  nextAppointment?: string;
  professionalName: string;
  professionalId?: string;
}

interface MedicalRecordViewProps {
  data: { entries?: MedicalRecordEntry[] };
  onDataChange: (data: { entries: MedicalRecordEntry[] }) => void;
  clientName: string;
  readOnly?: boolean;
}

const MedicalRecordView: React.FC<MedicalRecordViewProps> = ({ 
  data, 
  onDataChange, 
  clientName,
  readOnly = false 
}) => {
  const [entries, setEntries] = useState<MedicalRecordEntry[]>([]);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<MedicalRecordEntry>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'consultation',
    professionalName: 'Dr. Usuário' // TODO: pegar do contexto de auth
  });

  useEffect(() => {
    if (data.entries) {
      setEntries(data.entries.sort((a, b) => 
        new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
      ));
    }
  }, [data]);

  const addEntry = () => {
    if (!newEntry.title || !newEntry.description) {
      alert('Título e descrição são obrigatórios');
      return;
    }

    const entry: MedicalRecordEntry = {
      id: `entry_${Date.now()}`,
      date: newEntry.date || new Date().toISOString().split('T')[0],
      time: newEntry.time || new Date().toTimeString().slice(0, 5),
      type: newEntry.type || 'consultation',
      title: newEntry.title!,
      description: newEntry.description!,
      diagnosis: newEntry.diagnosis || '',
      treatment: newEntry.treatment || '',
      medications: newEntry.medications || '',
      nextAppointment: newEntry.nextAppointment || '',
      professionalName: newEntry.professionalName || 'Dr. Usuário'
    };

    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    onDataChange({ entries: updatedEntries });
    
    // Reset form
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      type: 'consultation',
      professionalName: newEntry.professionalName
    });
    setShowNewEntryForm(false);
  };

  const deleteEntry = (entryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta entrada do prontuário?')) {
      const updatedEntries = entries.filter(e => e.id !== entryId);
      setEntries(updatedEntries);
      onDataChange({ entries: updatedEntries });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return '🩺';
      case 'procedure': return '🔧';
      case 'exam': return '🔬';
      case 'observation': return '📝';
      default: return '📋';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consulta';
      case 'procedure': return 'Procedimento';
      case 'exam': return 'Exame';
      case 'observation': return 'Observação';
      default: return 'Registro';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return '#3b82f6';
      case 'procedure': return '#10b981';
      case 'exam': return '#f59e0b';
      case 'observation': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="medical-record-container">
      <div className="medical-record-header">
        <h3>📋 Prontuário Médico</h3>
        <p className="record-subtitle">Paciente: <strong>{clientName}</strong></p>
        
        {!readOnly && (
          <button 
            className="add-entry-btn"
            onClick={() => setShowNewEntryForm(true)}
          >
            ➕ Nova Entrada
          </button>
        )}
      </div>

      {/* Formulário de nova entrada */}
      {showNewEntryForm && !readOnly && (
        <div className="new-entry-form">
          <div className="form-header">
            <h4>📝 Nova Entrada no Prontuário</h4>
            <button 
              className="form-close-btn"
              onClick={() => setShowNewEntryForm(false)}
            >
              ✕
            </button>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Hora</label>
                <input
                  type="time"
                  value={newEntry.time}
                  onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({...newEntry, type: e.target.value as any})}
                >
                  <option value="consultation">Consulta</option>
                  <option value="procedure">Procedimento</option>
                  <option value="exam">Exame</option>
                  <option value="observation">Observação</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                placeholder="Ex: Consulta de rotina, Procedimento endodôntico..."
                value={newEntry.title || ''}
                onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Descrição/Anamnese *</label>
              <textarea
                rows={4}
                placeholder="Descreva os sintomas, exame clínico, observações..."
                value={newEntry.description || ''}
                onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Diagnóstico</label>
              <textarea
                rows={2}
                placeholder="Diagnóstico clínico..."
                value={newEntry.diagnosis || ''}
                onChange={(e) => setNewEntry({...newEntry, diagnosis: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Tratamento/Procedimento Realizado</label>
              <textarea
                rows={2}
                placeholder="Tratamento realizado ou recomendado..."
                value={newEntry.treatment || ''}
                onChange={(e) => setNewEntry({...newEntry, treatment: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Medicações Prescritas</label>
              <textarea
                rows={2}
                placeholder="Medicamentos, dosagem e orientações..."
                value={newEntry.medications || ''}
                onChange={(e) => setNewEntry({...newEntry, medications: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Próximo Retorno</label>
                <input
                  type="date"
                  value={newEntry.nextAppointment || ''}
                  onChange={(e) => setNewEntry({...newEntry, nextAppointment: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Profissional</label>
                <input
                  type="text"
                  value={newEntry.professionalName || ''}
                  onChange={(e) => setNewEntry({...newEntry, professionalName: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowNewEntryForm(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={addEntry}
              >
                💾 Salvar Entrada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de entradas */}
      <div className="entries-list">
        {entries.length === 0 ? (
          <div className="empty-state">
            <p>📋 Nenhuma entrada no prontuário ainda.</p>
            {!readOnly && (
              <p>Clique em "Nova Entrada" para começar o registro médico.</p>
            )}
          </div>
        ) : (
          <div className="entries-timeline">
            {entries.map((entry) => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-meta">
                    <div 
                      className="entry-type-badge"
                      style={{ backgroundColor: getTypeColor(entry.type) }}
                    >
                      {getTypeIcon(entry.type)} {getTypeLabel(entry.type)}
                    </div>
                    <div className="entry-datetime">
                      📅 {new Date(entry.date).toLocaleDateString('pt-BR')} às {entry.time}
                    </div>
                    <div className="entry-professional">
                      👨‍⚕️ {entry.professionalName}
                    </div>
                  </div>
                  
                  {!readOnly && (
                    <button 
                      className="delete-entry-btn"
                      onClick={() => deleteEntry(entry.id)}
                      title="Excluir entrada"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="entry-content">
                  <h4 className="entry-title">{entry.title}</h4>
                  <div className="entry-description">
                    <strong>Descrição/Anamnese:</strong>
                    <p>{entry.description}</p>
                  </div>

                  {entry.diagnosis && (
                    <div className="entry-section">
                      <strong>Diagnóstico:</strong>
                      <p>{entry.diagnosis}</p>
                    </div>
                  )}

                  {entry.treatment && (
                    <div className="entry-section">
                      <strong>Tratamento:</strong>
                      <p>{entry.treatment}</p>
                    </div>
                  )}

                  {entry.medications && (
                    <div className="entry-section">
                      <strong>Medicações:</strong>
                      <p>{entry.medications}</p>
                    </div>
                  )}

                  {entry.nextAppointment && (
                    <div className="entry-footer">
                      <div className="next-appointment">
                        📅 Próximo retorno: {new Date(entry.nextAppointment).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordView;