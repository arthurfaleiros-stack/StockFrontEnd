/**
 * Extrai e normaliza mensagens de erro vindas da API KStock-API.
 * Padrão esperado da API: { "error": { "code", "message", "details" } }
 * 
 * @param {any} error - Erro capturado do Axios ou exceção genérica
 * @returns {{ message: string, code?: string, details?: any }}
 */
export function parseApiError(error) {
  if (!error) {
    return { message: 'Ocorreu um erro desconhecido. Tente novamente.' };
  }

  // Se o servidor respondeu com status de erro
  if (error.response && error.response.data) {
    const data = error.response.data;

    // Padrão documentado: { error: { code, message, details } }
    if (data.error && typeof data.error === 'object') {
      let detailMsg = '';
      if (Array.isArray(data.error.details)) {
        detailMsg = data.error.details.join(' | ');
      } else if (typeof data.error.details === 'string') {
        detailMsg = data.error.details;
      } else if (data.error.details && typeof data.error.details === 'object') {
        detailMsg = Object.values(data.error.details).join(' | ');
      }

      return {
        message: data.error.message || detailMsg || 'Falha ao processar solicitação.',
        code: data.error.code,
        details: detailMsg || data.error.details,
      };
    }

    // Caso a API retorne mensagem na raiz { message: "..." }
    if (typeof data.message === 'string') {
      return { message: data.message };
    }

    // Caso retorne string simples
    if (typeof data === 'string') {
      return { message: data };
    }
  }

  // Erros de conexão / rede
  if (error.code === 'ERR_NETWORK') {
    return {
      message: 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.',
      code: 'ERR_NETWORK',
    };
  }

  if (error.code === 'ECONNABORTED') {
    return {
      message: 'Tempo limite de resposta esgotado. Tente novamente mais tarde.',
      code: 'TIMEOUT',
    };
  }

  return {
    message: error.message || 'Ocorreu um erro inesperado ao se comunicar com a API.',
  };
}

