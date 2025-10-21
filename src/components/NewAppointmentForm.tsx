import React, { useState, useEffect } from 'react';
import ServiceManagementContent from './ServiceManagementContent';
import '../styles/settings.css';

interface NewAppointmentFormProps {
  date: string;
  time: string;
  onClose: () => void;
  onSave: (data: any) => void;
}

const NewAppointmentForm: React.FC<NewAppointmentFormProps> = ({
  date,
  time,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [services, setServices] = useState<any[]>([]);
  const [endTime, setEndTime] = useState('');
  const [searchingCPF, setSearchingCPF] = useState(false);
  
  const [formData, setFormData] = useState({
    cpf: '',
    fullName: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    birthDate: '',
    rg: '',
    phone: '',
    contactPhone: '',
    serviceId: '',
    convenio: '',
    numeroCarteirinha: '',
    validadeCarteirinha: '',
    nomeTitular: '',
    codigoPlano: ''
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      if (data.services) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const handleCPFSearch = async (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length === 11) {
      setSearchingCPF(true);
      try {
        const response = await fetch(`/api/clients/search/${cleanCPF}`);
        const data = await response.json();
        
        if (data.client) {
          setFormData({
            ...formData,
            cpf: cleanCPF,
            fullName: data.client.fullName || '',
            cep: data.client.cep || '',
            street: data.client.street || '',
            number: data.client.number || '',
            complement: data.client.complement || '',
            neighborhood: data.client.neighborhood || '',
            city: data.client.city || '',
            state: data.client.state || '',
            birthDate: data.client.birthDate ? new Date(data.client.birthDate).toISOString().split('T')[0] : '',
            rg: data.client.rg || '',
            phone: data.client.phone || '',
            contactPhone: data.client.contactPhone || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
      } finally {
        setSearchingCPF(false);
      }
    }
  };

  const handleCEPSearch = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData({
            ...formData,
            cep: cleanCEP,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setFormData({ ...formData, serviceId });

    if (service && service.duration && time) {
      const [hours, minutes] = time.split(':').map(Number);
      const endMinutes = (hours * 60 + minutes + service.duration) % 1440;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      setEndTime(`${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`);
    }
  };

  const handleSubmit = async () => {
    try {
      let clientId;

      const cleanCPF = formData.cpf.replace(/\D/g, '');
      const existingClientResponse = await fetch(`/api/clients/search/${cleanCPF}`);
      const existingClientData = await existingClientResponse.json();

      if (existingClientData.client) {
        clientId = existingClientData.client.id;
        
        await fetch(`/api/clients/${clientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            cpf: cleanCPF,
            phone: formData.phone,
            cep: formData.cep,
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            birthDate: formData.birthDate,
            rg: formData.rg,
            contactPhone: formData.contactPhone
          })
        });
      } else {
        const createClientResponse = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            cpf: cleanCPF,
            email: '',
            phone: formData.phone,
            cep: formData.cep,
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            birthDate: formData.birthDate,
            rg: formData.rg,
            contactPhone: formData.contactPhone
          })
        });

        const createClientData = await createClientResponse.json();
        clientId = createClientData.client.id;
      }

      const appointmentData = {
        clientId,
        serviceId: formData.serviceId,
        date,
        startTime: time,
        endTime,
        notes: formData.convenio ? `Convênio: ${formData.convenio} - Carteirinha: ${formData.numeroCarteirinha}` : ''
      };

      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (appointmentResponse.ok) {
        onSave(appointmentData);
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento');
    }
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <div className="settings-title">
            <span className="settings-icon">📅</span>
            <h2>Novo Agendamento</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="appointment-datetime" style={{ 
          padding: '16px 32px', 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderBottom: '1px solid rgba(229, 231, 235, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 600, color: '#0369a1' }}>Data e Hora:</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#0c4a6e' }}>
              {new Date(date).toLocaleDateString('pt-BR')} {time} 
              {endTime && ` ~ ${endTime}`}
            </span>
          </div>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            <button 
              className={`tab-btn ${activeTab === 'cadastro' ? 'active' : ''}`}
              onClick={() => setActiveTab('cadastro')}
            >
              <span>📝</span>
              Cadastro
            </button>
            <button 
              className={`tab-btn ${activeTab === 'planos' ? 'active' : ''}`}
              onClick={() => setActiveTab('planos')}
            >
              <span>🏥</span>
              Planos
            </button>
            <button 
              className={`tab-btn ${activeTab === 'servicos' ? 'active' : ''}`}
              onClick={() => setActiveTab('servicos')}
            >
              <span>📋</span>
              Gestão de Serviços
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'cadastro' && (
              <div style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '24px', color: '#1f2937', fontSize: '18px', fontWeight: 600 }}>
                  Dados do Cliente
                </h3>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={formatCPF(formData.cpf)}
                    onChange={(e) => {
                      const cpf = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, cpf });
                    }}
                    onBlur={(e) => handleCPFSearch(e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px'
                    }}
                  />
                  {searchingCPF && <small style={{ color: '#6b7280' }}>Buscando cliente...</small>}
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nome completo do cliente"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                      CEP *
                    </label>
                    <input
                      type="text"
                      value={formatCEP(formData.cep)}
                      onChange={(e) => {
                        const cep = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, cep });
                      }}
                      onBlur={(e) => handleCEPSearch(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                      Número *
                    </label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      placeholder="Nº"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                    Endereço *
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Rua/Avenida"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    placeholder="Apto, Bloco, etc"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                      Bairro *
                    </label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="Bairro"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Cidade"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                      UF *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      placeholder="UF"
                      maxLength={2}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                      RG
                    </label>
                    <input
                      type="text"
                      value={formData.rg}
                      onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                      placeholder="RG"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                      Telefone Pessoal *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                      Telefone de Contato
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                    Serviço *
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.duration}min - R$ {service.price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'planos' && (
              <div style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '24px', color: '#1f2937', fontSize: '18px', fontWeight: 600 }}>
                  Informações do Plano
                </h3>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                    Nome do Convênio/Operadora
                  </label>
                  <input
                    type="text"
                    value={formData.convenio}
                    onChange={(e) => setFormData({ ...formData, convenio: e.target.value })}
                    placeholder="Ex: Unimed, Amil, Bradesco Saúde"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                    Número da Carteirinha
                  </label>
                  <input
                    type="text"
                    value={formData.numeroCarteirinha}
                    onChange={(e) => setFormData({ ...formData, numeroCarteirinha: e.target.value })}
                    placeholder="Número da carteirinha do convênio"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                    Validade da Carteirinha
                  </label>
                  <input
                    type="date"
                    value={formData.validadeCarteirinha}
                    onChange={(e) => setFormData({ ...formData, validadeCarteirinha: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                    Nome Completo do Titular
                  </label>
                  <input
                    type="text"
                    value={formData.nomeTitular}
                    onChange={(e) => setFormData({ ...formData, nomeTitular: e.target.value })}
                    placeholder="Nome do titular do plano"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
                    Código do Plano
                  </label>
                  <input
                    type="text"
                    value={formData.codigoPlano}
                    onChange={(e) => setFormData({ ...formData, codigoPlano: e.target.value })}
                    placeholder="Código do plano contratado"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div style={{
                  padding: '16px',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  <p style={{ fontWeight: 600, color: '#0369a1', marginBottom: '8px' }}>
                    ℹ️ Informações importantes do Plano de Saúde:
                  </p>
                  <ul style={{ color: '#075985', paddingLeft: '20px', margin: 0 }}>
                    <li>Nome completo do titular</li>
                    <li>Número da carteirinha</li>
                    <li>Validade da carteirinha</li>
                    <li>Nome do convênio/operadora</li>
                    <li>Código do plano</li>
                    <li>Coberturas incluídas no plano</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'servicos' && (
              <div style={{ padding: '0' }}>
                <ServiceManagementContent onServicesUpdate={loadServices} />
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            style={{
              padding: '12px 24px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500
            }}
          >
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={!formData.cpf || !formData.fullName || !formData.serviceId}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: formData.cpf && formData.fullName && formData.serviceId ? 'pointer' : 'not-allowed',
              fontSize: '15px',
              fontWeight: 500,
              opacity: formData.cpf && formData.fullName && formData.serviceId ? 1 : 0.5
            }}
          >
            Salvar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentForm;
