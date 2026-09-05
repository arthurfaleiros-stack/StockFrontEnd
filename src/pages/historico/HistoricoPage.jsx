import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { Search } from 'lucide-react';
import inventoryService from '../../api/inventory';

export function HistoricoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([
    { id: 1, data: '05/09/2026 14:32:18', usuario: 'Carlos Lima (OPERADOR)', acao: 'CRIAÇÃO_MOVIMENTAÇÃO', entidade: 'Movimentação #1042', detalhe: 'Entrada de 50 un do item PROD-001 via NF #8921' },
    { id: 2, data: '05/09/2026 13:10:04', usuario: 'Arthur Faleiros (ADMIN)', acao: 'ATUALIZAÇÃO_PREÇO', entidade: 'Produto PROD-002', detalhe: 'Alteração de preço unitário de R$ 1.180,00 para R$ 1.250,00' },
    { id: 3, data: '05/09/2026 12:15:42', usuario: 'Arthur Faleiros (ADMIN)', acao: 'CRIAÇÃO_MOVIMENTAÇÃO', entidade: 'Movimentação #1041', detalhe: 'Saída de 12 un do item PROD-004 para OS Linha B' },
    { id: 4, data: '04/09/2026 18:00:22', usuario: 'Mariana Costa (GERENTE)', acao: 'CADASTRO_FORNECEDOR', entidade: 'Fornecedor #4', detalhe: 'Inclusão de EletroPower Distribuidora S/A' },
    { id: 5, data: '04/09/2026 10:20:15', usuario: 'Arthur Faleiros (ADMIN)', acao: 'AUTENTICAÇÃO_LOGIN', entidade: 'Sessão Web', detalhe: 'Autenticação bem-sucedida via JWT' },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const data = await inventoryService.getHistorico();
        if (data && Array.isArray(data) && data.length > 0) {
          setLogs(data);
        }
      } catch {
        // mantém padrão
      }
    }
    load();
  }, []);

  const filtered = logs.filter((log) =>
    log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.detalhe.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Histórico & Trilha de Auditoria</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registro imutável de todas as ações operacionais e eventos de segurança.
          </p>
        </div>
      </div>

      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
        <Input
          placeholder="Filtrar por usuário, ação ou detalhe da operação..."
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
                <th className="py-3 px-6 font-semibold">Timestamp</th>
                <th className="py-3 px-6 font-semibold">Usuário Responsável</th>
                <th className="py-3 px-6 font-semibold">Evento / Ação</th>
                <th className="py-3 px-6 font-semibold">Alvo</th>
                <th className="py-3 px-6 font-semibold">Descrição do Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17223e]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#121c38]/60 transition-colors">
                  <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                    {item.data}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-200">
                    {item.usuario}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#162244] text-indigo-300 border border-[#233566]">
                      {item.acao}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                    {item.entidade}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    {item.detalhe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default HistoricoPage;
