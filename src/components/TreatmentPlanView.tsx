
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
  readOnly?: boolean;
}

const TreatmentPlanView: React.FC<TreatmentPlanViewProps> = ({ data, onDataChange, clientName, readOnly = false }) => {
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
              <div className="plan-details-header">
                <div className="plan-title-section">
                  <input
                    type="text"
                    value={selectedPlan.title}
                    onChange={(e) => updatePlan({ ...selectedPlan, title: e.target.value })}
                    className="plan-title-input"
                    readOnly={readOnly}
                  />
                  <span
                    className="plan-status-badge"
                    style={{ backgroundColor: getStatusColor(selectedPlan.status) }}
                  >
                    {getStatusLabel(selectedPlan.status)}
                  </span>
                </div>

                {!readOnly && (
                  <div className="plan-main-actions">
                    <button className="btn-secondary">Imprimir</button>
                    <button className="btn-primary">Aprovar Plano</button>
                  </div>
                )}
              </div>

              <div className="plan-tabs">
                <button
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Visão Geral
                </button>
                <button
                  className={`tab-btn ${activeTab === 'phases' ? 'active' : ''}`}
                  onClick={() => setActiveTab('phases')}
                >
                  Fases e Procedimentos
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="tab-content overview-tab">
                  <div className="overview-grid">
                    <div className="overview-card">
                      <h4>Status do Plano</h4>
                      <p>{getStatusLabel(selectedPlan.status)}</p>
                    </div>
                    <div className="overview-card">
                      <h4>Custo Total</h4>
                      <p>{formatCurrency(selectedPlan.totalCost)}</p>
                    </div>
                    <div className="overview-card">
                      <h4>Duração Estimada</h4>
                      <p>{selectedPlan.estimatedTotalTime} semanas</p>
                    </div>
                    <div className="overview-card">
                      <h4>Procedimentos Planejados</h4>
                      <p>{getTotalProceduresByStatus('planejado')}</p>
                    </div>
                    <div className="overview-card">
                      <h4>Procedimentos Concluídos</h4>
                      <p>{getTotalProceduresByStatus('concluido')}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'phases' && (
                <div className="tab-content phases-tab">
                  {selectedPlan.phases.map((phase) => (
                    <div className="phase-card" key={phase.id}>
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
                        {phase.procedures.length > 0 ? (
                          phase.procedures.map(proc => (
                            <div className="procedure-item" key={proc.id}>
                              <div className="procedure-main">
                                <span className="procedure-tooth">Dente: {proc.toothNumber || 'N/A'}</span>
                                <span className="procedure-name">{proc.name}</span>
                              </div>
                              <div className="procedure-details">
                                <span className="procedure-cost">{formatCurrency(proc.estimatedCost)}</span>
                                <span
                                  className="procedure-priority"
                                  style={{ backgroundColor: getPriorityColor(proc.priority) }}
                                >
                                  {proc.priority}
                                </span>
                                <span
                                  className="procedure-status"
                                  style={{ backgroundColor: getStatusColor(proc.status) }}
                                >
                                  {getStatusLabel(proc.status)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="no-procedures">Nenhum procedimento nesta fase.</p>
                        )}
                      </div>

                      {!readOnly && (
                        <div className="phase-actions">
                          <button
                            className="btn-add-procedure"
                            onClick={() => {
                              setSelectedPhase(phase.id);
                              setShowProcedureModal(true);
                            }}
                          >
                            Adicionar Procedimento
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-details">
              <div className="empty-icon">📄</div>
              <h4>Selecione um Plano</h4>
              <p>Escolha um plano de tratamento na lista ao lado para ver os detalhes.</p>
            </div>
          )}
        </div>
      </div>

      {showProcedureModal && selectedPhase && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Adicionar Procedimento</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const procedureName = (form.elements.namedItem('procedureName') as HTMLSelectElement).value;
              const toothNumber = (form.elements.namedItem('toothNumber') as HTMLInputElement).value;
              const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement).value;

              const commonProc = commonProcedures.find(p => p.name === procedureName);

              if (commonProc) {
                addProcedureToPhase(selectedPhase, {
                  name: commonProc.name,
                  category: commonProc.category,
                  estimatedCost: commonProc.basePrice,
                  estimatedDuration: commonProc.duration,
                  toothNumber,
                  notes,
                });
              }
            }}>
              <div className="form-group">
                <label>Procedimento</label>
                <select name="procedureName" required>
                  {commonProcedures.map(proc => (
                    <option key={proc.name} value={proc.name}>
                      {proc.name} ({formatCurrency(proc.basePrice)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Número do Dente (opcional)</label>
                <input type="text" name="toothNumber" placeholder="Ex: 11, 24, 36..." />
              </div>
              <div className="form-group">
                <label>Observações (opcional)</label>
                <textarea name="notes" rows={3}></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowProcedureModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewPlanModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Criar Novo Plano de Tratamento</h3>
            <p>Deseja criar um novo plano de tratamento para {clientName}?</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowNewPlanModal(false)}>Cancelar</button>
              <button type="button" className="btn-primary" onClick={createNewPlan}>Criar Plano</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlanView;

