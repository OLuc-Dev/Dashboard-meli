import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-meli-blue mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null; // O AuthWrapper irá mostrar a tela de login
  }

  return children;
};

export default PrivateRoute;

