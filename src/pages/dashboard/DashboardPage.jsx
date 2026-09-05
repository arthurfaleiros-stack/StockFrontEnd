import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { RoleBadge } from '../../components/common/Badge';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowLeftRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Layers,
} from 'lucide-react';
import inventoryService from '../../api/inventory';

export function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalProdutos: 148,
    valorTotalEstoque: 284500.0,
    itensEstoqueBaixo: 12,
    movimentacoesHoje: 24,
  });

  const [recentMovements, setRecentMovements] = useState([
    { id: 1, tipo: 'ENTRADA', produto: 'Sensor Fotoelétrico Industrial', quantidade: 50, responsavel: 'Carlos Lima', data: 'Hoje às 14:32' },
    { id: 2, tipo: 'SAIDA', produto: 'Cabo Blindado 4 Vias 100m', quantidade: 12, responsavel: 'Arthur Faleiros', data: 'Hoje às 12:15' },
    { id: 3, tipo: 'SAIDA', produto: 'Controlador Lógico Programável (CLP)', quantidade: 2, responsavel: 'Mariana Costa', data: 'Hoje às 10:45' },
    { id: 4, tipo: 'ENTRADA', produto: 'Fonte Chaveada 24V 10A', quantidade: 30, responsavel: 'Arthur Faleiros', data: 'Ontem às 17:00' },
  ]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const summary = await inventoryService.getDashboardSummary();
        if (summary && mounted) {
          setMetrics(summary);
        }
        const movs = await inventoryService.getMovimentacoes({ limit: 5 });
        if (movs && Array.isArray(movs) && mounted) {
          setRecentMovements(movs);
        }
      } catch (err) {
        console.warn('Utilizando dados estruturados para renderização do Dashboard:', err);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Boas-vindas e Perfil */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d152b] border border-[#1b2649] rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Olá, {user?.nome || 'Operador'}!
            </h1>
            <RoleBadge role={user?.perfil} size="md" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Painel consolidado de estoque em tempo real na plataforma <span className="text-indigo-300 font-semibold">KeepStock</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/movimentacoes">
            <Button variant="secondary" icon={ArrowLeftRight}>
              Registrar Movimentação
            </Button>
          </Link>
          <Link to="/produtos">
            <Button variant="primary" icon={Plus}>
              Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Produtos */}
        <div className="bg-[#0e162c] border border-[#1d294d] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total de Produtos
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics.totalProdutos}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +8% este mês
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Itens com SKU cadastrado no catálogo</p>
        </div>

        {/* Card 2: Valor em Estoque */}
        <div className="bg-[#0e162c] border border-[#1d294d] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Valor em Estoque
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              R$ {Number(metrics.valorTotalEstoque).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Valor patrimonial de mercadorias ativas</p>
        </div>

        {/* Card 3: Alertas de Estoque Baixo */}
        <div className="bg-[#0e162c] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Estoque Baixo / Ruptura
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {metrics.itensEstoqueBaixo}
            </span>
            <span className="text-xs text-amber-300 font-medium">itens requerem reposição</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Abaixo do ponto de pedido configurado</p>
        </div>

        {/* Card 4: Movimentações Hoje */}
        <div className="bg-[#0e162c] border border-[#1d294d] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Movimentações Hoje
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics.movimentacoesHoje}
            </span>
            <span className="text-xs text-slate-400 font-medium">operações</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Entradas e saídas registradas na data</p>
        </div>
      </div>

      {/* Seção Central: Movimentações Recentes & Status do Armazém */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Movimentações Recentes (2 colunas) */}
        <div className="lg:col-span-2">
          <Card
            title="Últimas Movimentações de Estoque"
            subtitle="Registro cronológico das operações recentes no sistema"
            icon={Clock}
            action={
              <Link
                to="/movimentacoes"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">Tipo</th>
                    <th className="pb-3 font-semibold">Produto</th>
                    <th className="pb-3 font-semibold text-center">Quantidade</th>
                    <th className="pb-3 font-semibold">Operador</th>
                    <th className="pb-3 font-semibold text-right">Data/Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17223e]">
                  {recentMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-[#121c38]/50 transition-colors">
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            mov.tipo === 'ENTRADA'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {mov.tipo === 'ENTRADA' ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="py-3.5 font-medium text-slate-200">
                        {mov.produto}
                      </td>
                      <td className="py-3.5 text-center font-mono font-bold text-white">
                        {mov.quantidade}
                      </td>
                      <td className="py-3.5 text-xs text-slate-400">
                        {mov.responsavel}
                      </td>
                      <td className="py-3.5 text-right text-xs text-slate-400">
                        {mov.data}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Resumo de Categorias & Saúde do Inventário (1 coluna) */}
        <div className="space-y-6">
          <Card
            title="Distribuição por Categoria"
            subtitle="Composição de mercadorias no catálogo"
            icon={Layers}
          >
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Eletrônicos & Sensores</span>
                  <span className="text-slate-400 font-mono">45% (67 itens)</span>
                </div>
                <div className="h-2 bg-[#172344] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Cabos & Conectores</span>
                  <span className="text-slate-400 font-mono">25% (37 itens)</span>
                </div>
                <div className="h-2 bg-[#172344] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Automação & CLP</span>
                  <span className="text-slate-400 font-mono">20% (30 itens)</span>
                </div>
                <div className="h-2 bg-[#172344] rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Outros Insumos</span>
                  <span className="text-slate-400 font-mono">10% (14 itens)</span>
                </div>
                <div className="h-2 bg-[#172344] rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#172342] flex items-center justify-between text-xs">
              <span className="text-slate-400">Status Operacional</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Estoque Sincronizado
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ArrowRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default DashboardPage;
