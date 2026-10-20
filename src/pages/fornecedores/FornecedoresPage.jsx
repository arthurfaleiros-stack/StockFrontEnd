import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { Truck, Plus, Search, Trash2, MapPin, User, FileText } from 'lucide-react';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';
import { useAuth } from '../../context/useAuth';

export function FornecedoresPage() {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form states
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contato, setContato] = useState('');
  const [endereco, setEndereco] = useState('');

  const loadFornecedores = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getFornecedores({ limit: 100 });
      const items = res?.data || (Array.isArray(res) ? res : []);
      setFornecedores(items);
    } catch (err) {
      setFeedback({ type: 'danger', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFornecedores();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !cnpj.trim()) {
      setModalError('Nome/Razão Social e CNPJ são obrigatórios.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');
      await inventoryService.createFornecedor({
        nome: nome.trim(),
        cnpj: cnpj.trim(),
        contato: contato.trim() || undefined,
        endereco: endereco.trim() || undefined,
      });

      setShowModal(false);
      setNome('');
      setCnpj('');
      setContato('');
      setEndereco('');
      setFeedback({ type: 'success', message: 'Fornecedor cadastrado com sucesso!' });
      await loadFornecedores();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, fornNome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o fornecedor "${fornNome}"?`)) {
      return;
    }
    try {
      await inventoryService.deleteFornecedor(id);
      setFeedback({ type: 'success', message: 'Fornecedor removido com sucesso!' });
      await loadFornecedores();
    } catch (err) {
      setFeedback({ type: 'danger', message: getErrorMessage(err) });
    }
  };

  const filtered = fornecedores.filter((f) =>
    (f.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.cnpj || '').includes(searchTerm) ||
    (f.contato || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManage = hasRole(['ADMIN', 'GERENTE']);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Fornecedores Cadastrados</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Parceiros comerciais e canais de suprimento de estoque.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setModalError('');
              setShowModal(true);
            }}
          >
            Novo Fornecedor
          </Button>
        )}
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
        <Input
          placeholder="Pesquisar por Razão Social, CNPJ ou Nome de Contato..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando fornecedores...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#0e162c] border border-[#1e2a4a] rounded-2xl p-6 text-slate-400 text-sm">
          Nenhum fornecedor encontrado. Cadastre um fornecedor para poder vincular aos produtos.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="bg-[#0e162c] border border-[#1e2a4a] hover:border-indigo-500/40 rounded-2xl p-5 transition-all relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{f.nome}</h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    CNPJ: {f.cnpj}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                    <Truck className="w-4 h-4" />
                  </span>
                  {canManage && (
                    <button
                      onClick={() => handleDelete(f.id, f.nome)}
                      title="Excluir fornecedor"
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#17223e] space-y-2 text-xs text-slate-300">
                {f.contato && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Contato: {f.contato}</span>
                  </div>
                )}
                {f.endereco && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{f.endereco}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Novo Fornecedor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Novo Fornecedor</h3>

            {modalError && (
              <div className="mb-4">
                <Alert type="danger" message={modalError} />
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Razão Social / Nome *"
                placeholder="Ex: Distribuidora Nacional de Peças"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <Input
                label="CNPJ *"
                placeholder="Ex: 00.000.000/0001-91"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                required
              />

              <Input
                label="Nome do Contato / Telefone"
                placeholder="Ex: João da Silva (11) 99999-9999"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
              />

              <Input
                label="Endereço / Localidade"
                placeholder="Ex: Av. Industrial, 1500 - São Paulo/SP"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={submitting}
                >
                  Salvar Fornecedor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FornecedoresPage;
