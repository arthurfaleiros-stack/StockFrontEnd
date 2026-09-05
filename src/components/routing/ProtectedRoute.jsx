import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ShieldAlert } from 'lucide-react';
import Button from '../common/Button';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 animate-pulse mb-4">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Validando credenciais...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0e162c] border border-rose-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acesso Não Autorizado</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Seu perfil atual (<span className="text-indigo-300 font-semibold">{user?.perfil}</span>) não possui permissão para acessar esta seção. É necessário ter perfil: {allowedRoles.join(' ou ')}.
          </p>
          <div className="flex justify-center">
            <Button variant="primary" onClick={() => window.history.back()}>
              Voltar à página anterior
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
