import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../api/auth';
import { getErrorMessage } from '../../utils/errorParser';
import { isValidEmail } from '../../utils/validators';
import './Auth.css';

// Tela de "Esqueci minha senha", dividida em 3 passos simples:
// 1) informar o e-mail  2) digitar o código recebido  3) criar a nova senha
export function ForgotPasswordWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Passo 1: envia o e-mail e pede pra API mandar o código
  async function handleRequestCode(e) {
    e.preventDefault();
    setApiError('');

    if (!isValidEmail(email)) {
      setErrors({ email: 'Informe um e-mail válido.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setInfoMessage('Se esse e-mail estiver cadastrado, um código de 6 dígitos foi enviado.');
      setStep(2);
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Passo 2: confere se o código digitado é válido
  async function handleVerifyCode(e) {
    e.preventDefault();
    setApiError('');

    if (codigo.trim().length !== 6) {
      setErrors({ codigo: 'O código tem 6 dígitos.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.verifyResetCode(email, codigo.trim());
      setInfoMessage('Código validado! Agora defina sua nova senha.');
      setStep(3);
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Passo 3: salva a nova senha
  async function handleResetPassword(e) {
    e.preventDefault();
    setApiError('');

    if (novaSenha.length < 6) {
      setErrors({ novaSenha: 'A senha precisa ter no mínimo 6 caracteres.' });
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setErrors({ confirmarNovaSenha: 'As senhas não coincidem.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(email, codigo.trim(), novaSenha);
      navigate('/login', {
        state: { message: 'Senha redefinida com sucesso! Faça login com a nova senha.' },
      });
    } catch (error) {
      setApiError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>KeepStock</h1>
          <p>Recuperação de senha</p>
        </div>

        <p className="step-indicator">Passo {step} de 3</p>

        {infoMessage && <div className="alert alert-info">{infoMessage}</div>}
        {apiError && <div className="alert alert-error">{apiError}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestCode} noValidate>
            <h2 className="auth-title">Qual é o seu e-mail?</h2>
            <div className="form-group">
              <label htmlFor="email">E-mail cadastrado</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} noValidate>
            <h2 className="auth-title">Digite o código recebido</h2>
            <div className="form-group">
              <label htmlFor="codigo">Código de 6 dígitos</label>
              <input
                id="codigo"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
              />
              {errors.codigo && <p className="form-error">{errors.codigo}</p>}
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verificando...' : 'Verificar código'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} noValidate>
            <h2 className="auth-title">Defina sua nova senha</h2>
            <div className="form-group">
              <label htmlFor="novaSenha">Nova senha</label>
              <input
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
              />
              {errors.novaSenha && <p className="form-error">{errors.novaSenha}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmarNovaSenha">Confirmar nova senha</label>
              <input
                id="confirmarNovaSenha"
                type="password"
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                placeholder="Digite a senha novamente"
              />
              {errors.confirmarNovaSenha && <p className="form-error">{errors.confirmarNovaSenha}</p>}
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Lembrou a senha? <Link to="/login">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordWizard;
