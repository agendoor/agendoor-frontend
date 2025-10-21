import React, { useState, useEffect } from 'react';
import '../styles/odontogram.css';
import ToothSVG from './ToothSVG';
import { getToothColor, getStatusLabel } from '../utils/toothColors';

interface DentalTreatment {
  id: string;
  name: string;
  category: string;
  description?: string;
  color?: string;
  estimatedDuration?: number;
  averagePrice?: number;
}

interface ToothTreatment {
  id: string;
  toothId: number;
  treatmentId: string;
  treatment: DentalTreatment;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  datePerformed?: string;
  datePlanned?: string;
  price?: number;
}

interface ToothData {
  id: number;
  status: 'healthy' | 'caries' | 'restored' | 'missing' | 'implant' | 'crown' | 'root_canal';
  procedures: string[];
  notes?: string;
  treatments?: ToothTreatment[];
}

interface OdontogramViewProps {
  data: { teeth?: ToothData[] };
  onDataChange: (data: { teeth: ToothData[] }) => void;
  readOnly?: boolean;
  clientId?: string;
}

const OdontogramView: React.FC<OdontogramViewProps> = ({ data, onDataChange, readOnly = false, clientId }) => {
  const [teeth, setTeeth] = useState<ToothData[]>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [availableTreatments, setAvailableTreatments] = useState<DentalTreatment[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [treatmentSearch, setTreatmentSearch] = useState<string>('');
  const [showNewTreatmentForm, setShowNewTreatmentForm] = useState(false);
  const [newTreatment, setNewTreatment] = useState({
    name: '',
    category: 'restaurador',
    description: '',
    estimatedDuration: '',
    averagePrice: '',
    color: '#3b82f6'
  });
  const [loading, setLoading] = useState(false);

  // Inicializar dentes e carregar tratamentos
  useEffect(() => {
    if (data.teeth && data.teeth.length > 0) {
      setTeeth(data.teeth);
    } else {
      // Criar odontograma com numeração FDI
      const initialTeeth: ToothData[] = [];
      
      // Dentes superiores direitos (18-11) 
      for (let i = 18; i >= 11; i--) {
        initialTeeth.push({
          id: i,
          status: 'healthy',
          procedures: [],
          notes: '',
          treatments: []
        });
      }
      
      // Dentes superiores esquerdos (21-28)
      for (let i = 21; i <= 28; i++) {
        initialTeeth.push({
          id: i,
          status: 'healthy',
          procedures: [],
          notes: '',
          treatments: []
        });
      }
      
      // Dentes inferiores direitos (48-41)
      for (let i = 48; i >= 41; i--) {
        initialTeeth.push({
          id: i,
          status: 'healthy',
          procedures: [],
          notes: '',
          treatments: []
        });
      }
      
      // Dentes inferiores esquerdos (31-38)
      for (let i = 31; i <= 38; i++) {
        initialTeeth.push({
          id: i,
          status: 'healthy',
          procedures: [],
          notes: '',
          treatments: []
        });
      }
      
      setTeeth(initialTeeth);
    }
    
    loadAvailableTreatments();
    if (clientId) {
      loadToothTreatments();
    }
  }, [data, clientId]);

  const loadAvailableTreatments = async () => {
    try {
      const response = await fetch('/api/dental-treatments');
      if (response.ok) {
        const result = await response.json();
        setAvailableTreatments(result.treatments || []);
      }
    } catch (error) {
      console.error('Erro ao carregar tratamentos:', error);
    }
  };

  const loadToothTreatments = async () => {
    if (!clientId) return;
    
    try {
      const response = await fetch(`/api/clients/${clientId}/tooth-treatments`);
      if (response.ok) {
        const result = await response.json();
        const treatmentsByTooth = result.toothTreatments.reduce((acc: any, treatment: ToothTreatment) => {
          if (!acc[treatment.toothId]) acc[treatment.toothId] = [];
          acc[treatment.toothId].push(treatment);
          return acc;
        }, {});
        
        setTeeth(prevTeeth => 
          prevTeeth.map(tooth => ({
            ...tooth,
            treatments: treatmentsByTooth[tooth.id] || []
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao carregar tratamentos do cliente:', error);
    }
  };

  const getTreatmentStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'Planejado';
      case 'IN_PROGRESS': return 'Em Andamento';
      case 'COMPLETED': return 'Concluído';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const updateTooth = (toothId: number, updates: Partial<ToothData>) => {
    if (readOnly) return;
    
    const updatedTeeth = teeth.map(tooth => 
      tooth.id === toothId ? { ...tooth, ...updates } : tooth
    );
    setTeeth(updatedTeeth);
    onDataChange({ teeth: updatedTeeth });
  };

  const addTreatmentToTooth = async (toothId: number, treatmentId: string, notes: string = '') => {
    if (!clientId) {
      alert('ID do cliente não fornecido');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/tooth-treatments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toothId,
          treatmentId,
          status: 'PLANNED',
          notes
        })
      });
      
      if (response.ok) {
        await loadToothTreatments();
        setSelectedTreatment('');
        alert('Tratamento adicionado com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao adicionar tratamento: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar tratamento:', error);
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const createNewTreatment = async () => {
    if (!newTreatment.name.trim() || !newTreatment.category) {
      alert('Nome e categoria são obrigatórios');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/dental-treatments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTreatment,
          estimatedDuration: newTreatment.estimatedDuration ? parseInt(newTreatment.estimatedDuration) : null,
          averagePrice: newTreatment.averagePrice ? parseFloat(newTreatment.averagePrice) : null
        })
      });
      
      if (response.ok) {
        await loadAvailableTreatments();
        setShowNewTreatmentForm(false);
        setNewTreatment({
          name: '',
          category: 'restaurador',
          description: '',
          estimatedDuration: '',
          averagePrice: '',
          color: '#3b82f6'
        });
        alert('Tratamento criado com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao criar tratamento: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar tratamento:', error);
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const openToothModal = (toothId: number) => {
    if (readOnly) return;
    setSelectedTooth(toothId);
    setModalOpen(true);
    setTreatmentSearch('');
    setSelectedTreatment('');
    setShowNewTreatmentForm(false);
  };

  const filteredTreatments = availableTreatments.filter(treatment => 
    treatment.name.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
    treatment.category.toLowerCase().includes(treatmentSearch.toLowerCase())
  );

  const getToothTreatmentsDisplay = (toothId: number) => {
    const tooth = teeth.find(t => t.id === toothId);
    if (!tooth?.treatments?.length) return null;
    
    const planned = tooth.treatments.filter(t => t.status === 'PLANNED').length;
    const completed = tooth.treatments.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tooth.treatments.filter(t => t.status === 'IN_PROGRESS').length;
    
    return { planned, completed, inProgress, total: tooth.treatments.length };
  };

  const selectedToothData = selectedTooth ? teeth.find(t => t.id === selectedTooth) : null;

  // Organizar dentes em layout linear como na imagem de referência
  const upperTeeth = teeth.filter(t => t.id >= 11 && t.id <= 28).sort((a, b) => {
    const upperOrder = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    return upperOrder.indexOf(a.id) - upperOrder.indexOf(b.id);
  });
  
  const lowerTeeth = teeth.filter(t => t.id >= 31 && t.id <= 48).sort((a, b) => {
    const lowerOrder = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
    return lowerOrder.indexOf(a.id) - lowerOrder.indexOf(b.id);
  });

  return (
    <div className="odontogram-container">
      <div className="odontogram-header">
        <h3>🦷 Odontograma Profissional</h3>
        <p className="odontogram-subtitle">
          {readOnly ? 'Visualizar estado dos dentes e tratamentos' : 'Clique nos dentes para adicionar tratamentos'}
        </p>
      </div>

      <div className="professional-dental-chart">
        {/* Vista Superior (Maxila) */}
        <div className="dental-arch upper-arch">
          <div className="arch-header">
            <span className="side-label">Direita</span>
            <span className="arch-title">MAXILA (SUPERIOR)</span>
            <span className="side-label">Esquerda</span>
          </div>
          
          <div className="teeth-row maxila">
            {upperTeeth.map(tooth => {
              const treatmentInfo = getToothTreatmentsDisplay(tooth.id);
              return (
                <div key={tooth.id} className="tooth-container" title={`Dente ${tooth.id} - ${getStatusLabel(tooth.status)}${treatmentInfo ? ` - ${treatmentInfo.total} tratamento(s)` : ''}`}>
                  <ToothSVG
                    toothNumber={tooth.id}
                    status={tooth.status}
                    onClick={() => openToothModal(tooth.id)}
                    className={`${readOnly ? '' : 'clickable'} ${treatmentInfo ? 'has-treatments' : ''}`}
                  />
                  <span className="tooth-number">{tooth.id}</span>
                  {treatmentInfo && (
                    <div className="tooth-treatments-info">
                      {treatmentInfo.completed > 0 && <span className="completed">{treatmentInfo.completed}</span>}
                      {treatmentInfo.inProgress > 0 && <span className="in-progress">{treatmentInfo.inProgress}</span>}
                      {treatmentInfo.planned > 0 && <span className="planned">{treatmentInfo.planned}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Categorias dos dentes superiores */}
          <div className="tooth-categories upper-categories">
            <span className="category molares">molares</span>
            <span className="category pre-molares">pré-molares</span>
            <span className="category caninos">caninos</span>
            <span className="category incisivos">incisivos</span>
            <span className="category caninos">caninos</span>
            <span className="category pre-molares">pré-molares</span>
            <span className="category molares">molares</span>
          </div>
        </div>

        {/* Espaço entre arcadas */}
        <div className="arch-separator"></div>

        {/* Vista Inferior (Mandíbula) */}
        <div className="dental-arch lower-arch">
          {/* Categorias dos dentes inferiores */}
          <div className="tooth-categories lower-categories">
            <span className="category molares">molares</span>
            <span className="category pre-molares">pré-molares</span>
            <span className="category caninos">caninos</span>
            <span className="category incisivos">incisivos</span>
            <span className="category caninos">caninos</span>
            <span className="category pre-molares">pré-molares</span>
            <span className="category molares">molares</span>
          </div>
          
          <div className="teeth-row mandibula">
            {lowerTeeth.map(tooth => {
              const treatmentInfo = getToothTreatmentsDisplay(tooth.id);
              return (
                <div key={tooth.id} className="tooth-container" title={`Dente ${tooth.id} - ${getStatusLabel(tooth.status)}${treatmentInfo ? ` - ${treatmentInfo.total} tratamento(s)` : ''}`}>
                  <ToothSVG
                    toothNumber={tooth.id}
                    status={tooth.status}
                    onClick={() => openToothModal(tooth.id)}
                    className={`${readOnly ? '' : 'clickable'} ${treatmentInfo ? 'has-treatments' : ''}`}
                  />
                  <span className="tooth-number">{tooth.id}</span>
                  {treatmentInfo && (
                    <div className="tooth-treatments-info">
                      {treatmentInfo.completed > 0 && <span className="completed">{treatmentInfo.completed}</span>}
                      {treatmentInfo.inProgress > 0 && <span className="in-progress">{treatmentInfo.inProgress}</span>}
                      {treatmentInfo.planned > 0 && <span className="planned">{treatmentInfo.planned}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="arch-header">
            <span className="side-label">Direita</span>
            <span className="arch-title">MANDÍBULA (INFERIOR)</span>
            <span className="side-label">Esquerda</span>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="odontogram-legend">
        <h4>Legenda:</h4>
        <div className="legend-items">
          {[
            { status: 'healthy', label: 'Hígido' },
            { status: 'caries', label: 'Cárie' },
            { status: 'restored', label: 'Restaurado' },
            { status: 'missing', label: 'Ausente' },
            { status: 'implant', label: 'Implante' },
            { status: 'crown', label: 'Coroa' },
            { status: 'root_canal', label: 'Endodontia' }
          ].map(item => (
            <div key={item.status} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: getToothColor(item.status) }}
              ></div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        
        <div className="treatment-legend">
          <h4>Status dos Tratamentos:</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="treatment-badge planned">P</span>
              <span>Planejado</span>
            </div>
            <div className="legend-item">
              <span className="treatment-badge in-progress">A</span>
              <span>Em Andamento</span>
            </div>
            <div className="legend-item">
              <span className="treatment-badge completed">C</span>
              <span>Concluído</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edição do dente */}
      {modalOpen && selectedToothData && !readOnly && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Dente {selectedToothData.id}</h3>
              <button 
                className="modal-close" 
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Status do Dente */}
              <div className="form-group">
                <label>Status do Dente:</label>
                <select
                  value={selectedToothData.status}
                  onChange={(e) => updateTooth(selectedToothData.id, { 
                    status: e.target.value as ToothData['status'] 
                  })}
                >
                  <option value="healthy">Hígido</option>
                  <option value="caries">Cárie</option>
                  <option value="restored">Restaurado</option>
                  <option value="missing">Ausente</option>
                  <option value="implant">Implante</option>
                  <option value="crown">Coroa</option>
                  <option value="root_canal">Tratamento Endodôntico</option>
                </select>
              </div>

              {/* Sistema de Tratamentos */}
              <div className="form-group">
                <label>Adicionar Tratamento:</label>
                
                <div className="treatment-search-container">
                  <input
                    type="text"
                    placeholder="Buscar tratamento..."
                    value={treatmentSearch}
                    onChange={(e) => {
                      setTreatmentSearch(e.target.value);
                      setSelectedTreatment('');
                    }}
                    className="treatment-search"
                  />
                  <button
                    type="button"
                    className="btn-add-treatment"
                    onClick={() => setShowNewTreatmentForm(!showNewTreatmentForm)}
                    title="Cadastrar novo tratamento"
                  >
                    +
                  </button>
                </div>

                {treatmentSearch && (
                  <div className="treatments-dropdown">
                    {filteredTreatments.length > 0 ? (
                      filteredTreatments.map(treatment => (
                        <div
                          key={treatment.id}
                          className="treatment-option"
                          onClick={() => {
                            setSelectedTreatment(treatment.id);
                            setTreatmentSearch(treatment.name);
                          }}
                        >
                          <span 
                            className="treatment-color" 
                            style={{ backgroundColor: treatment.color || '#3b82f6' }}
                          ></span>
                          <div className="treatment-info">
                            <div className="treatment-name">{treatment.name}</div>
                            <div className="treatment-category">{treatment.category}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-treatments">
                        <p>Nenhum tratamento encontrado</p>
                        <button
                          type="button"
                          className="btn-create-treatment"
                          onClick={() => {
                            setNewTreatment(prev => ({ ...prev, name: treatmentSearch }));
                            setShowNewTreatmentForm(true);
                          }}
                        >
                          Cadastrar "{treatmentSearch}"
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedTreatment && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => addTreatmentToTooth(selectedToothData.id, selectedTreatment)}
                    disabled={loading}
                  >
                    {loading ? 'Adicionando...' : 'Adicionar Tratamento'}
                  </button>
                )}
              </div>

              {/* Formulário para novo tratamento */}
              {showNewTreatmentForm && (
                <div className="new-treatment-form">
                  <h4>Cadastrar Novo Tratamento</h4>
                  
                  <div className="form-group">
                    <label>Nome do Tratamento:</label>
                    <input
                      type="text"
                      value={newTreatment.name}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Restauração com Resina"
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoria:</label>
                    <select
                      value={newTreatment.category}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="restaurador">Restaurador</option>
                      <option value="preventivo">Preventivo</option>
                      <option value="cirurgico">Cirúrgico</option>
                      <option value="endodontico">Endodôntico</option>
                      <option value="protético">Protético</option>
                      <option value="estetico">Estético</option>
                      <option value="ortodontico">Ortodôntico</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowNewTreatmentForm(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={createNewTreatment}
                      disabled={loading}
                    >
                      {loading ? 'Criando...' : 'Criar Tratamento'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tratamentos existentes no dente */}
              {selectedToothData.treatments && selectedToothData.treatments.length > 0 && (
                <div className="existing-treatments">
                  <h4>Tratamentos Existentes:</h4>
                  {selectedToothData.treatments.map(treatment => (
                    <div key={treatment.id} className="existing-treatment">
                      <span 
                        className="treatment-color" 
                        style={{ backgroundColor: treatment.treatment.color || '#3b82f6' }}
                      ></span>
                      <div className="treatment-details">
                        <div className="treatment-name">{treatment.treatment.name}</div>
                        <div className="treatment-status">Status: {getTreatmentStatusLabel(treatment.status)}</div>
                        {treatment.notes && <div className="treatment-notes">{treatment.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OdontogramView;