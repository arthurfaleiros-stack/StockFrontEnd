import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { Plus, Search, FolderTree, Trash2 } from 'lucide-react';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';
import { useAuth } from '../../context/useAuth';

export function CategoriasPage() {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'danger', message: '' }
  const [modalError, setModalError] = useState('');

  // Form states
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getCategorias({ limit: 100 });
      const items = res?.data || (Array.isArray(res) ? res : []);
      setCategorias(items);
    } catch (err) {
      setFeedback({ type: 'danger', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setModalError('O nome da categoria é obrigatório.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');
      await inventoryService.createCategoria({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
      });

      setShowModal(false);
      setNome('');
      setDescricao('');
      setFeedback({ type: 'success', message: 'Categoria cadastrada com sucesso!' });
      await loadCategorias();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, catNome) => {
    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${catNome}"?`)) {
      return;
    }
    try {
      await inventoryService.deleteCategoria(id);
      setFeedback({ type: 'success', message: 'Categoria removida com sucesso!' });
      await loadCategorias();
    } catch (err) {
      setFeedback({ type: 'danger', message: getErrorMessage(err) });
    }
  };

  const filtered = categorias.filter((c) =>
    (c.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManage = hasRole(['ADMIN', 'GERENTE']);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Categorias de Produtos</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Segmentação e organização do catálogo de inventário.
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
            Nova Categoria
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
          placeholder="Pesquisar por nome ou descrição da categoria..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando categorias...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#0e162c] border border-[#1e2a4a] rounded-2xl p-6 text-slate-400 text-sm">
          Nenhuma categoria encontrada. Cadastre uma categoria para poder vincular aos produtos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="bg-[#0e162c] border border-[#1e2a4a] hover:border-indigo-500/40 rounded-2xl p-5 transition-all group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <FolderTree className="w-5 h-5" />
                </div>
                {canManage && (
                  <button
                    onClick={() => handleDelete(cat.id, cat.nome)}
                    title="Excluir categoria"
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                {cat.nome}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {cat.descricao || 'Sem descrição cadastrada.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nova Categoria */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Nova Categoria</h3>

            {modalError && (
              <div className="mb-4">
                <Alert type="danger" message={modalError} />
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Nome da Categoria *"
                placeholder="Ex: Sensores, Conectores, Elétrica"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <Input
                label="Descrição"
                placeholder="Ex: Dispositivos de detecção industrial"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
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
                  Salvar Categoria
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriasPage;
