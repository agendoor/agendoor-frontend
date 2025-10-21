import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/topbar.css';

interface TopBarProps {
  onSettingsClick?: () => void;
  onLogout?: () => void;
  onUrgentClick?: () => void;
  urgentCount?: number;
  userWelcome?: string;
}

const TopBar: React.FC<TopBarProps> = ({ 
  onSettingsClick, 
  onLogout, 
  onUrgentClick,
  urgentCount = 0,
  userWelcome = "Olá, adm!" 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      navigate('/login');
    }
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="topbar">
      {/* Logo Section */}
      <div className="topbar-logo">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" className="logo-svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="brand-name">Agendoor</span>
            <span className="brand-subtitle">Sistema de Agendamento</span>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="topbar-nav">
        <div 
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} 
          onClick={() => navigate('/dashboard')}
          data-tooltip="Dashboard"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          <span className="nav-label">Dashboard</span>
        </div>
        
        <div 
          className={`nav-item ${isActive('/clients') ? 'active' : ''}`} 
          onClick={() => navigate('/clients')}
          data-tooltip="Clientes"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2v-4h2v4h2v-4h3v4h2v-6H2v6h2zm0-8.5c0-2.49 2.01-4.5 4.5-4.5S13 7.01 13 9.5s-2.01 4.5-4.5 4.5S4 11.99 4 9.5z"/>
          </svg>
          <span className="nav-label">Clientes</span>
        </div>
        
        <div 
          className={`nav-item ${isActive('/financial') ? 'active' : ''}`} 
          onClick={() => navigate('/financial')}
          data-tooltip="Financeiro"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
          </svg>
          <span className="nav-label">Financeiro</span>
        </div>
        
        <div 
          className={`nav-item ${isActive('/products') ? 'active' : ''}`} 
          onClick={() => navigate('/products')}
          data-tooltip="Produtos"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
          </svg>
          <span className="nav-label">Produtos</span>
        </div>
        
        <div 
          className="nav-item" 
          onClick={handleSettingsClick}
          data-tooltip="Configurações"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
          <span className="nav-label">Configurações</span>
        </div>
        
        <div 
          className="nav-item" 
          data-tooltip="Relatórios"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
          </svg>
          <span className="nav-label">Relatórios</span>
        </div>
      </nav>

      {/* User Section */}
      <div className="topbar-user">
        <div className="user-info">
          <span className="user-welcome">{userWelcome}</span>
          <div className="user-avatar">
            <span>A</span>
          </div>
        </div>
        
        <div className="user-actions">
          <div 
            className="action-item urgent-action"
            onClick={onUrgentClick}
            data-tooltip="Sala de Urgências"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            {urgentCount > 0 && <span className="urgent-badge">{urgentCount}</span>}
          </div>
          <div 
            className="action-item"
            onClick={handleLogout}
            data-tooltip="Sair"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;