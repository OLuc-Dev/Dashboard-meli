import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Register from './Register';

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, login, register, authLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    
    if (result.success) {
      setMessage(result.message);
      setMessageType('success');
    } else {
      setMessage(result.error);
      setMessageType('error');
    }
    
    // Limpar mensagem após 5 segundos
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleRegister = async (userData) => {
    const result = await register(userData);
    
    if (result.success) {
      setMessage(result.message);
      setMessageType('success');
    } else {
      setMessage(result.error);
      setMessageType('error');
    }
    
    // Limpar mensagem após 5 segundos
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const switchToRegister = () => {
    setIsLoginMode(false);
    setMessage('');
    setMessageType('');
  };

  const switchToLogin = () => {
    setIsLoginMode(true);
    setMessage('');
    setMessageType('');
  };

  if (isAuthenticated()) {
    return children;
  }

  return (
    <div className="relative">
      {/* Mensagem de feedback */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          messageType === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={() => {
                setMessage('');
                setMessageType('');
              }}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tela de Login ou Registro */}
      {isLoginMode ? (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={switchToRegister}
          loading={authLoading}
        />
      ) : (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={switchToLogin}
          loading={authLoading}
        />
      )}
    </div>
  );
};

export default AuthWrapper;

