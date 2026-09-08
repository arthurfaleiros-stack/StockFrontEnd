import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { isValidEmail } from '../../utils/validators';

function RegisterPage() {
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
          maxWidth: '400px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '32px',
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0',
            }}
          >
            KeepStock
          </h1>

          <p
            style={{
              fontSize: '13px',
              color: '#cbd5e1',
              margin: '4px 0 0',
            }}
          >
            Sistema de Gestão de Estoque
          </p>
        </div>

        {/* Título */}
        <h2
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#ffffff',
            margin: '0 0 16px',
          }}
        >
          Criar conta
        </h2>

        {/* Erro da API */}
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
            }}
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Nome */}
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <label
              htmlFor="nome"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '6px',
              }}
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
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: errors.nome
                  ? '1px solid #dc2626'
                  : '1px solid #475569',
                borderRadius: '8px',
                color: '#ffffff',
                backgroundColor: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            {errors.nome && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#fca5a5',
                  marginTop: '4px',
                  marginBottom: '0',
                }}
              >
                {errors.nome}
              </p>
            )}
          </div>

          {/* E-mail */}
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '6px',
              }}
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
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: errors.email
                  ? '1px solid #dc2626'
                  : '1px solid #475569',
                borderRadius: '8px',
                color: '#ffffff',
                backgroundColor: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            {errors.email && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#fca5a5',
                  marginTop: '4px',
                  marginBottom: '0',
                }}
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Senha */}
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <label
              htmlFor="senha"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '6px',
              }}
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
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: errors.senha
                  ? '1px solid #dc2626'
                  : '1px solid #475569',
                borderRadius: '8px',
                color: '#ffffff',
                backgroundColor: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            {errors.senha && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#fca5a5',
                  marginTop: '4px',
                  marginBottom: '0',
                }}
              >
                {errors.senha}
              </p>
            )}
          </div>

          {/* Confirmar senha */}
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <label
              htmlFor="confirmarSenha"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '6px',
              }}
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
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: errors.confirmarSenha
                  ? '1px solid #dc2626'
                  : '1px solid #475569',
                borderRadius: '8px',
                color: '#ffffff',
                backgroundColor: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            {errors.confirmarSenha && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#fca5a5',
                  marginTop: '4px',
                  marginBottom: '0',
                }}
              >
                {errors.confirmarSenha}
              </p>
            )}
          </div>

          {/* Botão */}
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
            }}
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {/* Rodapé */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
            color: '#cbd5e1',
          }}
        >
          Já tem uma conta?{' '}

          <Link
            to="/login"
            style={{
              color: '#a5b4fc',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;