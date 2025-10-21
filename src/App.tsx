import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthProvider';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Financial from './pages/Financial';
import Products from './pages/Products';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGuard from './components/AuthGuard';
import './styles.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<AuthGuard redirectAuthenticated={true}><Login /></AuthGuard>} />
            <Route path="/register" element={<AuthGuard redirectAuthenticated={true}><Register /></AuthGuard>} />
            <Route path="/register-success" element={<RegisterSuccess />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/financial" element={<ProtectedRoute><Financial /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/" element={<AuthGuard redirectAuthenticated={true}><Navigate to="/login" replace /></AuthGuard>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
