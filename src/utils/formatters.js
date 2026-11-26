/**
 * Formata datas YYYY-MM-DD ou ISO para dd/MM/yyyy sem sofrer deslocamento de fuso horário.
 */
export function formatDateBr(dateValue) {
  if (!dateValue) return '—';
  const str = String(dateValue).trim();
  const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (ymdMatch) {
    return `${ymdMatch[3]}/${ymdMatch[2]}/${ymdMatch[1]}`;
  }
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return str;
  return parsed.toLocaleDateString('pt-BR');
}

/**
 * Formata datas YYYY-MM-DD ou ISO para dd/MM.
 */
export function formatShortDateBr(dateValue) {
  if (!dateValue) return '—';
  const str = String(dateValue).trim();
  const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (ymdMatch) {
    return `${ymdMatch[3]}/${ymdMatch[2]}`;
  }
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return str;
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/**
 * Soma dias à data local atual e retorna string formatada dd/MM/yyyy.
 */
export function addDaysFormatted(days) {
  const numericDays = Number(days);
  if (!Number.isFinite(numericDays)) return '—';
  const d = new Date();
  d.setDate(d.getDate() + Math.max(0, Math.floor(numericDays)));
  return d.toLocaleDateString('pt-BR');
}

/**
 * Soma dias à data local atual e retorna dd/MM.
 */
export function addDaysShortFormatted(days) {
  const numericDays = Number(days);
  if (!Number.isFinite(numericDays)) return '—';
  const d = new Date();
  d.setDate(d.getDate() + Math.max(0, Math.floor(numericDays)));
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/**
 * Formata número em pt-BR.
 */
export function formatNumberBr(value, maxFractionDigits = 0) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('pt-BR', { maximumFractionDigits: maxFractionDigits });
}

/**
 * Trunca textos longos para caber em eixos de gráficos sem sobreposição.
 */
export function truncateLabel(text, maxLength = 18) {
  if (!text) return '';
  const str = String(text);
  return str.length > maxLength ? `${str.slice(0, maxLength - 1)}…` : str;
}
