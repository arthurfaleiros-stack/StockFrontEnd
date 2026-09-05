import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export function Alert({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) {
  const configs = {
    error: {
      icon: AlertCircle,
      wrapperClass: 'bg-rose-950/40 border-rose-500/40 text-rose-200',
      iconClass: 'text-rose-400',
      titleClass: 'text-rose-300',
    },
    success: {
      icon: CheckCircle2,
      wrapperClass: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
      iconClass: 'text-emerald-400',
      titleClass: 'text-emerald-300',
    },
    warning: {
      icon: AlertTriangle,
      wrapperClass: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
      iconClass: 'text-amber-400',
      titleClass: 'text-amber-300',
    },
    info: {
      icon: Info,
      wrapperClass: 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200',
      iconClass: 'text-indigo-400',
      titleClass: 'text-indigo-300',
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm text-sm ${config.wrapperClass} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconClass}`} />

      <div className="flex-1 pr-2">
        {title && <h5 className={`font-semibold mb-1 ${config.titleClass}`}>{title}</h5>}
        <div className="leading-relaxed">{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 transition-colors cursor-pointer rounded-lg"
          aria-label="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default Alert;

