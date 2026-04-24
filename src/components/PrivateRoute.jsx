import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const getDashboardPath = (role) => {
  if (role === 'student') return '/student/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/login';
};

// Protect routes that require authentication
export const PrivateRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, userRole } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  return children;
};

// Redirect authenticated users away from login
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, userRole } = useAppContext();

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  return children;
};

export const HomeRoute = () => {
  const { isAuthenticated, userRole } = useAppContext();

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  return <Navigate to="/login" replace />;
};
