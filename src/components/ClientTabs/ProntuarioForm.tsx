import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

interface ProntuarioFormProps {
  clientId: string;
  appointmentId?: string;
}

const ProntuarioForm: React.FC<ProntuarioFormProps> = ({ clientId, appointmentId }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    dataConsulta: new Date().toISOString().split('T')[0],
    pressaoArterial: '',
    temperatura: '',
    peso: '',
    altura: '',
    queixaPaciente: '',
    exameClinico: '',
    hipoteseDiagnostica: '',
    examesComplementares: '',
    conduta: '',
    prescricao: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const endpoint = appointmentId 
        ? `/api/appointments/${appointmentId}/notes`
        : `/api/clients/${clientId}/notes`;
      
      await axios.post(endpoint, {
        type: 'PRONTUARIO',
        title: `Prontuário - ${formData.dataConsulta}`,
        content: JSON.stringify(formData),
        ...(appointmentId && { appointmentId })
      });

      alert('Prontuário salvo com sucesso!');
      
      setFormData({
        dataConsulta: new Date().toISOString().split('T')[0],
        pressaoArterial: '',
        temperatura: '',
        peso: '',
        altura: '',
        queixaPaciente: '',
        exameClinico: '',
        hipoteseDiagnostica: '',
        examesComplementares: '',
        conduta: '',
        prescricao: '',
        observacoes: ''
      });
    } catch (error: any) {
      console.error('Erro ao salvar prontuário:', error);
      alert(error.response?.data?.error || 'Erro ao salvar prontuário');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="prontuario-form">
      <div className="form-header">
        <h3>📝 Prontuário Clínico</h3>
        {appointmentId && <span className="badge">Vinculado ao atendimento</span>}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>Dados Vitais</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Data da Consulta</label>
              <input
                type="date"
                value={formData.dataConsulta}
                onChange={(e) => setFormData({ ...formData, dataConsulta: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Pressão Arterial</label>
              <input
                type="text"
                value={formData.pressaoArterial}
                onChange={(e) => setFormData({ ...formData, pressaoArterial: e.target.value })}
                placeholder="120/80 mmHg"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Temperatura (°C)</label>
              <input
                type="text"
                value={formData.temperatura}
                onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
                placeholder="36.5"
              />
            </div>

            <div className="form-group">
              <label>Peso (kg)</label>
              <input
                type="text"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                placeholder="70"
              />
            </div>

            <div className="form-group">
              <label>Altura (cm)</label>
              <input
                type="text"
                value={formData.altura}
                onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                placeholder="170"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Avaliação Clínica</h4>

          <div className="form-group">
            <label>Queixa do Paciente</label>
            <textarea
              value={formData.queixaPaciente}
              onChange={(e) => setFormData({ ...formData, queixaPaciente: e.target.value })}
              placeholder="Descrição da queixa principal..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Exame Clínico</label>
            <textarea
              value={formData.exameClinico}
              onChange={(e) => setFormData({ ...formData, exameClinico: e.target.value })}
              placeholder="Descrição do exame físico realizado..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Hipótese Diagnóstica</label>
            <textarea
              value={formData.hipoteseDiagnostica}
              onChange={(e) => setFormData({ ...formData, hipoteseDiagnostica: e.target.value })}
              placeholder="CID, diagnóstico provável..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Exames Complementares</label>
            <textarea
              value={formData.examesComplementares}
              onChange={(e) => setFormData({ ...formData, examesComplementares: e.target.value })}
              placeholder="Exames solicitados ou resultados..."
              rows={2}
            />
          </div>
        </div>

        <div className="form-section">
          <h4>Conduta e Tratamento</h4>

          <div className="form-group">
            <label>Conduta</label>
            <textarea
              value={formData.conduta}
              onChange={(e) => setFormData({ ...formData, conduta: e.target.value })}
              placeholder="Procedimentos realizados, orientações..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Prescrição</label>
            <textarea
              value={formData.prescricao}
              onChange={(e) => setFormData({ ...formData, prescricao: e.target.value })}
              placeholder="Medicamentos prescritos, dosagem, duração..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Outras anotações relevantes..."
              rows={2}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Prontuário'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProntuarioForm;
