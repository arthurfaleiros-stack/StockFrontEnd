import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Plus, Search, FolderTree } from 'lucide-react';
import inventoryService from '../../api/inventory';

export function CategoriasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState([
    { id: 1, nome: 'Sensores', descricao: 'Dispositivos fotoelétricos, indutivos e de proximidade', totalItens: 42 },
    { id: 2, nome: 'Automação', descricao: 'Controladores lógicos (CLP), IHM e módulos de expansão', totalItens: 28 },
    { id: 3, nome: 'Elétrica', descricao: 'Fontes chaveadas, disjuntores, relés e contactores', totalItens: 65 },
    { id: 4, nome: 'Cabos', descricao: 'Cabos blindados, cabos de rede e fiações industriais', totalItens: 19 },
    { id: 5, nome: 'Conectores', descricao: 'Conectores circulares M12, bornes e terminais', totalItens: 87 },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const data = await inventoryService.getCategorias();
        if (data && Array.isArray(data) && data.length > 0) {
          setCategorias(data);
        }
      } catch {
        // mantém padrão
      }
    }
    load();
  }, []);

  const filtered = categorias.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Categorias de Produtos</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Segmentação e organização do catálogo de inventário.
          </p>
        </div>

        <Button variant="primary" icon={Plus}>
          Nova Categoria
        </Button>
      </div>

      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
        <Input
          placeholder="Pesquisar por nome ou descrição da categoria..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#0e162c] border border-[#1e2a4a] hover:border-indigo-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <FolderTree className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold bg-[#141e3a] px-2.5 py-1 rounded-full text-indigo-300 border border-[#1e2a4a]">
                {cat.totalItens} produtos
              </span>
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              {cat.nome}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {cat.descricao}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoriasPage;
