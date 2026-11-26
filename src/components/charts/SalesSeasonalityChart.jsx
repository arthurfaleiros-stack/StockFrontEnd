import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity,
} from 'lucide-react';
import Card from '../common/Card';
import { useIsMobile } from '../../hooks/useIsMobile';
import { formatNumberBr } from '../../utils/formatters';

function SalesTooltip({ active, payload, mediaMensal }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  const diff = Number(item.totalSaidas) - Number(mediaMensal || 0);

  return (
    <div className="bg-[#0a1020]/95 backdrop-blur-md border border-[#2a3b66] rounded-xl px-3.5 py-2.5 shadow-2xl text-xs min-w-[175px]">
      <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-[#1b2649]">
        <span className="font-bold text-white">{item.mesNome}</span>
        {item.isPeak && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Pico
          </span>
        )}
        {item.isLow && !item.isPeak && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Menor
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Total de saídas:</span>
          <span className="font-mono font-bold text-white">
            {formatNumberBr(item.totalSaidas)} un
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Transações:</span>
          <span className="font-mono font-semibold text-indigo-300">
            {formatNumberBr(item.totalTransacoes)}
          </span>
        </div>
        {mediaMensal > 0 && (
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#1b2649]/80">
            <span className="text-slate-400">Vs. média:</span>
            <span
              className={`font-mono font-semibold ${
                diff >= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {diff >= 0 ? '+' : ''}
              {formatNumberBr(diff, 1)} un
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function SalesSeasonalityChart({
  salesAnalytics,
  loading = false,
  products = [],
  categories = [],
  selectedCategoryFilter = '',
  onCategoryChange,
  selectedProductFilter = '',
  onProductChange,
  selectedYear,
  onYearChange,
}) {
  const isMobile = useIsMobile();
  const [chartType, setChartType] = useState('bar');
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Gera dinamicamente os últimos 4 anos a partir do ano atual
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, idx) => currentYear - idx);
  }, []);

  // Filtra produtos pela categoria selecionada para facilitar a seleção
  const filteredProducts = useMemo(() => {
    if (!selectedCategoryFilter) return products;
    return products.filter(
      (p) => String(p.categoria_id) === String(selectedCategoryFilter)
    );
  }, [products, selectedCategoryFilter]);

  const chartData = useMemo(() => {
    const meses = salesAnalytics?.dadosMensais || [];
    const peakMes = salesAnalytics?.mesMaisVendido?.mesNumero;
    const lowMes = salesAnalytics?.mesMenosVendido?.mesNumero;

    return meses.map((m) => ({
      ...m,
      totalSaidas: Number(m.totalSaidas) || 0,
      totalTransacoes: Number(m.totalTransacoes) || 0,
      isPeak: peakMes === m.mesNumero && Number(m.totalSaidas) > 0,
      isLow: lowMes === m.mesNumero && Number(m.totalSaidas) > 0,
    }));
  }, [salesAnalytics]);

  const hasSalesData = (salesAnalytics?.totalAnualSaidas || 0) > 0;
  const mediaMensal = Number(salesAnalytics?.mediaMensal) || 0;

  const handleBarOrPointClick = (entry) => {
    const payload = entry?.activePayload?.[0]?.payload || entry?.payload || entry;
    if (payload && payload.mesNome) {
      setSelectedMonth((prev) =>
        prev?.mesNumero === payload.mesNumero ? null : payload
      );
    }
  };

  return (
    <Card
      title="Histórico de Vendas & Análise Sazonal"
      subtitle="Identifique os meses de maior e menor demanda para planejar compras e priorizar o estoque"
      icon={BarChart3}
      action={
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Filtro por Categoria */}
          <select
            aria-label="Filtrar por categoria"
            value={selectedCategoryFilter}
            onChange={(e) => {
              onCategoryChange(e.target.value);
              setSelectedMonth(null);
            }}
            className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 sm:flex-none min-w-[140px]"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>

          {/* Filtro por Produto */}
          <select
            aria-label="Filtrar por produto"
            value={selectedProductFilter}
            onChange={(e) => {
              onProductChange(e.target.value);
              setSelectedMonth(null);
            }}
            className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 sm:flex-none min-w-[160px] max-w-full sm:max-w-[220px]"
          >
            <option value="">Todos os Produtos</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.codigo})
              </option>
            ))}
          </select>

          {/* Seletor de Ano dinâmico */}
          <select
            aria-label="Selecionar ano"
            value={selectedYear}
            onChange={(e) => {
              onYearChange(Number(e.target.value));
              setSelectedMonth(null);
            }}
            className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Alternância Barras vs Área/Linha */}
          <div
            className="inline-flex rounded-xl bg-[#10172a] border border-[#1e294b] p-0.5"
            role="group"
            aria-label="Tipo de visualização"
          >
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Barras</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                chartType === 'area'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Linha</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Indicadores Sazonais (Pico vs Mínimo vs Média) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-[#121c38] border border-[#1d294d] rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                Mês de Maior Venda / Saída
              </span>
              {loading ? (
                <div className="h-5 w-32 bg-[#1b2649] rounded animate-pulse mt-1" />
              ) : (
                <span className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5 block truncate">
                  {salesAnalytics?.mesMaisVendido
                    ? `${salesAnalytics.mesMaisVendido.mesNome} (${formatNumberBr(
                        salesAnalytics.mesMaisVendido.totalSaidas
                      )} un)`
                    : 'Sem saídas no ano'}
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#121c38] border border-[#1d294d] rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                Mês de Menor Demanda
              </span>
              {loading ? (
                <div className="h-5 w-32 bg-[#1b2649] rounded animate-pulse mt-1" />
              ) : (
                <span className="text-sm sm:text-base font-bold text-amber-400 mt-0.5 block truncate">
                  {salesAnalytics?.mesMenosVendido
                    ? `${salesAnalytics.mesMenosVendido.mesNome} (${formatNumberBr(
                        salesAnalytics.mesMenosVendido.totalSaidas
                      )} un)`
                    : 'Sem saídas no ano'}
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#121c38] border border-[#1d294d] rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                Média Mensal de Saída
              </span>
              {loading ? (
                <div className="h-5 w-28 bg-[#1b2649] rounded animate-pulse mt-1" />
              ) : (
                <span className="text-sm sm:text-base font-bold text-indigo-300 mt-0.5 block truncate">
                  {formatNumberBr(mediaMensal, 1)} un/mês
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Gráfico Responsivo */}
        {loading ? (
          <div className="w-full h-64 sm:h-72 lg:h-80 bg-[#121c38]/60 border border-[#1b2649] rounded-xl p-4 flex flex-col justify-end gap-3 animate-pulse">
            <div className="flex items-end gap-2 sm:gap-4 h-full pt-6">
              {[45, 70, 35, 85, 55, 65, 90, 40, 60, 75, 50, 80].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#1b2649] rounded-t-md"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="h-3 w-full bg-[#1b2649]/60 rounded" />
          </div>
        ) : !hasSalesData ? (
          <div className="w-full h-64 sm:h-72 lg:h-80 bg-[#0a1020]/50 border border-dashed border-[#1b2649] rounded-xl flex flex-col items-center justify-center px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Nenhuma saída registrada em {selectedYear}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Não há movimentações do tipo SAÍDA para os filtros selecionados. Quando houver consumo ou vendas registradas, a curva sazonal será exibida aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-full h-64 sm:h-72 lg:h-80 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                {chartType === 'bar' ? (
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 12,
                      right: isMobile ? 8 : 16,
                      left: isMobile ? -16 : 0,
                      bottom: isMobile ? 12 : 4,
                    }}
                    onClick={handleBarOrPointClick}
                  >
                    <CartesianGrid stroke="#1b2649" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="mesNome"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#1b2649' }}
                      interval={0}
                      angle={isMobile ? -35 : 0}
                      textAnchor={isMobile ? 'end' : 'middle'}
                      height={isMobile ? 44 : 30}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => formatNumberBr(val)}
                      width={isMobile ? 42 : 52}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                      content={<SalesTooltip mediaMensal={mediaMensal} />}
                    />
                    {mediaMensal > 0 && (
                      <ReferenceLine
                        y={mediaMensal}
                        stroke="#818cf8"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{
                          value: `Média: ${formatNumberBr(mediaMensal, 1)}`,
                          position: 'insideTopRight',
                          fill: '#a5b4fc',
                          fontSize: 11,
                        }}
                      />
                    )}
                    <Bar
                      dataKey="totalSaidas"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={44}
                      className="cursor-pointer"
                    >
                      {chartData.map((entry) => {
                        const fill = entry.isPeak
                          ? '#10b981'
                          : entry.isLow
                          ? '#f59e0b'
                          : '#6366f1';
                        return <Cell key={`cell-${entry.mesNumero}`} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                ) : (
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 12,
                      right: isMobile ? 8 : 16,
                      left: isMobile ? -16 : 0,
                      bottom: isMobile ? 12 : 4,
                    }}
                    onClick={handleBarOrPointClick}
                  >
                    <defs>
                      <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1b2649" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="mesNome"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#1b2649' }}
                      interval={0}
                      angle={isMobile ? -35 : 0}
                      textAnchor={isMobile ? 'end' : 'middle'}
                      height={isMobile ? 44 : 30}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => formatNumberBr(val)}
                      width={isMobile ? 42 : 52}
                    />
                    <Tooltip content={<SalesTooltip mediaMensal={mediaMensal} />} />
                    {mediaMensal > 0 && (
                      <ReferenceLine
                        y={mediaMensal}
                        stroke="#818cf8"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{
                          value: `Média: ${formatNumberBr(mediaMensal, 1)}`,
                          position: 'insideTopRight',
                          fill: '#a5b4fc',
                          fontSize: 11,
                        }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="totalSaidas"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#salesAreaGrad)"
                      activeDot={{ r: 6, fill: '#818cf8', stroke: '#0a1020', strokeWidth: 2 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Legenda compacta + seleção por toque no mobile */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  Pico de vendas
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  Menor demanda
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                  Demais meses
                </span>
              </div>

              {selectedMonth && (
                <div className="px-2.5 py-1 rounded-lg bg-[#121c38] border border-indigo-500/30 text-slate-200 font-mono">
                  {selectedMonth.mesNome}: <strong>{formatNumberBr(selectedMonth.totalSaidas)} un</strong> ·{' '}
                  {formatNumberBr(selectedMonth.totalTransacoes)} transações
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insight Estratégico */}
        {!loading && salesAnalytics?.mesMaisVendido && (
          <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Recomendação Estratégica: </span>
              O maior volume de saídas ocorre em{' '}
              <strong className="text-emerald-400">{salesAnalytics.mesMaisVendido.mesNome}</strong> (
              {formatNumberBr(salesAnalytics.mesMaisVendido.totalSaidas)} un em{' '}
              {formatNumberBr(salesAnalytics.mesMaisVendido.totalTransacoes)} movimentações).
              Para evitar risco de desabastecimento (ruptura), programe reposição com fornecedores de 30 a 60 dias antes deste mês crítico.
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default SalesSeasonalityChart;
