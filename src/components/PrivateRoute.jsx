import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader-card">
          <div className="loader-spinner" />
          <p>Validando sessão...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  return children;
};

export default PrivateRoute;
