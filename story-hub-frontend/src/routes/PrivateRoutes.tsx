// components/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { JSX } from 'react';
import Loader from '../components/Loader';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <Loader />   // one of the issue that I will never forget
  }
  return user ? children : <Navigate to="/users/login" replace />;
};

export default PrivateRoute;
