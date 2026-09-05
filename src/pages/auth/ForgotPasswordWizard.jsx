import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import StepProgress from '../../components/common/StepProgress';
import { Boxes, Mail, KeyRound, Lock, ArrowLeft, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { isValidEmail, evaluatePasswordStrength } from '../../utils/validators';
import { parseApiError } from '../../utils/errorParser';

export function ForgotPasswordWizard() {
  const navigate = useNavigate();

  // ESTADOS EM MEMÓRIA (NUNCA NO LOCALSTORAGE, CONFORME REQUISITO)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  // Estados de controle e feedback da UI
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Temporizador para reenvio de código (60s)
  const [countdown, setCountdown] = useState(0);

  // Refs para caixas de 6 dígitos
  const digitRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Medidor de força da nova senha na etapa 3
  const passwordStrength = evaluatePasswordStrength(novaSenha);

  // ==========================================
  // ETAPA 1: SOLICITAR CÓDIGO (FORGOT-PASSWORD)
  // ==========================================
  const handleRequestCode = async (e) => {
    e?.preventDefault();
    setApiError(null);
    setInfoMessage(null);

    if (!email.trim()) {
      setFieldErrors({ email: 'Informe o endereço de e-mail.' });
      return;
    }
    if (!isValidEmail(email)) {
      setFieldErrors({ email: 'Informe um formato de e-mail válido.' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Chama POST /api/v1/auth/forgot-password (email)
      await authService.forgotPassword(email);

      // Mensagem genérica sem confirmar se o e-mail existe
      setInfoMessage(
        'Caso o e-mail informado esteja cadastrado em nossa base, um código de 6 dígitos foi enviado. Verifique sua caixa de entrada e spam.'
      );
      setCountdown(60);
      setStep(2);
    } catch (err) {
      // Mesmo em caso de erro, caso a API retorne mensagem genérica ou erro de rate-limit
      const parsed = parseApiError(err);
      setApiError(parsed);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reenviar código a partir da Etapa 2
  const handleResendCode = async () => {
    if (countdown > 0 || isSubmitting) return;

    setApiError(null);
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setInfoMessage('Novo código de verificação enviado para o seu e-mail.');
      setCountdown(60);
    } catch (err) {
      const parsed = parseApiError(err);
      setApiError(parsed);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ETAPA 2: VERIFICAR CÓDIGO (VERIFY-RESET-CODE)
  // ==========================================
  const handleVerifyCode = async (e) => {
    e?.preventDefault();
    setApiError(null);

    const cleanCode = codigo.replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setFieldErrors({ codigo: 'O código de verificação deve conter exatamente 6 dígitos.' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Chama POST /api/v1/auth/verify-reset-code (email, codigo)
      await authService.verifyResetCode(email, cleanCode);

      setInfoMessage('Código validado com sucesso! Agora defina sua nova senha.');
      setStep(3);
    } catch (err) {
      const parsed = parseApiError(err);
      setApiError(parsed);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualização dos inputs de 6 dígitos
  const handleDigitChange = (index, value) => {
    const numericValue = value.replace(/\D/g, '');
    const currentDigits = codigo.split('');

    if (numericValue.length > 1) {
      // Colagem de código de 6 dígitos
      const pasted = numericValue.slice(0, 6);
      setCodigo(pasted);
      const nextIndex = Math.min(pasted.length, 5);
      digitRefs.current[nextIndex]?.focus();
      return;
    }

    currentDigits[index] = numericValue;
    const newCode = currentDigits.join('').slice(0, 6);
    setCodigo(newCode);

    if (numericValue && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  // ==========================================
  // ETAPA 3: DEFINIR NOVA SENHA (RESET-PASSWORD)
  // ==========================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setApiError(null);

    const errors = {};
    if (!novaSenha) {
      errors.novaSenha = 'Por favor, defina sua nova senha.';
    } else if (novaSenha.length < 6) {
      errors.novaSenha = 'A senha deve conter ao menos 6 caracteres.';
    }

    if (!confirmarNovaSenha) {
      errors.confirmarNovaSenha = 'Confirme sua nova senha.';
    } else if (novaSenha !== confirmarNovaSenha) {
      errors.confirmarNovaSenha = 'As senhas não conferem.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Chama POST /api/v1/auth/reset-password (email, codigo, novaSenha)
      await authService.resetPassword(email, codigo, novaSenha);

      // Redireciona para o login com mensagem de confirmação
      navigate('/login', {
        state: {
          message: 'Sua senha foi redefinida com sucesso! Você já pode entrar com a nova senha.',
        },
      });
    } catch (err) {
      const parsed = parseApiError(err);
      setApiError(parsed);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-br from-indigo-600/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="w-full max-w-lg relative z-10">
        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/30 text-white mb-3">
            <Boxes className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Keep<span className="text-indigo-400">Stock</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recuperação e Redefinição de Acesso
          </p>
        </div>

        {/* Card do Wizard */}
        <div className="bg-[#0d1428]/90 border border-[#1b2749] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          {/* Indicador de Progresso Visual */}
          <StepProgress currentStep={step} />

          <div className="my-6 border-t border-[#172342]" />

          {/* Alertas de Notificação / Erros */}
          {infoMessage && (
            <div className="mb-5">
              <Alert type="info" onClose={() => setInfoMessage(null)}>
                {infoMessage}
              </Alert>
            </div>
          )}

          {apiError && (
            <div className="mb-5">
              <Alert
                type="error"
                title={apiError.code ? `Erro (${apiError.code})` : 'Falha na Operação'}
                onClose={() => setApiError(null)}
              >
                {apiError.message}
                {apiError.details && apiError.details !== apiError.message && (
                  <p className="text-xs text-rose-300/80 mt-1 font-mono">{String(apiError.details)}</p>
                )}
              </Alert>
            </div>
          )}

          {/* ==================================================== */}
          {/* ETAPA 1: ESQUECI MINHA SENHA (SOLICITAR CÓDIGO)      */}
          {/* ==================================================== */}
          {step === 1 && (
            <div>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <span>Esqueci minha senha</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Informe o e-mail cadastrado na sua conta. Enviaremos um código de segurança de 6 dígitos para verificação.
                </p>
              </div>

              <form onSubmit={handleRequestCode} className="space-y-4" noValidate>
                <Input
                  label="E-mail Cadastrado"
                  id="forgot-email"
                  type="email"
                  placeholder="usuario@empresa.com"
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

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isSubmitting}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Enviar Código de 6 Dígitos
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* ETAPA 2: VERIFICAR CÓDIGO (6 DÍGITOS)                */}
          {/* ==================================================== */}
          {step === 2 && (
            <div>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                  <span>Verificar Código</span>
                </h2>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>Código enviado para: <strong className="text-indigo-300">{email}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setCodigo('');
                      setApiError(null);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                  >
                    Alterar e-mail
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6" noValidate>
                {/* 6 Caixas de Dígitos */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 text-center">
                    Digite o código de 6 dígitos
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <input
                        key={idx}
                        ref={(el) => (digitRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={codigo[idx] || ''}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold bg-[#10172a] text-white border border-[#223157] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
                      />
                    ))}
                  </div>
                  {fieldErrors.codigo && (
                    <p className="text-center text-xs text-rose-400 mt-2 font-medium">
                      {fieldErrors.codigo}
                    </p>
                  )}
                </div>

                {/* Ação de validação */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isSubmitting}
                    icon={CheckCircle2}
                  >
                    Validar Código
                  </Button>

                  {/* Reenvio de Código com Limite de 60 segundos */}
                  <div className="text-center pt-2">
                    {countdown > 0 ? (
                      <p className="text-xs text-slate-400">
                        Não recebeu o código? Reenviar em{' '}
                        <span className="font-mono font-bold text-indigo-400">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isSubmitting}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reenviar novo código por e-mail</span>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* ETAPA 3: DEFINIR NOVA SENHA                          */}
          {/* ==================================================== */}
          {step === 3 && (
            <div>
              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Código validado com sucesso</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  <span>Definir Nova Senha</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Crie uma nova senha forte para a conta de <strong className="text-slate-200">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                <div>
                  <Input
                    label="Nova Senha"
                    id="reset-nova-senha"
                    type="password"
                    placeholder="Digite a nova senha"
                    icon={Lock}
                    value={novaSenha}
                    onChange={(e) => {
                      setNovaSenha(e.target.value);
                      if (fieldErrors.novaSenha) setFieldErrors((prev) => ({ ...prev, novaSenha: null }));
                    }}
                    error={fieldErrors.novaSenha}
                    autoComplete="new-password"
                    required
                  />

                  {/* Indicador de Força */}
                  {novaSenha.length > 0 && (
                    <div className="mt-2.5 p-3 rounded-xl bg-[#091022] border border-[#1a2544]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-medium">Força da Nova Senha:</span>
                        <span className={`font-semibold ${passwordStrength.color}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                        {[1, 2, 3, 4].map((s) => (
                          <div
                            key={s}
                            className={`h-full rounded-full transition-all duration-300 ${
                              passwordStrength.score >= s
                                ? passwordStrength.bgColor
                                : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirmar Nova Senha"
                  id="reset-confirmar-senha"
                  type="password"
                  placeholder="Repita a nova senha"
                  icon={Lock}
                  value={confirmarNovaSenha}
                  onChange={(e) => {
                    setConfirmarNovaSenha(e.target.value);
                    if (fieldErrors.confirmarNovaSenha)
                      setFieldErrors((prev) => ({ ...prev, confirmarNovaSenha: null }));
                  }}
                  error={fieldErrors.confirmarNovaSenha}
                  autoComplete="new-password"
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isSubmitting}
                    icon={CheckCircle2}
                  >
                    Salvar Nova Senha e Entrar
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Rodapé / Voltar ao Login */}
          <div className="mt-6 pt-5 border-t border-[#172342] text-center">
            <Link
              to="/login"
              className="font-medium text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lembrou da senha? Voltar ao login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordWizard;

