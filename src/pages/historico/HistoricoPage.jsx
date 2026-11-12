import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { Search } from 'lucide-react';
import inventoryService from '../../api/inventory';

const HistoricoPage = () => {
  // Armazena o texto digitado pelo usuário no campo de pesquisa.
  // O setSearchTerm é utilizado para atualizar o valor da pesquisa sempre que o usuário digitar.
  const [searchTerm, setSearchTerm] = useState('');

  // Armazena todos os registros de movimentações recebidos do backend.
  // Inicialmente, começa como um array vazio porque os dados ainda não foram carregados.
  const [logs, setLogs] = useState([]);

  // Controla o estado de carregamento da página.
  // Enquanto estiver true, o sistema informa que está buscando os registros na API.
  const [loading, setLoading] = useState(true);

  // useEffect executa uma função quando o componente é carregado.
  // Como o array de dependências está vazio, a busca acontece apenas na montagem da página.
  useEffect(() => {
    // Função assíncrona responsável por buscar o histórico de movimentações no backend.
    // O async permite utilizar await para aguardar a resposta da requisição.
    const load = async () => {
      // Ativa o indicador de carregamento antes de iniciar a requisição.
      setLoading(true);

      try {
        // Chama o serviço responsável por consultar o histórico na API.
        // O parâmetro limit: 100 solicita que sejam retornados até 100 registros.
        // O await aguarda a resposta do servidor antes de continuar.
        const res = await inventoryService.getHistorico({ limit: 100 });

        // Verifica o formato da resposta recebida. Se existir a propriedade data, utiliza seu conteúdo. Caso a resposta já seja um array, utiliza a própria resposta.
        // Se nenhum dos formatos for encontrado, utiliza um array vazio.
        const data = res?.data || (Array.isArray(res) ? res : []);

        // Atualiza o estado logs com os registros recebidos da API.
        // Isso faz com que o React atualize a interface com os novos dados.
        setLogs(data);
      } catch (error) {
        // Caso a requisição apresente algum erro, mantém o histórico vazio.
        // Isso evita que dados incorretos sejam apresentados na página.
        setLogs([]);
      } finally {
        // Finaliza o carregamento independentemente de a requisição ter funcionado ou apresentado erro.
        setLoading(false);
      }
    };

    // Executa a função responsável por buscar os registros do histórico.
    load();
  }, []);

  // Função responsável por transformar uma data em um formato mais fácil de visualizar.
  // Recebe uma data como parâmetro e retorna a data formatada no padrão brasileiro.
  const formatDate = (date) => {
    // Verifica se existe uma data antes de tentar realizar a formatação.
    // Caso esteja vazia, retorna um traço na interface.
    if (!date) return '—';

    try {
      // new Date converte o valor recebido em um objeto de data do JavaScript.
      // toLocaleDateString formata a data utilizando o padrão brasileiro (pt-BR).
      // As opções definem que serão exibidos dia, mês, ano, hora, minuto e segundo.
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      // Se ocorrer algum erro durante a conversão, retorna o valor original recebido.
      return date;
    }
  };

 //filtragem de produtos que atendem as condições de pesquisa digitadas pelo usuário.
  const filtered = logs.filter((log) => {
    
    const term = searchTerm.toLowerCase();

    // Verifica se o texto pesquisado aparece em algum dos campos do registro.
    // O operador || significa OU: basta uma das condições ser verdadeira para manter o registro.
    
    return (
      (log.usuario_nome || '').toLowerCase().includes(term) || // O uso de || '' evita erros caso alguma propriedade esteja vazia ou não exista.
      (log.tipo_operacao || '').toLowerCase().includes(term) || 
      (log.descricao || '').toLowerCase().includes(term) ||
      (log.produto_nome || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Histórico & Trilha de Auditoria</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registro imutável de todas as ações operacionais e eventos de estoque.
          </p>
        </div>
      </div>

      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
        <Input
          placeholder="Filtrar por usuário, ação, produto ou descrição da operação..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400 bg-[#0c1326]">
                <th className="py-3 px-6 font-semibold">Data / Hora</th>
                <th className="py-3 px-6 font-semibold">Usuário Responsável</th>
                <th className="py-3 px-6 font-semibold">Operação</th>
                <th className="py-3 px-6 font-semibold">Produto / Alvo</th>
                <th className="py-3 px-6 font-semibold">Descrição do Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17223e]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Carregando histórico do banco de dados...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#121c38]/60 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {formatDate(item.data_hora)}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-200">
                      {item.usuario_nome || 'Sistema'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#162244] text-indigo-300 border border-[#233566]">
                        {item.tipo_operacao}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300 font-medium">
                      {item.produto_nome ? (
                        <div>
                          <span>{item.produto_nome}</span>
                          {item.produto_codigo && (
                            <span className="block font-mono text-[11px] text-slate-400">
                              {item.produto_codigo}
                            </span>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      {item.descricao}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default HistoricoPage;
