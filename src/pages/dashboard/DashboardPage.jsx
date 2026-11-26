import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { RoleBadge } from '../../components/common/Badge';
import SalesSeasonalityChart from '../../components/charts/SalesSeasonalityChart';
import CategoryDistributionChart from '../../components/charts/CategoryDistributionChart';
import RuptureQuickWidget from '../../components/ruptura/RuptureQuickWidget';
import PrevisaoRupturaModal from '../../components/ruptura/PrevisaoRupturaModal';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowLeftRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ArrowRight,
} from 'lucide-react';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';
import { formatNumberBr } from '../../utils/formatters';

export function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalProdutos: 0,
    totalEstoqueFisico: 0,
    itensEstoqueBaixo: 0,
    movimentacoesTotal: 0,
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [riscoRuptura, setRiscoRuptura] = useState({ total: 0, data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados do Gráfico de Sazonalidade de Vendas
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [salesAnalytics, setSalesAnalytics] = useState({
    dadosMensais: [],
    mesMaisVendido: null,
    mesMenosVendido: null,
    totalAnualSaidas: 0,
    mediaMensal: 0,
  });
  const [loadingChart, setLoadingChart] = useState(true);

  // Modal de Previsão de Ruptura pelo Widget
  const [selectedRupturaProduct, setSelectedRupturaProduct] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [summaryRes, prodRes, catRes, movRes, riscoRes] = await Promise.allSettled([
          inventoryService.getDashboardSummary(),
          inventoryService.getProdutos({ limit: 100 }),
          inventoryService.getCategorias({ limit: 100 }),
          inventoryService.getMovimentacoes({ limit: 5 }),
          inventoryService.getRiscoRuptura({ dias: 30, limite_dias: 7 }),
        ]);

        if (!mounted) return;

        const prods =
          prodRes.status === 'fulfilled'
            ? prodRes.value?.data || (Array.isArray(prodRes.value) ? prodRes.value : [])
            : [];
        const cats =
          catRes.status === 'fulfilled'
            ? catRes.value?.data || (Array.isArray(catRes.value) ? catRes.value : [])
            : [];
        const movs =
          movRes.status === 'fulfilled'
            ? movRes.value?.data || (Array.isArray(movRes.value) ? movRes.value : [])
            : [];

        setProducts(prods);
        setCategories(cats);
        setRecentMovements(movs);

        if (riscoRes.status === 'fulfilled' && riscoRes.value) {
          setRiscoRuptura(riscoRes.value);
        }

        if (summaryRes.status === 'fulfilled' && summaryRes.value) {
          const s = summaryRes.value;
          setMetrics({
            totalProdutos: Number(s.totalProdutos) || 0,
            totalEstoqueFisico: Number(s.totalEstoqueFisico) || 0,
            itensEstoqueBaixo: Number(s.itensEstoqueBaixo) || 0,
            movimentacoesTotal: Number(s.movimentacoesTotal) || 0,
          });
        } else {
          // Fallback caso o endpoint resumo falhe
          const totalQtd = prods.reduce((acc, p) => acc + (Number(p.quantidade_atual) || 0), 0);
          const baixo = prods.filter(
            (p) => Number(p.quantidade_atual || 0) <= Number(p.quantidade_minima || 0)
          ).length;

          setMetrics({
            totalProdutos:
              prodRes.status === 'fulfilled'
                ? prodRes.value?.pagination?.total ?? prods.length
                : 0,
            totalEstoqueFisico: totalQtd,
            itensEstoqueBaixo: baixo,
            movimentacoesTotal:
              movRes.status === 'fulfilled'
                ? movRes.value?.pagination?.total ?? movs.length
                : 0,
          });

          if (summaryRes.status === 'rejected') {
            setError(getErrorMessage(summaryRes.reason));
          }
        }
      } catch (err) {
        if (mounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Busca dados de vendas/saídas sazonais do backend
  useEffect(() => {
    let mounted = true;
    async function fetchSalesChart() {
      try {
        const params = { ano: selectedYear };
        if (selectedCategoryFilter) {
          params.categoria_id = selectedCategoryFilter;
        }
        if (selectedProductFilter) {
          params.produto_id = selectedProductFilter;
        }

        const data = await inventoryService.getVendasMensais(params);
        if (mounted && data) {
          setSalesAnalytics(data);
        }
      } catch (err) {
        console.warn('Erro ao buscar dados de vendas mensais:', err);
      } finally {
        if (mounted) setLoadingChart(false);
      }
    }
    fetchSalesChart();
    return () => {
      mounted = false;
    };
  }, [selectedCategoryFilter, selectedProductFilter, selectedYear]);

  const handleCategoryChange = (nextCategoryId) => {
    setLoadingChart(true);
    setSelectedCategoryFilter(nextCategoryId);
    if (nextCategoryId && selectedProductFilter) {
      const selectedProd = products.find(
        (p) => String(p.id) === String(selectedProductFilter)
      );
      if (selectedProd && String(selectedProd.categoria_id) !== String(nextCategoryId)) {
        setSelectedProductFilter('');
      }
    }
  };

  const handleProductChange = (nextProductId) => {
    setLoadingChart(true);
    setSelectedProductFilter(nextProductId);
  };

  const handleYearChange = (nextYear) => {
    setLoadingChart(true);
    setSelectedYear(nextYear);
  };

  return (
    <div className="space-y-6">
      {/* Boas-vindas e Perfil */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d152b] border border-[#1b2649] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Olá, {user?.nome || 'Operador'}!
            </h1>
            <RoleBadge role={user?.perfil} size="md" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Painel consolidado de estoque em tempo real na plataforma{' '}
            <span className="text-indigo-300 font-semibold">KeepStock</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Grid de Métricas Principais (via getDashboardSummary) */}
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
          {loading ? (
            <div className="h-8 w-24 bg-[#1b2649] rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatNumberBr(metrics.totalProdutos)}
              </span>
              {metrics.totalProdutos > 0 ? (
                <span className="text-xs text-emerald-400 font-medium flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> Catálogo Ativo
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-medium">
                  Sem itens cadastrados
                </span>
              )}
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2">Itens com SKU cadastrado no catálogo</p>
        </div>

        {/* Card 2: Total em Estoque Físico */}
        <div className="bg-[#0e162c] border border-[#1d294d] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Estoque Físico Total
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-28 bg-[#1b2649] rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatNumberBr(metrics.totalEstoqueFisico)}
              </span>
              <span className="text-xs text-indigo-300 font-medium">unidades</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2">Volume consolidado de itens em estoque</p>
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
          {loading ? (
            <div className="h-8 w-24 bg-[#1b2649] rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                {formatNumberBr(metrics.itensEstoqueBaixo)}
              </span>
              <span className="text-xs text-amber-300 font-medium">itens requerem reposição</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2">Abaixo do ponto de pedido configurado</p>
        </div>

        {/* Card 4: Movimentações Registradas */}
        <div className="bg-[#0e162c] border border-[#1d294d] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total de Movimentações
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-24 bg-[#1b2649] rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatNumberBr(metrics.movimentacoesTotal)}
              </span>
              <span className="text-xs text-slate-400 font-medium">operações auditadas</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2">Entradas, saídas e ajustes no armazém</p>
        </div>
      </div>

      {/* Gráfico Funcional de Vendas & Análise Sazonal */}
      <SalesSeasonalityChart
        salesAnalytics={salesAnalytics}
        loading={loadingChart}
        products={products}
        categories={categories}
        selectedCategoryFilter={selectedCategoryFilter}
        onCategoryChange={handleCategoryChange}
        selectedProductFilter={selectedProductFilter}
        onProductChange={handleProductChange}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
      />

      {/* Widget de Alerta Rápido de Ruptura */}
      <RuptureQuickWidget
        riscoData={riscoRuptura}
        loading={loading}
        onSelectProduct={(item) => setSelectedRupturaProduct(item)}
      />

      {/* Seção Central: Movimentações Recentes & Distribuição por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Movimentações Recentes (2 colunas) */}
        <div className="lg:col-span-2 min-w-0">
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
                    <th className="pb-3 font-semibold hidden sm:table-cell">Operador</th>
                    <th className="pb-3 font-semibold text-right">Data/Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17223e]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        Carregando movimentações recentes...
                      </td>
                    </tr>
                  ) : recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        Nenhuma movimentação registrada até o momento.
                      </td>
                    </tr>
                  ) : (
                    recentMovements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-[#121c38]/50 transition-colors">
                        <td className="py-3.5 pr-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              mov.tipo === 'ENTRADA'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : mov.tipo === 'SAIDA'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}
                          >
                            {mov.tipo === 'ENTRADA' ? (
                              <ArrowDownRight className="w-3 h-3" />
                            ) : mov.tipo === 'SAIDA' ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowLeftRight className="w-3 h-3" />
                            )}
                            {mov.tipo}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2 font-medium text-slate-200">
                          {mov.produto_nome || mov.produto}
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono font-bold text-white whitespace-nowrap">
                          {mov.quantidade} un
                        </td>
                        <td className="py-3.5 px-2 text-xs text-slate-400 hidden sm:table-cell">
                          {mov.usuario_nome || mov.responsavel || 'Sistema'}
                        </td>
                        <td className="py-3.5 pl-2 text-right text-xs text-slate-400 font-mono whitespace-nowrap">
                          {mov.data_hora
                            ? new Date(mov.data_hora).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : mov.data}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Gráfico Interativo de Distribuição por Categoria (1 coluna) */}
        <div className="min-w-0">
          <CategoryDistributionChart products={products} loading={loading} />
        </div>
      </div>

      {/* Modal de Previsão Individual aberto pelo Widget */}
      {selectedRupturaProduct && (
        <PrevisaoRupturaModal
          produtoId={selectedRupturaProduct.produto_id}
          initialProduct={selectedRupturaProduct}
          initialDias={30}
          initialLimiteDias={7}
          onClose={() => setSelectedRupturaProduct(null)}
        />
      )}
    </div>
  );
}

export default DashboardPage;
