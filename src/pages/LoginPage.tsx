import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { MemberLoginPage } from './MemberLoginPage';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isDirectorMode = searchParams.get('mode') === 'director';
  if (isDirectorMode) {
    return <Navigate to="/login/admin" replace />;
  }
  return <MemberLoginPage />;
};
