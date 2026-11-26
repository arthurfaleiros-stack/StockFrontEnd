import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
} from 'recharts';
import { Layers } from 'lucide-react';
import Card from '../common/Card';
import { formatNumberBr, truncateLabel } from '../../utils/formatters';

const PALETTE = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f43f5e', // rose
];

function CategoryTooltip({ active, payload, metric }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-[#0a1020]/95 backdrop-blur-md border border-[#2a3b66] rounded-xl px-3.5 py-2.5 shadow-2xl text-xs min-w-[170px]">
      <div className="flex items-center gap-2 pb-1.5 mb-1.5 border-b border-[#1b2649]">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-bold text-white">{item.nome}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">SKUs cadastrados:</span>
          <span className="font-mono font-bold text-white">
            {formatNumberBr(item.skus)} ({item.skuPercent}%)
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Volume em estoque:</span>
          <span className="font-mono font-semibold text-indigo-300">
            {formatNumberBr(item.volume)} un ({item.volumePercent}%)
          </span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1">
          Métrica ativa: {metric === 'skus' ? 'Quantidade de SKUs' : 'Unidades em estoque'}
        </div>
      </div>
    </div>
  );
}

function renderActiveSector(props) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius - 2}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

export function CategoryDistributionChart({ products = [], loading = false }) {
  const [metric, setMetric] = useState('skus'); // 'skus' | 'volume'
  const [activeIndex, setActiveIndex] = useState(null);

  const { items, totalSkus, totalVolume } = useMemo(() => {
    if (!products || products.length === 0) {
      return { items: [], totalSkus: 0, totalVolume: 0 };
    }

    const grouped = {};
    let skusSum = 0;
    let volSum = 0;

    products.forEach((p) => {
      const catName = p.categoria_nome || 'Geral / Sem Categoria';
      const qty = Math.max(0, Number(p.quantidade_atual) || 0);
      if (!grouped[catName]) {
        grouped[catName] = { nome: catName, skus: 0, volume: 0 };
      }
      grouped[catName].skus += 1;
      grouped[catName].volume += qty;
      skusSum += 1;
      volSum += qty;
    });

    const list = Object.values(grouped)
      .map((entry, idx) => ({
        ...entry,
        color: PALETTE[idx % PALETTE.length],
        skuPercent: skusSum > 0 ? Math.round((entry.skus / skusSum) * 100) : 0,
        volumePercent: volSum > 0 ? Math.round((entry.volume / volSum) * 100) : 0,
      }))
      .sort((a, b) => b[metric] - a[metric]);

    return { items: list, totalSkus: skusSum, totalVolume: volSum };
  }, [products, metric]);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const hasChartData = items.some((item) => item[metric] > 0);

  return (
    <Card
      title="Distribuição por Categoria"
      subtitle="Composição de SKUs e volume em estoque"
      icon={Layers}
      action={
        <div
          className="inline-flex rounded-xl bg-[#10172a] border border-[#1e294b] p-0.5"
          role="group"
          aria-label="Métrica de categoria"
        >
          <button
            type="button"
            onClick={() => {
              setMetric('skus');
              setActiveIndex(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              metric === 'skus'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SKUs
          </button>
          <button
            type="button"
            onClick={() => {
              setMetric('volume');
              setActiveIndex(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              metric === 'volume'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Estoque (un)
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="w-full h-64 sm:h-72 lg:h-80 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-[18px] border-[#1b2649]" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-[#1b2649] rounded w-full" />
            <div className="h-3 bg-[#1b2649] rounded w-3/4" />
          </div>
        </div>
      ) : items.length === 0 || !hasChartData ? (
        <div className="py-10 text-center text-slate-400">
          <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
          <p className="text-xs font-medium text-slate-300">
            {items.length === 0
              ? 'Nenhum produto cadastrado ainda.'
              : 'Sem volume em estoque para exibir.'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Cadastre produtos ou movimente entradas para visualizar a distribuição por categoria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Donut Chart */}
          <div className="relative w-full h-64 sm:h-72 lg:h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={items}
                  dataKey={metric}
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  innerRadius="56%"
                  outerRadius="82%"
                  paddingAngle={3}
                  stroke="none"
                  shape={(props) =>
                    props.index === activeIndex || props.isActive ? (
                      renderActiveSector(props)
                    ) : (
                      <Sector {...props} />
                    )
                  }
                  onMouseEnter={(_, idx) => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={(_, idx) =>
                    setActiveIndex((prev) => (prev === idx ? null : idx))
                  }
                >
                  {items.map((entry, idx) => (
                    <Cell
                      key={entry.nome}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === idx ? 1 : 0.45}
                      className="cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip metric={metric} />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centro informativo do Donut */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                {activeItem
                  ? truncateLabel(activeItem.nome, 14)
                  : metric === 'skus'
                  ? 'Total SKUs'
                  : 'Total Físico'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-0.5">
                {activeItem
                  ? formatNumberBr(activeItem[metric])
                  : formatNumberBr(metric === 'skus' ? totalSkus : totalVolume)}
              </span>
              <span className="text-[11px] text-indigo-300 font-medium">
                {activeItem
                  ? `${metric === 'skus' ? activeItem.skuPercent : activeItem.volumePercent}%`
                  : metric === 'skus'
                  ? `${items.length} ${items.length === 1 ? 'categoria' : 'categorias'}`
                  : 'unidades'}
              </span>
            </div>
          </div>

          {/* Legenda Responsiva Interativa */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {items.map((cat, idx) => {
              const isHighlighted = activeIndex === idx;
              const percent = metric === 'skus' ? cat.skuPercent : cat.volumePercent;
              return (
                <button
                  key={cat.nome}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={() => setActiveIndex((prev) => (prev === idx ? null : idx))}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isHighlighted
                      ? 'bg-[#152142] border border-indigo-500/40'
                      : 'bg-[#121c38]/60 border border-transparent hover:bg-[#152142]/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-200 font-medium truncate">
                      {cat.nome}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    <span className="text-slate-300 font-semibold">
                      {metric === 'skus'
                        ? `${formatNumberBr(cat.skus)} ${cat.skus === 1 ? 'SKU' : 'SKUs'}`
                        : `${formatNumberBr(cat.volume)} un`}
                    </span>
                    <span className="text-slate-400">({percent}%)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-[#172342] flex items-center justify-between text-xs">
        <span className="text-slate-400">Status Operacional</span>
        <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Estoque Sincronizado
        </span>
      </div>
    </Card>
  );
}

export default CategoryDistributionChart;
