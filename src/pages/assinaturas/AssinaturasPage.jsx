import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { RoleBadge, StatusBadge } from '../../components/common/Badge';
import { Search, CreditCard, UserPlus, Calendar } from 'lucide-react';
import inventoryService from '../../api/inventory';
import { getErrorMessage } from '../../utils/errorParser';
import { useAuth } from '../../context/useAuth';

export function AssinaturasPage() {
  const { hasRole, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [assinaturas, setAssinaturas] = useState([]);
  const [minhaAssinatura, setMinhaAssinatura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form states
  const [form, setForm] = useState({
    usuario_id: '',
    plano: 'FREE',
    data_inicio: new Date().toISOString().split('T')[0],
  });

  const canManage = hasRole(['ADMIN']);

  const loadData = async () => {
    try {
      setLoading(true);

      if (canManage) {
        const res = await inventoryService.getAssinaturas({ limit: 100 });
        const items = res?.data || (Array.isArray(res) ? res : []);
        setAssinaturas(items);
      } else {
        const res = await inventoryService.getMinhaAssinatura();
        setMinhaAssinatura(res);
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.usuario_id) {
      setModalError('Selecione um usuário para a assinatura.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');
      await inventoryService.createAssinatura({
        usuario_id: Number(form.usuario_id),
        plano: form.plano,
        data_inicio: form.data_inicio,
      });

      setShowModal(false);
      setForm({ usuario_id: '', plano: 'FREE', data_inicio: new Date().toISOString().split('T')[0] });
      setFeedback({ type: 'success', message: 'Assinatura criada com sucesso!' });
      await loadData();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await inventoryService.updateAssinaturaStatus(id, status);
      setFeedback({ type: 'success', message: `Status da assinatura alterado para ${status}!` });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'danger', message: getErrorMessage(err) });
    }
  };

  const filtered = assinaturas.filter((a) =>
    (a.usuario_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.usuario_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.plano || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanoLabel = (plano) => {
    const labels = {
      FREE: 'Gratuito',
      BASIC: 'Básico',
      PRO: 'Profissional',
      ENTERPRISE: 'Empresarial',
    };
    return labels[plano] || plano;
  };

  const getPlanoColor = (plano) => {
    const colors = {
      FREE: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      BASIC: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      PRO: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
      ENTERPRISE: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    };
    return colors[plano] || 'bg-slate-500/10 text-slate-300 border-slate-500/20';
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Assinaturas e Planos</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {canManage ? 'Gerenciamento de assinaturas de todos os usuários.' : 'Visualização do seu plano atual e limites de uso.'}
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => {
              setModalError('');
              setShowModal(true);
            }}
          >
            Nova Assinatura
          </Button>
        )}
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          onClose={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Minha Assinatura (para não-admins) ou Resumo */}
      {!canManage && minhaAssinatura && (
        <Card
          title="Minha Assinatura Atual"
          subtitle="Detalhes do seu plano e status"
          icon={CreditCard}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#10172a] border border-[#1e294b] rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Plano</p>
              <p className="text-lg font-bold text-white">{getPlanoLabel(minhaAssinatura.plano)}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono mt-2 ${getPlanoColor(minhaAssinatura.plano)}`}>
                {getPlanoLabel(minhaAssinatura.plano)}
              </span>
            </div>
            <div className="bg-[#10172a] border border-[#1e294b] rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <StatusBadge status={minhaAssinatura.status === 'ATIVO' ? 'success' : 'warning'} label={minhaAssinatura.status} />
            </div>
            <div className="bg-[#10172a] border border-[#1e294b] rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Início</p>
              <p className="text-base font-mono text-white">{formatDate(minhaAssinatura.data_inicio)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Assinaturas (ADMIN) */}
      {canManage && (
        <>
          <div className="bg-[#0d1428] border border-[#1b2649] rounded-2xl p-4">
            <Input
              placeholder="Pesquisar por usuário, e-mail, plano ou status..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Carregando assinaturas...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-[#0e162c] border border-[#1e2a4a] rounded-2xl p-6 text-slate-400 text-sm">
              Nenhuma assinatura encontrada.
            </div>
          ) : (
            <Card bodyClassName="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#1b2542] text-[11px] uppercase tracking-wider text-slate-400 bg-[#0c1326]">
                      <th className="py-3 px-6 font-semibold">Usuário</th>
                      <th className="py-3 px-6 font-semibold">E-mail</th>
                      <th className="py-3 px-6 font-semibold text-center">Plano</th>
                      <th className="py-3 px-6 font-semibold text-center">Status</th>
                      <th className="py-3 px-6 font-semibold text-center">Início</th>
                      <th className="py-3 px-6 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17223e]">
                    {filtered.map((assinatura) => (
                      <tr key={assinatura.id} className="hover:bg-[#121c38]/60 transition-colors">
                        <td className="py-4 px-6 font-medium text-slate-100 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
                            {(assinatura.usuario_nome || 'U').charAt(0)}
                          </div>
                          <span>{assinatura.usuario_nome || 'Usuário'}</span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-300 font-mono">
                          {assinatura.usuario_email || '—'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono ${getPlanoColor(assinatura.plano)}`}>
                            {getPlanoLabel(assinatura.plano)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <StatusBadge
                            status={assinatura.status === 'ATIVO' ? 'success' : assinatura.status === 'CANCELADO' ? 'danger' : 'warning'}
                            label={assinatura.status}
                          />
                        </td>
                        <td className="py-4 px-6 text-center text-xs text-slate-400 font-mono">
                          {formatDate(assinatura.data_inicio)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {assinatura.status !== 'ATIVO' && (
                              <button
                                onClick={() => handleUpdateStatus(assinatura.id, 'ATIVO')}
                                title="Ativar assinatura"
                                className="text-slate-500 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {assinatura.status !== 'CANCELADO' && (
                              <button
                                onClick={() => handleUpdateStatus(assinatura.id, 'CANCELADO')}
                                title="Cancelar assinatura"
                                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Modal Nova Assinatura */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e162c] border border-[#1e2a4a] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Nova Assinatura</h3>

            {modalError && (
              <div className="mb-4">
                <Alert type="danger">{modalError}</Alert>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Usuário *"
                placeholder="Selecione o usuário..."
                value={form.usuario_id}
                onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}
                required
                as="select"
                options={[
                  { value: '', label: 'Selecione um usuário...' },
                  // Os usuários seriam carregados dinamicamente
                ]}
              />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Plano *
                </label>
                <select
                  value={form.plano}
                  onChange={(e) => setForm({ ...form, plano: e.target.value })}
                  className="w-full bg-[#10172a] border border-[#1e294b] text-slate-100 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="FREE">Gratuito (FREE)</option>
                  <option value="BASIC">Básico (BASIC)</option>
                  <option value="PRO">Profissional (PRO)</option>
                  <option value="ENTERPRISE">Empresarial (ENTERPRISE)</option>
                </select>
              </div>

              <Input
                label="Data de Início *"
                type="date"
                value={form.data_inicio}
                onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                required
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
                  isLoading={submitting}
                >
                  Criar Assinatura
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Check(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function X(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default AssinaturasPage;