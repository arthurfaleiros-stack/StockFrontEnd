import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { isValidEmail } from '../../utils/validators';
import './Auth.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Mensagem que pode vir de outra tela (ex: depois de cadastrar)
  const successMessage = location.state?.message;

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Informe o e-mail.';
    else if (!isValidEmail(email)) newErrors.email = 'E-mail inválido.';

    if (!senha) newErrors.senha = 'Informe a senha.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    const result = await login(email, senha);
    setIsSubmitting(false);

    if (!result.success) {
      setApiError(result.error);
      return;
    }

    navigate('/dashboard');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>KeepStock</h1>
          <p>Sistema de Gestão de Estoque</p>
        </div>

        <h2 className="auth-title">Entrar</h2>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@empresa.com"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
            />
            {errors.senha && <p className="form-error">{errors.senha}</p>}
          </div>

          <p style={{ textAlign: 'right', marginBottom: 16 }}>
            <Link to="/esqueci-senha" className="btn-link">Esqueceu a senha?</Link>
          </p>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
