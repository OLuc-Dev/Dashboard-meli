import { useState } from 'react';
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import logoImage from '../assets/logo.png';

const initialFormData = {
  email: '',
  password: '',
};

const Login = ({ onLogin, onSwitchToRegister, loading }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
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
    const email = formData.email.trim();

    if (!email) {
      nextErrors.email = 'Email é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = 'Informe um email válido';
    }

    if (!formData.password) {
      nextErrors.password = 'Senha é obrigatória';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onLogin({
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero" aria-label="Resumo do dashboard">
        <span className="auth-hero__badge">
          <ShieldCheck size={18} /> Operação segura
        </span>
        <h1>Entre no painel MELI com uma experiência mais rápida e bonita.</h1>
        <p>
          Monitore produtos, gestores, chamados e indicadores do Mercado Livre em uma interface redesenhada para uso diário.
        </p>
        <div className="auth-feature-list">
          <span className="auth-feature-item">
            <Zap size={18} /> Dados protegidos por autenticação JWT
          </span>
          <span className="auth-feature-item">
            <Sparkles size={18} /> Layout responsivo com feedbacks claros
          </span>
        </div>
      </section>

      <section className="auth-panel" aria-label="Formulário de login">
        <div className="auth-card">
          <div className="auth-card__header">
            <div className="auth-logo">
              <img src={logoImage} alt="Mercado Livre" />
            </div>
            <h1>Bem-vindo</h1>
            <p>Acesse sua conta para abrir o dashboard empresarial.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
                  placeholder="Sua senha"
                  autoComplete="current-password"
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

            <button className="primary-action" type="submit" disabled={loading}>
              {loading ? <span className="button-spinner" aria-hidden="true" /> : <LogIn size={18} />}
              {loading ? 'Entrando...' : 'Entrar no painel'}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              Não tem uma conta?{' '}
              <button type="button" onClick={onSwitchToRegister}>
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
