import React from 'react';
import { getToothColors } from '../utils/toothColors';

interface ToothSVGProps {
  toothNumber: number;
  status: string;
  onClick?: () => void;
  className?: string;
}

// Função para determinar o tipo de dente baseado na numeração FDI
const getToothType = (toothNumber: number): string => {
  const position = toothNumber % 10; // Posição dentro do quadrante (1-8)
  
  if (position === 1 || position === 2) return 'incisor';
  if (position === 3) return 'canine';
  if (position === 4 || position === 5) return 'premolar';
  if (position === 6 || position === 7 || position === 8) return 'molar';
  return 'incisor';
};

// Função para determinar se é dente superior ou inferior (numeração FDI)
const isUpperTooth = (toothNumber: number): boolean => {
  const quadrant = Math.floor(toothNumber / 10);
  return quadrant === 1 || quadrant === 2;
};


// Componente para incisivo - design simples e clean
const IncisorSVG: React.FC<{ isUpper: boolean; fill: string; stroke: string }> = ({ isUpper, fill, stroke }) => {
  if (isUpper) {
    return (
      <svg viewBox="0 0 40 60" className="tooth-svg">
        {/* Coroa do dente */}
        <path 
          d="M20 8
             C25 8, 28 10, 28 15
             L28 25
             C28 28, 26 30, 20 30
             C14 30, 12 28, 12 25
             L12 15
             C12 10, 15 8, 20 8 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Raiz */}
        <path 
          d="M20 30
             C18 30, 16 32, 16 35
             L16 50
             C16 52, 18 52, 20 52
             C22 52, 24 52, 24 50
             L24 35
             C24 32, 22 30, 20 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
      </svg>
    );
  } else {
    return (
      <svg viewBox="0 0 40 60" className="tooth-svg">
        {/* Raiz */}
        <path 
          d="M20 8
             C22 8, 24 8, 24 10
             L24 25
             C24 28, 22 30, 20 30
             C18 30, 16 28, 16 25
             L16 10
             C16 8, 18 8, 20 8 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Coroa do dente */}
        <path 
          d="M20 30
             C14 30, 12 32, 12 35
             L12 45
             C12 50, 15 52, 20 52
             C25 52, 28 50, 28 45
             L28 35
             C28 32, 26 30, 20 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
      </svg>
    );
  }
};

// Componente para canino - com ponta característica
const CanineSVG: React.FC<{ isUpper: boolean; fill: string; stroke: string }> = ({ isUpper, fill, stroke }) => {
  if (isUpper) {
    return (
      <svg viewBox="0 0 40 60" className="tooth-svg">
        {/* Coroa do dente com ponta */}
        <path 
          d="M20 6
             C20 6, 18 8, 16 10
             C14 12, 12 15, 12 18
             L12 25
             C12 28, 14 30, 20 30
             C26 30, 28 28, 28 25
             L28 18
             C28 15, 26 12, 24 10
             C22 8, 20 6, 20 6 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Raiz */}
        <path 
          d="M20 30
             C18 30, 16 32, 16 35
             L16 50
             C16 52, 18 52, 20 52
             C22 52, 24 52, 24 50
             L24 35
             C24 32, 22 30, 20 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
      </svg>
    );
  } else {
    return (
      <svg viewBox="0 0 40 60" className="tooth-svg">
        {/* Raiz */}
        <path 
          d="M20 8
             C22 8, 24 8, 24 10
             L24 25
             C24 28, 22 30, 20 30
             C18 30, 16 28, 16 25
             L16 10
             C16 8, 18 8, 20 8 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Coroa do dente com ponta */}
        <path 
          d="M20 30
             C14 30, 12 32, 12 35
             L12 42
             C12 45, 14 48, 16 50
             C18 52, 20 54, 20 54
             C20 54, 22 52, 24 50
             C26 48, 28 45, 28 42
             L28 35
             C28 32, 26 30, 20 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
      </svg>
    );
  }
};

// Componente para pré-molar - duas cúspides
const PremolarSVG: React.FC<{ isUpper: boolean; fill: string; stroke: string }> = ({ isUpper, fill, stroke }) => {
  if (isUpper) {
    return (
      <svg viewBox="0 0 40 60" className="tooth-svg">
        {/* Coroa do dente */}
        <path 
          d="M20 8
             C26 8, 30 10, 30 15
             L30 25
             C30 28, 28 30, 20 30
             C12 30, 10 28, 10 25
             L10 15
             C10 10, 14 8, 20 8 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Duas cúspides características */}
        <circle cx="16" cy="12" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="24" cy="12" r="1" fill="rgba(0,0,0,0.08)" />
        {/* Raízes */}
        <path 
          d="M16 30
             C14 30, 12 32, 12 35
             L12 48
             C12 50, 14 50, 16 50
             C18 50, 20 50, 20 48
             L20 35
             C20 32, 18 30, 16 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        <path 
          d="M24 30
             C22 30, 20 32, 20 35
             L20 48
             C20 50, 22 50, 24 50
             C26 50, 28 50, 28 48
             L28 35
             C28 32, 26 30, 24 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
      </svg>
    );
  } else {
    return (
      <svg viewBox="0 0 40 60" className="tooth-svg">
        {/* Raiz */}
        <path 
          d="M20 8
             C22 8, 24 8, 24 10
             L24 25
             C24 28, 22 30, 20 30
             C18 30, 16 28, 16 25
             L16 10
             C16 8, 18 8, 20 8 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Coroa do dente */}
        <path 
          d="M20 30
             C12 30, 10 32, 10 35
             L10 45
             C10 50, 14 52, 20 52
             C26 52, 30 50, 30 45
             L30 35
             C30 32, 28 30, 20 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Duas cúspides */}
        <circle cx="16" cy="48" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="24" cy="48" r="1" fill="rgba(0,0,0,0.08)" />
      </svg>
    );
  }
};

// Componente para molar - maior e com múltiplas raízes
const MolarSVG: React.FC<{ isUpper: boolean; fill: string; stroke: string }> = ({ isUpper, fill, stroke }) => {
  if (isUpper) {
    return (
      <svg viewBox="0 0 45 60" className="tooth-svg">
        {/* Coroa do dente */}
        <path 
          d="M22.5 8
             C30 8, 35 10, 35 15
             L35 25
             C35 28, 33 30, 22.5 30
             C12 30, 10 28, 10 25
             L10 15
             C10 10, 15 8, 22.5 8 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Múltiplas cúspides */}
        <circle cx="15" cy="12" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="22" cy="12" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="30" cy="12" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="18" cy="16" r="0.8" fill="rgba(0,0,0,0.06)" />
        <circle cx="27" cy="16" r="0.8" fill="rgba(0,0,0,0.06)" />
        {/* Múltiplas raízes */}
        <path 
          d="M15 30
             C13 30, 11 32, 11 35
             L11 48
             C11 50, 13 50, 15 50
             C17 50, 19 50, 19 48
             L19 35
             C19 32, 17 30, 15 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        <path 
          d="M22.5 30
             C20.5 30, 18.5 32, 18.5 35
             L18.5 50
             C18.5 52, 20.5 52, 22.5 52
             C24.5 52, 26.5 52, 26.5 50
             L26.5 35
             C26.5 32, 24.5 30, 22.5 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        <path 
          d="M30 30
             C28 30, 26 32, 26 35
             L26 48
             C26 50, 28 50, 30 50
             C32 50, 34 50, 34 48
             L34 35
             C34 32, 32 30, 30 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
      </svg>
    );
  } else {
    return (
      <svg viewBox="0 0 45 60" className="tooth-svg">
        {/* Raízes */}
        <path 
          d="M15 8
             C17 8, 19 8, 19 10
             L19 25
             C19 28, 17 30, 15 30
             C13 30, 11 28, 11 25
             L11 10
             C11 8, 13 8, 15 8 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        <path 
          d="M30 8
             C32 8, 34 8, 34 10
             L34 25
             C34 28, 32 30, 30 30
             C28 30, 26 28, 26 25
             L26 10
             C26 8, 28 8, 30 8 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Coroa do dente */}
        <path 
          d="M22.5 30
             C12 30, 10 32, 10 35
             L10 45
             C10 50, 15 52, 22.5 52
             C30 52, 35 50, 35 45
             L35 35
             C35 32, 33 30, 22.5 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.2"
        />
        {/* Múltiplas cúspides */}
        <circle cx="15" cy="48" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="22" cy="48" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="30" cy="48" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="18" cy="44" r="0.8" fill="rgba(0,0,0,0.06)" />
        <circle cx="27" cy="44" r="0.8" fill="rgba(0,0,0,0.06)" />
      </svg>
    );
  }
};

// Componente especial para dente ausente
const MissingToothSVG: React.FC = () => {
  return (
    <svg viewBox="0 0 50 70" className="tooth-svg missing-tooth">
      <rect x="10" y="20" width="30" height="30" fill="none" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,3" rx="5"/>
      <text x="25" y="38" textAnchor="middle" fill="#9ca3af" fontSize="8">X</text>
    </svg>
  );
};

// Componente principal
const ToothSVG: React.FC<ToothSVGProps> = ({ 
  toothNumber, 
  status, 
  onClick, 
  className = ''
}) => {
  const toothType = getToothType(toothNumber);
  const isUpper = isUpperTooth(toothNumber);
  const { fill, stroke } = getToothColors(status);

  // Verificar se deve ser clicável
  const isClickable = onClick && className.includes('clickable');
  
  if (status === 'missing') {
    return (
      <div 
        className={`tooth-container ${className} ${!isClickable ? 'read-only' : ''}`}
        onClick={isClickable ? onClick : undefined}
        style={{ cursor: isClickable ? 'pointer' : 'default' }}
      >
        <MissingToothSVG />
        <span className="tooth-number">{toothNumber}</span>
      </div>
    );
  }

  const renderToothByType = () => {
    switch (toothType) {
      case 'incisor':
        return <IncisorSVG isUpper={isUpper} fill={fill} stroke={stroke} />;
      case 'canine':
        return <CanineSVG isUpper={isUpper} fill={fill} stroke={stroke} />;
      case 'premolar':
        return <PremolarSVG isUpper={isUpper} fill={fill} stroke={stroke} />;
      case 'molar':
        return <MolarSVG isUpper={isUpper} fill={fill} stroke={stroke} />;
      default:
        return <IncisorSVG isUpper={isUpper} fill={fill} stroke={stroke} />;
    }
  };

  return (
    <div 
      className={`tooth-container ${className} ${!isClickable ? 'read-only' : ''}`} 
      onClick={isClickable ? onClick : undefined}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      {renderToothByType()}
      <span className="tooth-number">{toothNumber}</span>
    </div>
  );
};

export default ToothSVG;