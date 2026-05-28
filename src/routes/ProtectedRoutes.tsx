import React from 'react';
import { CircularProgress, Stack } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type LoginRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowRoles?: LoginRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowRoles }) => {
  const { user, isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <Stack sx={{ minHeight: '45vh' }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/panel" replace />;
  }

  return children;
};
