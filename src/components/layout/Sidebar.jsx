import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { RoleBadge } from '../common/Badge';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Tags,
  Truck,
  History,
  Users,
  LogOut,
  Boxes,
  X,
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, logout, hasRole } = useAuth();

  // Definição dos itens de navegação e restrição por papel
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
    },
    {
      label: 'Produtos',
      path: '/produtos',
      icon: Package,
      roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
    },
    {
      label: 'Movimentações',
      path: '/movimentacoes',
      icon: ArrowLeftRight,
      roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
    },
    {
      label: 'Categorias',
      path: '/categorias',
      icon: Tags,
      roles: ['ADMIN', 'GERENTE'],
    },
    {
      label: 'Fornecedores',
      path: '/fornecedores',
      icon: Truck,
      roles: ['ADMIN', 'GERENTE'],
    },
    {
      label: 'Histórico & Logs',
      path: '/historico',
      icon: History,
      roles: ['ADMIN', 'GERENTE'],
    },
    {
      label: 'Usuários',
      path: '/usuarios',
      icon: Users,
      roles: ['ADMIN'], // Apenas ADMIN
    },
  ];

  // Filtra itens com base no perfil do usuário logado
  const visibleNavItems = navItems.filter((item) => hasRole(item.roles));

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          w-72 bg-[#0a1020] border-r border-[#1a2647] flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Topo / Logo */}
        <div>
          <div className="h-20 px-6 border-b border-[#17223e] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Keep<span className="text-indigo-400">Stock</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Gestão de Inventário
                </p>
              </div>
            </div>

            {/* Fechar no mobile */}
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#15213f]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Navegação */}
          <div className="p-4">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Menu Principal
            </p>
            <nav className="space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600/20 to-blue-600/10 text-indigo-300 border-l-4 border-indigo-500 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#121c38]'
                      }
                    `}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Rodapé da Sidebar: Usuário + Logout */}
        <div className="p-4 border-t border-[#17223e]">
          <div className="bg-[#0f172e] border border-[#1d2a4d] rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#17223e]">
              <RoleBadge role={user?.perfil} size="sm" />
              <button
                onClick={logout}
                title="Sair da conta"
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
