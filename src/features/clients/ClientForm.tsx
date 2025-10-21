import React, { useState, useEffect } from 'react';
import type { Client, CreateClientData } from '../../api/clients';

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: CreateClientData) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState<CreateClientData>({
    fullName: '',
    cpf: '',
    phone: '',
    email: '',
    birthDate: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setFormData({
        fullName: client.fullName,
        cpf: client.cpf,
        phone: client.phone,
        email: client.email || '',
        birthDate: client.birthDate || '',
        cep: client.cep || '',
        street: client.street || '',
        number: client.number || '',
        complement: client.complement || '',
        neighborhood: client.neighborhood || '',
        city: client.city || '',
        state: client.state || '',
        notes: client.notes || ''
      });
    } else {
      setFormData({
        fullName: '',
        cpf: '',
        phone: '',
        email: '',
        birthDate: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        notes: ''
      });
    }
    setError('');
  }, [client, isOpen]);

  const handleInputChange = (field: keyof CreateClientData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCepChange = async (cep: string) => {
    handleInputChange('cep', cep);
    
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.fullName || !formData.cpf || !formData.phone) {
      setError('Nome, CPF e telefone são obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onCancel();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao salvar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{client ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="client-form">
          <div className="form-section">
            <h3>Dados Pessoais</h3>
            
            <div className="form-group">
              <label>Nome Completo *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CPF *</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="exemplo@email.com"
                />
              </div>

              <div className="form-group">
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Endereço</h3>
            
            <div className="form-group">
              <label>CEP</label>
              <input
                type="text"
                value={formData.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                disabled={isSubmitting}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Rua</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Será preenchido automaticamente pelo CEP"
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Número</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bairro</label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Será preenchido automaticamente pelo CEP"
                />
              </div>

              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Será preenchido automaticamente pelo CEP"
                />
              </div>

              <div className="form-group" style={{ flex: 0.5 }}>
                <label>UF</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Complemento</label>
              <input
                type="text"
                value={formData.complement}
                onChange={(e) => handleInputChange('complement', e.target.value)}
                disabled={isSubmitting}
                placeholder="Apto, Bloco, etc."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Observações</h3>
            <div className="form-group">
              <label>Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={isSubmitting}
                placeholder="Adicione observações sobre o cliente..."
                rows={3}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : client ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
