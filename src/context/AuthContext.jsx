import React, { useState, useEffect } from 'react';
import authService from '../api/auth';
import { getErrorMessage } from '../utils/errorParser';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quando o app abre, se já tiver um token salvo, tenta buscar
  // os dados do usuário pra manter ele logado.
  useEffect(() => {
    const token = localStorage.getItem('keepstock_token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        // Token inválido ou expirado
        localStorage.removeItem('keepstock_token');
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(email, senha) {
    try {
      const data = await authService.login(email, senha);
      localStorage.setItem('keepstock_token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  async function register(nome, email, senha) {
    try {
      await authService.register(nome, email, senha);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  function logout() {
    localStorage.removeItem('keepstock_token');
    setUser(null);
  }

  // Confere se o usuário logado tem um dos perfis permitidos
  // (ADMIN, GERENTE ou OPERADOR). Sem lista = qualquer um pode.
  function hasRole(allowedRoles = []) {
    if (allowedRoles.length === 0) return true;
    return !!user && allowedRoles.includes(user.perfil);
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
