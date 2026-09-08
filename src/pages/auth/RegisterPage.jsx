import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { isValidEmail } from '../../utils/validators';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const newErrors = {};

    if (!nome.trim()) {
      newErrors.nome = 'Informe seu nome completo.';
    }

    if (!email.trim()) {
      newErrors.email = 'Informe o e-mail.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'E-mail inválido.';
    }

    if (!senha) {
      newErrors.senha = 'Defina uma senha.';
    } else if (senha.length < 6) {
      newErrors.senha = 'A senha precisa ter no mínimo 6 caracteres.';
    }

    if (senha !== confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setApiError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const result = await register(nome, email, senha);

    setIsSubmitting(false);

    if (!result.success) {
      setApiError(result.error);
      return;
    }

    navigate('/login', {
      state: {
        message: 'Cadastro realizado com sucesso! Faça login para continuar.',
      },
    });
  }

  return (
    <div
      className="auth-page"
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at center, #18213b 0%, #0d1426 45%, #070b16 100%)',
      }}
    >
      <div
        className="auth-card"
        style={{
          backgroundColor: '#151d33',
          border: '1px solid #252f49',
          borderRadius: '12px',
          color: '#ffffff',
        }}
      >
        <div className="auth-logo">
          <h1 style={{ color: '#ffffff' }}>KeepStock</h1>

          <p style={{ color: '#ffffff' }}>
            Sistema de Gestão de Estoque
          </p>
        </div>

        <h2
          className="auth-title"
          style={{ color: '#ffffff' }}
        >
          Criar conta
        </h2>

        {apiError && (
          <div className="alert alert-error">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          <div className="form-group">
            <label
              htmlFor="nome"
              style={{ color: '#ffffff' }}
            >
              Nome completo
            </label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Maria Silva"
              style={{
                color: '#ffffff',
                backgroundColor: '#0d1426',
              }}
            />

            {errors.nome && (
              <p className="form-error">
                {errors.nome}
              </p>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="email"
              style={{ color: '#ffffff' }}
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@empresa.com"
              style={{
                color: '#ffffff',
                backgroundColor: '#0d1426',
              }}
            />

            {errors.email && (
              <p className="form-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="senha"
              style={{ color: '#ffffff' }}
            >
              Senha
            </label>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              style={{
                color: '#ffffff',
                backgroundColor: '#0d1426',
              }}
            />

            {errors.senha && (
              <p className="form-error">
                {errors.senha}
              </p>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="confirmarSenha"
              style={{ color: '#ffffff' }}
            >
              Confirmar senha
            </label>

            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite a senha novamente"
              style={{
                color: '#ffffff',
                backgroundColor: '#0d1426',
              }}
            />

            {errors.confirmarSenha && (
              <p className="form-error">
                {errors.confirmarSenha}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p
          className="auth-footer"
          style={{ color: '#ffffff' }}
        >
          Já tem uma conta?{' '}
          <Link to="/login">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;