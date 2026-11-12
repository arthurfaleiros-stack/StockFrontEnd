
import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { Search } from 'lucide-react';
import inventoryService from '../../api/inventory';

const HistoricoPage = () => {

  // Armazena o texto digitado pelo usuário no campo de pesquisa.
  // O setSearchTerm permite atualizar esse texto e fazer com que a lista seja filtrada automaticamente.
  const [searchTerm, setSearchTerm] = useState('');

  // Armazena os registros de auditoria recebidos do backend.
  // Inicialmente, o array começa vazio até que a requisição à API seja concluída.
  const [logs, setLogs] = useState([]);

  // Controla se a página está aguardando o carregamento dos registros.
  // Enquanto estiver true, a interface apresenta uma mensagem de carregamento.
  const [loading, setLoading] = useState(true);

  // useEffect executa uma função quando o componente é carregado.
  // Como o array de dependências está vazio, a consulta ao histórico acontece apenas na montagem da página.
  useEffect(() => {

    // Função assíncrona responsável por solicitar os registros de auditoria ao backend.
    // O async permite utilizar await para aguardar a conclusão da requisição.
    const load = async () => {

      // Ativa o estado de carregamento antes de iniciar a consulta à API.
      setLoading(true);

      try {

        // Utiliza o inventoryService para consultar a rota de histórico do backend.
        // O parâmetro limit: 100 solicita até 100 registros.
        // O await aguarda a resposta do servidor antes de executar as próximas instruções.
        const res = await inventoryService.getHistorico({ limit: 100 });

        // Verifica o formato dos dados recebidos do backend.
        // Se a resposta possuir a propriedade data, utiliza os registros armazenados nela.
        // Caso a própria resposta já seja um array, utiliza esse array diretamente.
        // Se nenhum dos formatos for encontrado, define um array vazio para evitar erros.
        const data = res?.data || (Array.isArray(res) ? res : []);

        // Armazena os registros recebidos no estado logs.
        // A atualização desse estado faz o React renderizar novamente a página com os dados.
        setLogs(data);

      } catch (error) {

        // Executa caso aconteça algum erro durante a comunicação com a API.
        // Nesse caso, mantém a lista vazia para não apresentar informações incorretas.
        setLogs([]);

      } finally {

        // Executa independentemente de a requisição ter sido concluída com sucesso ou erro.
        // Desativa o carregamento para permitir que a interface apresente os resultados ou a mensagem de erro.
        setLoading(false);
      }
    };

    // Chama a função load para iniciar a busca dos registros de auditoria.
    load();

  }, []);

  // Função responsável por converter e formatar as datas recebidas do backend.
  // Recebe uma data como parâmetro e retorna seu valor no padrão brasileiro.
  const formatDate = (date) => {

    // Verifica se o valor recebido contém uma data.
    // Caso esteja vazio ou não exista, retorna um traço para representar a ausência da informação.
    if (!date) return '—';

    try {

      // new Date converte o valor recebido em um objeto de data do JavaScript.
      // toLocaleDateString transforma essa data em um formato de fácil leitura.
      // O parâmetro pt-BR define o padrão brasileiro de apresentação.
      // As opções abaixo determinam a exibição de dia, mês, ano, hora, minuto e segundo.
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

    } catch {

      // Caso aconteça algum erro durante a conversão da data,
      // retorna o valor original para evitar que a informação seja perdida.
      return date;
    }
  };

  // Cria uma nova lista com os registros que correspondem ao texto digitado pelo usuário.
  // O método filter percorre o array logs e mantém somente os registros que atendem às condições de pesquisa.
  const filtered = logs.filter((log) => {

    // Converte o texto pesquisado para letras minúsculas.
    // Isso permite comparar os textos sem diferenciar letras maiúsculas e minúsculas.
    const term = searchTerm.toLowerCase();

    // Verifica se o texto pesquisado aparece em algum dos campos do registro.
    // O operador || significa OU, portanto basta uma das condições ser verdadeira para manter o registro.
    // O uso de || '' substitui valores vazios ou inexistentes por uma string vazia,
    // evitando erros ao executar toLowerCase() e includes().
    return (
      (log.usuario_nome || '').toLowerCase().includes(term) ||
      (log.tipo_operacao || '').toLowerCase().includes(term) ||
      (log.descricao || '').toLowerCase().includes(term) ||
      (log.produto_nome || '').toLowerCase().includes(term)
    );
  });

  // Retorna a estrutura visual da página de histórico e auditoria.
  // O JSX permite combinar elementos HTML, componentes React e informações recebidas do backend.
  return (
    // Container principal que organiza todos os elementos da página.
    // space-y-6 adiciona espaçamento vertical entre os elementos filhos.
    <div className="space-y-6">

      {/* Cabeçalho da página, contendo o título e a descrição da funcionalidade. */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>

          {/* Título principal exibido no topo da página. */}
          <h1 className="text-xl sm:text-2xl font-black text-white">Histórico & Trilha de Auditoria</h1>

          {/* Texto explicativo que informa a finalidade da página ao usuário. */}
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registro imutável de todas as ações operacionais e eventos de estoque.
          </p>
        </div>
      </div>

      {/* Container visual que envolve o campo de pesquisa. */}
      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">

        {/* Campo utilizado para pesquisar registros por usuário, operação, produto ou descrição.
            O placeholder apresenta uma orientação, o icon adiciona o símbolo de pesquisa,
            o value mantém o campo sincronizado com searchTerm e o onChange atualiza esse estado
            sempre que o usuário digita um novo texto. */}
        <Input
          placeholder="Filtrar por usuário, ação, produto ou descrição da operação..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Componente Card utilizado como container visual para organizar a tabela.
          bodyClassName="p-0" remove o espaçamento interno do conteúdo do Card. */}
      <Card bodyClassName="p-0">

        {/* Container que permite a rolagem horizontal da tabela quando ela ultrapassa
            a largura disponível na tela, melhorando a visualização em dispositivos menores. */}
        <div className="overflow-x-auto">

          {/* Tabela responsável por apresentar os registros de auditoria.
              w-full ocupa toda a largura disponível, text-left alinha o conteúdo à esquerda
              e text-sm define o tamanho dos textos. */}
          <table className="w-full text-left text-sm">

            {/* Cabeçalho da tabela, responsável por identificar as informações de cada coluna. */}
            <thead>
              <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400 bg-[#0c1326]">

                {/* Coluna que apresenta a data e o horário em que a operação foi registrada. */}
                <th className="py-3 px-6 font-semibold">Data / Hora</th>

                {/* Coluna que identifica o usuário responsável pela operação realizada. */}
                <th className="py-3 px-6 font-semibold">Usuário Responsável</th>

                {/* Coluna que apresenta o tipo de operação registrada no histórico. */}
                <th className="py-3 px-6 font-semibold">Operação</th>

                {/* Coluna que identifica o produto relacionado à operação, quando existir. */}
                <th className="py-3 px-6 font-semibold">Produto / Alvo</th>

                {/* Coluna que apresenta uma descrição detalhada do evento registrado. */}
                <th className="py-3 px-6 font-semibold">Descrição do Evento</th>
              </tr>
            </thead>

            {/* Corpo da tabela, onde os registros recebidos da API serão apresentados. */}
            <tbody className="divide-y divide-[#17223e]">

              {/* Verifica se os dados ainda estão sendo carregados.
                  Se loading for true, apresenta uma mensagem de carregamento.
                  Caso contrário, verifica se existem registros correspondentes à pesquisa. */}
              {loading ? (

                // Primeira condição: enquanto a requisição estiver em andamento,
                // apresenta uma mensagem ocupando as cinco colunas da tabela.
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Carregando histórico do banco de dados...
                  </td>
                </tr>

              ) : filtered.length === 0 ? (

                // Segunda condição: se o carregamento terminou e nenhum registro foi encontrado,
                // apresenta uma mensagem informando que a pesquisa não retornou resultados.
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>

              ) : (

                // Terceira condição: se existem registros, utiliza map para percorrer o array filtered.
                // Para cada registro encontrado, cria uma linha da tabela com suas respectivas informações.
                filtered.map((item) => (

                  // Cria uma linha para cada registro de auditoria.
                  // key={item.id} fornece uma identificação única para o React acompanhar cada elemento da lista.
                  <tr key={item.id} className="hover:bg-[#121c38]/60 transition-colors">

                    {/* Apresenta a data e o horário da operação.
                        A função formatDate transforma o valor de data_hora em um formato legível. */}
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {formatDate(item.data_hora)}
                    </td>

                    {/* Apresenta o nome do usuário responsável pelo registro.
                        Caso usuario_nome esteja vazio ou não exista, apresenta a identificação "Sistema". */}
                    <td className="py-4 px-6 font-medium text-slate-200">
                      {item.usuario_nome || 'Sistema'}
                    </td>

                    {/* Apresenta o tipo de operação realizada.
                        O elemento span permite aplicar uma aparência de etiqueta ao tipo de operação. */}
                    <td className="py-4 px-6">
                      <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#162244] text-indigo-300 border border-[#233566]">
                        {item.tipo_operacao}
                      </span>
                    </td>

                    {/* Apresenta as informações do produto relacionado ao registro.
                        Primeiro verifica se existe um nome de produto antes de exibir seus dados. */}
                    <td className="py-4 px-6 text-xs text-slate-300 font-medium">

                      {/* Se produto_nome existir, apresenta o nome do produto.
                          Caso contrário, apresenta um traço indicando que não há produto associado. */}
                      {item.produto_nome ? (
                        <div>

                          {/* Exibe o nome do produto relacionado à movimentação. */}
                          <span>{item.produto_nome}</span>

                          {/* Verifica se existe um código para o produto.
                              O operador && permite apresentar o elemento somente quando produto_codigo possuir valor. */}
                          {item.produto_codigo && (
                            <span className="block font-mono text-[11px] text-slate-400">

                              {/* Apresenta o código de identificação do produto abaixo do seu nome. */}
                              {item.produto_codigo}
                            </span>
                          )}
                        </div>
                      ) : (

                        // Caso o registro não esteja associado a um produto, apresenta um traço.
                        '—'
                      )}
                    </td>

                    {/* Apresenta a descrição do evento armazenada no registro de auditoria.
                        Essa informação permite identificar com mais detalhes o que aconteceu no sistema. */}
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

// Exporta o componente HistoricoPage para que ele possa ser importado e utilizado nas rotas do React.
export default HistoricoPage;
