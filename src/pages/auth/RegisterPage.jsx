import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Boxes, User, Mail, Lock, Check, X, ArrowLeft, UserPlus } from 'lucide-react';
import { isValidEmail, evaluatePasswordStrength } from '../../utils/validators';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Avaliação de força de senha
  const passwordStrength = evaluatePasswordStrength(senha);

  const validate = () => {
    const errors = {};

    if (!nome.trim()) {
      errors.nome = 'Informe seu nome completo.';
    } else if (nome.trim().length < 3) {
      errors.nome = 'O nome deve conter ao menos 3 caracteres.';
    }

    if (!email.trim()) {
      errors.email = 'Informe seu endereço de e-mail.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Insira um formato válido de e-mail.';
    }

    if (!senha) {
      errors.senha = 'Defina uma senha de acesso.';
    } else if (senha.length < 6) {
      errors.senha = 'A senha deve conter no mínimo 6 caracteres.';
    }

    if (!confirmarSenha) {
      errors.confirmarSenha = 'Confirme sua senha.';
    } else if (senha !== confirmarSenha) {
      errors.confirmarSenha = 'As senhas não coincidem.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await register(nome, email, senha);

      if (!result.success) {
        setApiError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Redireciona para o login com mensagem de confirmação
      navigate('/login', {
        state: {
          message: 'Cadastro realizado com sucesso! Faça login com as credenciais criadas.',
        },
      });
    } catch {
      setApiError({ message: 'Erro inesperado ao cadastrar usuário. Tente novamente.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-br from-indigo-600/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="w-full max-w-lg relative z-10">
        {/* Topo / Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/30 text-white mb-3">
            <Boxes className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Criar Conta no <span className="text-indigo-400">KeepStock</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre-se para acessar e gerenciar o inventário
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-[#0d1428]/90 border border-[#1b2749] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          {apiError && (
            <div className="mb-5">
              <Alert
                type="error"
                title={apiError.code ? `Erro (${apiError.code})` : 'Falha no Cadastro'}
                onClose={() => setApiError(null)}
              >
                {apiError.message}
                {apiError.details && apiError.details !== apiError.message && (
                  <p className="text-xs text-rose-300/80 mt-1 font-mono">{String(apiError.details)}</p>
                )}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Nome Completo"
              id="register-nome"
              placeholder="Ex: Carlos Eduardo Silveira"
              icon={User}
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (fieldErrors.nome) setFieldErrors((prev) => ({ ...prev, nome: null }));
              }}
              error={fieldErrors.nome}
              required
            />

            <Input
              label="E-mail Corporativo"
              id="register-email"
              type="email"
              placeholder="carlos@empresa.com"
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
              <Input
                label="Senha de Acesso"
                id="register-senha"
                type="password"
                placeholder="Crie uma senha segura"
                icon={Lock}
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (fieldErrors.senha) setFieldErrors((prev) => ({ ...prev, senha: null }));
                }}
                error={fieldErrors.senha}
                autoComplete="new-password"
                required
              />

              {/* Medidor visual de força da senha */}
              {senha.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#091022] border border-[#1a2544]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Força da Senha:</span>
                    <span className={`font-semibold ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  {/* Barra de progresso */}
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= step
                            ? passwordStrength.bgColor
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Checklist dos requisitos */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${passwordStrength.requirements.minLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordStrength.requirements.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>8+ caracteres</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrength.requirements.hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordStrength.requirements.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Letra maiúscula</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrength.requirements.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordStrength.requirements.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Número</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrength.requirements.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordStrength.requirements.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Símbolo (@#$%...)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirmação de Senha"
              id="register-confirmar-senha"
              type="password"
              placeholder="Digite a senha novamente"
              icon={Lock}
              value={confirmarSenha}
              onChange={(e) => {
                setConfirmarSenha(e.target.value);
                if (fieldErrors.confirmarSenha) setFieldErrors((prev) => ({ ...prev, confirmarSenha: null }));
              }}
              error={fieldErrors.confirmarSenha}
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
                icon={UserPlus}
              >
                Concluir Cadastro
              </Button>
            </div>
          </form>

          {/* Voltar para login */}
          <div className="mt-6 pt-5 border-t border-[#172342] text-center">
            <Link
              to="/login"
              className="font-medium text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Já possui uma conta? Voltar ao login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
