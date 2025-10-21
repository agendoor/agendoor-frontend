import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectAuthenticated?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, redirectAuthenticated = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Carregando...</div>;
  }
  
  if (isAuthenticated && redirectAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default AuthGuard;