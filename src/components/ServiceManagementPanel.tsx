import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import Toast, { type ToastType } from './Toast';
import ConfirmDialog from './ConfirmDialog';
import '../styles/settings.css';

interface ServiceSchedule {
  days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  startTime: string;
  endTime: string;
}

interface Service {
  id: string;
  name: string;
  type: string;
  duration: number;
  price: number;
  description?: string;
  schedule: ServiceSchedule;
  professionalId: string;
  professionalName: string;
  createdAt: string;
  updatedAt: string;
  isGlobal?: boolean;
}

interface ServiceType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ServiceTypeFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ServiceFormData {
  name: string;
  type: string;
  duration: number;
  price: number;
  description?: string;
  schedule: ServiceSchedule;
  isGlobal: boolean;
}

interface ServiceManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServiceManagementPanel: React.FC<ServiceManagementPanelProps> = ({
  isOpen,
  onClose
}) => {
  const [activeServiceTab, setActiveServiceTab] = useState<'services' | 'types'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>({
    name: '',
    type: '',
    duration: 60,
    price: 0,
    description: '',
    schedule: {
      days: [],
      startTime: '08:00',
      endTime: '18:00'
    },
    isGlobal: false
  });

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [editingServiceType, setEditingServiceType] = useState<ServiceType | null>(null);
  const [serviceTypeFormData, setServiceTypeFormData] = useState<ServiceTypeFormData>({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6'
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const availableIcons = [
    '✂️', '💇', '💅', '🦷', '💊', '🩺', '🐕', '🐾', '🎓', '📚',
    '🍽️', '☕', '🏋️', '⚽', '🎨', '🎭', '🎵', '🎸', '🚗', '🔧',
    '🏠', '🔨', '💻', '📱', '🖥️', '⌚', '📷', '🎥', '✈️', '🏖️',
    '👔', '👗', '🎀', '💄', '🧴', '🧼', '🛁', '🧘', '💆', '💇‍♀️',
    '🍕', '🍔', '🍰', '🎂', '🍷', '🍺', '🌺', '🌸', '🌻', '🌹',
    '⭐', '✨', '💫', '🔥', '💧', '🌊', '🌈', '☀️', '🌙', '⚡'
  ];

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  useEffect(() => {
    if (isOpen) {
      loadServices();
      loadServiceTypes();
    }
  }, [isOpen]);

  const loadServices = async () => {
    try {
      const response = await axiosInstance.get('/services');
      
      if (response.data.services) {
        const convertedServices = response.data.services.map((service: any) => ({
          id: service.id,
          name: service.name,
          type: service.serviceTypeId,
          duration: service.duration,
          price: service.price,
          schedule: {
            days: getDaysFromService(service),
            startTime: service.startTime,
            endTime: service.endTime
          },
          professionalId: 'prof-1',
          professionalName: 'Sistema',
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
          isGlobal: true
        }));
        setServices(convertedServices);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      showToast('Erro ao carregar serviços', 'error');
    }
  };

  const getDaysFromService = (service: any) => {
    const days = [];
    if (service.mondayEnabled) days.push('monday');
    if (service.tuesdayEnabled) days.push('tuesday');
    if (service.wednesdayEnabled) days.push('wednesday');
    if (service.thursdayEnabled) days.push('thursday');
    if (service.fridayEnabled) days.push('friday');
    if (service.saturdayEnabled) days.push('saturday');
    if (service.sundayEnabled) days.push('sunday');
    return days;
  };

  const loadServiceTypes = async () => {
    try {
      const response = await axiosInstance.get('/service-types');
      
      if (response.data.serviceTypes) {
        setServiceTypes(response.data.serviceTypes);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de serviço:', error);
      showToast('Erro ao carregar tipos de serviço', 'error');
    }
  };

  const handleScheduleDayToggle = (day: string) => {
    setServiceFormData(prev => {
      const days = prev.schedule.days.includes(day as any)
        ? prev.schedule.days.filter(d => d !== day)
        : [...prev.schedule.days, day as any];
      
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          days
        }
      };
    });
  };

  const handleServiceSubmit = async () => {
    if (!serviceFormData.name || !serviceFormData.type || serviceFormData.duration <= 0 || serviceFormData.price < 0) {
      showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
      return;
    }

    try {
      const apiData = {
        name: serviceFormData.name,
        serviceTypeId: serviceFormData.type,
        duration: serviceFormData.duration,
        price: serviceFormData.price,
        description: serviceFormData.description || '',
        mondayEnabled: serviceFormData.schedule.days.includes('monday'),
        tuesdayEnabled: serviceFormData.schedule.days.includes('tuesday'),
        wednesdayEnabled: serviceFormData.schedule.days.includes('wednesday'),
        thursdayEnabled: serviceFormData.schedule.days.includes('thursday'),
        fridayEnabled: serviceFormData.schedule.days.includes('friday'),
        saturdayEnabled: serviceFormData.schedule.days.includes('saturday'),
        sundayEnabled: serviceFormData.schedule.days.includes('sunday'),
        startTime: serviceFormData.schedule.startTime,
        endTime: serviceFormData.schedule.endTime
      };

      if (editingService) {
        await axiosInstance.put(`/services/${editingService.id}`, apiData);
        showToast('Serviço atualizado com sucesso!', 'success');
      } else {
        await axiosInstance.post('/services', apiData);
        showToast('Serviço criado com sucesso!', 'success');
      }

      await loadServices();
      setServiceFormData({
        name: '',
        type: '',
        duration: 60,
        price: 0,
        description: '',
        schedule: {
          days: [],
          startTime: '08:00',
          endTime: '18:00'
        },
        isGlobal: false
      });
      setEditingService(null);
    } catch (error: any) {
      console.error('Erro ao salvar serviço:', error);
      showToast(error.response?.data?.error || 'Erro ao salvar serviço', 'error');
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormData({
      name: service.name,
      type: service.type,
      duration: service.duration,
      price: service.price,
      description: service.description || '',
      schedule: service.schedule,
      isGlobal: service.isGlobal || false
    });
  };

  const handleCancelServiceEdit = () => {
    setEditingService(null);
    setServiceFormData({
      name: '',
      type: '',
      duration: 60,
      price: 0,
      description: '',
      schedule: {
        days: [],
        startTime: '08:00',
        endTime: '18:00'
      },
      isGlobal: false
    });
  };

  const handleDeleteService = (serviceId: string) => {
    showConfirm(
      'Excluir Serviço',
      'Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await axiosInstance.delete(`/services/${serviceId}`);
          showToast('Serviço excluído com sucesso!', 'success');
          await loadServices();
          if (editingService?.id === serviceId) {
            handleCancelServiceEdit();
          }
        } catch (error) {
          console.error('Erro ao excluir serviço:', error);
          showToast('Erro ao excluir serviço', 'error');
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
      'danger'
    );
  };

  const handleServiceTypeSubmit = async () => {
    if (!serviceTypeFormData.name) {
      showToast('Por favor, preencha o nome do tipo de serviço', 'warning');
      return;
    }

    try {
      if (editingServiceType) {
        await axiosInstance.put(`/service-types/${editingServiceType.id}`, serviceTypeFormData);
        showToast('Tipo de serviço atualizado com sucesso!', 'success');
      } else {
        await axiosInstance.post('/service-types', serviceTypeFormData);
        showToast('Tipo de serviço criado com sucesso!', 'success');
      }

      await loadServiceTypes();
      setServiceTypeFormData({
        name: '',
        description: '',
        icon: '',
        color: '#3B82F6'
      });
      setEditingServiceType(null);
    } catch (error: any) {
      console.error('Erro ao salvar tipo de serviço:', error);
      showToast(error.response?.data?.error || 'Erro ao salvar tipo de serviço', 'error');
    }
  };

  const handleEditServiceType = (serviceType: ServiceType) => {
    setEditingServiceType(serviceType);
    setServiceTypeFormData({
      name: serviceType.name,
      description: serviceType.description || '',
      icon: serviceType.icon || '',
      color: serviceType.color || '#3B82F6'
    });
  };

  const handleCancelServiceTypeEdit = () => {
    setEditingServiceType(null);
    setServiceTypeFormData({
      name: '',
      description: '',
      icon: '',
      color: '#3B82F6'
    });
  };

  const handleDeleteServiceType = (serviceTypeId: string) => {
    showConfirm(
      'Excluir Tipo de Serviço',
      'Tem certeza que deseja excluir este tipo de serviço? Todos os serviços deste tipo precisarão ser reconfigurados.',
      async () => {
        try {
          await axiosInstance.delete(`/service-types/${serviceTypeId}`);
          showToast('Tipo de serviço excluído com sucesso!', 'success');
          await loadServiceTypes();
          if (editingServiceType?.id === serviceTypeId) {
            handleCancelServiceTypeEdit();
          }
        } catch (error) {
          console.error('Erro ao excluir tipo de serviço:', error);
          showToast('Erro ao excluir tipo de serviço', 'error');
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
      'danger'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <div className="settings-title">
            <span className="settings-icon">📝</span>
            <h2>Gestão de Serviços</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            <button 
              className={`tab-btn ${activeServiceTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveServiceTab('services')}
            >
              <span>📝</span>
              Serviços
            </button>
            <button 
              className={`tab-btn ${activeServiceTab === 'types' ? 'active' : ''}`}
              onClick={() => setActiveServiceTab('types')}
            >
              <span>🌐</span>
              Tipos de Serviços
            </button>
          </div>

          <div className="tab-content">
            {activeServiceTab === 'services' ? (
              <div style={{ padding: '24px' }}>
              <div className="service-form-section">
                <h4>{editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</h4>
                
                <div className="service-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nome do Serviço</label>
                      <input 
                        type="text" 
                        value={serviceFormData.name}
                        onChange={(e) => setServiceFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Corte + Escova"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tipo de Serviço</label>
                      <select 
                        value={serviceFormData.type}
                        onChange={(e) => setServiceFormData(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="">Selecione o tipo</option>
                        {serviceTypes.filter(st => st.active).map((serviceType) => (
                          <option key={serviceType.id} value={serviceType.id}>
                            {serviceType.icon && `${serviceType.icon} `}{serviceType.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Duração (minutos)</label>
                      <input 
                        type="number" 
                        value={serviceFormData.duration}
                        onChange={(e) => setServiceFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                        min="15"
                        step="15"
                      />
                    </div>
                    <div className="form-group">
                      <label>Valor (R$)</label>
                      <input 
                        type="number" 
                        value={serviceFormData.price}
                        onChange={(e) => setServiceFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Dias de Atendimento</label>
                    <div className="days-selector">
                      {[
                        { key: 'monday', label: 'Seg' },
                        { key: 'tuesday', label: 'Ter' },
                        { key: 'wednesday', label: 'Qua' },
                        { key: 'thursday', label: 'Qui' },
                        { key: 'friday', label: 'Sex' },
                        { key: 'saturday', label: 'Sáb' },
                        { key: 'sunday', label: 'Dom' }
                      ].map((day) => (
                        <button
                          key={day.key}
                          type="button"
                          className={`day-btn ${serviceFormData.schedule.days.includes(day.key as any) ? 'active' : ''}`}
                          onClick={() => handleScheduleDayToggle(day.key)}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Horário de Início</label>
                      <input 
                        type="time" 
                        value={serviceFormData.schedule.startTime}
                        onChange={(e) => setServiceFormData(prev => ({ 
                          ...prev, 
                          schedule: { ...prev.schedule, startTime: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Horário de Fim</label>
                      <input 
                        type="time" 
                        value={serviceFormData.schedule.endTime}
                        onChange={(e) => setServiceFormData(prev => ({ 
                          ...prev, 
                          schedule: { ...prev.schedule, endTime: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={serviceFormData.isGlobal}
                        onChange={(e) => setServiceFormData(prev => ({ ...prev, isGlobal: e.target.checked }))}
                      />
                      <span>Aplicar em todas as agendas do usuário</span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button className="save-service-btn" onClick={handleServiceSubmit}>
                      {editingService ? 'Atualizar Serviço' : 'Salvar Serviço'}
                    </button>
                    {editingService && (
                      <button className="cancel-edit-btn" onClick={handleCancelServiceEdit}>
                        Cancelar Edição
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="services-list-section">
                <h4>Serviços Cadastrados ({services.length})</h4>
                <div className="services-list">
                  {services.length > 0 ? (
                    services.map((service) => (
                      <div key={service.id} className="service-item">
                        <div className="service-info">
                          <div className="service-name">{service.name}</div>
                          <div className="service-details">
                            <span className="service-type">
                              {serviceTypes.find(st => st.id === service.type)?.name || 'N/A'}
                            </span>
                            <span className="service-duration">{service.duration}min</span>
                            <span className="service-price">R$ {service.price.toFixed(2)}</span>
                          </div>
                          <div className="service-schedule">
                            Dias: {service.schedule.days.map(d => {
                              const dayNames = {
                                monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua',
                                thursday: 'Qui', friday: 'Sex', saturday: 'Sáb', sunday: 'Dom'
                              };
                              return dayNames[d];
                            }).join(', ')} • {service.schedule.startTime} - {service.schedule.endTime}
                          </div>
                          {service.isGlobal && (
                            <div className="service-global-badge">🌐 Global</div>
                          )}
                        </div>
                        <div className="service-actions">
                          <button className="edit-service-btn" onClick={() => handleEditService(service)}>
                            ✏️
                          </button>
                          <button className="delete-service-btn" onClick={() => handleDeleteService(service.id)}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-services">
                      <div className="no-services-icon">📝</div>
                      <div className="no-services-text">Nenhum serviço cadastrado ainda</div>
                      <div className="no-services-subtitle">Comece cadastrando seu primeiro serviço acima</div>
                    </div>
                  )}
                </div>
              </div>
              </div>
            ) : (
              <div style={{ padding: '24px' }}>
              <div className="service-form-section">
                <h4>{editingServiceType ? 'Editar Tipo de Serviço' : 'Cadastrar Novo Tipo de Serviço'}</h4>
                
                <div className="service-form">
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Nome do Tipo</label>
                      <input 
                        type="text" 
                        value={serviceTypeFormData.name}
                        onChange={(e) => setServiceTypeFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Cortes, Estética, Tratamentos..."
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Preview</label>
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '44px',
                          backgroundColor: serviceTypeFormData.color,
                          borderRadius: '8px',
                          fontSize: '24px',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {serviceTypeFormData.icon || '?'}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ícone</label>
                    <div style={{ position: 'relative' }}>
                      <div 
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          backgroundColor: '#fff',
                          transition: 'border-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                      >
                        <span style={{ fontSize: '24px' }}>
                          {serviceTypeFormData.icon || '🎯'}
                        </span>
                        <span style={{ color: '#6b7280', flex: 1 }}>
                          {serviceTypeFormData.icon ? 'Clique para trocar o ícone' : 'Clique para selecionar um ícone'}
                        </span>
                        <span style={{ color: '#9ca3af' }}>▼</span>
                      </div>
                      
                      {showIconPicker && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '8px',
                            backgroundColor: 'white',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '16px',
                            zIndex: 1000,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            maxHeight: '280px',
                            overflowY: 'auto'
                          }}
                        >
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(10, 1fr)',
                            gap: '8px'
                          }}>
                            {availableIcons.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => {
                                  setServiceTypeFormData(prev => ({ ...prev, icon }));
                                  setShowIconPicker(false);
                                }}
                                style={{
                                  fontSize: '24px',
                                  padding: '8px',
                                  border: serviceTypeFormData.icon === icon ? '2px solid #3b82f6' : '2px solid transparent',
                                  borderRadius: '8px',
                                  backgroundColor: serviceTypeFormData.icon === icon ? '#eff6ff' : '#f9fafb',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#eff6ff';
                                  e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                  if (serviceTypeFormData.icon !== icon) {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                  }
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descrição (opcional)</label>
                    <input 
                      type="text" 
                      value={serviceTypeFormData.description}
                      onChange={(e) => setServiceTypeFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva este tipo de serviço..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Cor do Tipo</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input 
                        type="color" 
                        value={serviceTypeFormData.color}
                        onChange={(e) => setServiceTypeFormData(prev => ({ ...prev, color: e.target.value }))}
                        style={{
                          width: '80px',
                          height: '44px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: serviceTypeFormData.color,
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: '500',
                        textAlign: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {serviceTypeFormData.color}
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="save-service-btn" onClick={handleServiceTypeSubmit}>
                      {editingServiceType ? '✓ Atualizar Tipo' : '+ Salvar Tipo'}
                    </button>
                    {editingServiceType && (
                      <button className="cancel-edit-btn" onClick={handleCancelServiceTypeEdit}>
                        ✕ Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="services-list-section">
                <h4>Tipos de Serviço Cadastrados ({serviceTypes.length})</h4>
                <div className="services-list">
                  {serviceTypes.length > 0 ? (
                    serviceTypes.map((serviceType) => (
                      <div 
                        key={serviceType.id} 
                        className="service-item"
                        style={{
                          borderLeft: `4px solid ${serviceType.color || '#3b82f6'}`
                        }}
                      >
                        <div className="service-info">
                          <div className="service-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span 
                              style={{
                                fontSize: '28px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '48px',
                                height: '48px',
                                backgroundColor: serviceType.color || '#3b82f6',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}
                            >
                              {serviceType.icon || '📦'}
                            </span>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '16px' }}>
                                {serviceType.name}
                              </div>
                              {serviceType.description && (
                                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                                  {serviceType.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="service-actions">
                          <button className="edit-service-btn" onClick={() => handleEditServiceType(serviceType)}>
                            ✏️
                          </button>
                          <button className="delete-service-btn" onClick={() => handleDeleteServiceType(serviceType.id)}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-services">
                      <div className="no-services-icon">🏷️</div>
                      <div className="no-services-text">Nenhum tipo de serviço cadastrado ainda</div>
                      <div className="no-services-subtitle">Comece cadastrando seu primeiro tipo de serviço acima</div>
                    </div>
                  )}
                </div>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default ServiceManagementPanel;
