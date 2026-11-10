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

  // Alertas de Estoque
  async getAlertasEstoque(params = {}) {
    const res = await apiClient.get('/api/v1/produtos/alerta-estoque', { params });
    return res.data;
  },

  // Risco de Ruptura
  async getRiscoRuptura(params = {}) {
    const res = await apiClient.get('/api/v1/produtos/risco-ruptura', { params });
    return res.data;
  },

  // Previsão de Ruptura por Produto
  async getPrevisaoRuptura(produtoId) {
    const res = await apiClient.get(`/api/v1/produtos/${produtoId}/previsao-ruptura`);
    return res.data;
  },

  // Upload de Foto do Produto
  async uploadFotoProduto(produtoId, formData) {
    const res = await apiClient.post(`/api/v1/produtos/${produtoId}/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
  async getUsuarios(params = {}) {
    const res = await apiClient.get('/api/v1/usuarios', { params });
    return res.data;
  },

  async createUsuario(data) {
    const res = await apiClient.post('/api/v1/usuarios', data);
    return res.data;
  },

  async getUsuarioById(id) {
    const res = await apiClient.get(`/api/v1/usuarios/${id}`);
    return res.data;
  },

  async updateUsuario(id, data) {
    const res = await apiClient.put(`/api/v1/usuarios/${id}`, data);
    return res.data;
  },

  async updateUsuarioPerfil(id, perfil) {
    const res = await apiClient.patch(`/api/v1/usuarios/${id}/perfil`, { perfil });
    return res.data;
  },

  async deleteUsuario(id) {
    const res = await apiClient.delete(`/api/v1/usuarios/${id}`);
    return res.data;
  },

  // Assinaturas
  async getMinhaAssinatura() {
    const res = await apiClient.get('/api/v1/assinaturas/minha');
    return res.data;
  },

  async getAssinaturas(params = {}) {
    const res = await apiClient.get('/api/v1/assinaturas', { params });
    return res.data;
  },

  async getAssinaturaById(id) {
    const res = await apiClient.get(`/api/v1/assinaturas/${id}`);
    return res.data;
  },

  async createAssinatura(data) {
    const res = await apiClient.post('/api/v1/assinaturas', data);
    return res.data;
  },

  async updateAssinaturaStatus(id, status) {
    const res = await apiClient.patch(`/api/v1/assinaturas/${id}/status`, { status });
    return res.data;
  },

  // Métricas do Dashboard
  async getDashboardSummary() {
    const res = await apiClient.get('/api/v1/dashboard/resumo');
    return res.data;
  },
};

export default inventoryService;

