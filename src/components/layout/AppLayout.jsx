import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles = {
  '/dashboard': 'Visão Geral & Métricas',
  '/produtos': 'Catálogo de Produtos',
  '/movimentacoes': 'Movimentações de Estoque',
  '/categorias': 'Gestão de Categorias',
  '/fornecedores': 'Gestão de Fornecedores',
  '/historico': 'Histórico & Trilha de Auditoria',
  '/usuarios': 'Administração de Usuários',
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || 'Painel de Controle';

  return (
    <div className="min-h-screen bg-[#080d1a] flex">
      {/* Barra Lateral */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={currentTitle}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

