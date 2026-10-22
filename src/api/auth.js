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
   * Solicita token de recuperação de senha para o e-mail informado
   * POST /api/v1/auth/esqueci-senha
   */
  async solicitarReset(email) {
    const response = await apiClient.post('/api/v1/auth/esqueci-senha', {
      email: email.trim(),
    });
    return response.data;
  },

  /**
   * Confirma a redefinição de senha com o token e a nova senha
   * POST /api/v1/auth/resetar-senha
   */
  async confirmarReset(token, novaSenha) {
    const response = await apiClient.post('/api/v1/auth/resetar-senha', {
      token: token.trim(),
      novaSenha,
    });
    return response.data;
  },

  /**
   * Aliases compatíveis com versões anteriores
   */
  async forgotPassword(email) {
    return this.solicitarReset(email);
  },

  async resetPassword(token, novaSenha) {
    return this.confirmarReset(token, novaSenha);
  },
};

export default authService;
