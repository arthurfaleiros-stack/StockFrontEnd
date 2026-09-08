/**
 * Confere se o texto digitado parece um e-mail válido.
 * (validação simples, só pra dar um feedback rápido pro usuário)
 */
export function isValidEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}
