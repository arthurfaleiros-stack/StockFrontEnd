import React from 'react';  
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';

// Rotas de Controle
import ProtectedRoute from './components/routing/ProtectedRoute';
import GuestRoute from './components/routing/GuestRoute';
import AppLayout from './components/layout/AppLayout';

// Páginas de Autenticação
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordWizard from './pages/auth/ForgotPasswordWizard';

// Páginas Principais
import DashboardPage from './pages/dashboard/DashboardPage';
import ProdutosPage from './pages/produtos/ProdutosPage';
import MovimentacoesPage from './pages/movimentacoes/MovimentacoesPage';
import CategoriasPage from './pages/categorias/CategoriasPage';
import FornecedoresPage from './pages/fornecedores/FornecedoresPage';
import HistoricoPage from './pages/historico/HistoricoPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import NotFoundPage from './pages/NotFoundPage';

function AppRoutes() {
  const { user } = useAuth();
  const sessionKey = user?.id ? `user-${user.id}` : 'guest';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/esqueci-senha" element={<GuestRoute><ForgotPasswordWizard /></GuestRoute>} />
        <Route path="/recuperar-senha" element={<GuestRoute><ForgotPasswordWizard /></GuestRoute>} />

        {/* ROTAS PROTEGIDAS (exigem JWT válido) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout key={sessionKey} />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Acessível a ADMIN, GERENTE e OPERADOR */}
          <Route path="/dashboard" element={<DashboardPage key={sessionKey} />} />
          <Route path="/produtos" element={<ProdutosPage key={sessionKey} />} />
          <Route path="/movimentacoes" element={<MovimentacoesPage key={sessionKey} />} />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE', 'OPERADOR']}>
                <CategoriasPage key={sessionKey} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fornecedores"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE', 'OPERADOR']}>
                <FornecedoresPage key={sessionKey} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE', 'OPERADOR']}>
                <HistoricoPage key={sessionKey} />
              </ProtectedRoute>
            }
          />

          {/* Acessível apenas a ADMIN */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsuariosPage key={sessionKey} />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;