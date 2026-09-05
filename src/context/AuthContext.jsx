import React, { useState, useEffect, useCallback } from 'react';
import authService from '../api/auth';
import { parseApiError } from '../utils/errorParser';
import { AuthContext } from './authContextDef';

// Normaliza o token recebido da API
function extractToken(data) {
  if (typeof data === 'string') return data;
  if (data?.token) return data.token;
  if (data?.accessToken) return data.accessToken;
  if (data?.jwt) return data.jwt;
  if (data?.data?.token) return data.data.token;
  return null;
}

// Normaliza o perfil do usuário (ADMIN, GERENTE, OPERADOR)
function normalizeUserProfile(userData) {
  if (!userData) return null;

  let perfil = (userData.perfil || userData.role || 'OPERADOR').toUpperCase();
  if (Array.isArray(userData.roles) && userData.roles.length > 0) {
    perfil = userData.roles[0].replace('ROLE_', '').toUpperCase();
  }

  return {
    id: userData.id,
    nome: userData.nome || userData.name || 'Usuário',
    email: userData.email,
    perfil,
    raw: userData,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('keepstock_token') || null);
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('keepstock_token'));
  const [sessionNotice, setSessionNotice] = useState(null);

  // Busca dados do usuário autenticado via GET /api/v1/auth/me
  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await authService.getMe();
      const normalizedUser = normalizeUserProfile(data?.data || data);
      setUser(normalizedUser);
      return normalizedUser;
    } catch (err) {
      console.warn('Falha ao validar sessão existente:', err);
      localStorage.removeItem('keepstock_token');
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inicializa sessão ao carregar a aplicação
  useEffect(() => {
    let isMounted = true;

    if (token) {
      authService
        .getMe()
        .then((data) => {
          if (isMounted) {
            setUser(normalizeUserProfile(data?.data || data));
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('Falha ao validar sessão existente:', err);
            localStorage.removeItem('keepstock_token');
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }

    // Ouvinte para evento de sessão expirada disparado pelo interceptor do Axios
    const handleSessionExpired = (event) => {
      setUser(null);
      setToken(null);
      setSessionNotice(event.detail?.message || 'Sua sessão expirou.');
    };

    window.addEventListener('keepstock:session-expired', handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('keepstock:session-expired', handleSessionExpired);
    };
  }, [token]);

  // Função de Login
  const login = async (email, senha) => {
    try {
      const loginResponse = await authService.login(email, senha);
      const jwt = extractToken(loginResponse);

      if (!jwt) {
        throw new Error('A API não retornou um token JWT válido.');
      }

      localStorage.setItem('keepstock_token', jwt);
      setToken(jwt);
      setSessionNotice(null);

      // Busca dados completos do usuário via /me
      const userData = await authService.getMe();
      const normalized = normalizeUserProfile(userData?.data || userData);
      setUser(normalized);

      return { success: true, user: normalized };
    } catch (err) {
      const parsed = parseApiError(err);
      return { success: false, error: parsed };
    }
  };

  // Função de Registro
  const register = async (nome, email, senha) => {
    try {
      const response = await authService.register(nome, email, senha);
      return { success: true, data: response };
    } catch (err) {
      const parsed = parseApiError(err);
      return { success: false, error: parsed };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('keepstock_token');
    setToken(null);
    setUser(null);
  };

  // Helper para checar se o usuário atual possui um dos papéis permitidos
  const hasRole = (allowedRoles = []) => {
    if (!user || !user.perfil) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.perfil);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    sessionNotice,
    clearSessionNotice: () => setSessionNotice(null),
    login,
    register,
    logout,
    refreshUser: fetchCurrentUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
