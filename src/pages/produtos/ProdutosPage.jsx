import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { StatusBadge } from '../../components/common/Badge';
import { Search, Plus, Filter, Trash2, Package, Tag, Building2, AlertTriangle } from 'lucide-react';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';

export function ProdutosPage() {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & form states
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [modalError, setModalError] = useState('');

  const [form, setForm] = useState({
    nome: '',
    codigo: '',
    categoria_id: '',
    fornecedor_id: '',
    quantidade_atual: 0,
    quantidade_minima: 0,
    codigo_barras: '',
    descricao: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, fornRes] = await Promise.all([
        inventoryService.getProdutos({ limit: 100 }),
        inventoryService.getCategorias({ limit: 100 }),
        inventoryService.getFornecedores({ limit: 100 }),
      ]);

      const prods = prodRes?.data || (Array.isArray(prodRes) ? prodRes : []);
      const cats = catRes?.data || (Array.isArray(catRes) ? catRes : []);
      const forns = fornRes?.data || (Array.isArray(fornRes) ? fornRes : []);

      setProdutos(prods);
      setCategorias(cats);
      setFornecedores(forns);
    } catch (err) {
      setFeedback({ type: 'danger', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    setModalError('');
    setForm({
      nome: '',
      codigo: '',
      categoria_id: categorias.length > 0 ? String(categorias[0].id) : '',
      fornecedor_id: fornecedores.length > 0 ? String(fornecedores[0].id) : '',
      quantidade_atual: 0,
      quantidade_minima: 0,
      codigo_barras: '',
      descricao: '',
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!form.nome.trim() || !form.codigo.trim()) {
      setModalError('Nome do Produto e Código SKU são obrigatórios.');
      return;
    }
    if (!form.categoria_id) {
      setModalError('Selecione uma categoria para o produto.');
      return;
    }
    if (!form.fornecedor_id) {
      setModalError('Selecione um fornecedor para o produto.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');

      await inventoryService.createProduto({
        nome: form.nome.trim(),
        codigo: form.codigo.trim(),
        categoria_id: Number(form.categoria_id),
        fornecedor_id: Number(form.fornecedor_id),
        quantidade_atual: Math.max(0, parseInt(form.quantidade_atual, 10) || 0),
        quantidade_minima: Math.max(0, parseInt(form.quantidade_minima, 10) || 0),
        codigo_barras: form.codigo_barras.trim() || undefined,
        descricao: form.descricao.trim() || undefined,
      });

      setShowModal(false);
      setFeedback({ type: 'success', message: 'Produto cadastrado com sucesso no catálogo e estoque!' });
      await loadData();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
      return;
    }
    try {
      await inventoryService.deleteProduto(id);
      setFeedback({ type: 'success', message: 'Produto excluído com sucesso!' });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'danger', message: getErrorMessage(err) });
    }
  };

  const canManageProducts = hasRole(['ADMIN', 'GERENTE']);
  const canDeleteProducts = hasRole(['ADMIN']);

  // Filtragem
  const filtered = produtos.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (p.nome || '').toLowerCase().includes(term) ||
      (p.codigo || '').toLowerCase().includes(term) ||
      (p.codigo_barras || '').toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === 'TODAS' ||
      String(p.categoria_id) === String(selectedCategory) ||
      p.categoria_nome === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (p) => {
    const qtd = Number(p.quantidade_atual || 0);
    const min = Number(p.quantidade_minima || 0);
    if (qtd <= 0) return { status: 'danger', label: 'Esgotado' };
    if (qtd <= min) return { status: 'warning', label: 'Estoque Baixo' };
    return { status: 'success', label: 'Normal' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Catálogo de Produtos</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualização e controle de itens estocados no armazém.
          </p>
        </div>

        {canManageProducts && (
          <Button variant="primary" icon={Plus} onClick={handleOpenModal}>
            Novo Produto
          </Button>
        )}
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Barra de Busca e Filtros */}
      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Buscar por nome do item, código SKU ou código de barras..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="TODAS">Todas as Categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400 bg-[#0c1326]">
                <th className="py-3 px-6 font-semibold">SKU / Código</th>
                <th className="py-3 px-6 font-semibold">Produto / Descrição</th>
                <th className="py-3 px-6 font-semibold">Categoria</th>
                <th className="py-3 px-6 font-semibold">Fornecedor</th>
                <th className="py-3 px-6 font-semibold text-center">Em Estoque</th>
                <th className="py-3 px-6 font-semibold text-center">Mínimo</th>
                <th className="py-3 px-6 font-semibold text-center">Status</th>
                {canDeleteProducts && (
                  <th className="py-3 px-6 font-semibold text-center">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17223e]">
              {loading ? (
                <tr>
                  <td colSpan={canDeleteProducts ? 8 : 7} className="py-12 text-center text-slate-400">
                    Carregando produtos do banco de dados...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={canDeleteProducts ? 8 : 7} className="py-12 text-center text-slate-400">
                    Nenhum produto cadastrado correspondente aos filtros. Clique em &quot;Novo Produto&quot; para cadastrar.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const stock = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-[#121c38]/60 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-indigo-400 font-bold">
                        {item.codigo}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-100">
                        <div className="flex flex-col">
                          <span>{item.nome}</span>
                          {item.codigo_barras && (
                            <span className="text-[11px] font-mono text-slate-400">
                              EAN: {item.codigo_barras}
                            </span>
                          )}
                          {item.descricao && (
                            <span className="text-xs text-slate-400 line-clamp-1">
                              {item.descricao}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        <span className="bg-[#141e3a] px-2.5 py-1 rounded-lg border border-[#1e2c54]">
                          {item.categoria_nome || 'Sem Categoria'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {item.fornecedor_nome || 'Não vinculado'}
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-bold text-white">
                        {item.quantidade_atual} un
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-xs text-slate-400">
                        {item.quantidade_minima} un
                      </td>
                      <td className="py-4 px-6 text-center">
                        <StatusBadge status={stock.status} label={stock.label} />
                      </td>
                      {canDeleteProducts && (
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDelete(item.id, item.nome)}
                            title="Excluir produto"
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Cadastro de Produto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl my-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cadastrar Novo Produto</h3>
                <p className="text-xs text-slate-400">
                  Preencha os dados para registrar o item no catálogo e estoque.
                </p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4">
                <Alert type="danger" message={modalError} />
              </div>
            )}

            {/* Aviso se faltar categorias ou fornecedores */}
            {(categorias.length === 0 || fornecedores.length === 0) && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Cadastros necessários pendentes:</p>
                  <p className="text-amber-300/80 mt-0.5">
                    {categorias.length === 0 && '• Nenhuma Categoria cadastrada no sistema. '}
                    {fornecedores.length === 0 && '• Nenhum Fornecedor cadastrado no sistema.'}
                  </p>
                  <p className="text-slate-400 mt-1">
                    Vá até os menus laterais correspondentes para cadastrá-los primeiro.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome do Produto *"
                  name="nome"
                  placeholder="Ex: Sensor Fotoelétrico 24V"
                  value={form.nome}
                  onChange={handleFormChange}
                  required
                />

                <Input
                  label="Código SKU *"
                  name="codigo"
                  placeholder="Ex: SEN-001"
                  value={form.codigo}
                  onChange={handleFormChange}
                  required
                />
              </div>

              {/* Categoria e Fornecedor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                    Categoria *
                  </label>
                  <select
                    name="categoria_id"
                    value={form.categoria_id}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-[#10172a] border border-[#1e294b] text-slate-100 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    Fornecedor *
                  </label>
                  <select
                    name="fornecedor_id"
                    value={form.fornecedor_id}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-[#10172a] border border-[#1e294b] text-slate-100 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione um fornecedor...</option>
                    {fornecedores.map((forn) => (
                      <option key={forn.id} value={forn.id}>
                        {forn.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantidades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Estoque Inicial"
                  name="quantidade_atual"
                  type="number"
                  min="0"
                  value={form.quantidade_atual}
                  onChange={handleFormChange}
                />

                <Input
                  label="Estoque Mínimo de Segurança"
                  name="quantidade_minima"
                  type="number"
                  min="0"
                  value={form.quantidade_minima}
                  onChange={handleFormChange}
                />
              </div>

              <Input
                label="Código de Barras (EAN / Barcode)"
                name="codigo_barras"
                placeholder="Ex: 7891234567890"
                value={form.codigo_barras}
                onChange={handleFormChange}
              />

              <Input
                label="Descrição / Especificações Técnicas"
                name="descricao"
                placeholder="Ex: Tensão 24V DC, alcance 5 metros, corpo metálico M18"
                value={form.descricao}
                onChange={handleFormChange}
              />

              <div className="flex gap-2 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={submitting}
                  disabled={submitting || categorias.length === 0 || fornecedores.length === 0}
                >
                  Salvar Produto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProdutosPage;
