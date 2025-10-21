import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const RegisterSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-success-container">
      <div className="register-success-content">
        <img src={logo} alt="Agendoor" className="logo" />
        
        <div className="success-icon">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="50" fill="#10b981" />
            <path d="M30 50L42 62L70 34" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1>Parabéns!</h1>
        <h2>Cadastro realizado com sucesso!</h2>
        
        <p className="success-message">
          Sua conta foi criada e está pronta para uso. 
          Agora você pode aproveitar todos os recursos do Agendoor.
        </p>

        <div className="next-steps">
          <h3>Próximos passos:</h3>
          <ul>
            <li>✓ Faça login com suas credenciais</li>
            <li>✓ Configure seus serviços</li>
            <li>✓ Comece a agendar seus clientes</li>
          </ul>
        </div>

        <button onClick={handleGoToLogin} className="go-to-login-btn">
          Ir para Login
        </button>

        <p className="auto-redirect">
          Você será redirecionado automaticamente em 5 segundos...
        </p>
      </div>
    </div>
  );
};

export default RegisterSuccess;
