import React from 'react';

export function Card({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}) {
  const hasCustomPadding = /\bp-\d+|\bp-\[/.test(bodyClassName);

  return (
    <div className={`bg-[#0e162c] border border-[#1e2a4a] rounded-2xl shadow-xl shadow-black/20 overflow-hidden ${className}`}>
      {(title || Icon || action) && (
        <div
          className={`px-4 sm:px-6 py-4 border-b border-[#1b2542] flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 ${headerClassName}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="font-semibold text-slate-100 text-base truncate sm:whitespace-normal">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
        </div>
      )}
      <div className={`${hasCustomPadding ? '' : 'p-4 sm:p-6'} ${bodyClassName}`}>{children}</div>
    </div>
  );
}

export default Card;

