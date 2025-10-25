import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import logo from '../../assets/logo.png';

interface BusinessType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

const RegisterForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    number: '',
    complement: '',
    companyName: '',
    companyPhone: '',
    companyCep: '',
    companyStreet: '',
    companyNeighborhood: '',
    companyCity: '',
    companyState: '',
    companyNumber: '',
    companyComplement: '',
    businessTypeId: '',
    businessDays: [] as number[],
    plan: 'basic'
  });

  useEffect(() => {
    const loadBusinessTypes = async () => {
      try {
        const response = await fetch('/api/business-types');
        const data = await response.json();
        setBusinessTypes(data.businessTypes || []);
      } catch (error) {
        console.error('Erro ao carregar tipos de negócio:', error);
      }
    };

    loadBusinessTypes();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCepChange = async (cep: string, isBusinessAddress = false) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          if (isBusinessAddress) {
            setFormData(prev => ({
              ...prev,
              companyCep: cep,
              companyStreet: data.logradouro,
              companyNeighborhood: data.bairro,
              companyCity: data.localidade,
              companyState: data.uf
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              cep: cep,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleBusinessDayToggle = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      businessDays: prev.businessDays.includes(dayIndex)
        ? prev.businessDays.filter(d => d !== dayIndex)
        : [...prev.businessDays, dayIndex]
    }));
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (!formData.cep || !formData.number) {
      setError('Por favor, preencha o endereço completo');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.companyName || !formData.companyPhone) {
      setError('Por favor, preencha os dados da empresa');
      return false;
    }
    if (!formData.companyCep || !formData.companyNumber) {
      setError('Por favor, preencha o endereço da empresa completo');
      return false;
    }
    if (formData.businessDays.length === 0) {
      setError('Por favor, selecione pelo menos um dia de atendimento');
      return false;
    }
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      const registerData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        cep: formData.cep,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        companyName: formData.companyName,
        companyPhone: formData.companyPhone,
        companyCep: formData.companyCep,
        companyStreet: formData.companyStreet,
        companyNumber: formData.companyNumber,
        companyComplement: formData.companyComplement,
        companyNeighborhood: formData.companyNeighborhood,
        companyCity: formData.companyCity,
        companyState: formData.companyState,
        businessTypeId: formData.businessTypeId,
        businessDays: formData.businessDays,
        plan: formData.plan
      };

      await authApi.register(registerData);
      
      navigate('/register-success');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao fazer cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Dados Pessoais';
      case 2: return 'Dados da Empresa';
      default: return 'Cadastro';
    }
  };

  const weekDays = [
    { index: 1, name: 'Seg', full: 'Segunda' },
    { index: 2, name: 'Ter', full: 'Terça' },
    { index: 3, name: 'Qua', full: 'Quarta' },
    { index: 4, name: 'Qui', full: 'Quinta' },
    { index: 5, name: 'Sex', full: 'Sexta' },
  ];

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="register-left-content">
          <img src={logo} alt="Agendoor" className="logo" />
          <h1>Transforme seu negócio</h1>
          <p>Gerencie agendamentos de forma inteligente e aumente sua produtividade</p>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <span>Agendamento automático 24/7</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📱</span>
              <span>Acesso em qualquer dispositivo</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎯</span>
              <span>Organize e otimize seu tempo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="register-right">
        <div className="register-form-container">
          {step > 1 && (
            <button onClick={goBack} className="back-button-regular" type="button">
              <span className="back-arrow">←</span>
              Voltar
            </button>
          )}
          <h2>{getStepTitle()}</h2>
          <div className="step-indicator">
            <span className={step === 1 ? 'active' : step > 1 ? 'completed' : ''}>1</span>
            <span className={step === 2 ? 'active' : step > 2 ? 'completed' : ''}>2</span>
          </div>

          <form onSubmit={handleNext} className="register-form">
            {step === 1 && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    placeholder="Telefone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Confirmar Senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="address-section">
                  <h4>Endereço Residencial</h4>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="CEP"
                      value={formData.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group-row">
                    <div className="form-group" style={{ flex: 3 }}>
                      <input
                        type="text"
                        placeholder="Rua"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input
                        type="text"
                        placeholder="Número"
                        value={formData.number}
                        onChange={(e) => handleInputChange('number', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Complemento (opcional)"
                      value={formData.complement}
                      onChange={(e) => handleInputChange('complement', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', display: 'block' }}>
                    Tipo de Negócio (Opcional)
                  </label>
                  <select
                    value={formData.businessTypeId}
                    onChange={(e) => handleInputChange('businessTypeId', e.target.value)}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: '#f9fafb',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Selecione o tipo de negócio</option>
                    {businessTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon ? `${type.icon} ` : ''}{type.name}
                        {type.description ? ` - ${type.description}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Nome do Estabelecimento"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    placeholder="Telefone do Estabelecimento"
                    value={formData.companyPhone}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="address-section">
                  <h4>Endereço do Estabelecimento</h4>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="CEP"
                      value={formData.companyCep}
                      onChange={(e) => handleCepChange(e.target.value, true)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group-row">
                    <div className="form-group" style={{ flex: 3 }}>
                      <input
                        type="text"
                        placeholder="Rua"
                        value={formData.companyStreet}
                        onChange={(e) => handleInputChange('companyStreet', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input
                        type="text"
                        placeholder="Número"
                        value={formData.companyNumber}
                        onChange={(e) => handleInputChange('companyNumber', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={formData.companyNeighborhood}
                      onChange={(e) => handleInputChange('companyNeighborhood', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Complemento (opcional)"
                      value={formData.companyComplement}
                      onChange={(e) => handleInputChange('companyComplement', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="business-days-section">
                  <h4>Dias de Atendimento</h4>
                  <div className="days-grid">
                    {weekDays.map((day) => (
                      <button
                        key={day.index}
                        type="button"
                        className={`day-button ${formData.businessDays.includes(day.index) ? 'active' : ''}`}
                        onClick={() => handleBusinessDayToggle(day.index)}
                      >
                        {day.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Aguarde...' : (step === 1 ? 'Próximo' : 'Finalizar Cadastro')}
            </button>
          </form>

          <p className="login-link">
            Já tem uma conta? <a href="/login">Faça login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

