import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import ToothButton from './ToothButton';
import ToothPanel from './ToothPanel';
import './Odontogram.css';

interface ToothProcedure {
  tooth: number;
  lastProcedure?: {
    type: string;
    title: string;
    content: string;
    date: string;
  };
  count: number;
}

interface OdontogramProps {
  clientId: string;
  readOnly?: boolean;
}

const Odontogram: React.FC<OdontogramProps> = ({ clientId, readOnly = false }) => {
  const [teethData, setTeethData] = useState<ToothProcedure[]>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Dentes FDI
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  useEffect(() => {
    loadOdontograma();
  }, [clientId]);

  const loadOdontograma = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/clients/${clientId}/odontograma`);
      setTeethData(response.data.teeth || []);
    } catch (error) {
      console.error('Erro ao carregar odontograma:', error);
    } finally {
      setLoading(false);
    }
  };

  const getToothData = (toothNumber: number): ToothProcedure | undefined => {
    return teethData.find(t => t.tooth === toothNumber);
  };

  const handleToothClick = (toothNumber: number) => {
    if (!readOnly) {
      setSelectedTooth(toothNumber);
    }
  };

  const handleProcedureSaved = () => {
    loadOdontograma();
    setSelectedTooth(null);
  };

  return (
    <div className="odontogram-wrapper">
      <div className="odontogram-header">
        <h3>🦷 Odontograma</h3>
        <p>{readOnly ? 'Visualização' : 'Clique em um dente para registrar procedimento'}</p>
      </div>

      {loading ? (
        <div className="odontogram-loading">Carregando...</div>
      ) : (
        <div className="odontogram-chart">
          {/* Arcada Superior */}
          <div className="dental-arch upper">
            <div className="arch-label">
              <span>Direita</span>
              <span className="arch-name">MAXILA (Superior)</span>
              <span>Esquerda</span>
            </div>
            <div className="teeth-row">
              {upperTeeth.map(toothNum => (
                <ToothButton
                  key={toothNum}
                  toothNumber={toothNum}
                  data={getToothData(toothNum)}
                  onClick={() => handleToothClick(toothNum)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>

          {/* Divisor */}
          <div className="arch-divider"></div>

          {/* Arcada Inferior */}
          <div className="dental-arch lower">
            <div className="teeth-row">
              {lowerTeeth.map(toothNum => (
                <ToothButton
                  key={toothNum}
                  toothNumber={toothNum}
                  data={getToothData(toothNum)}
                  onClick={() => handleToothClick(toothNum)}
                  readOnly={readOnly}
                />
              ))}
            </div>
            <div className="arch-label">
              <span>Direita</span>
              <span className="arch-name">MANDÍBULA (Inferior)</span>
              <span>Esquerda</span>
            </div>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="odontogram-legend">
        <div className="legend-item">
          <span className="badge badge-procedure">●</span>
          <span>Dente com procedimento registrado</span>
        </div>
        <div className="legend-item">
          <span className="badge badge-count">2</span>
          <span>Número de procedimentos</span>
        </div>
      </div>

      {/* Panel do Dente */}
      {selectedTooth && !readOnly && (
        <ToothPanel
          toothNumber={selectedTooth}
          clientId={clientId}
          onClose={() => setSelectedTooth(null)}
          onSave={handleProcedureSaved}
        />
      )}
    </div>
  );
};

export default Odontogram;
