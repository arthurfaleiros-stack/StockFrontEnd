import apiClient from './client';

/**
 * Serviços para Gestão de Inventário e Recursos do Sistema KStock-API
 */
export const inventoryService = {
  // Produtos
  async getProdutos(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/produtos', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  async getProdutoById(id) {
    const res = await apiClient.get(`/api/v1/produtos/${id}`);
    return res.data;
  },

  async createProduto(data) {
    const res = await apiClient.post('/api/v1/produtos', data);
    return res.data;
  },

  // Movimentações
  async getMovimentacoes(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/movimentacoes', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  async createMovimentacao(data) {
    const res = await apiClient.post('/api/v1/movimentacoes', data);
    return res.data;
  },

  // Categorias
  async getCategorias() {
    try {
      const res = await apiClient.get('/api/v1/categorias');
      return res.data;
    } catch {
      return null;
    }
  },

  // Fornecedores
  async getFornecedores() {
    try {
      const res = await apiClient.get('/api/v1/fornecedores');
      return res.data;
    } catch {
      return null;
    }
  },

  // Histórico / Auditoria
  async getHistorico(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/historico', { params });
      return res.data;
    } catch {
      return null;
    }
  },

  // Usuários (ADMIN)
  async getUsuarios() {
    try {
      const res = await apiClient.get('/api/v1/usuarios');
      return res.data;
    } catch {
      return null;
    }
  },

  // Métricas do Dashboard
  async getDashboardSummary() {
    try {
      const res = await apiClient.get('/api/v1/dashboard/resumo');
      return res.data;
    } catch {
      return null;
    }
  },
};

export default inventoryService;

