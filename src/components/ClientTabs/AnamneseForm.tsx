import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

interface AnamneseFormProps {
  clientId: string;
}

const AnamneseForm: React.FC<AnamneseFormProps> = ({ clientId }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingAnamnese, setExistingAnamnese] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    queixaPrincipal: '',
    historiaDoenca: '',
    alergias: '',
    medicamentos: '',
    doencasPreexistentes: '',
    cirurgiasAnteriores: '',
    habitosVida: '',
    historiaFamiliar: '',
    observacoes: ''
  });

  useEffect(() => {
    loadAnamnese();
  }, [clientId]);

  const loadAnamnese = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/clients/${clientId}/notes?type=ANAMNESE`);
      const notes = response.data.notes || [];
      
      if (notes.length > 0) {
        const latestAnamnese = notes[0];
        setExistingAnamnese(latestAnamnese);
        
        try {
          const content = JSON.parse(latestAnamnese.content);
          setFormData(content);
        } catch (e) {
          console.log('Formato antigo de anamnese, usando como texto');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar anamnese:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      await axios.post(`/api/clients/${clientId}/notes`, {
        type: 'ANAMNESE',
        title: 'Anamnese',
        content: JSON.stringify(formData)
      });

      alert('Anamnese salva com sucesso!');
      loadAnamnese();
    } catch (error: any) {
      console.error('Erro ao salvar anamnese:', error);
      alert(error.response?.data?.error || 'Erro ao salvar anamnese');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando anamnese...</div>;
  }

  return (
    <div className="anamnese-form">
      <div className="form-header">
        <h3>📋 Anamnese</h3>
        {existingAnamnese && (
          <p className="last-update">
            Última atualização: {new Date(existingAnamnese.createdAt).toLocaleString('pt-BR')}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-group">
            <label>Queixa Principal</label>
            <textarea
              value={formData.queixaPrincipal}
              onChange={(e) => setFormData({ ...formData, queixaPrincipal: e.target.value })}
              placeholder="Qual o motivo da consulta?"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>História da Doença Atual</label>
            <textarea
              value={formData.historiaDoenca}
              onChange={(e) => setFormData({ ...formData, historiaDoenca: e.target.value })}
              placeholder="Quando começou? Como evoluiu?"
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h4>Histórico Médico</h4>
          
          <div className="form-group">
            <label>Alergias</label>
            <input
              type="text"
              value={formData.alergias}
              onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
              placeholder="Medicamentos, alimentos, materiais..."
            />
          </div>

          <div className="form-group">
            <label>Medicamentos em Uso</label>
            <textarea
              value={formData.medicamentos}
              onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
              placeholder="Liste os medicamentos e dosagens"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Doenças Preexistentes</label>
            <textarea
              value={formData.doencasPreexistentes}
              onChange={(e) => setFormData({ ...formData, doencasPreexistentes: e.target.value })}
              placeholder="Diabetes, hipertensão, problemas cardíacos..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Cirurgias Anteriores</label>
            <textarea
              value={formData.cirurgiasAnteriores}
              onChange={(e) => setFormData({ ...formData, cirurgiasAnteriores: e.target.value })}
              placeholder="Liste cirurgias realizadas e datas"
              rows={2}
            />
          </div>
        </div>

        <div className="form-section">
          <h4>Hábitos e Estilo de Vida</h4>
          
          <div className="form-group">
            <label>Hábitos de Vida</label>
            <textarea
              value={formData.habitosVida}
              onChange={(e) => setFormData({ ...formData, habitosVida: e.target.value })}
              placeholder="Tabagismo, consumo de álcool, atividade física..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>História Familiar</label>
            <textarea
              value={formData.historiaFamiliar}
              onChange={(e) => setFormData({ ...formData, historiaFamiliar: e.target.value })}
              placeholder="Doenças hereditárias na família..."
              rows={2}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Observações Gerais</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Outras informações relevantes..."
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Anamnese'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnamneseForm;
