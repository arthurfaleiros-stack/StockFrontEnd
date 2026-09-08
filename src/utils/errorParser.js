/**
 * Pega o erro que veio do axios e devolve só a mensagem
 * que a gente quer mostrar na tela pro usuário.
 *
 * A nossa API sempre responde erro nesse formato:
 * { error: { code, message } }
 */
export function getErrorMessage(error) {
  // Erro de conexão (backend fora do ar, sem internet, etc)
  if (error.code === 'ERR_NETWORK') {
    return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
  }

  // A API respondeu, mas com um erro (400, 401, 404, etc)
  if (error.response && error.response.data && error.response.data.error) {
    return error.response.data.error.message;
  }

  // Qualquer outro erro que a gente não previu
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export default getErrorMessage;
