import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Boxes, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { isValidEmail } from '../../utils/validators';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, sessionNotice, clearSessionNotice } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mensagem passada via state ao redirecionar (ex: após cadastro ou reset de senha)
  const redirectedMessage = location.state?.message;
  const isSessionExpired = searchParams.get('expired') === '1' || !!sessionNotice;

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Informe o seu endereço de e-mail.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Digite um e-mail válido (exemplo: usuario@empresa.com).';
    }

    if (!senha) {
      errors.senha = 'Informe a sua senha de acesso.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await login(email, senha);

      if (!result.success) {
        setFormError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Redireciona para rota anterior solicitada ou dashboard
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch {
      setFormError({ message: 'Erro inesperado ao realizar login. Tente novamente.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-br from-indigo-600/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="w-full max-w-md relative z-10">
        {/* Cabeçalho do App / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/30 text-white mb-4">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Keep<span className="text-indigo-400">Stock</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Plataforma Integrada de Gestão de Inventário
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-[#0d1428]/90 border border-[#1b2749] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Acessar Conta</h2>
            <p className="text-xs text-slate-400 mt-1">
              Entre com suas credenciais para gerenciar o estoque.
            </p>
          </div>

          {/* Alertas contextuais */}
          {redirectedMessage && (
            <div className="mb-5">
              <Alert type="success">{redirectedMessage}</Alert>
            </div>
          )}

          {isSessionExpired && (
            <div className="mb-5">
              <Alert type="warning" onClose={clearSessionNotice}>
                {sessionNotice || 'Sua sessão expirou por inatividade. Faça login novamente para continuar.'}
              </Alert>
            </div>
          )}

          {formError && (
            <div className="mb-5">
              <Alert
                type="error"
                title={formError.code ? `Erro (${formError.code})` : 'Falha na Autenticação'}
                onClose={() => setFormError(null)}
              >
                {formError.message}
                {formError.details && formError.details !== formError.message && (
                  <p className="text-xs text-rose-300/80 mt-1 font-mono">{String(formError.details)}</p>
                )}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="E-mail"
              id="login-email"
              type="email"
              placeholder="seu.email@empresa.com"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
              }}
              error={fieldErrors.email}
              autoComplete="email"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Senha <span className="text-rose-400">*</span>
                </span>
                <Link
                  to="/esqueci-senha"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="login-senha"
                type="password"
                placeholder="Digite sua senha"
                icon={Lock}
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (fieldErrors.senha) setFieldErrors((prev) => ({ ...prev, senha: null }));
                }}
                error={fieldErrors.senha}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                icon={LogIn}
              >
                Entrar no Sistema
              </Button>
            </div>
          </form>

          {/* Rodapé do Card: Criar Conta */}
          <div className="mt-6 pt-5 border-t border-[#172342] text-center">
            <p className="text-xs text-slate-400">
              Não possui acesso cadastrado?{' '}
              <Link
                to="/cadastro"
                className="font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors ml-1"
              >
                <span>Criar nova conta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>

        {/* Rodapé externo com versão e info */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          KStock-API Integrada &bull; Comunicação Segura via JWT
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
