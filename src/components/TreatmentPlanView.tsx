import React, { useState, useEffect } from 'react';
import '../styles/treatment-plan.css';

interface Procedure {
  id: string;
  name: string;
  toothNumber?: string;
  category: string;
  description: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  estimatedCost: number;
  estimatedDuration: number; // em minutos
  plannedDate?: string;
  completedDate?: string;
  professional?: string;
  notes?: string;
}

interface TreatmentPhase {
  id: string;
  name: string;
  description: string;
  procedures: Procedure[];
  order: number;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  totalCost: number;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido';
}

interface TreatmentPlan {
  id?: string;
  title: string;
  description?: string;
  phases: TreatmentPhase[];
  totalCost: number;
  estimatedTotalTime: number; // em semanas
  startDate?: string;
  endDate?: string;
  status: 'rascunho' | 'aprovado' | 'em_andamento' | 'concluido' | 'pausado';
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
}

interface TreatmentPlanViewProps {
  data: { treatmentPlans?: TreatmentPlan[] };
  onDataChange: (data: { treatmentPlans: TreatmentPlan[] }) => void;
  clientName: string;
  clientId?: string;
  readOnly?: boolean;
}

const TreatmentPlanView: React.FC<TreatmentPlanViewProps> = ({
  data,
  onDataChange,
  clientName,
  clientId,
  readOnly = false
}) => {
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>(data?.treatmentPlans || []);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const commonProcedures = [
    { name: 'Limpeza (Profilaxia)', category: 'preventivo', basePrice: 80, duration: 60 },
    { name: 'Restauração Resina', category: 'restaurador', basePrice: 150, duration: 90 },
    { name: 'Restauração Amálgama', category: 'restaurador', basePrice: 120, duration: 75 },
    { name: 'Tratamento Endodôntico', category: 'endodontico', basePrice: 400, duration: 120 },
    { name: 'Extração Simples', category: 'cirurgico', basePrice: 100, duration: 45 },
    { name: 'Extração Complexa', category: 'cirurgico', basePrice: 200, duration: 90 },
    { name: 'Implante Dentário', category: 'cirurgico', basePrice: 1200, duration: 60 },
    { name: 'Coroa Protocolo', category: 'protetico', basePrice: 800, duration: 90 },
    { name: 'Prótese Parcial', category: 'protetico', basePrice: 600, duration: 60 },
    { name: 'Clareamento Dental', category: 'estetico', basePrice: 300, duration: 45 },
    { name: 'Aplicação de Flúor', category: 'preventivo', basePrice: 50, duration: 30 },
    { name: 'Radiografia Periapical', category: 'exame', basePrice: 25, duration: 15 }
  ];

  useEffect(() => {
    if (data.treatmentPlans) {
      setTreatmentPlans(data.treatmentPlans);
    }
  }, [data]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return '#ef4444';
      case 'alta': return '#f59e0b';
      case 'media': return '#3b82f6';
      case 'baixa': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejado': case 'rascunho': case 'nao_iniciado': return '#6b7280';
      case 'aprovado': return '#3b82f6';
      case 'em_andamento': return '#f59e0b';
      case 'concluido': return '#10b981';
      case 'cancelado': case 'pausado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'rascunho': 'Rascunho',
      'aprovado': 'Aprovado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'pausado': 'Pausado',
      'planejado': 'Planejado',
      'nao_iniciado': 'Não Iniciado',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  const createNewPlan = () => {
    const newPlan: TreatmentPlan = {
      id: `plan_${Date.now()}`,
      title: 'Novo Plano de Tratamento',
      description: '',
      phases: [{
        id: `phase_${Date.now()}`,
        name: 'Fase 1 - Inicial',
        description: 'Primeira fase do tratamento',
        procedures: [],
        order: 1,
        totalCost: 0,
        status: 'nao_iniciado'
      }],
      totalCost: 0,
      estimatedTotalTime: 0,
      status: 'rascunho',
      createdBy: 'Dr. Usuário',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const updatedPlans = [...treatmentPlans, newPlan];
    setTreatmentPlans(updatedPlans);
    onDataChange({ treatmentPlans: updatedPlans });
    setSelectedPlan(newPlan);
    setShowNewPlanModal(false);
  };

  const updatePlan = (updatedPlan: TreatmentPlan) => {
    const updatedPlans = treatmentPlans.map(plan => 
      plan.id === updatedPlan.id ? { ...updatedPlan, lastModified: new Date().toISOString() } : plan
    );
    setTreatmentPlans(updatedPlans);
    onDataChange({ treatmentPlans: updatedPlans });
    setSelectedPlan(updatedPlan);
  };

  const deletePlan = (planId: string) => {
    if (confirm('Tem certeza que deseja excluir este plano de tratamento?')) {
      const updatedPlans = treatmentPlans.filter(plan => plan.id !== planId);
      setTreatmentPlans(updatedPlans);
      onDataChange({ treatmentPlans: updatedPlans });
      
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
    }
  };

  const addProcedureToPhase = (phaseId: string, procedure: Partial<Procedure>) => {
    if (!selectedPlan) return;

    const newProcedure: Procedure = {
      id: `proc_${Date.now()}`,
      name: procedure.name || '',
      toothNumber: procedure.toothNumber || '',
      category: procedure.category || 'restaurador',
      description: procedure.description || '',
      priority: procedure.priority || 'media',
      status: 'planejado',
      estimatedCost: procedure.estimatedCost || 0,
      estimatedDuration: procedure.estimatedDuration || 60,
      professional: 'Dr. Usuário',
      notes: procedure.notes || ''
    };

    const updatedPlan = {
      ...selectedPlan,
      phases: selectedPlan.phases.map(phase => 
        phase.id === phaseId 
          ? {
              ...phase,
              procedures: [...phase.procedures, newProcedure],
              totalCost: phase.procedures.reduce((sum, p) => sum + p.estimatedCost, 0) + newProcedure.estimatedCost
            }
          : phase
      )
    };

    // Recalcular custo total do plano
    updatedPlan.totalCost = updatedPlan.phases.reduce((sum, phase) => sum + phase.totalCost, 0);
    
    updatePlan(updatedPlan);
    setShowProcedureModal(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTotalProceduresByStatus = (status: string) => {
    if (!selectedPlan) return 0;
    return selectedPlan.phases
      .flatMap(phase => phase.procedures)
      .filter(proc => proc.status === status).length;
  };

  return (
    <div className="treatment-plan-container">
      <div className="treatment-plan-header">
        <h3>🦷 Plano de Tratamento</h3>
        <p className="plan-subtitle">Paciente: <strong>{clientName}</strong></p>
        
        {!readOnly && (
          <button 
            className="create-plan-btn"
            onClick={() => setShowNewPlanModal(true)}
          >
            ➕ Novo Plano
          </button>
        )}
      </div>

      <div className="treatment-plan-content">
        {/* Lista de Planos */}
        <div className="plans-sidebar">
          <h4>Planos de Tratamento</h4>
          
          {treatmentPlans.length === 0 ? (
            <div className="empty-plans">
              <p>📋 Nenhum plano criado ainda.</p>
              {!readOnly && (
                <button 
                  className="create-first-plan"
                  onClick={createNewPlan}
                >
                  Criar primeiro plano
                </button>
              )}
            </div>
          ) : (
            <div className="plans-list">
              {treatmentPlans.map(plan => (
                <div 
                  key={plan.id}
                  className={`plan-item ${selectedPlan?.id === plan.id ? 'active' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="plan-item-header">
                    <h5>{plan.title}</h5>
                    <span 
                      className="plan-status-badge"
                      style={{ backgroundColor: getStatusColor(plan.status) }}
                    >
                      {getStatusLabel(plan.status)}
                    </span>
                  </div>
                  
                  <div className="plan-item-info">
                    <div className="plan-cost">{formatCurrency(plan.totalCost)}</div>
                    <div className="plan-phases">{plan.phases.length} fase(s)</div>
                    <div className="plan-procedures">
                      {plan.phases.reduce((total, phase) => total + phase.procedures.length, 0)} procedimento(s)
                    </div>
                  </div>
                  
                  {plan.startDate && (
                    <div className="plan-dates">
                      📅 {new Date(plan.startDate).toLocaleDateString('pt-BR')}
                      {plan.endDate && ` - ${new Date(plan.endDate).toLocaleDateString('pt-BR')}`}
                    </div>
                  )}

                  {!readOnly && (
                    <div className="plan-actions">
                      <button 
                        className="btn-delete-plan"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlan(plan.id!);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes do Plano Selecionado */}
        <div className="plan-details">
          {selectedPlan ? (
            <>
              <div className="plan-header">
                <div className="plan-title-section">
                  {!readOnly ? (
                    <input
                      type="text"
                      value={selectedPlan.title}
                      onChange={(e) => updatePlan({ ...selectedPlan, title: e.target.value })}
                      className="plan-title-input"
                    />
                  ) : (
                    <h2>{selectedPlan.title}</h2>
                  )}
                  
                  <div 
                    className="plan-status-large"
                    style={{ backgroundColor: getStatusColor(selectedPlan.status) }}
                  >
                    {getStatusLabel(selectedPlan.status)}
                  </div>
                </div>

                <div className="plan-summary">
                  <div className="summary-card">
                    <div className="summary-value">{formatCurrency(selectedPlan.totalCost)}</div>
                    <div className="summary-label">Custo Total</div>
                  </div>
                  
                  <div className="summary-card">
                    <div className="summary-value">{selectedPlan.phases.length}</div>
                    <div className="summary-label">Fases</div>
                  </div>
                  
                  <div className="summary-card">
                    <div className="summary-value">
                      {selectedPlan.phases.reduce((total, phase) => total + phase.procedures.length, 0)}
                    </div>
                    <div className="summary-label">Procedimentos</div>
                  </div>
                  
                  <div className="summary-card">
                    <div className="summary-value">{selectedPlan.estimatedTotalTime || 0}</div>
                    <div className="summary-label">Semanas</div>
                  </div>
                </div>
              </div>

              <div className="plan-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  📊 Visão Geral
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'phases' ? 'active' : ''}`}
                  onClick={() => setActiveTab('phases')}
                >
                  📋 Fases do Tratamento
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  📅 Cronograma
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="tab-content overview-tab">
                  <div className="progress-cards">
                    <div className="progress-card planned">
                      <div className="progress-number">{getTotalProceduresByStatus('planejado')}</div>
                      <div className="progress-label">Planejados</div>
                    </div>
                    <div className="progress-card in-progress">
                      <div className="progress-number">{getTotalProceduresByStatus('em_andamento')}</div>
                      <div className="progress-label">Em Andamento</div>
                    </div>
                    <div className="progress-card completed">
                      <div className="progress-number">{getTotalProceduresByStatus('concluido')}</div>
                      <div className="progress-label">Concluídos</div>
                    </div>
                  </div>

                  <div className="plan-description">
                    <h4>Descrição do Plano</h4>
                    {!readOnly ? (
                      <textarea
                        value={selectedPlan.description || ''}
                        onChange={(e) => updatePlan({ ...selectedPlan, description: e.target.value })}
                        placeholder="Descrição detalhada do plano de tratamento..."
                        rows={4}
                        className="plan-description-textarea"
                      />
                    ) : (
                      <p>{selectedPlan.description || 'Nenhuma descrição disponível.'}</p>
                    )}
                  </div>

                  <div className="plan-metadata">
                    <div className="metadata-row">
                      <strong>Criado por:</strong> {selectedPlan.createdBy}
                    </div>
                    <div className="metadata-row">
                      <strong>Data de criação:</strong> 
                      {selectedPlan.createdAt && new Date(selectedPlan.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="metadata-row">
                      <strong>Última modificação:</strong> 
                      {selectedPlan.lastModified && new Date(selectedPlan.lastModified).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'phases' && (
                <div className="tab-content phases-tab">
                  {selectedPlan.phases.map((phase, phaseIndex) => (
                    <div key={phase.id} className="phase-card">
                      <div className="phase-header">
                        <div className="phase-info">
                          <h4>{phase.name}</h4>
                          <p>{phase.description}</p>
                        </div>
                        <div className="phase-meta">
                          <div className="phase-cost">{formatCurrency(phase.totalCost)}</div>
                          <span 
                            className="phase-status"
                            style={{ backgroundColor: getStatusColor(phase.status) }}
                          >
                            {getStatusLabel(phase.status)}
                          </span>
                        </div>
                      </div>

                      <div className="procedures-list">
                        {phase.procedures.map(procedure => (
                          <div key={procedure.id} className="procedure-item">
                            <div className="procedure-info">
                              <div className="procedure-name">
                                {procedure.name}
                                {procedure.toothNumber && (
                                  <span className="tooth-number">Dente {procedure.toothNumber}</span>
                                )}
                              </div>
                              <div className="procedure-details">
                                <span className="procedure-category">{procedure.category}</span>
                                <span 
                                  className="procedure-priority"
                                  style={{ backgroundColor: getPriorityColor(procedure.priority) }}
                                >
                                  {procedure.priority}
                                </span>
                                <span className="procedure-duration">{procedure.estimatedDuration}min</span>
                                <span className="procedure-cost">{formatCurrency(procedure.estimatedCost)}</span>
                              </div>
                              {procedure.description && (
                                <div className="procedure-description">{procedure.description}</div>
                              )}
                            </div>
                            <div 
                              className="procedure-status"
                              style={{ backgroundColor: getStatusColor(procedure.status) }}
                            >
                              {getStatusLabel(procedure.status)}
                            </div>
                          </div>
                        ))}

                        {!readOnly && (
                          <button
                            className="add-procedure-btn"
                            onClick={() => {
                              setSelectedPhase(phase.id);
                              setShowProcedureModal(true);
                            }}
                          >
                            ➕ Adicionar Procedimento
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="tab-content timeline-tab">
                  <div className="timeline-content">
                    <p>🚧 Cronograma visual em desenvolvimento</p>
                    <p>Em breve: visualização de cronograma com datas e dependências entre procedimentos.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-plan-selected">
              <div className="empty-icon">📋</div>
              <h4>Nenhum plano selecionado</h4>
              <p>Selecione um plano na lista ao lado ou crie um novo para começar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para adicionar procedimento */}
      {showProcedureModal && !readOnly && selectedPhase && (
        <ProcedureModal
          isOpen={showProcedureModal}
          onClose={() => setShowProcedureModal(false)}
          onAdd={(procedure) => addProcedureToPhase(selectedPhase, procedure)}
          commonProcedures={commonProcedures}
        />
      )}
    </div>
  );
};

// Componente Modal para Adicionar Procedimento
interface ProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (procedure: Partial<Procedure>) => void;
  commonProcedures: Array<{
    name: string;
    category: string;
    basePrice: number;
    duration: number;
  }>;
}

const ProcedureModal: React.FC<ProcedureModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  commonProcedures
}) => {
  const [selectedCommon, setSelectedCommon] = useState('');
  const [customProcedure, setCustomProcedure] = useState({
    name: '',
    toothNumber: '',
    category: 'restaurador',
    description: '',
    priority: 'media' as const,
    estimatedCost: 0,
    estimatedDuration: 60,
    notes: ''
  });

  const handleCommonProcedureSelect = (procedureName: string) => {
    const procedure = commonProcedures.find(p => p.name === procedureName);
    if (procedure) {
      setCustomProcedure({
        ...customProcedure,
        name: procedure.name,
        category: procedure.category,
        estimatedCost: procedure.basePrice,
        estimatedDuration: procedure.duration
      });
      setSelectedCommon(procedureName);
    }
  };

  const handleSubmit = () => {
    if (!customProcedure.name) {
      alert('Nome do procedimento é obrigatório');
      return;
    }
    
    onAdd(customProcedure);
    
    // Reset form
    setCustomProcedure({
      name: '',
      toothNumber: '',
      category: 'restaurador',
      description: '',
      priority: 'media',
      estimatedCost: 0,
      estimatedDuration: 60,
      notes: ''
    });
    setSelectedCommon('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="procedure-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>➕ Adicionar Procedimento</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="procedure-selection">
            <h4>Procedimentos Comuns</h4>
            <div className="common-procedures-grid">
              {commonProcedures.map(proc => (
                <button
                  key={proc.name}
                  className={`common-proc-btn ${selectedCommon === proc.name ? 'selected' : ''}`}
                  onClick={() => handleCommonProcedureSelect(proc.name)}
                >
                  <div className="proc-name">{proc.name}</div>
                  <div className="proc-details">
                    {proc.category} • R$ {proc.basePrice} • {proc.duration}min
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="custom-procedure-form">
            <h4>Detalhes do Procedimento</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nome do Procedimento *</label>
                <input
                  type="text"
                  value={customProcedure.name}
                  onChange={(e) => setCustomProcedure({...customProcedure, name: e.target.value})}
                  placeholder="Ex: Restauração com resina"
                />
              </div>
              <div className="form-group">
                <label>Dente</label>
                <input
                  type="text"
                  value={customProcedure.toothNumber}
                  onChange={(e) => setCustomProcedure({...customProcedure, toothNumber: e.target.value})}
                  placeholder="Ex: 11, 21, 36..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={customProcedure.category}
                  onChange={(e) => setCustomProcedure({...customProcedure, category: e.target.value})}
                >
                  <option value="preventivo">Preventivo</option>
                  <option value="restaurador">Restaurador</option>
                  <option value="endodontico">Endodôntico</option>
                  <option value="cirurgico">Cirúrgico</option>
                  <option value="protetico">Protético</option>
                  <option value="estetico">Estético</option>
                  <option value="exame">Exame</option>
                </select>
              </div>
              <div className="form-group">
                <label>Prioridade</label>
                <select
                  value={customProcedure.priority}
                  onChange={(e) => setCustomProcedure({...customProcedure, priority: e.target.value as any})}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Custo Estimado (R$)</label>
                <input
                  type="number"
                  value={customProcedure.estimatedCost}
                  onChange={(e) => setCustomProcedure({...customProcedure, estimatedCost: Number(e.target.value)})}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Duração (minutos)</label>
                <input
                  type="number"
                  value={customProcedure.estimatedDuration}
                  onChange={(e) => setCustomProcedure({...customProcedure, estimatedDuration: Number(e.target.value)})}
                  min="15"
                  step="15"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={customProcedure.description}
                onChange={(e) => setCustomProcedure({...customProcedure, description: e.target.value})}
                placeholder="Descrição detalhada do procedimento..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                value={customProcedure.notes}
                onChange={(e) => setCustomProcedure({...customProcedure, notes: e.target.value})}
                placeholder="Observações adicionais..."
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            ➕ Adicionar Procedimento
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlanView;