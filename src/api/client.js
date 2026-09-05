import axios from 'axios';
import { parseApiError } from '../utils/errorParser';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('🚨 API_BASE_URL:', API_BASE_URL);
console.log('🚨 VITE_API_URL:', import.meta.env.VITE_API_URL);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor de Requisição: anexa JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('keepstock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta: trata 401 e erros de autorização
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Normaliza erro para formato amigável
    const parsed = parseApiError(error);
    error.parsedError = parsed;

    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      // Se não for rota de login ou recuperação de senha
      const isAuthGuestRoute = 
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/forgot-password') ||
        requestUrl.includes('/auth/verify-reset-code') ||
        requestUrl.includes('/auth/reset-password');

      if (!isAuthGuestRoute) {
        // Remove token inválido/expirado
        localStorage.removeItem('keepstock_token');
        
        // Notifica o AuthContext através de evento customizado
        window.dispatchEvent(new CustomEvent('keepstock:session-expired', {
          detail: { message: parsed.message || 'Sua sessão expirou. Faça login novamente.' }
        }));

        // Redireciona para o login se não estivermos nele
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?expired=1`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

