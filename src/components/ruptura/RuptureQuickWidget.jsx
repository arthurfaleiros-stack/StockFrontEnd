import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import Card from '../common/Card';
import { StatusBadge } from '../common/Badge';
import { formatDateBr, formatNumberBr } from '../../utils/formatters';

export function RuptureQuickWidget({
  riscoData,
  loading = false,
  onSelectProduct,
}) {
  const items = Array.isArray(riscoData?.data) ? riscoData.data : [];
  const top5 = items.slice(0, 5);
  const totalInRisk = riscoData?.total ?? items.length;

  return (
    <Card
      title="Alerta Rápido de Ruptura"
      subtitle="Top 5 itens com menor autonomia estimada (janela 30d · limiar 7d)"
      icon={AlertTriangle}
      action={
        <Link
          to="/previsao-ruptura"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 whitespace-nowrap"
        >
          <span>Ver análise completa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-[#121c38] rounded-xl" />
          ))}
        </div>
      ) : top5.length === 0 ? (
        <div className="py-6 px-4 text-center bg-[#0a1020]/50 border border-dashed border-[#1b2649] rounded-xl">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
          <p className="text-xs font-semibold text-slate-200">
            Nenhum produto em risco crítico nos próximos 7 dias
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Todos os itens monitorados possuem cobertura confortável ou sem consumo recente.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {top5.map((item) => {
            const isCritical = item.dias_ate_ruptura <= 3;
            return (
              <button
                key={item.produto_id}
                type="button"
                onClick={() => onSelectProduct && onSelectProduct(item)}
                className="w-full text-left bg-[#121c38]/80 hover:bg-[#162345] border border-[#1d294d] hover:border-indigo-500/40 rounded-xl p-3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100 truncate">
                      {item.nome}
                    </span>
                    <span className="text-[11px] font-mono text-indigo-400">
                      {item.codigo}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 mt-1">
                    <span>
                      Saldo: <strong className="text-slate-200">{formatNumberBr(item.quantidade_atual)} un</strong>
                    </span>
                    <span>
                      Consumo: <strong className="text-indigo-300">{formatNumberBr(item.media_diaria_saidas, 2)} un/dia</strong>
                    </span>
                    <span>
                      Previsão: <strong className="text-slate-200">{formatDateBr(item.data_prevista_ruptura)}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                  <StatusBadge
                    status={isCritical ? 'danger' : 'warning'}
                    label={
                      item.dias_ate_ruptura === 0
                        ? 'Hoje (0d)'
                        : `${item.dias_ate_ruptura} ${item.dias_ate_ruptura === 1 ? 'dia' : 'dias'}`
                    }
                  />
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-300">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Simular</span>
                  </span>
                </div>
              </button>
            );
          })}

          {totalInRisk > 5 && (
            <div className="pt-2 text-center">
              <Link
                to="/previsao-ruptura"
                className="text-xs text-slate-400 hover:text-indigo-300 transition-colors"
              >
                +{totalInRisk - 5} outros itens em risco · Abrir painel completo
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default RuptureQuickWidget;
