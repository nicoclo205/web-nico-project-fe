import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Component to protect routes that require authentication
 *
 * Usage:
 * ```tsx
 * <Route
 *   path="/homepage"
 *   element={
 *     <ProtectedRoute>
 *       <HomePage />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
export const ProtectedRoute = ({ children, redirectTo = '/login' }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-myBlack flex justify-center items-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};
