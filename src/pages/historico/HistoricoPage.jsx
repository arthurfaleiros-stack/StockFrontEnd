import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { Search } from 'lucide-react';
import inventoryService from '../../api/inventory';

export function HistoricoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await inventoryService.getHistorico({ limit: 100 });
        const data = res?.data || (Array.isArray(res) ? res : []);
        setLogs(data);
      } catch {
        // mantém lista vazia se erro
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const filtered = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const user = (log.usuario_nome || '').toLowerCase();
    const acao = (log.tipo_operacao || '').toLowerCase();
    const detalhe = (log.descricao || '').toLowerCase();
    const produto = (log.produto_nome || '').toLowerCase();
    return user.includes(term) || acao.includes(term) || detalhe.includes(term) || produto.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Histórico & Trilha de Auditoria</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registro imutável de todas as ações operacionais e eventos de estoque.
          </p>
        </div>
      </div>

      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
        <Input
          placeholder="Filtrar por usuário, ação, produto ou descrição da operação..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400 bg-[#0c1326]">
                <th className="py-3 px-6 font-semibold">Data / Hora</th>
                <th className="py-3 px-6 font-semibold">Usuário Responsável</th>
                <th className="py-3 px-6 font-semibold">Operação</th>
                <th className="py-3 px-6 font-semibold">Produto / Alvo</th>
                <th className="py-3 px-6 font-semibold">Descrição do Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17223e]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Carregando histórico do banco de dados...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#121c38]/60 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {formatDate(item.data_hora)}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-200">
                      {item.usuario_nome || 'Sistema'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#162244] text-indigo-300 border border-[#233566]">
                        {item.tipo_operacao}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300 font-medium">
                      {item.produto_nome ? (
                        <div>
                          <span>{item.produto_nome}</span>
                          {item.produto_codigo && (
                            <span className="block font-mono text-[11px] text-slate-400">
                              {item.produto_codigo}
                            </span>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      {item.descricao}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default HistoricoPage;
