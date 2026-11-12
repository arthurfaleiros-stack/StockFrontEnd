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
  AlertCircle,
  Inbox,
  ShieldCheck,
} from 'lucide-react';

export function ForgotPasswordWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Estados do formulário
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState(''); // Começa ESTRITAMENTE VAZIO, sem autofill
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Auxiliares visuais
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Estados de controle
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-preenchimento caso o usuário clique no link recebido por e-mail
  useEffect(() => {
    const urlToken = searchParams.get('token') || searchParams.get('codigo');
    const urlEmail = searchParams.get('email');
    if (urlEmail) {
      setEmail(urlEmail);
    }
    if (urlToken) {
      const clean = urlToken.trim();
      setCodigo(clean);
      setStep(2);
      setInfoMessage('Código de verificação carregado automaticamente do link! Defina sua nova senha.');
    }
  }, [searchParams]);

  // Validação da Etapa 1 (E-mail)
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

  // Validação da Etapa 2 (Código digitado manualmente + Senha)
  function validateStep2() {
    const newErrors = {};
    const cleanCode = codigo.trim();

    if (!cleanCode) {
      newErrors.codigo = 'Informe o código de verificação recebido no seu e-mail.';
    } else if (cleanCode.length < 6) {
      newErrors.codigo = 'O código deve conter 6 dígitos numéricos.';
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

  // Envio do código de 6 dígitos para o e-mail
  async function handleSolicitarCodigo(e) {
    e.preventDefault();
    setApiError('');
    setInfoMessage('');

    if (!validateStep1()) return;

    setIsSubmitting(true);
    try {
      const response = await authService.solicitarReset(email.trim());
      setInfoMessage(
        response.message ||
          `Enviamos um código de verificação para ${email}. Acesse sua caixa de e-mail para consultá-lo.`
      );

      // Garante que o código permaneça vazio para o usuário digitar
      setCodigo('');
      setStep(2);
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Confirmação do código digitado e alteração de senha
  async function handleConfirmarCodigo(e) {
    e.preventDefault();
    setApiError('');

    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {
      await authService.confirmarReset({
        email: email.trim(),
        codigo: codigo.trim(),
        novaSenha,
      });

      navigate('/login', {
        state: {
          message: 'Senha alterada com sucesso! Faça login com sua nova senha.',
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
          borderRadius: '16px',
          padding: '32px',
          boxSizing: 'border-box',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Logo KeepStock */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0' }}>
            <span style={{ color: '#ffffff' }}>Keep</span>
            <span style={{ color: '#7c80f8' }}>Stock</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0 0' }}>
            Recuperação de Acesso Corporativo
          </p>
        </div>

        {/* Indicador Visual das Etapas */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            padding: '10px 14px',
            backgroundColor: '#0f172a',
            borderRadius: '10px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
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
              Solicitar Código
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
                width: '26px',
                height: '26px',
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
              Validar & Redefinir
            </span>
          </div>
        </div>

        {/* Mensagem Informativa de Envio */}
        {infoMessage && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              backgroundColor: '#0c4a6e',
              color: '#bae6fd',
              border: '1px solid #0284c7',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <Inbox size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ lineHeight: '1.5' }}>{infoMessage}</span>
          </div>
        )}

        {/* Mensagem de Erro da API */}
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

        {/* PASSO 1: INFORMAR E-MAIL */}
        {step === 1 && (
          <form onSubmit={handleSolicitarCodigo} noValidate>
            <div style={{ marginBottom: '16px' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 0 6px',
                }}
              >
                Esqueceu sua senha?
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0', lineHeight: '1.5' }}>
                Informe seu e-mail cadastrado. Enviaremos um <strong>código de verificação de 6 dígitos</strong> para que você comprove sua identidade.
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
                E-mail Cadastrado
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                style={{
                  width: '100%',
                  padding: '11px 12px',
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
                <p style={{ fontSize: '12px', color: '#fca5a5', margin: '4px 0 0' }}>
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
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
              {isSubmitting ? 'Enviando código...' : 'Enviar Código de Verificação'}
            </button>
          </form>
        )}

        {/* PASSO 2: DIGITAR O CÓDIGO RECEBIDO MANUALMENTE E CRIAR NOVA SENHA */}
        {step === 2 && (
          <form onSubmit={handleConfirmarCodigo} noValidate>
            <div style={{ marginBottom: '16px' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 0 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ShieldCheck size={18} color="#38bdf8" />
                Digite o Código e sua Nova Senha
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0', lineHeight: '1.5' }}>
                Verifique a mensagem enviada para <strong style={{ color: '#ffffff' }}>{email}</strong>, copie o código de 6 dígitos e digite abaixo:
              </p>
            </div>

            {/* Campo do Código de 6 Dígitos (VAZIO, DIGITADO MANUALMENTE) */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="codigo"
                htmlFor="codigo"
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
                Código de Verificação (6 dígitos)
              </label>

              <input
                id="codigo"
                id="codigo"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 489201"
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '18px',
                  fontWeight: '700',
                  letterSpacing: '6px',
                  textAlign: 'center',
                  border: errors.codigo ? '1px solid #dc2626' : '1px solid #6366f1',
                  borderRadius: '8px',
                  color: '#38bdf8',
                  backgroundColor: '#0f172a',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />

              {errors.codigo && (
                <p style={{ fontSize: '12px', color: '#fca5a5', margin: '4px 0 0', textAlign: 'center' }}>
                  {errors.codigo}
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
                  placeholder="Mínimo de 6 caracteres"
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 12px',
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
                <p style={{ fontSize: '12px', color: '#fca5a5', margin: '4px 0 0' }}>
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
                  placeholder="Digite a nova senha novamente"
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 12px',
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
                <p style={{ fontSize: '12px', color: '#fca5a5', margin: '4px 0 0' }}>
                  {errors.confirmarSenha}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
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
              {isSubmitting ? 'Validando...' : 'Validar Código e Redefinir Senha'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCodigo('');
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
              Não recebeu? Reenviar código ou trocar e-mail
            </button>
          </form>
        )}

        {/* Rodapé / Voltar ao Login */}
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
