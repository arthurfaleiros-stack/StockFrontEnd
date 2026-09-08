import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home, HelpCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#070b16] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
        <HelpCircle className="w-8 h-8" />
      </div>
      <span className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-2">
        Erro 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
        Página Não Encontrada
      </h1>
      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        O recurso ou rota que você tentou acessar não existe ou foi movido para outro endereço.
      </p>
      <Link to="/login">
        <Button variant="primary" icon={Home} size="lg">
          Voltar ao Login
        </Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;

