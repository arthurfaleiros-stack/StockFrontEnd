import React from 'react';
import { Check } from 'lucide-react';

export function StepProgress({ currentStep = 1, steps = [] }) {
  const defaultSteps = [
    { id: 1, title: 'Identificação', description: 'E-mail cadastrado' },
    { id: 2, title: 'Validação', description: 'Código de 6 dígitos' },
    { id: 3, title: 'Nova Senha', description: 'Definição de acesso' },
  ];

  const stepList = steps.length > 0 ? steps : defaultSteps;

  return (
    <div className="w-full py-4 px-2">
      <div className="relative flex items-center justify-between">
        {/* Linha conectora traseira */}
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-[#1a2544] -z-0">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-500"
            style={{
              width: `${((Math.min(currentStep, stepList.length) - 1) / (stepList.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Círculos das Etapas */}
        {stepList.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-600/40 scale-110'
                      : 'bg-[#10182f] border border-[#23335c] text-slate-400'
                  }
                `}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : step.id}
              </div>

              <div className="text-center mt-2.5">
                <p
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    isCurrent ? 'text-indigo-300' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <span className="hidden sm:block text-[10px] text-slate-500 mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepProgress;

