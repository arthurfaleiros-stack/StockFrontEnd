import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Info } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  addDaysShortFormatted,
  formatDateBr,
  formatNumberBr,
  formatShortDateBr,
} from '../../utils/formatters';

function BurndownTooltip({ active, payload, hasSimulation }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="bg-[#0a1020]/95 backdrop-blur-md border border-[#2a3b66] rounded-xl px-3.5 py-2.5 shadow-2xl text-xs min-w-[190px]">
      <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-[#1b2649]">
        <span className="font-bold text-white">{item.labelDia}</span>
        <span className="font-mono text-[11px] text-slate-400">{item.dataLabel}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-rose-300">Saldo projetado atual:</span>
          <span className="font-mono font-bold text-white">
            {formatNumberBr(item.saldoAtual, 1)} un
          </span>
        </div>
        {hasSimulation && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-emerald-300">Com reposição simulada:</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatNumberBr(item.saldoSimulado, 1)} un
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function RuptureBurndownChart({ previsao, reposicaoExtra = 0 }) {
  const isMobile = useIsMobile();

  const mediaDiaria = Number(previsao?.media_diaria_saidas) || 0;
  const saldoInicial = Math.max(0, Number(previsao?.quantidade_atual) || 0);
  const estoqueMinimo = Math.max(0, Number(previsao?.quantidade_minima) || 0);
  const diasAteRuptura = previsao?.dias_ate_ruptura;
  const extraQty = Math.max(0, Number(reposicaoExtra) || 0);
  const hasSimulation = extraQty > 0;

  const { chartData, simulatedDays } = useMemo(() => {
    if (!previsao || mediaDiaria <= 0 || diasAteRuptura === null) {
      return { chartData: [], simulatedDays: null };
    }

    const simDaysTotal = Math.floor((saldoInicial + extraQty) / mediaDiaria);
    // Horizonte visível no gráfico: mínimo 10 dias, máximo 90 dias para manter legibilidade
    const horizon = Math.min(Math.max(simDaysTotal + 2, diasAteRuptura + 3, 10), 90);
    const step = horizon > 35 ? Math.ceil(horizon / 30) : 1;

    const points = [];
    for (let d = 0; d <= horizon; d += step) {
      points.push({
        dayIndex: d,
        labelDia: d === 0 ? 'Hoje' : `+${d}d`,
        dataLabel: addDaysShortFormatted(d),
        saldoAtual: Math.max(0, Number((saldoInicial - mediaDiaria * d).toFixed(1))),
        saldoSimulado: hasSimulation
          ? Math.max(0, Number((saldoInicial + extraQty - mediaDiaria * d).toFixed(1)))
          : null,
      });
    }

    // Garante ponto exato de ruptura atual no gráfico se não tiver caído no step
    if (diasAteRuptura <= horizon && !points.some((p) => p.dayIndex === diasAteRuptura)) {
      points.push({
        dayIndex: diasAteRuptura,
        labelDia: `+${diasAteRuptura}d`,
        dataLabel: addDaysShortFormatted(diasAteRuptura),
        saldoAtual: 0,
        saldoSimulado: hasSimulation
          ? Math.max(0, Number((saldoInicial + extraQty - mediaDiaria * diasAteRuptura).toFixed(1)))
          : null,
      });
      points.sort((a, b) => a.dayIndex - b.dayIndex);
    }

    return { chartData: points, simulatedDays: simDaysTotal };
  }, [previsao, mediaDiaria, diasAteRuptura, saldoInicial, extraQty, hasSimulation]);

  if (!previsao) return null;

  // Caso sem histórico de saídas (media_diaria_saidas === 0 / dias_ate_ruptura === null)
  if (mediaDiaria <= 0 || diasAteRuptura === null) {
    return (
      <div className="w-full h-64 sm:h-72 bg-[#0a1020]/60 border border-dashed border-[#1b2649] rounded-xl flex flex-col items-center justify-center px-6 text-center">
        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
          <Info className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-200">
          Sem histórico de saídas no período analisado
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Nos últimos {previsao.periodo_analisado_dias} dias não houve movimentações de SAÍDA para este produto. Sem taxa de consumo diário, não é possível projetar data de ruptura.
        </p>
      </div>
    );
  }

  const rupturaPoint = chartData.find((p) => p.dayIndex === diasAteRuptura);
  const maxY = Math.max(saldoInicial + extraQty, estoqueMinimo, 10);

  return (
    <div className="space-y-3">
      <div className="w-full h-64 sm:h-72 lg:h-80 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={chartData}
            margin={{
              top: 16,
              right: isMobile ? 10 : 20,
              left: isMobile ? -14 : 0,
              bottom: isMobile ? 12 : 4,
            }}
          >
            <defs>
              <linearGradient id="burndownCurrentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="burndownSimGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1b2649" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="labelDia"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 11 }}
              tickLine={false}
              axisLine={{ stroke: '#1b2649' }}
              interval="preserveStartEnd"
              angle={isMobile ? -30 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 42 : 28}
            />
            <YAxis
              domain={[0, Math.ceil(maxY * 1.1)]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatNumberBr(val)}
              width={isMobile ? 40 : 48}
            />
            <Tooltip content={<BurndownTooltip hasSimulation={hasSimulation} />} />

            {/* Linha horizontal do estoque mínimo */}
            {estoqueMinimo > 0 && (
              <ReferenceLine
                y={estoqueMinimo}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `Mínimo (${estoqueMinimo} un)`,
                  position: 'insideTopRight',
                  fill: '#fcd34d',
                  fontSize: 11,
                }}
              />
            )}

            {/* Marcação vertical do dia previsto para ruptura */}
            {rupturaPoint && (
              <ReferenceLine
                x={rupturaPoint.labelDia}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Ruptura (${formatShortDateBr(previsao.data_prevista_ruptura)})`,
                  position: 'insideTopLeft',
                  fill: '#fda4af',
                  fontSize: 11,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="saldoAtual"
              name="Projeção Atual"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fill="url(#burndownCurrentGrad)"
              activeDot={{ r: 5, fill: '#f43f5e', stroke: '#0a1020', strokeWidth: 2 }}
            />

            {hasSimulation && (
              <Area
                type="monotone"
                dataKey="saldoSimulado"
                name="Com Reposição"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#burndownSimGrad)"
                activeDot={{ r: 5, fill: '#10b981', stroke: '#0a1020', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda do Burn-down */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 rounded" />
            Projeção atual ({formatDateBr(previsao.data_prevista_ruptura)})
          </span>
          {estoqueMinimo > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-400" />
              Estoque mínimo ({estoqueMinimo} un)
            </span>
          )}
          {hasSimulation && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 rounded" />
              Com +{formatNumberBr(extraQty)} un ({simulatedDays}d)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default RuptureBurndownChart;
