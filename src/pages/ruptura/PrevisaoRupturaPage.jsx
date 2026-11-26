import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Clock,
  Activity,
  TrendingDown,
  ArrowDownRight,
  SlidersHorizontal,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { StatusBadge } from '../../components/common/Badge';
import RuptureTimelineChart from '../../components/charts/RuptureTimelineChart';
import PrevisaoRupturaModal from '../../components/ruptura/PrevisaoRupturaModal';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';
import { formatDateBr, formatNumberBr } from '../../utils/formatters';

const DIAS_JANELA_OPTIONS = [7, 15, 30, 60, 90];
const LIMIAR_ALERTA_OPTIONS = [3, 7, 15, 30];

export function PrevisaoRupturaPage() {
  const [dias, setDias] = useState(30);
  const [limiteDias, setLimiteDias] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH'

  const [riscoData, setRiscoData] = useState({
    total: 0,
    periodo_analisado_dias: 30,
    limite_dias_alerta: 7,
    data: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Produto selecionado para abrir o simulador individual
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRisco() {
      try {
        const res = await inventoryService.getRiscoRuptura({
          dias,
          limite_dias: limiteDias,
        });
        if (!cancelled && res) {
          setRiscoData({
            total: res.total ?? (Array.isArray(res.data) ? res.data.length : 0),
            periodo_analisado_dias: res.periodo_analisado_dias ?? dias,
            limite_dias_alerta: res.limite_dias_alerta ?? limiteDias,
            data: Array.isArray(res.data) ? res.data : [],
          });
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

    fetchRisco();
    return () => {
      cancelled = true;
    };
  }, [dias, limiteDias, reloadKey]);

  const handleDiasChange = (nextDias) => {
    setLoading(true);
    setError('');
    setDias(Number(nextDias));
  };

  const handleLimiteChange = (nextLimite) => {
    setLoading(true);
    setError('');
    const numeric = Number(nextLimite);
    setLimiteDias(numeric);
    if (numeric <= 3 && statusFilter === 'HIGH') {
      setStatusFilter('ALL');
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    setReloadKey((k) => k + 1);
  };

  const items = riscoData.data;

  // Resumo agregado calculado a partir dos itens retornados
  const summary = useMemo(() => {
    const criticalCount = items.filter((i) => i.dias_ate_ruptura <= 3).length;
    const mostUrgent = items.length > 0 ? items[0] : null;
    const aggregatedDailyRate = items.reduce(
      (acc, i) => acc + (Number(i.media_diaria_saidas) || 0),
      0
    );
    const totalOutflowPeriod = items.reduce(
      (acc, i) => acc + (Number(i.total_saidas_periodo) || 0),
      0
    );

    return {
      totalInRisk: items.length,
      criticalCount,
      highOnlyCount: Math.max(0, items.length - criticalCount),
      mostUrgent,
      aggregatedDailyRate,
      totalOutflowPeriod,
    };
  }, [items]);

  // Aplicação de busca e filtro de severidade
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !term ||
        (item.nome || '').toLowerCase().includes(term) ||
        (item.codigo || '').toLowerCase().includes(term);

      const d = Number(item.dias_ate_ruptura);
      let matchesStatus = true;
      if (statusFilter === 'CRITICAL') {
        matchesStatus = d <= 3;
      } else if (statusFilter === 'HIGH') {
        matchesStatus = limiteDias > 3 ? d > 3 && d <= limiteDias : d <= limiteDias;
      }

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter, limiteDias]);

  const getSeverityBadge = (diasRestantes) => {
    if (diasRestantes <= 3) {
      return { status: 'danger', label: 'Crítico (≤ 3d)' };
    }
    return { status: 'warning', label: `Alto (≤ ${limiteDias}d)` };
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d152b] border border-[#1b2649] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Previsão de Ruptura de Estoque
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Monitoramento Preditivo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Identifique produtos em risco de desabastecimento com base na taxa média de saídas e simule cenários de reposição.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
            disabled={loading}
          >
            Atualizar
          </Button>
          <Link to="/movimentacoes?tipo=ENTRADA&open=1">
            <Button variant="primary" size="sm" icon={ArrowDownRight}>
              Nova Entrada
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Controles de Análise Configuráveis */}
      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="w-full lg:flex-1">
            <Input
              placeholder="Buscar produto em risco por nome ou código SKU..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-3">
            {/* Janela de Análise (dias) */}
            <div className="flex items-center gap-2 bg-[#10172a] border border-[#1e294b] rounded-xl px-3 py-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400 shrink-0" />
              <label
                htmlFor="ruptura-dias"
                className="text-xs text-slate-400 whitespace-nowrap"
              >
                Janela:
              </label>
              <select
                id="ruptura-dias"
                value={dias}
                onChange={(e) => handleDiasChange(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-semibold focus:outline-none w-full cursor-pointer"
              >
                {DIAS_JANELA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0e162c]">
                    Últimos {opt} dias
                  </option>
                ))}
              </select>
            </div>

            {/* Limiar de Alerta (limite_dias) */}
            <div className="flex items-center gap-2 bg-[#10172a] border border-[#1e294b] rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <label
                htmlFor="ruptura-limiar"
                className="text-xs text-slate-400 whitespace-nowrap"
              >
                Limiar alerta:
              </label>
              <select
                id="ruptura-limiar"
                value={limiteDias}
                onChange={(e) => handleLimiteChange(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-semibold focus:outline-none w-full cursor-pointer"
              >
                {LIMIAR_ALERTA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0e162c]">
                    ≤ {opt} dias
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filtro rápido por Status */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#17223e]">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mr-1">
            Severidade:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-[#10172a] border-[#1e294b] text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos em Risco ({summary.totalInRisk})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              statusFilter === 'CRITICAL'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-[#10172a] border-[#1e294b] text-slate-400 hover:text-slate-200'
            }`}
          >
            Crítico ≤ 3 dias ({summary.criticalCount})
          </button>

          {limiteDias > 3 && (
            <button
              type="button"
              onClick={() => setStatusFilter('HIGH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                statusFilter === 'HIGH'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-[#10172a] border-[#1e294b] text-slate-400 hover:text-slate-200'
              }`}
            >
              Alto (4 a {limiteDias} dias) ({summary.highOnlyCount})
            </button>
          )}
        </div>
      </div>

      {/* Cards de Resumo de Risco */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0e162c] border border-amber-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Produtos em Risco Alto
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-20 bg-[#1b2649] rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {summary.totalInRisk}
              </span>
              <span className="text-xs text-rose-400 font-semibold">
                {summary.criticalCount} {summary.criticalCount === 1 ? 'crítico' : 'críticos'} (≤ 3d)
              </span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2">
            Janela de {riscoData.periodo_analisado_dias}d · Limiar ≤ {riscoData.limite_dias_alerta}d
          </p>
        </div>

        <div className="bg-[#0e162c] border border-rose-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Menor Prazo até Ruptura
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-36 bg-[#1b2649] rounded animate-pulse" />
          ) : summary.mostUrgent ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
                  {summary.mostUrgent.dias_ate_ruptura === 0
                    ? 'Hoje (0d)'
                    : `${summary.mostUrgent.dias_ate_ruptura}d`}
                </span>
                <span className="text-xs text-slate-300 font-medium truncate">
                  {summary.mostUrgent.nome}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 truncate">
                SKU {summary.mostUrgent.codigo} · Previsão:{' '}
                <strong className="text-slate-200">
                  {formatDateBr(summary.mostUrgent.data_prevista_ruptura)}
                </strong>
              </p>
            </div>
          ) : (
            <div>
              <span className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Sem urgências
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                Nenhum item atinge ruptura dentro do limiar
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#0e162c] border border-[#1d294d] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Consumo Médio Agregado
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-28 bg-[#1b2649] rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {formatNumberBr(summary.aggregatedDailyRate, 2)}
              </span>
              <span className="text-xs text-indigo-300 font-medium">un/dia</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2">
            Total de {formatNumberBr(summary.totalOutflowPeriod)} saídas entre os itens em risco
          </p>
        </div>
      </div>

      {/* Gráfico Horizontal de Ranking / Linha do Tempo */}
      <RuptureTimelineChart
        items={filteredItems}
        limiteDias={limiteDias}
        loading={loading}
        onSelectProduct={(item) => setSelectedProduct(item)}
      />

      {/* Tabela Desktop + Cards Mobile */}
      <Card
        title="Produtos Monitorados em Risco"
        subtitle={`${filteredItems.length} ${
          filteredItems.length === 1 ? 'item listado' : 'itens listados'
        } para ação imediata`}
        icon={TrendingDown}
        bodyClassName="p-0"
      >
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-14 bg-[#121c38] rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/70 mb-3" />
            <p className="text-sm font-semibold text-slate-200">
              Nenhum produto encontrado para os filtros aplicados
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Experimente ampliar o limiar de dias de alerta ou ajustar os termos da busca.
            </p>
          </div>
        ) : (
          <>
            {/* Cards Mobile (< 768px) */}
            <div className="md:hidden divide-y divide-[#17223e]">
              {filteredItems.map((item) => {
                const sev = getSeverityBadge(item.dias_ate_ruptura);
                return (
                  <div key={item.produto_id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.nome}</p>
                        <span className="text-xs font-mono text-indigo-400">{item.codigo}</span>
                      </div>
                      <StatusBadge status={sev.status} label={sev.label} />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs bg-[#0a1020] border border-[#1b2649] rounded-xl p-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Estoque / Mín.</span>
                        <span className="font-mono font-bold text-white">
                          {formatNumberBr(item.quantidade_atual)} / {formatNumberBr(item.quantidade_minima)} un
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Saídas ({item.periodo_analisado_dias}d)</span>
                        <span className="font-mono font-semibold text-slate-200">
                          {formatNumberBr(item.total_saidas_periodo)} un
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Média Diária</span>
                        <span className="font-mono font-semibold text-indigo-300">
                          {formatNumberBr(item.media_diaria_saidas, 2)} un/dia
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ruptura Prevista</span>
                        <span
                          className={`font-mono font-bold ${
                            item.dias_ate_ruptura <= 3 ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          {item.dias_ate_ruptura}d · {formatDateBr(item.data_prevista_ruptura)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        icon={TrendingDown}
                        onClick={() => setSelectedProduct(item)}
                      >
                        Simular
                      </Button>
                      <Link
                        to={`/movimentacoes?produto_id=${item.produto_id}&tipo=ENTRADA&open=1`}
                        className="w-full"
                      >
                        <Button variant="success" size="sm" fullWidth icon={ArrowDownRight}>
                          Entrada
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabela Desktop (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400 bg-[#0c1326]">
                    <th className="py-3 px-5 font-semibold">Produto / SKU</th>
                    <th className="py-3 px-4 font-semibold text-center">Atual vs Mín.</th>
                    <th className="py-3 px-4 font-semibold text-center">Saídas</th>
                    <th className="py-3 px-4 font-semibold text-center">Média Diária</th>
                    <th className="py-3 px-4 font-semibold text-center">Dias até Ruptura</th>
                    <th className="py-3 px-4 font-semibold text-center">Data Prevista</th>
                    <th className="py-3 px-4 font-semibold text-center">Risco</th>
                    <th className="py-3 px-5 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17223e]">
                  {filteredItems.map((item) => {
                    const sev = getSeverityBadge(item.dias_ate_ruptura);
                    const belowMin =
                      Number(item.quantidade_atual) <= Number(item.quantidade_minima);

                    return (
                      <tr
                        key={item.produto_id}
                        className="hover:bg-[#121c38]/60 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-100">{item.nome}</p>
                            <span className="font-mono text-xs text-indigo-400">
                              {item.codigo}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span
                            className={`font-bold ${
                              belowMin ? 'text-rose-400' : 'text-white'
                            }`}
                          >
                            {formatNumberBr(item.quantidade_atual)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {' '}
                            / {formatNumberBr(item.quantidade_minima)} un
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                          {formatNumberBr(item.total_saidas_periodo)} un
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-indigo-300 font-semibold">
                          {formatNumberBr(item.media_diaria_saidas, 2)} un/dia
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          <span
                            className={
                              item.dias_ate_ruptura <= 3
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }
                          >
                            {item.dias_ate_ruptura === 0
                              ? 'Hoje (0d)'
                              : `${item.dias_ate_ruptura} ${
                                  item.dias_ate_ruptura === 1 ? 'dia' : 'dias'
                                }`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-300">
                          {formatDateBr(item.data_prevista_ruptura)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status={sev.status} label={sev.label} />
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={TrendingDown}
                              onClick={() => setSelectedProduct(item)}
                            >
                              Analisar / Simular
                            </Button>
                            <Link
                              to={`/movimentacoes?produto_id=${item.produto_id}&tipo=ENTRADA&open=1`}
                            >
                              <Button variant="success" size="sm" icon={ArrowDownRight}>
                                Registrar Entrada
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Modal Simulador Individual */}
      {selectedProduct && (
        <PrevisaoRupturaModal
          produtoId={selectedProduct.produto_id}
          initialProduct={selectedProduct}
          initialDias={dias}
          initialLimiteDias={limiteDias}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default PrevisaoRupturaPage;
