import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PublicOnlyRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export const PublicOnlyRoute = ({ children, redirectTo = '/homepage' }: PublicOnlyRouteProps) => {
    const { isAuthenticated, loading } = useAuth();

 // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-myBlack flex justify-center items-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // If user is authenticated, redirect to homepage
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is not authenticated, show the public page
  return <>{children}</>;
};