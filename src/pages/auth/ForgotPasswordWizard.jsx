import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../api/auth';
import { getErrorMessage } from '../../utils/errorParser';
import { isValidEmail } from '../../utils/validators';
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Inbox,
} from 'lucide-react';

export function ForgotPasswordWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Estados principais
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Auxiliares de UI
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se o usuário clicar diretamente no link recebido no e-mail (ex: ?token=xyz&email=teste@empresa.com)
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');

    if (urlEmail) {
      setEmail(urlEmail);
    }

    if (urlToken) {
      setToken(urlToken);
      setStep(2);
      setInfoMessage('Link de e-mail validado. Agora defina sua nova senha.');
    }
  }, [searchParams]);

  // Validação do Passo 1
  function validateStep1() {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Informe o e-mail cadastrado.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Formato de e-mail inválido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Validação do Passo 2
  function validateStep2() {
    const newErrors = {};
    if (!token.trim()) {
      newErrors.token = 'Informe o token recebido no seu e-mail.';
    }
    if (!novaSenha) {
      newErrors.novaSenha = 'A nova senha é obrigatória.';
    } else if (novaSenha.length < 6) {
      newErrors.novaSenha = 'A senha deve conter no mínimo 6 caracteres.';
    }
    if (!confirmarSenha) {
      newErrors.confirmarSenha = 'Confirme sua nova senha.';
    } else if (novaSenha !== confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Enviar pedido de recuperação (Passo 1)
  async function handleSolicitarReset(e) {
    e.preventDefault();
    setApiError('');
    setInfoMessage('');

    if (!validateStep1()) return;

    setIsSubmitting(true);
    try {
      const response = await authService.solicitarReset(email);
      setInfoMessage(
        response.message ||
          `Enviamos um e-mail com as instruções para ${email}. Verifique sua caixa de entrada e pasta de spam para pegar o token.`
      );

      // O token NÃO é preenchido aqui: o usuário DEVE consultar seu e-mail real!
      setToken('');
      setStep(2);
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Confirmar redefinição da nova senha (Passo 2)
  async function handleConfirmarReset(e) {
    e.preventDefault();
    setApiError('');

    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {
      await authService.confirmarReset(token, novaSenha);
      navigate('/login', {
        state: {
          message: 'Senha redefinida com sucesso! Faça login com suas novas credenciais.',
        },
      });
    } catch (error) {
      setApiError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '32px',
          boxSizing: 'border-box',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Cabeçalho / Logo */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0' }}>
            <span style={{ color: '#ffffff' }}>Keep</span>
            <span style={{ color: '#7c80f8' }}>Stock</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '6px 0 0' }}>
            Recuperação de Acesso ao Sistema
          </p>
        </div>

        {/* Indicador de Etapas */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            padding: '8px 12px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step === 1 ? '#4f46e5' : '#10b981',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              {step === 1 ? '1' : <Check size={14} />}
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: step === 1 ? '#ffffff' : '#94a3b8',
              }}
            >
              E-mail
            </span>
          </div>

          <div
            style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#334155',
              margin: '0 12px',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step === 2 ? '#4f46e5' : '#334155',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              2
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: step === 2 ? '#ffffff' : '#64748b',
              }}
            >
              Validação & Senha
            </span>
          </div>
        </div>

        {/* Mensagem Informativa de Envio de E-mail */}
        {infoMessage && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              backgroundColor: '#0c4a6e',
              color: '#bae6fd',
              border: '1px solid #0284c7',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <Inbox size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Alerta de Erro */}
        {apiError && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              backgroundColor: '#450a0a',
              color: '#fecaca',
              border: '1px solid #991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{apiError}</span>
          </div>
        )}

        {/* ETAPA 1: SOLICITAR TOKEN VIA E-MAIL */}
        {step === 1 && (
          <form onSubmit={handleSolicitarReset} noValidate>
            <div style={{ marginBottom: '16px' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 6px',
                }}
              >
                Esqueceu sua senha?
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0' }}>
                Informe seu e-mail cadastrado. Enviaremos um token e link de recuperação diretamente para sua caixa de entrada.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '6px',
                }}
              >
                <Mail size={14} color="#818cf8" />
                E-mail
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@kstock.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: errors.email ? '1px solid #dc2626' : '1px solid #475569',
                  borderRadius: '8px',
                  color: '#ffffff',
                  backgroundColor: '#0f172a',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />

              {errors.email && (
                <p style={{ fontSize: '12px', color: '#fca5a5', marginTop: '4px', margin: '4px 0 0' }}>
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: isSubmitting ? '#6366f1' : '#4f46e5',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {isSubmitting ? 'Enviando e-mail...' : 'Enviar Link e Token por E-mail'}
            </button>
          </form>
        )}

        {/* ETAPA 2: DIGITAR O TOKEN RECEBIDO NO E-MAIL E DEFINIR NOVA SENHA */}
        {step === 2 && (
          <form onSubmit={handleConfirmarReset} noValidate>
            <div style={{ marginBottom: '16px' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 6px',
                }}
              >
                Confirmar Identidade e Nova Senha
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0' }}>
                Abra seu e-mail, localize a mensagem do KeepStock e copie o token de validação recebido.
              </p>
            </div>

            {/* Campo Token - VAZIO, exige que o usuário consulte seu e-mail */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="token"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '6px',
                }}
              >
                <KeyRound size={14} color="#818cf8" />
                Token recebido por e-mail
              </label>

              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole aqui o token de validação recebido no seu e-mail"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  border: errors.token ? '1px solid #dc2626' : '1px solid #475569',
                  borderRadius: '8px',
                  color: '#ffffff',
                  backgroundColor: '#0f172a',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />

              {errors.token && (
                <p style={{ fontSize: '12px', color: '#fca5a5', marginTop: '4px', margin: '4px 0 0' }}>
                  {errors.token}
                </p>
              )}
            </div>

            {/* Nova Senha */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="novaSenha"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '6px',
                }}
              >
                <Lock size={14} color="#818cf8" />
                Nova Senha
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="novaSenha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    fontSize: '14px',
                    border: errors.novaSenha ? '1px solid #dc2626' : '1px solid #475569',
                    borderRadius: '8px',
                    color: '#ffffff',
                    backgroundColor: '#0f172a',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.novaSenha && (
                <p style={{ fontSize: '12px', color: '#fca5a5', marginTop: '4px', margin: '4px 0 0' }}>
                  {errors.novaSenha}
                </p>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="confirmarSenha"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '6px',
                }}
              >
                <Lock size={14} color="#818cf8" />
                Confirmar Nova Senha
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="confirmarSenha"
                  type={mostrarConfirmar ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    fontSize: '14px',
                    border: errors.confirmarSenha ? '1px solid #dc2626' : '1px solid #475569',
                    borderRadius: '8px',
                    color: '#ffffff',
                    backgroundColor: '#0f172a',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  {mostrarConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.confirmarSenha && (
                <p style={{ fontSize: '12px', color: '#fca5a5', marginTop: '4px', margin: '4px 0 0' }}>
                  {errors.confirmarSenha}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: isSubmitting ? '#6366f1' : '#4f46e5',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginBottom: '12px',
              }}
            >
              {isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setApiError('');
              }}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '12px',
                color: '#94a3b8',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Reenviar e-mail / Alterar e-mail informado
            </button>
          </form>
        )}

        {/* Rodapé / Link de Retorno */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #334155',
            fontSize: '13px',
            color: '#cbd5e1',
          }}
        >
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#a5b4fc',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} />
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordWizard;
