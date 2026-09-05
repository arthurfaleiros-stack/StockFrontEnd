import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Truck, Plus, Search, Mail, Phone, MapPin } from 'lucide-react';
import inventoryService from '../../api/inventory';

export function FornecedoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fornecedores, setFornecedores] = useState([
    { id: 1, razaoSocial: 'AutomaTech Componentes Ltda', cnpj: '12.345.678/0001-90', contato: 'Marcos Vinicius', email: 'vendas@automatech.com.br', telefone: '(11) 3456-7890', cidade: 'São Paulo/SP' },
    { id: 2, razaoSocial: 'Sensortec Sensores Industriais', cnpj: '98.765.432/0001-10', contato: 'Fernanda Rocha', email: 'comercial@sensortec.ind.br', telefone: '(19) 9876-5432', cidade: 'Campinas/SP' },
    { id: 3, razaoSocial: 'ConectaFio Cabos Especiais', cnpj: '45.123.789/0001-55', contato: 'Renato Alves', email: 'atendimento@conectafio.com', telefone: '(41) 3322-1100', cidade: 'Curitiba/PR' },
    { id: 4, razaoSocial: 'EletroPower Distribuidora S/A', cnpj: '33.888.999/0001-40', contato: 'Juliana Pires', email: 'juliana@eletropower.com.br', telefone: '(31) 2555-8800', cidade: 'Belo Horizonte/MG' },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const data = await inventoryService.getFornecedores();
        if (data && Array.isArray(data) && data.length > 0) {
          setFornecedores(data);
        }
      } catch {
        // mantém padrão
      }
    }
    load();
  }, []);

  const filtered = fornecedores.filter((f) =>
    f.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cnpj.includes(searchTerm) ||
    f.contato.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Fornecedores Cadastrados</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Parceiros comerciais e canais de suprimento de estoque.
          </p>
        </div>

        <Button variant="primary" icon={Plus}>
          Novo Fornecedor
        </Button>
      </div>

      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
        <Input
          placeholder="Pesquisar por Razão Social, CNPJ ou Nome de Contato..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="bg-[#0e162c] border border-[#1e2a4a] hover:border-indigo-500/40 rounded-2xl p-5 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white">{f.razaoSocial}</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">CNPJ: {f.cnpj}</p>
              </div>
              <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Truck className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-[#17223e] space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{f.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{f.telefone} &bull; Contato: {f.contato}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{f.cidade}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FornecedoresPage;
