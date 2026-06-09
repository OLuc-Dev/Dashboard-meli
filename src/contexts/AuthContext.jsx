import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'meli_dashboard_token';
const USER_STORAGE_KEY = 'meli_dashboard_user';

function readStoredSession() {
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  try {
    return { token: storedToken, user: JSON.parse(storedUser) };
  } catch (error) {
    console.error('Erro ao recuperar sessão:', error);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    return { token: null, user: null };
  }
}

function persistSession(accessToken, user) {
  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

async function getErrorMessage(response, fallbackMessage) {
  try {
    const payload = await response.json();
    return payload.error || payload.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const storedSession = readStoredSession();
    setToken(storedSession.token);
    setUser(storedSession.user);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials) => {
    setAuthLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Erro ao fazer login'));
      }

      const payload = await response.json();
      persistSession(payload.access_token, payload.user);
      setToken(payload.access_token);
      setUser(payload.user);

      return { success: true, message: payload.message || 'Login realizado com sucesso' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message || 'Não foi possível fazer login' };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setAuthLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Erro ao criar conta'));
      }

      const payload = await response.json();
      persistSession(payload.access_token, payload.user);
      setToken(payload.access_token);
      setUser(payload.user);

      return { success: true, message: payload.message || 'Conta criada com sucesso' };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: error.message || 'Não foi possível criar a conta' };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const isAuthenticated = useCallback(() => Boolean(token && user), [token, user]);

  const authenticatedFetch = useCallback(
    async (url, options = {}) => {
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }

      const headers = new Headers(options.headers || {});
      const isFormData = options.body instanceof FormData;

      if (!headers.has('Content-Type') && !isFormData) {
        headers.set('Content-Type', 'application/json');
      }

      headers.set('Authorization', `Bearer ${token}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      return response;
    },
    [logout, token],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authLoading,
      login,
      register,
      logout,
      isAuthenticated,
      authenticatedFetch,
    }),
    [authLoading, authenticatedFetch, isAuthenticated, loading, login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
