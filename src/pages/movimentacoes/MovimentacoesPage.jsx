import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { ArrowDownRight, ArrowUpRight, RefreshCw, Plus, Search, Filter, Package } from 'lucide-react';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';

export function MovimentacoesPage() {
  const [filterType, setFilterType] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de nova movimentação
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [modalError, setModalError] = useState('');

  // Formulário
  const [novoTipo, setNovoTipo] = useState('ENTRADA');
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [novaQtd, setNovaQtd] = useState(1);
  const [novoMotivo, setNovoMotivo] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [movRes, prodRes] = await Promise.all([
        inventoryService.getMovimentacoes({ limit: 100 }),
        inventoryService.getProdutos({ limit: 200 }),
      ]);

      const movs = movRes?.data || (Array.isArray(movRes) ? movRes : []);
      const prods = prodRes?.data || (Array.isArray(prodRes) ? prodRes : []);

      setMovimentacoes(movs);
      setProdutos(prods);
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
    setNovoTipo('ENTRADA');
    setSelectedProdutoId(produtos.length > 0 ? String(produtos[0].id) : '');
    setNovaQtd(1);
    setNovoMotivo('');
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedProdutoId) {
      setModalError('Selecione um produto para movimentar.');
      return;
    }
    if (Number(novaQtd) <= 0 && novoTipo !== 'AJUSTE') {
      setModalError('A quantidade movimentada deve ser maior que zero.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');

      await inventoryService.createMovimentacao({
        produto_id: Number(selectedProdutoId),
        tipo: novoTipo,
        quantidade: Number(novaQtd),
        observacao: novoMotivo.trim() || undefined,
      });

      setShowModal(false);
      setFeedback({ type: 'success', message: 'Movimentação registrada e estoque atualizado com sucesso!' });
      await loadData();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = movimentacoes.filter((m) => {
    const matchesType = filterType === 'TODOS' || m.tipo === filterType;
    const term = searchTerm.toLowerCase();
    const prodNome = (m.produto_nome || '').toLowerCase();
    const prodCodigo = (m.produto_codigo || '').toLowerCase();
    const usuario = (m.usuario_nome || '').toLowerCase();
    const motivo = (m.observacao || '').toLowerCase();

    const matchesSearch =
      prodNome.includes(term) ||
      prodCodigo.includes(term) ||
      usuario.includes(term) ||
      motivo.includes(term);

    return matchesType && matchesSearch;
  });

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const selectedProdutoObj = produtos.find((p) => String(p.id) === String(selectedProdutoId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Movimentações de Estoque</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registro auditado de entradas, saídas e ajustes de inventário físico.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenModal}
        >
          Registrar Operação
        </Button>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Barra de Filtros */}
      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Buscar por produto, SKU, responsável ou motivo..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="TODOS">Todos os Tipos</option>
            <option value="ENTRADA">Apenas Entradas (+)</option>
            <option value="SAIDA">Apenas Saídas (-)</option>
            <option value="AJUSTE">Apenas Ajustes (=)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Movimentações */}
      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400 bg-[#0c1326]">
                <th className="py-3 px-6 font-semibold">Data / Hora</th>
                <th className="py-3 px-6 font-semibold">Tipo</th>
                <th className="py-3 px-6 font-semibold">Produto / SKU</th>
                <th className="py-3 px-6 font-semibold text-center">Quantidade</th>
                <th className="py-3 px-6 font-semibold">Responsável</th>
                <th className="py-3 px-6 font-semibold">Motivo / Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17223e]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Carregando movimentações do banco de dados...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhuma movimentação registrada correspondente aos filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#121c38]/60 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {formatDate(item.data_hora)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.tipo === 'ENTRADA'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : item.tipo === 'SAIDA'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}
                      >
                        {item.tipo === 'ENTRADA' ? (
                          <ArrowDownRight className="w-3 h-3" />
                        ) : item.tipo === 'SAIDA' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        {item.tipo}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-100">
                      <div>
                        <span>{item.produto_nome}</span>
                        {item.produto_codigo && (
                          <span className="block text-xs font-mono text-indigo-400">
                            {item.produto_codigo}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-white">
                      {item.tipo === 'ENTRADA' ? `+${item.quantidade}` : item.tipo === 'SAIDA' ? `-${item.quantidade}` : item.quantidade} un
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      {item.usuario_nome || 'Sistema'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {item.observacao || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Nova Movimentação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Registrar Movimentação</h3>

            {modalError && (
              <div className="mb-4">
                <Alert type="danger" message={modalError} />
              </div>
            )}

            {produtos.length === 0 ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Não existem produtos cadastrados no banco de dados para movimentar.
                  Acesse o menu <strong className="text-indigo-400">Produtos</strong> e cadastre os itens primeiro.
                </p>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowModal(false)}
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 block">
                    Tipo de Operação
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNovoTipo('ENTRADA')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        novoTipo === 'ENTRADA'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-[#10172a] border-[#1e294b] text-slate-400 hover:text-white'
                      }`}
                    >
                      Entrada (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNovoTipo('SAIDA')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        novoTipo === 'SAIDA'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-[#10172a] border-[#1e294b] text-slate-400 hover:text-white'
                      }`}
                    >
                      Saída (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNovoTipo('AJUSTE')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        novoTipo === 'AJUSTE'
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-[#10172a] border-[#1e294b] text-slate-400 hover:text-white'
                      }`}
                    >
                      Ajuste (=)
                    </button>
                  </div>
                </div>

                {/* Seleção do Produto Cadastrado */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-400" />
                    Produto Cadastrado *
                  </label>
                  <select
                    value={selectedProdutoId}
                    onChange={(e) => setSelectedProdutoId(e.target.value)}
                    required
                    className="w-full bg-[#10172a] border border-[#1e294b] text-slate-100 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} - {p.nome} (Saldo atual: {p.quantidade_atual} un)
                      </option>
                    ))}
                  </select>

                  {selectedProdutoObj && (
                    <div className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between px-1">
                      <span>Saldo em estoque: <strong className="text-slate-200">{selectedProdutoObj.quantidade_atual} un</strong></span>
                      <span>Mínimo: <strong className="text-slate-200">{selectedProdutoObj.quantidade_minima} un</strong></span>
                    </div>
                  )}
                </div>

                <Input
                  label={novoTipo === 'AJUSTE' ? 'Novo Saldo Físico Real' : 'Quantidade *'}
                  type="number"
                  min={novoTipo === 'AJUSTE' ? 0 : 1}
                  value={novaQtd}
                  onChange={(e) => setNovaQtd(e.target.value)}
                  required
                />

                <Input
                  label="Motivo / Documento / Justificativa"
                  placeholder="Ex: Compra NF 8921 ou Ordem de Serviço #42"
                  value={novoMotivo}
                  onChange={(e) => setNovoMotivo(e.target.value)}
                />

                <div className="flex gap-2 pt-2">
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
                  >
                    Confirmar Operação
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovimentacoesPage;
