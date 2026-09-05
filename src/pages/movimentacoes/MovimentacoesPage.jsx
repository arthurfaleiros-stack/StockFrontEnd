import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { ArrowDownRight, ArrowUpRight, Plus, Search, Filter } from 'lucide-react';
import inventoryService from '../../api/inventory';

export function MovimentacoesPage() {
  const [filterType, setFilterType] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Formulário de nova movimentação
  const [novoTipo, setNovoTipo] = useState('ENTRADA');
  const [novoProduto, setNovoProduto] = useState('');
  const [novaQtd, setNovaQtd] = useState(1);
  const [novoMotivo, setNovoMotivo] = useState('');

  const [movimentacoes, setMovimentacoes] = useState([
    { id: 1, data: '05/09/2026 14:32', tipo: 'ENTRADA', produto: 'Sensor Fotoelétrico Industrial 24V', quantidade: 50, operador: 'Carlos Lima', motivo: 'Compra de Reposição - NF #8921' },
    { id: 2, data: '05/09/2026 12:15', tipo: 'SAIDA', produto: 'Cabo Blindado 4 Vias 100m', quantidade: 12, operador: 'Arthur Faleiros', motivo: 'Ordem de Serviço Linha B' },
    { id: 3, data: '05/09/2026 10:45', tipo: 'SAIDA', produto: 'Controlador Lógico Programável (CLP)', quantidade: 2, operador: 'Mariana Costa', motivo: 'Projeto Novo Painel 03' },
    { id: 4, data: '04/09/2026 17:00', tipo: 'ENTRADA', produto: 'Fonte Chaveada 24V 10A', quantidade: 30, operador: 'Arthur Faleiros', motivo: 'Recebimento de Fornecedor' },
    { id: 5, data: '04/09/2026 09:12', tipo: 'SAIDA', produto: 'Relé de Estado Sólido 40A', quantidade: 5, operador: 'Carlos Lima', motivo: 'Manutenção Preventiva' },
  ]);

  useEffect(() => {
    async function loadMovs() {
      try {
        const data = await inventoryService.getMovimentacoes();
        if (data && Array.isArray(data) && data.length > 0) {
          setMovimentacoes(data);
        }
      } catch {
        // mantém padrão
      }
    }
    loadMovs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!novoProduto.trim() || novaQtd <= 0) return;

    const nova = {
      id: Date.now(),
      data: 'Agora',
      tipo: novoTipo,
      produto: novoProduto,
      quantidade: Number(novaQtd),
      operador: 'Você (Operador)',
      motivo: novoMotivo || 'Movimentação manual avulsa',
    };

    setMovimentacoes([nova, ...movimentacoes]);
    setShowModal(false);
    setNovoProduto('');
    setNovaQtd(1);
    setNovoMotivo('');

    try {
      await inventoryService.createMovimentacao(nova);
    } catch {
      // silencioso se API não estiver rodando
    }
  };

  const filtered = movimentacoes.filter((m) => {
    const matchesType = filterType === 'TODOS' || m.tipo === filterType;
    const matchesSearch =
      m.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.operador.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Movimentações de Estoque</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registro de entradas, saídas e ajustes de inventário físico.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowModal(true)}
        >
          Registrar Operação
        </Button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Buscar por produto, operador ou motivo..."
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
            <option value="ENTRADA">Apenas Entradas</option>
            <option value="SAIDA">Apenas Saídas</option>
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
                <th className="py-3 px-6 font-semibold">Produto</th>
                <th className="py-3 px-6 font-semibold text-center">Quantidade</th>
                <th className="py-3 px-6 font-semibold">Responsável</th>
                <th className="py-3 px-6 font-semibold">Motivo / Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17223e]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#121c38]/60 transition-colors">
                  <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                    {item.data}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.tipo === 'ENTRADA'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {item.tipo === 'ENTRADA' ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                      {item.tipo}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-100">
                    {item.produto}
                  </td>
                  <td className="py-4 px-6 text-center font-mono font-bold text-white">
                    {item.quantidade} un
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    {item.operador}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-400">
                    {item.motivo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Nova Movimentação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Registrar Movimentação</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Tipo de Operação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNovoTipo('ENTRADA')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      novoTipo === 'ENTRADA'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#10172a] border-[#1e294b] text-slate-400'
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
                        : 'bg-[#10172a] border-[#1e294b] text-slate-400'
                    }`}
                  >
                    Saída (-)
                  </button>
                </div>
              </div>

              <Input
                label="Nome do Produto"
                placeholder="Ex: Fonte Chaveada 24V"
                value={novoProduto}
                onChange={(e) => setNovoProduto(e.target.value)}
                required
              />

              <Input
                label="Quantidade"
                type="number"
                min="1"
                value={novaQtd}
                onChange={(e) => setNovaQtd(e.target.value)}
                required
              />

              <Input
                label="Motivo / Observação"
                placeholder="Ex: Compra ou Ordem de Serviço"
                value={novoMotivo}
                onChange={(e) => setNovoMotivo(e.target.value)}
              />

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth>
                  Confirmar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovimentacoesPage;
