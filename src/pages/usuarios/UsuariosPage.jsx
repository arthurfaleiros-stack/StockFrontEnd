import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { RoleBadge, StatusBadge } from '../../components/common/Badge';
import { Search, UserPlus } from 'lucide-react';
import inventoryService from '../../api/inventory';

export function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'Arthur Faleiros', email: 'arthur@keepstock.io', perfil: 'ADMIN', status: 'success', dataCriacao: '01/08/2026' },
    { id: 2, nome: 'Mariana Costa', email: 'mariana.costa@empresa.com', perfil: 'GERENTE', status: 'success', dataCriacao: '10/08/2026' },
    { id: 3, nome: 'Carlos Lima', email: 'carlos.lima@empresa.com', perfil: 'OPERADOR', status: 'success', dataCriacao: '15/08/2026' },
    { id: 4, nome: 'Roberta Dias', email: 'roberta.dias@empresa.com', perfil: 'OPERADOR', status: 'success', dataCriacao: '20/08/2026' },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const data = await inventoryService.getUsuarios();
        if (data && Array.isArray(data) && data.length > 0) {
          setUsuarios(data);
        }
      } catch {
        // mantém padrão
      }
    }
    load();
  }, []);

  const filtered = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.perfil.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white">Administração de Usuários</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Restrito: ADMIN
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gerenciamento de contas e níveis hierárquicos de acesso à plataforma.
          </p>
        </div>

        <Button variant="primary" icon={UserPlus}>
          Convidar Usuário
        </Button>
      </div>

      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
        <Input
          placeholder="Pesquisar por nome, e-mail ou perfil..."
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
                <th className="py-3 px-6 font-semibold">Usuário</th>
                <th className="py-3 px-6 font-semibold">E-mail</th>
                <th className="py-3 px-6 font-semibold">Perfil de Acesso</th>
                <th className="py-3 px-6 font-semibold text-center">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17223e]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#121c38]/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-100 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.nome.charAt(0)}
                    </div>
                    <span>{user.nome}</span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300 font-mono">
                    {user.email}
                  </td>
                  <td className="py-4 px-6">
                    <RoleBadge role={user.perfil} size="sm" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <StatusBadge status={user.status} label="Ativo" />
                  </td>
                  <td className="py-4 px-6 text-right text-xs text-slate-400 font-mono">
                    {user.dataCriacao}
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

export default UsuariosPage;
