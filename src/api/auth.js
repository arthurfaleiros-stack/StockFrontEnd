import apiClient from './client';

/**
 * Serviços de Autenticação para a KStock-API
 */
export const authService = {
  /**
   * Realiza login na API
   * POST /api/v1/auth/login (email, senha) -> retorna JWT
   */
  async login(email, senha) {
    const response = await apiClient.post('/api/v1/auth/login', {
      email: email.trim(),
      senha,
    });
    return response.data;
  },

  /**
   * Registra novo usuário
   * POST /api/v1/auth/register (nome, email, senha)
   */
  async register(nome, email, senha) {
    const response = await apiClient.post('/api/v1/auth/register', {
      nome: nome.trim(),
      email: email.trim(),
      senha,
    });
    return response.data;
  },

  /**
   * Obtém os dados do usuário autenticado a partir do JWT anexado
   * GET /api/v1/auth/me
   */
  async getMe() {
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data;
  },

  /**
   * Solicita envio de código de 6 dígitos para o e-mail
   * POST /api/v1/auth/forgot-password (email)
   */
  async forgotPassword(email) {
    const response = await apiClient.post('/api/v1/auth/forgot-password', {
      email: email.trim(),
    });
    return response.data;
  },

  /**
   * Valida o código de 6 dígitos recebido por e-mail
   * POST /api/v1/auth/verify-reset-code (email, codigo)
   */
  async verifyResetCode(email, codigo) {
    const response = await apiClient.post('/api/v1/auth/verify-reset-code', {
      email: email.trim(),
      codigo: codigo.trim(),
    });
    return response.data;
  },

  /**
   * Redefine a senha do usuário utilizando e-mail e código validado
   * POST /api/v1/auth/reset-password (email, codigo, novaSenha)
   */
  async resetPassword(email, codigo, novaSenha) {
    const response = await apiClient.post('/api/v1/auth/reset-password', {
      email: email.trim(),
      codigo: codigo.trim(),
      novaSenha,
    });
    return response.data;
  },
};

export default authService;

