import React from 'react';

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

interface ToothButtonProps {
  toothNumber: number;
  data?: ToothProcedure;
  onClick: () => void;
  readOnly?: boolean;
}

const ToothButton: React.FC<ToothButtonProps> = ({ toothNumber, data, onClick, readOnly }) => {
  const hasProcedures = data && data.count > 0;

  return (
    <div className="tooth-wrapper">
      <button
        className={`tooth-btn ${hasProcedures ? 'has-procedure' : ''} ${readOnly ? 'readonly' : ''}`}
        onClick={onClick}
        disabled={readOnly}
        title={
          hasProcedures && data.lastProcedure
            ? `Dente ${toothNumber} - ${data.lastProcedure.type} (${data.count} procedimento${data.count > 1 ? 's' : ''})`
            : `Dente ${toothNumber}`
        }
      >
        <svg viewBox="0 0 40 60" className="tooth-svg">
          <path
            d="M20 5 C10 5, 5 15, 5 25 L5 45 C5 50, 8 55, 12 55 L28 55 C32 55, 35 50, 35 45 L35 25 C35 15, 30 5, 20 5 Z"
            className="tooth-shape"
          />
        </svg>
        {hasProcedures && (
          <span className="procedure-count">{data.count}</span>
        )}
      </button>
      <span className="tooth-number">{toothNumber}</span>
    </div>
  );
};

export default ToothButton;
