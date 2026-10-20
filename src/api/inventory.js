import apiClient from './client';

/**
 * Serviços para Gestão de Inventário e Recursos do Sistema KStock-API
 */
export const inventoryService = {
  // Produtos
  async getProdutos(params = {}) {
    const res = await apiClient.get('/api/v1/produtos', { params });
    return res.data;
  },

  async getProdutoById(id) {
    const res = await apiClient.get(`/api/v1/produtos/${id}`);
    return res.data;
  },

  async createProduto(data) {
    const res = await apiClient.post('/api/v1/produtos', data);
    return res.data;
  },

  async updateProduto(id, data) {
    const res = await apiClient.put(`/api/v1/produtos/${id}`, data);
    return res.data;
  },

  async deleteProduto(id) {
    const res = await apiClient.delete(`/api/v1/produtos/${id}`);
    return res.data;
  },

  // Movimentações
  async getMovimentacoes(params = {}) {
    const res = await apiClient.get('/api/v1/movimentacoes', { params });
    return res.data;
  },

  async createMovimentacao(data) {
    const res = await apiClient.post('/api/v1/movimentacoes', data);
    return res.data;
  },

  // Categorias
  async getCategorias(params = {}) {
    const res = await apiClient.get('/api/v1/categorias', { params });
    return res.data;
  },

  async createCategoria(data) {
    const res = await apiClient.post('/api/v1/categorias', data);
    return res.data;
  },

  async updateCategoria(id, data) {
    const res = await apiClient.put(`/api/v1/categorias/${id}`, data);
    return res.data;
  },

  async deleteCategoria(id) {
    const res = await apiClient.delete(`/api/v1/categorias/${id}`);
    return res.data;
  },

  // Fornecedores
  async getFornecedores(params = {}) {
    const res = await apiClient.get('/api/v1/fornecedores', { params });
    return res.data;
  },

  async createFornecedor(data) {
    const res = await apiClient.post('/api/v1/fornecedores', data);
    return res.data;
  },

  async updateFornecedor(id, data) {
    const res = await apiClient.put(`/api/v1/fornecedores/${id}`, data);
    return res.data;
  },

  async deleteFornecedor(id) {
    const res = await apiClient.delete(`/api/v1/fornecedores/${id}`);
    return res.data;
  },

  // Histórico / Auditoria
  async getHistorico(params = {}) {
    const res = await apiClient.get('/api/v1/historico', { params });
    return res.data;
  },

  // Usuários (ADMIN)
  async getUsuarios() {
    const res = await apiClient.get('/api/v1/usuarios');
    return res.data;
  },

  // Métricas do Dashboard
  async getDashboardSummary() {
    const res = await apiClient.get('/api/v1/dashboard/resumo');
    return res.data;
  },
};

export default inventoryService;

