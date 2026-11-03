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
   * Solicita envio do código de verificação de 6 dígitos para o e-mail
   * POST /api/v1/auth/esqueci-senha
   */
  async solicitarReset(email) {
    const response = await apiClient.post('/api/v1/auth/forgot-password', {
      email: email.trim(),
    });
    return response.data;
  },

  async verificarResetCode(email, codigo) {
    const response = await apiClient.post('/api/v1/auth/verify-reset-code', {
      email: email.trim(),
      codigo: codigo.trim(),
    });
    return response.data;
  },

  async resetPassword(email, codigo, novaSenha) {
    const response = await apiClient.post('/api/v1/auth/reset-password', {
      email: email.trim(),
      codigo: codigo.trim(),
      novaSenha,
    });
    return response.data;
  },

  /**
   * Confirma a redefinição com o código de 6 dígitos digitado pelo usuário e a nova senha
   * POST /api/v1/auth/resetar-senha
   */
  async confirmarReset(arg1, arg2) {
    let payload = {};
    if (typeof arg1 === 'object' && arg1 !== null) {
      const cod = (arg1.codigo || arg1.token || '').toString().trim();
      payload = {
        email: arg1.email ? arg1.email.trim() : undefined,
        codigo: cod,
        token: cod,
        novaSenha: arg1.novaSenha,
      };
    } else {
      const cod = (arg1 || '').toString().trim();
      payload = {
        codigo: cod,
        token: cod,
        novaSenha: arg2,
      };
    }

    const response = await apiClient.post('/api/v1/auth/resetar-senha', payload);
    return response.data;
  },

  /**
   * Aliases para compatibilidade
   */
  async forgotPassword(email) {
    return this.solicitarReset(email);
  },

  async resetPassword(codigo, novaSenha) {
    return this.confirmarReset(codigo, novaSenha);
  },
};

export default authService;
