import React, { useState } from 'react';
import axios from '../../api/axios';

interface ToothPanelProps {
  toothNumber: number;
  clientId: string;
  onClose: () => void;
  onSave: () => void;
}

const ToothPanel: React.FC<ToothPanelProps> = ({ toothNumber, clientId, onClose, onSave }) => {
  const [procedureType, setProcedureType] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const procedureTypes = [
    { value: 'restauracao', label: 'Restauração' },
    { value: 'extracao', label: 'Extração' },
    { value: 'limpeza', label: 'Limpeza' },
    { value: 'canal', label: 'Tratamento de Canal' },
    { value: 'coroa', label: 'Coroa Protética' },
    { value: 'implante', label: 'Implante' },
    { value: 'clareamento', label: 'Clareamento' },
    { value: 'aparelho', label: 'Aparelho Ortodôntico' },
    { value: 'faceta', label: 'Faceta' },
    { value: 'outro', label: 'Outro' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!procedureType || !notes) {
      setError('Tipo de procedimento e descrição são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/api/clients/${clientId}/notes`, {
        type: 'ODONTOGRAM_ENTRY',
        title: title || `${procedureTypes.find(p => p.value === procedureType)?.label} - Dente ${toothNumber}`,
        content: notes,
        meta: {
          tooth: toothNumber,
          procedureType
        }
      });

      onSave();
    } catch (err: any) {
      console.error('Erro ao salvar procedimento:', err);
      setError(err.response?.data?.error || 'Erro ao salvar procedimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tooth-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🦷 Dente {toothNumber}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Tipo de Procedimento *</label>
            <select
              value={procedureType}
              onChange={(e) => setProcedureType(e.target.value)}
              required
            >
              <option value="">Selecione o procedimento</option>
              {procedureTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Título (opcional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Restauração em Resina Composta"
            />
          </div>

          <div className="form-group">
            <label>Descrição do Procedimento *</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva o procedimento realizado..."
              rows={4}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Procedimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToothPanel;
