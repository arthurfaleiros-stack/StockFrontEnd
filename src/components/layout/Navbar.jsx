import React from 'react';
import { Menu, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { RoleBadge } from '../common/Badge';

export function Navbar({ onMenuToggle, title = 'Painel Geral' }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-[#1a2647] bg-[#090f1e]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#15213f] transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Indicador de Status da API */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>KStock-API</span>
        </div>

        {/* Informações do usuário logado */}
        <div className="flex items-center gap-3 pl-2 sm:border-l border-[#1a2647]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{user?.nome}</p>
            <div className="mt-0.5">
              <RoleBadge role={user?.perfil} size="sm" />
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Sair do sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
