import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Register from './Register';

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, login, register, authLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [message, setMessage] = useState(null);
  const timeoutRef = useRef(null);

  const clearMessage = useCallback(() => {
    setMessage(null);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showMessage = useCallback((type, text) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setMessage({ type, text });
    timeoutRef.current = window.setTimeout(() => {
      setMessage(null);
      timeoutRef.current = null;
    }, 4500);
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    showMessage(result.success ? 'success' : 'error', result.success ? result.message : result.error);
  };

  const handleRegister = async (userData) => {
    const result = await register(userData);
    showMessage(result.success ? 'success' : 'error', result.success ? result.message : result.error);
  };

  const switchToRegister = () => {
    setIsLoginMode(false);
    clearMessage();
  };

  const switchToLogin = () => {
    setIsLoginMode(true);
    clearMessage();
  };

  if (isAuthenticated()) {
    return children;
  }

  return (
    <div className="relative">
      {message && (
        <div className={`auth-toast auth-toast--${message.type}`} role="status">
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <span>{message.text}</span>
          <button type="button" onClick={clearMessage} aria-label="Fechar mensagem">
            x
          </button>
        </div>
      )}

      {isLoginMode ? (
        <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} loading={authLoading} />
      ) : (
        <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} loading={authLoading} />
      )}
    </div>
  );
};

export default AuthWrapper;
