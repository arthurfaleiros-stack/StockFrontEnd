import React from 'react';
import { ShieldCheck, ShieldAlert, User, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function RoleBadge({ role, size = 'md', className = '' }) {
  const normalized = (role || 'OPERADOR').toUpperCase();

  const configs = {
    ADMIN: {
      label: 'Administrador',
      icon: ShieldAlert,
      styles: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    },
    GERENTE: {
      label: 'Gerente',
      icon: ShieldCheck,
      styles: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    },
    OPERADOR: {
      label: 'Operador',
      icon: User,
      styles: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
  };

  const config = configs[normalized] || configs.OPERADOR;
  const Icon = config.icon;

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${config.styles} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
}

export function StatusBadge({ status, label, className = '' }) {
  const statusConfigs = {
    success: {
      defaultLabel: 'Ativo',
      icon: CheckCircle2,
      styles: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    warning: {
      defaultLabel: 'Atenção',
      icon: AlertTriangle,
      styles: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    danger: {
      defaultLabel: 'Crítico',
      icon: XCircle,
      styles: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    info: {
      defaultLabel: 'Normal',
      icon: null,
      styles: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
  };

  const current = statusConfigs[status] || statusConfigs.info;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${current.styles} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      <span>{label || current.defaultLabel}</span>
    </span>
  );
}

export default RoleBadge;

