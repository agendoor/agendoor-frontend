import React, { useState } from 'react';

interface MedicalCertificateFormProps {
  clientId: string;
  clientName: string;
  onCertificateGenerated: (certificate: any) => void;
}

const MedicalCertificateForm: React.FC<MedicalCertificateFormProps> = ({
  clientId,
  clientName,
  onCertificateGenerated
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    days: '',
    issueDate: new Date().toISOString().split('T')[0],
    doctorName: '',
    doctorCrm: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateCertificate = async () => {
    if (!formData.reason || !formData.days || !formData.issueDate) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch(`/api/clients/${clientId}/medical-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        onCertificateGenerated(result.certificate);
        
        // Limpar formulário
        setFormData({
          reason: '',
          days: '',
          issueDate: new Date().toISOString().split('T')[0],
          doctorName: '',
          doctorCrm: ''
        });
        
        alert('Atestado gerado com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao gerar atestado: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao gerar atestado:', error);
      alert('Erro interno. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="medical-certificate-form">
      <div className="form-header">
        <h3>🏥 Emitir Atestado Médico</h3>
        <p>Paciente: <strong>{clientName}</strong></p>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">
            Motivo do Atestado *
          </label>
          <textarea
            className="form-textarea"
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            placeholder="Ex: Consulta médica, tratamento odontológico, etc."
            rows={3}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            Dias de Afastamento *
          </label>
          <input
            type="number"
            className="form-input"
            value={formData.days}
            onChange={(e) => handleInputChange('days', e.target.value)}
            placeholder="Ex: 1, 2, 3..."
            min="1"
            max="30"
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            Data de Emissão *
          </label>
          <input
            type="date"
            className="form-input"
            value={formData.issueDate}
            onChange={(e) => handleInputChange('issueDate', e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            Nome do Médico/Profissional
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.doctorName}
            onChange={(e) => handleInputChange('doctorName', e.target.value)}
            placeholder="Ex: Dr. João Silva"
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            CRM/Registro Profissional
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.doctorCrm}
            onChange={(e) => handleInputChange('doctorCrm', e.target.value)}
            placeholder="Ex: CRM 123456"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          className="btn-primary"
          onClick={handleGenerateCertificate}
          disabled={isGenerating}
        >
          {isGenerating ? '⏳ Gerando...' : '📋 Gerar Atestado'}
        </button>
      </div>

    </div>
  );
};

export default MedicalCertificateForm;