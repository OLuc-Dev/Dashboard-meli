import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, User, UserPlus, Zap } from 'lucide-react';
import logoImage from '../assets/logo.png';

const initialFormData = {
  nome: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const Register = ({ onRegister, onSwitchToLogin, loading }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));

    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const nome = formData.nome.trim();
    const email = formData.email.trim();

    if (!nome) {
      nextErrors.nome = 'Nome é obrigatório';
    } else if (nome.length < 2) {
      nextErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!email) {
      nextErrors.email = 'Email é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = 'Informe um email válido';
    }

    if (!formData.password) {
      nextErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      nextErrors.password = 'Senha deve conter letras e números';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Confirme sua senha';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onRegister({
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero" aria-label="Benefícios do cadastro">
        <span className="auth-hero__badge">
          <ShieldCheck size={18} /> Acesso protegido
        </span>
        <h1>Crie sua conta e acompanhe a operação de ponta a ponta.</h1>
        <p>
          O novo painel concentra indicadores, chamados, gestores e dados do Mercado Livre em um fluxo mais simples e fluido.
        </p>
        <div className="auth-feature-list">
          <span className="auth-feature-item">
            <Zap size={18} /> Autenticação persistente e segura
          </span>
          <span className="auth-feature-item">
            <Sparkles size={18} /> Validações claras antes do envio
          </span>
        </div>
      </section>

      <section className="auth-panel" aria-label="Formulário de cadastro">
        <div className="auth-card">
          <div className="auth-card__header">
            <div className="auth-logo">
              <img src={logoImage} alt="Mercado Livre" />
            </div>
            <h1>Criar conta</h1>
            <p>Preencha os dados para liberar o dashboard empresarial.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="form-field" htmlFor="nome">
              Nome completo
              <span className="auth-input-wrap">
                <User className="auth-input-icon" size={18} />
                <input
                  className="control-input"
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  value={formData.nome}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.nome)}
                />
              </span>
              {errors.nome && <span className="field-error">{errors.nome}</span>}
            </label>

            <label className="form-field" htmlFor="email">
              Email
              <span className="auth-input-wrap">
                <Mail className="auth-input-icon" size={18} />
                <input
                  className="control-input"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                />
              </span>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>

            <label className="form-field" htmlFor="password">
              Senha
              <span className="auth-input-wrap">
                <Lock className="auth-input-icon" size={18} />
                <input
                  className="control-input has-password-toggle"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </label>

            <label className="form-field" htmlFor="confirmPassword">
              Confirmar senha
              <span className="auth-input-wrap">
                <Lock className="auth-input-icon" size={18} />
                <input
                  className="control-input has-password-toggle"
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </label>

            <button className="primary-action" type="submit" disabled={loading}>
              {loading ? <span className="button-spinner" aria-hidden="true" /> : <UserPlus size={18} />}
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              Já tem conta?{' '}
              <button type="button" onClick={onSwitchToLogin}>
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
