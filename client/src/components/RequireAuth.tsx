import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  children: JSX.Element;
  allowedRoles?: string[];
};

const RequireAuth: React.FC<Props> = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const location = useLocation();

  if (loading) return <div />;

  if (!isAuthenticated) {
    // Not signed in — ask to sign in
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = user?.role;
    if (!role || !allowedRoles.includes(role)) {
      // Signed in but not authorized for this route — show Forbidden page
      return <Navigate to="/forbidden" replace state={{ from: location }} />;
    }
  }

  return children;
};

export default RequireAuth;
