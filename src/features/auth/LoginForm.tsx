import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.png';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-left-content">
          <img src={logo} alt="Agendoor" className="logo" />
          <h1>Bem-vindo ao Agendoor</h1>
          <p>Entre para continuar acessando o sistema</p>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-form-container">
          <h2>Entrar</h2>
          <p className="login-subtitle">Entre para continuar acessando as páginas</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'ENTRANDO...' : 'CONTINUAR'}
            </button>
            
            {error && (
              <div className="error-message" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
                {error}
              </div>
            )}
          </form>
          
          <div className="register-link">
            <p>Não tem uma conta? <a href="/register">Cadastre-se</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
