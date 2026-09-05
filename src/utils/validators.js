/**
 * Validador de formato de e-mail usando RFC 5322 simplificado
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Calcula a força da senha e retorna métricas para feedback visual
 * @param {string} password 
 */
export function evaluatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: 'Vazia',
      color: 'text-slate-500',
      bgColor: 'bg-slate-700',
      requirements: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
      }
    };
  }

  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  let points = 0;
  if (requirements.minLength) points += 1;
  if (requirements.hasUppercase && requirements.hasLowercase) points += 1;
  if (requirements.hasNumber) points += 1;
  if (requirements.hasSpecial) points += 1;

  let label = 'Muito Fraca';
  let color = 'text-rose-400';
  let bgColor = 'bg-rose-500';

  if (points === 2) {
    label = 'Razoável';
    color = 'text-amber-400';
    bgColor = 'bg-amber-500';
  } else if (points === 3) {
    label = 'Forte';
    color = 'text-blue-400';
    bgColor = 'bg-blue-500';
  } else if (points === 4) {
    label = 'Excelente';
    color = 'text-emerald-400';
    bgColor = 'bg-emerald-500';
  }

  return {
    score: points,
    label,
    color,
    bgColor,
    requirements,
    isValid: requirements.minLength && (points >= 3),
  };
}

