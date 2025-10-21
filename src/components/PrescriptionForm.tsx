import React, { useState } from 'react';

interface PrescriptionFormProps {
  clientId: string;
  clientName: string;
  onPrescriptionGenerated: (prescription: any) => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  clientId,
  clientName,
  onPrescriptionGenerated
}) => {
  const [formData, setFormData] = useState({
    medications: '',
    instructions: '',
    issueDate: new Date().toISOString().split('T')[0],
    doctorName: '',
    doctorCrm: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePrescription = async () => {
    if (!formData.medications || !formData.issueDate) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch(`/api/clients/${clientId}/prescription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        onPrescriptionGenerated(result.prescription);
        
        // Limpar formulário
        setFormData({
          medications: '',
          instructions: '',
          issueDate: new Date().toISOString().split('T')[0],
          doctorName: '',
          doctorCrm: ''
        });
        
        alert('Receita gerada com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao gerar receita: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao gerar receita:', error);
      alert('Erro interno. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="prescription-form">
      <div className="form-header">
        <h3>💊 Emitir Receita Médica</h3>
        <p>Paciente: <strong>{clientName}</strong></p>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">
            Medicamentos e Posologia *
          </label>
          <textarea
            className="form-textarea"
            value={formData.medications}
            onChange={(e) => handleInputChange('medications', e.target.value)}
            placeholder="Ex: Dipirona 500mg - Tomar 1 comprimido a cada 6 horas"
            rows={4}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            Instruções Adicionais
          </label>
          <textarea
            className="form-textarea"
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            placeholder="Ex: Tomar com água, após as refeições"
            rows={3}
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
          onClick={handleGeneratePrescription}
          disabled={isGenerating}
        >
          {isGenerating ? '⏳ Gerando...' : '💊 Gerar Receita'}
        </button>
      </div>

    </div>
  );
};

export default PrescriptionForm;