import React, { useState, useEffect, useMemo } from 'react';
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
  BarChart3,
  Calendar,
  Sparkles,
} from 'lucide-react';
import inventoryService from '../../api/inventory';

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
  const [loading, setLoading] = useState(true);

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
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [prodRes, movRes, catRes] = await Promise.all([
          inventoryService.getProdutos({ limit: 100 }),
          inventoryService.getMovimentacoes({ limit: 5 }),
          inventoryService.getCategorias({ limit: 100 }),
        ]);

        const prods = prodRes?.data || (Array.isArray(prodRes) ? prodRes : []);
        const movs = movRes?.data || (Array.isArray(movRes) ? movRes : []);
        const cats = catRes?.data || (Array.isArray(catRes) ? catRes : []);

        if (mounted) {
          setProducts(prods);
          setCategories(cats);
          const totalQtd = prods.reduce((acc, p) => acc + (Number(p.quantidade_atual) || 0), 0);
          const baixo = prods.filter(
            (p) => Number(p.quantidade_atual || 0) <= Number(p.quantidade_minima || 0)
          ).length;

          setMetrics({
            totalProdutos: prodRes?.pagination?.total ?? prods.length,
            totalEstoqueFisico: totalQtd,
            itensEstoqueBaixo: baixo,
            movimentacoesTotal: movRes?.pagination?.total ?? movs.length,
          });

          setRecentMovements(movs);
        }
      } catch (err) {
        console.warn('Erro ao carregar dados do Dashboard:', err);
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
        setLoadingChart(true);
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


  // Calcula quantos produtos existem em cada categoria
  const categoryStats = useMemo(() => { //useMemo constante para armazenar o resultado de um cálculo pesado/ evitando o sistema refazer todas as vezes quando atualizar

    // Se não houver produtos, retorna uma lista vazia
    if (!products || products.length === 0) return [];

    // Objeto que armazenará a quantidade de produtos por categoria
    const counts = {};

    // Percorre todos os produtos para contar suas categorias
    products.forEach((p) => {

      // Se o produto não tiver categoria, utiliza "Geral / Sem Categoria"
      const cat = p.categoria_nome || 'Geral / Sem Categoria';

      // Adiciona 1 à quantidade de produtos daquela categoria
      counts[cat] = (counts[cat] || 0) + 1;
    });

    // Obtém a quantidade total de produtos
    const total = products.length;

    // Cores utilizadas para diferenciar as categorias no gráfico
    const colors = [
      'bg-indigo-500',
      'bg-blue-500',
      'bg-violet-500',
      'bg-emerald-500',
      'bg-cyan-500',
      'bg-amber-500',
    ];

    // Transforma os dados em uma lista organizada para o gráfico
    return Object.entries(counts)
      .map(([nome, count], idx) => ({
        nome, // Nome da categoria
        count, // Quantidade de produtos na categoria

        // Calcula a porcentagem de produtos daquela categoria
        percent: Math.round((count / total) * 100),

        // Define uma cor para cada categoria, repetindo se necessário
        color: colors[idx % colors.length],
      }))

      // Organiza as categorias da maior quantidade para a menor
      .sort((a, b) => b.count - a.count);

  }, [products]); // Recalcula quando a lista de produtos mudar


  // Encontra a maior quantidade de saídas entre os meses
  const maxMonthlySales = useMemo(() => {

    // Se não houver dados mensais, utiliza 10 como valor padrão
    if (!salesAnalytics.dadosMensais || salesAnalytics.dadosMensais.length === 0) return 10;

    // Obtém o maior número de saídas registrado entre os meses
    const maxVal = Math.max(
      ...salesAnalytics.dadosMensais.map((m) => m.totalSaidas),
      0
    );

    // Se o maior valor for zero ou menor, utiliza 10 como padrão
    return maxVal > 0 ? maxVal : 10;

  }, [salesAnalytics.dadosMensais]); // Recalcula quando os dados mensais mudarem


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
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {Number(metrics.totalEstoqueFisico).toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-indigo-300 font-medium">unidades</span>
          </div>
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
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {metrics.itensEstoqueBaixo}
            </span>
            <span className="text-xs text-amber-300 font-medium">itens requerem reposição</span>
          </div>
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
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics.movimentacoesTotal}
            </span>
            <span className="text-xs text-slate-400 font-medium">operações auditadas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Entradas, saídas e ajustes no armazém</p>
        </div>
      </div>

      {/* NOVO: Gráfico Funcional de Vendas & Análise Sazonal de Priorização */}
      <Card
        title="Histórico de Vendas & Análise Sazonal"
        subtitle="Identifique os meses de maior e menor demanda para planejar compras e priorizar o estoque"
        icon={BarChart3}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setSelectedProductFilter('');
              }}
              className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>

            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
              className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos os Produtos (Geral)</option>
              {products
                .filter((p) => !selectedCategoryFilter || Number(p.categoria_id) === Number(selectedCategoryFilter))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.codigo})
                  </option>
                ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Indicadores Sazonais (Pico vs Mínimo) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121c38] border border-[#1d294d] rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Mês de Maior Venda / Saída
                </span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                  {salesAnalytics.mesMaisVendido
                    ? `${salesAnalytics.mesMaisVendido.mesNome} (${salesAnalytics.mesMaisVendido.totalSaidas} un)`
                    : 'Sem saídas no ano'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#121c38] border border-[#1d294d] rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Mês de Menor Demanda
                </span>
                <span className="text-base font-bold text-amber-400 mt-0.5 block">
                  {salesAnalytics.mesMenosVendido
                    ? `${salesAnalytics.mesMenosVendido.mesNome} (${salesAnalytics.mesMenosVendido.totalSaidas} un)`
                    : 'Sem saídas no ano'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#121c38] border border-[#1d294d] rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Média Mensal de Saída
                </span>
                <span className="text-base font-bold text-indigo-300 mt-0.5 block">
                  {salesAnalytics.mediaMensal} un/mês
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Área do Gráfico de Barras Responsivo */}
          <div className="pt-2">
            <div className="h-56 flex items-end gap-2 sm:gap-4 px-2 border-b border-[#1b2649] pb-2">
              {salesAnalytics.dadosMensais.map((item) => {
                const heightPercent = maxMonthlySales > 0 ? (item.totalSaidas / maxMonthlySales) * 100 : 0;
                const isPeak = salesAnalytics.mesMaisVendido?.mesNumero === item.mesNumero && item.totalSaidas > 0;
                const isLow = salesAnalytics.mesMenosVendido?.mesNumero === item.mesNumero && item.totalSaidas > 0;

                return (
                  <div key={item.mesNumero} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Tooltip com quantidade ao passar o mouse */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-mono font-bold text-white bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded shadow mb-1">
                      {item.totalSaidas} un
                    </div>

                    {/* Barra */}
                    <div className="w-full bg-[#152142] rounded-t-lg h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full transition-all duration-500 rounded-t-lg ${isPeak
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                            : isLow
                              ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                              : item.totalSaidas > 0
                                ? 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                                : 'bg-transparent'
                          }`}
                        style={{ height: `${Math.max(heightPercent, item.totalSaidas > 0 ? 4 : 0)}%` }}
                      />
                    </div>

                    {/* Rótulo do Mês */}
                    <span
                      className={`text-[11px] mt-2 font-medium ${isPeak
                          ? 'text-emerald-400 font-bold'
                          : isLow
                            ? 'text-amber-400 font-bold'
                            : 'text-slate-400'
                        }`}
                    >
                      {item.mesNome}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Insight de Priorização Sazonal */}
            {salesAnalytics.mesMaisVendido ? (
              <div className="mt-4 p-3.5 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Recomendação Estratégica: </span>
                  O maior volume de saídas ocorre em <strong className="text-emerald-400">{salesAnalytics.mesMaisVendido.mesNome}</strong>.
                  Para evitar risco de desabastecimento (ruptura), programe reposição com fornecedores de 30 a 60 dias antes deste mês crítico.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center mt-3">
                Nenhuma movimentação de saída registrada para o período selecionado. À medida que vendas ou saídas forem computadas, o gráfico refletirá o padrão de consumo.
              </p>
            )}
          </div>
        </div>
      </Card>

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
                  {recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        Nenhuma movimentação registrada até o momento.
                      </td>
                    </tr>
                  ) : (
                    recentMovements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-[#121c38]/50 transition-colors">
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${mov.tipo === 'ENTRADA'
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
                        <td className="py-3.5 font-medium text-slate-200">
                          {mov.produto_nome || mov.produto}
                        </td>
                        <td className="py-3.5 text-center font-mono font-bold text-white">
                          {mov.quantidade} un
                        </td>
                        <td className="py-3.5 text-xs text-slate-400">
                          {mov.usuario_nome || mov.responsavel || 'Sistema'}
                        </td>
                        <td className="py-3.5 text-right text-xs text-slate-400 font-mono">
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

        {/* Resumo de Categorias Dinâmico (1 coluna) */}
        <div className="space-y-6">
          <Card
            title="Distribuição por Categoria"
            subtitle="Composição de mercadorias no catálogo"
            icon={Layers}
          >
            {categoryStats.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                <p className="text-xs">Nenhum produto cadastrado ainda.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cadastre produtos no catálogo para visualizar a distribuição real.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryStats.map((cat) => (
                  <div key={cat.nome}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{cat.nome}</span>
                      <span className="text-slate-400 font-mono">
                        {cat.percent}% ({cat.count} {cat.count === 1 ? 'item' : 'itens'})
                      </span>
                    </div>
                    <div className="h-2 bg-[#172344] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full transition-all duration-300`}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

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
