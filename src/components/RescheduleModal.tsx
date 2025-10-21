import React, { useState, useEffect } from 'react';
import '../styles/finalize-modal.css';

interface RescheduleModalProps {
  appointment: any;
  onClose: () => void;
  onSuccess: () => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ appointment, onClose, onSuccess }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setNewDate(today);
  }, []);

  const calculateEndTime = (startTime: string, originalStart: string, originalEnd: string): string | null => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [origStartHour, origStartMin] = originalStart.split(':').map(Number);
    const [origEndHour, origEndMin] = originalEnd.split(':').map(Number);
    
    const durationMinutes = (origEndHour * 60 + origEndMin) - (origStartHour * 60 + origStartMin);
    const endTotalMinutes = (startHour * 60 + startMin) + durationMinutes;
    
    if (endTotalMinutes >= 24 * 60) {
      return null;
    }
    
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMin = endTotalMinutes % 60;
    
    return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      alert('Por favor, selecione uma nova data e horário');
      return;
    }

    const endTime = calculateEndTime(newTime, appointment.startTime, appointment.endTime);
    if (!endTime) {
      alert('O horário selecionado resultaria em um horário de término inválido (após meia-noite). Por favor, escolha um horário mais cedo.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointment.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: newDate,
          startTime: newTime,
          endTime: endTime,
          notes: reason || 'Reagendamento solicitado'
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao reagendar');
      }
    } catch (error) {
      console.error('Erro ao reagendar:', error);
      alert('Erro ao reagendar atendimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="finalize-modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>🔁 Reagendar Atendimento</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{
            background: '#f3f4f6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>Agendamento Atual</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Data:</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>
                  {new Date(appointment.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Horário:</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>
                  {appointment.startTime}
                </p>
              </div>
            </div>
          </div>

          <div className="section">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Nova Data
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="section">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Novo Horário
            </label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="section">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Motivo do Reagendamento (Opcional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Cliente solicitou mudança de horário..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleReschedule}
            disabled={loading || !newDate || !newTime}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              opacity: (!newDate || !newTime || loading) ? 0.5 : 1
            }}
          >
            {loading ? 'Reagendando...' : '🔁 Confirmar Reagendamento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
