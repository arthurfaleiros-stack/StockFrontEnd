import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';
import { useIsMobile } from '../../hooks/useIsMobile';
import { formatDateBr, formatNumberBr, truncateLabel } from '../../utils/formatters';

function RuptureTooltip({ active, payload, limiteDias }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  const isCritical = item.dias_ate_ruptura <= 3;

  return (
    <div className="bg-[#0a1020]/95 backdrop-blur-md border border-[#2a3b66] rounded-xl px-3.5 py-2.5 shadow-2xl text-xs min-w-[205px]">
      <div className="pb-1.5 mb-1.5 border-b border-[#1b2649]">
        <p className="font-bold text-white">{item.nome}</p>
        <p className="font-mono text-[11px] text-indigo-400">{item.codigo}</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Dias até ruptura:</span>
          <span
            className={`font-mono font-bold ${
              isCritical ? 'text-rose-400' : 'text-amber-400'
            }`}
          >
            {item.dias_ate_ruptura === 0
              ? '0 dias (Imediato)'
              : `${item.dias_ate_ruptura} ${item.dias_ate_ruptura === 1 ? 'dia' : 'dias'}`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Data prevista:</span>
          <span className="font-mono text-slate-200">
            {formatDateBr(item.data_prevista_ruptura)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Estoque atual:</span>
          <span className="font-mono text-white">
            {formatNumberBr(item.quantidade_atual)} un
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Consumo médio:</span>
          <span className="font-mono text-indigo-300">
            {formatNumberBr(item.media_diaria_saidas, 2)} un/dia
          </span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-[#1b2649]">
          Limiar configurado: {limiteDias} dias · Clique para simular
        </div>
      </div>
    </div>
  );
}

export function RuptureTimelineChart({
  items = [],
  limiteDias = 7,
  loading = false,
  onSelectProduct,
}) {
  const isMobile = useIsMobile();

  // Exibe os 10 produtos mais críticos no gráfico de ranking
  const chartData = useMemo(() => {
    return items.slice(0, 10).map((item) => ({
      ...item,
      shortName: truncateLabel(item.nome, isMobile ? 13 : 22),
    }));
  }, [items, isMobile]);

  const maxX = useMemo(() => {
    const maxItem = chartData.reduce(
      (max, item) => Math.max(max, Number(item.dias_ate_ruptura) || 0),
      0
    );
    return Math.max(maxItem + 1, Number(limiteDias) + 1);
  }, [chartData, limiteDias]);

  return (
    <Card
      title="Ranking & Linha do Tempo de Ruptura"
      subtitle="Comparativo de dias até ruptura em relação ao limiar configurado — clique em uma barra para simular reposição"
      icon={AlertTriangle}
      action={
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            Crítico (0–3 dias)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            Alto (4–{limiteDias} dias)
          </span>
        </div>
      }
    >
      {loading ? (
        <div className="w-full h-64 sm:h-72 lg:h-80 bg-[#121c38]/60 border border-[#1b2649] rounded-xl p-4 flex flex-col justify-center gap-4 animate-pulse">
          {[85, 65, 50, 35, 25].map((w, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-24 h-3 bg-[#1b2649] rounded" />
              <div className="h-5 bg-[#1b2649] rounded" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      ) : chartData.length === 0 ? (
        <div className="w-full h-64 sm:h-72 lg:h-80 bg-[#0a1020]/50 border border-dashed border-[#1b2649] rounded-xl flex flex-col items-center justify-center px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-200">
            Nenhum produto em risco crítico para os filtros atuais
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Todos os itens estão com autonomia acima de {limiteDias} dias ou não registraram saídas na janela selecionada.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-full h-64 sm:h-72 lg:h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 8,
                  right: isMobile ? 16 : 28,
                  left: isMobile ? 0 : 8,
                  bottom: 8,
                }}
                onClick={(state) => {
                  const clicked = state?.activePayload?.[0]?.payload;
                  if (clicked && onSelectProduct) {
                    onSelectProduct(clicked);
                  }
                }}
              >
                <CartesianGrid stroke="#1b2649" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, maxX]}
                  allowDecimals={false}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#1b2649' }}
                  tickFormatter={(val) => `${val}d`}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={isMobile ? 96 : 150}
                  stroke="#64748b"
                  tick={{ fill: '#cbd5e1', fontSize: isMobile ? 10 : 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                  content={<RuptureTooltip limiteDias={limiteDias} />}
                />
                {Number(limiteDias) > 3 && (
                  <ReferenceLine
                    x={3}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{
                      value: '3d',
                      position: 'top',
                      fill: '#fda4af',
                      fontSize: 10,
                    }}
                  />
                )}
                <ReferenceLine
                  x={Number(limiteDias)}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Limiar (${limiteDias}d)`,
                    position: 'top',
                    fill: '#fcd34d',
                    fontSize: 10,
                  }}
                />
                <Bar
                  dataKey="dias_ate_ruptura"
                  radius={[0, 6, 6, 0]}
                  barSize={isMobile ? 16 : 20}
                  minPointSize={8}
                  className="cursor-pointer"
                  onClick={(barData) => {
                    const item = barData?.payload || barData;
                    if (item && onSelectProduct) {
                      onSelectProduct(item);
                    }
                  }}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`rupture-${entry.produto_id}`}
                      fill={entry.dias_ate_ruptura <= 3 ? '#f43f5e' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {items.length > 10 && (
            <p className="text-[11px] text-slate-400 text-right">
              Exibindo os 10 itens mais urgentes de {items.length} em risco. Consulte a lista completa abaixo.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

export default RuptureTimelineChart;
