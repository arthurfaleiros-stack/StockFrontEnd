import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { StatusBadge } from '../../components/common/Badge';
import { Search, Plus, Filter } from 'lucide-react';
import inventoryService from '../../api/inventory';

export function ProdutosPage() {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');

  // Lista padrão para demonstração operacional caso API ainda esteja vazia
  const initialProdutos = [
    { id: 1, sku: 'PROD-001', nome: 'Sensor Fotoelétrico Industrial 24V', categoria: 'Sensores', estoque: 84, estoqueMinimo: 20, preco: 189.90 },
    { id: 2, sku: 'PROD-002', nome: 'Controlador Lógico Programável (CLP)', categoria: 'Automação', estoque: 6, estoqueMinimo: 10, preco: 1250.00 },
    { id: 3, sku: 'PROD-003', nome: 'Fonte Chaveada Trilho DIN 24V 10A', categoria: 'Elétrica', estoque: 35, estoqueMinimo: 15, preco: 215.50 },
    { id: 4, sku: 'PROD-004', nome: 'Cabo Blindado 4 Vias 100 Metros', categoria: 'Cabos', estoque: 18, estoqueMinimo: 10, preco: 380.00 },
    { id: 5, sku: 'PROD-005', nome: 'Relé de Estado Sólido 40A 220V', categoria: 'Elétrica', estoque: 3, estoqueMinimo: 15, preco: 74.20 },
    { id: 6, sku: 'PROD-006', nome: 'Conector M12 Macho 4 Pinos IP67', categoria: 'Conectores', estoque: 150, estoqueMinimo: 40, preco: 32.00 },
  ];

  const [produtos, setProdutos] = useState(initialProdutos);

  useEffect(() => {
    async function fetchApiProdutos() {
      try {
        const data = await inventoryService.getProdutos();
        if (data && Array.isArray(data) && data.length > 0) {
          setProdutos(data);
        }
      } catch {
        // mantém inicial
      }
    }
    fetchApiProdutos();
  }, []);

  const canManageProducts = hasRole(['ADMIN', 'GERENTE']);

  // Filtragem
  const filtered = produtos.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'TODAS' || p.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (p) => {
    if (p.estoque <= 0) return { status: 'danger', label: 'Esgotado' };
    if (p.estoque <= p.estoqueMinimo) return { status: 'warning', label: 'Estoque Baixo' };
    return { status: 'success', label: 'Normal' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Catálogo de Produtos</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualização e controle de itens estocados no armazém.
          </p>
        </div>

        {canManageProducts && (
          <Button variant="primary" icon={Plus}>
            Novo Produto
          </Button>
        )}
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Buscar por nome do item ou código SKU..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#10172a] border border-[#1e294b] text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="TODAS">Todas as Categorias</option>
            <option value="Sensores">Sensores</option>
            <option value="Automação">Automação</option>
            <option value="Elétrica">Elétrica</option>
            <option value="Cabos">Cabos</option>
            <option value="Conectores">Conectores</option>
          </select>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400 bg-[#0c1326]">
                <th className="py-3 px-6 font-semibold">SKU / Código</th>
                <th className="py-3 px-6 font-semibold">Descrição do Produto</th>
                <th className="py-3 px-6 font-semibold">Categoria</th>
                <th className="py-3 px-6 font-semibold text-center">Em Estoque</th>
                <th className="py-3 px-6 font-semibold text-right">Preço Unitário</th>
                <th className="py-3 px-6 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17223e]">
              {filtered.map((item) => {
                const stock = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-[#121c38]/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-indigo-400 font-bold">
                      {item.sku}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-100">
                      {item.nome}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      <span className="bg-[#141e3a] px-2.5 py-1 rounded-lg border border-[#1e2c54]">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-white">
                      {item.estoque} un
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-200">
                      R$ {Number(item.preco).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <StatusBadge status={stock.status} label={stock.label} />
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum produto encontrado correspondente aos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ProdutosPage;
