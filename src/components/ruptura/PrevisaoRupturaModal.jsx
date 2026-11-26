import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  TrendingDown,
  Package,
  Calendar,
  Activity,
  PlusCircle,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { StatusBadge } from '../common/Badge';
import RuptureBurndownChart from '../charts/RuptureBurndownChart';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';
import { addDaysFormatted, formatDateBr, formatNumberBr } from '../../utils/formatters';

const DIAS_OPTIONS = [7, 15, 30, 60, 90];
const LIMITE_OPTIONS = [3, 7, 15, 30];

export function PrevisaoRupturaModal({
  produtoId,
  initialProduct = null,
  initialDias = 30,
  initialLimiteDias = 7,
  onClose,
}) {
  const navigate = useNavigate();
  const [dias, setDias] = useState(initialDias);
  const [limiteDias, setLimiteDias] = useState(initialLimiteDias);
  const [previsao, setPrevisao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reposicaoInput, setReposicaoInput] = useState('');

  // Fecha com tecla ESC
  useEffect(() => {
    if (!produtoId) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [produtoId, onClose]);

  useEffect(() => {
    if (!produtoId) return undefined;
    let cancelled = false;

    async function fetchPrevisao() {
      try {
        const data = await inventoryService.getPrevisaoRuptura(produtoId, {
          dias,
          limite_dias: limiteDias,
        });
        if (!cancelled) {
          setPrevisao(data);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPrevisao();
    return () => {
      cancelled = true;
    };
  }, [produtoId, dias, limiteDias]);

  const handleChangeDias = (nextDias) => {
    setLoading(true);
    setError('');
    setDias(Number(nextDias));
  };

  const handleChangeLimite = (nextLimite) => {
    setLoading(true);
    setError('');
    setLimiteDias(Number(nextLimite));
  };

  const reposicaoExtra = Math.max(0, parseInt(reposicaoInput, 10) || 0);

  // Cálculo da simulação no cliente: (saldo + X) / media_diaria_saidas
  const simulation = useMemo(() => {
    if (!previsao) return null;
    const saldo = Math.max(0, Number(previsao.quantidade_atual) || 0);
    const media = Number(previsao.media_diaria_saidas) || 0;
    if (media <= 0 || previsao.dias_ate_ruptura === null) {
      return null;
    }

    const totalDiasComReposicao = (saldo + reposicaoExtra) / media;
    const totalDiasArredondado = Math.floor(totalDiasComReposicao);
    const diasExtrasExatos = reposicaoExtra / media;
    const diasExtrasGanhos = Math.max(0, totalDiasArredondado - previsao.dias_ate_ruptura);

    return {
      totalDiasExato: totalDiasComReposicao,
      totalDiasArredondado,
      diasExtrasExatos,
      diasExtrasGanhos,
      novaDataPrevista: addDaysFormatted(totalDiasArredondado),
    };
  }, [previsao, reposicaoExtra]);

  const badgeInfo = useMemo(() => {
    if (!previsao) return { status: 'info', label: 'Analisando...' };
    if (previsao.dias_ate_ruptura === null) {
      return { status: 'info', label: 'Sem Saídas' };
    }
    if (previsao.dias_ate_ruptura <= 3) {
      return { status: 'danger', label: 'Risco Crítico' };
    }
    if (previsao.risco === 'ALTO') {
      return { status: 'warning', label: 'Risco Alto' };
    }
    return { status: 'success', label: 'Autonomia Normal' };
  }, [previsao]);

  if (!produtoId) return null;

  const displayName = previsao?.nome || initialProduct?.nome || 'Produto';
  const displayCode = previsao?.codigo || initialProduct?.codigo || '';

  const handleRegistrarEntrada = () => {
    const params = new URLSearchParams({
      produto_id: String(produtoId),
      tipo: 'ENTRADA',
      open: '1',
    });
    if (reposicaoExtra > 0) {
      params.set('quantidade', String(reposicaoExtra));
    }
    onClose();
    navigate(`/movimentacoes?${params.toString()}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ruptura-modal-title"
    >
      <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-4 sm:p-7 max-w-4xl w-full shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1b2542]">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 id="ruptura-modal-title" className="text-lg font-bold text-white truncate">
                  {displayName}
                </h3>
                {displayCode && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#121c38] border border-[#1d294d] text-indigo-300">
                    {displayCode}
                  </span>
                )}
                {!loading && <StatusBadge status={badgeInfo.status} label={badgeInfo.label} />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Projeção individual de consumo, burn-down de estoque e simulador de reposição
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-start text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#15213f] transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Parâmetros da Análise */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-[#1b2542]/70">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="modal-dias"
                className="text-xs text-slate-400 font-medium"
              >
                Janela de análise:
              </label>
              <select
                id="modal-dias"
                value={dias}
                onChange={(e) => handleChangeDias(e.target.value)}
                className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DIAS_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    Últimos {d} dias
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="modal-limite"
                className="text-xs text-slate-400 font-medium"
              >
                Limiar de alerta:
              </label>
              <select
                id="modal-limite"
                value={limiteDias}
                onChange={(e) => handleChangeLimite(e.target.value)}
                className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LIMITE_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    Até {l} dias
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Atualizando projeção...
            </span>
          )}
        </div>

        {/* Erro */}
        {error && (
          <div className="mt-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        {/* Conteúdo */}
        {loading && !previsao ? (
          <div className="py-10 space-y-4 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-20 bg-[#121c38] rounded-xl border border-[#1d294d]" />
              ))}
            </div>
            <div className="h-64 bg-[#121c38] rounded-xl border border-[#1d294d]" />
          </div>
        ) : (
          previsao && (
            <div className="space-y-5 pt-4">
              {/* 4 KPIs da Previsão */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#121c38] border border-[#1d294d] rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <span>Estoque Atual / Mín.</span>
                    <Package className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-white font-mono">
                      {formatNumberBr(previsao.quantidade_atual)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      / mín. {formatNumberBr(previsao.quantidade_minima)} un
                    </span>
                  </div>
                </div>

                <div className="bg-[#121c38] border border-[#1d294d] rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <span>Saídas ({previsao.periodo_analisado_dias}d)</span>
                    <Activity className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-white font-mono">
                      {formatNumberBr(previsao.total_saidas_periodo)}
                    </span>
                    <span className="text-xs text-slate-400">unidades</span>
                  </div>
                </div>

                <div className="bg-[#121c38] border border-[#1d294d] rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <span>Média Diária</span>
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-indigo-300 font-mono">
                      {formatNumberBr(previsao.media_diaria_saidas, 2)}
                    </span>
                    <span className="text-xs text-slate-400">un/dia</span>
                  </div>
                </div>

                <div
                  className={`rounded-xl p-3.5 border ${
                    previsao.dias_ate_ruptura === null
                      ? 'bg-[#121c38] border-[#1d294d]'
                      : previsao.dias_ate_ruptura <= 3
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : previsao.risco === 'ALTO'
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : 'bg-emerald-950/25 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                    <span>Previsão de Ruptura</span>
                    <Calendar className="w-4 h-4 text-slate-300" />
                  </div>
                  {previsao.dias_ate_ruptura === null ? (
                    <p className="mt-1.5 text-sm font-bold text-slate-300">
                      Sem previsão (consumo 0)
                    </p>
                  ) : (
                    <div className="mt-1.5">
                      <span
                        className={`text-xl font-extrabold font-mono ${
                          previsao.dias_ate_ruptura <= 3
                            ? 'text-rose-400'
                            : previsao.risco === 'ALTO'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {previsao.dias_ate_ruptura === 0
                          ? 'Hoje (0d)'
                          : `${previsao.dias_ate_ruptura} ${
                              previsao.dias_ate_ruptura === 1 ? 'dia' : 'dias'
                            }`}
                      </span>
                      <span className="block text-[11px] text-slate-400 font-mono mt-0.5">
                        Data: {formatDateBr(previsao.data_prevista_ruptura)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulador de Reposição: "E se eu repor +X unidades?" */}
              <div className="bg-[#0a1020] border border-[#1b2649] rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      Simulador: &quot;E se eu repor +X unidades?&quot;
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Simule uma compra ou transferência para estimar os dias extras de autonomia do estoque.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[10, 25, 50, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setReposicaoInput(String(preset))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                          reposicaoExtra === preset
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-[#121c38] border-[#1d294d] text-slate-300 hover:border-indigo-500/50'
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <div>
                    <label
                      htmlFor="simular-reposicao"
                      className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1"
                    >
                      Quantidade a repor (+X un)
                    </label>
                    <input
                      id="simular-reposicao"
                      type="number"
                      min="0"
                      placeholder="Ex: 50"
                      value={reposicaoInput}
                      onChange={(e) => setReposicaoInput(e.target.value)}
                      className="w-full bg-[#10172a] border border-[#1e294b] text-slate-100 text-sm rounded-xl px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2 bg-[#121c38] border border-[#1d294d] rounded-xl p-3">
                    {Number(previsao.media_diaria_saidas) <= 0 ? (
                      <p className="text-xs text-slate-400">
                        Sem histórico de saídas no período analisado — a simulação de autonomia requer média diária de saídas maior que zero.
                      </p>
                    ) : reposicaoExtra <= 0 ? (
                      <p className="text-xs text-slate-400">
                        Informe uma quantidade positiva ou clique em um atalho (+10, +25, +50, +100) para visualizar a nova curva de burn-down.
                      </p>
                    ) : (
                      simulation && (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                              Autonomia com +{formatNumberBr(reposicaoExtra)} un
                            </span>
                            <span className="text-base font-bold text-emerald-400 font-mono">
                              {simulation.totalDiasArredondado} dias totais
                              <span className="text-xs text-emerald-300/80 font-normal ml-1.5">
                                (+{simulation.diasExtrasGanhos}d extras · exato:{' '}
                                {formatNumberBr(simulation.totalDiasExato, 1)}d)
                              </span>
                            </span>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                              Nova ruptura prevista
                            </span>
                            <span className="text-sm font-bold text-white font-mono">
                              {simulation.novaDataPrevista}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Gráfico Burn-down */}
              <div className="bg-[#0a1020] border border-[#1b2649] rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Projeção de Queda de Estoque (Burn-down)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Evolução diária estimada com base no consumo médio de{' '}
                      <strong className="text-slate-200">
                        {formatNumberBr(previsao.media_diaria_saidas, 2)} un/dia
                      </strong>
                    </p>
                  </div>
                </div>

                <RuptureBurndownChart
                  previsao={previsao}
                  reposicaoExtra={reposicaoExtra}
                />
              </div>
            </div>
          )
        )}

        {/* Rodapé com Ações */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-5 mt-5 border-t border-[#1b2542]">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button
            variant="success"
            icon={ArrowDownRight}
            onClick={handleRegistrarEntrada}
          >
            {reposicaoExtra > 0
              ? `Registrar Entrada (+${formatNumberBr(reposicaoExtra)} un)`
              : 'Registrar Entrada no Estoque'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PrevisaoRupturaModal;
