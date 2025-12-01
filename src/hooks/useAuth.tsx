import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService, User, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  mensajeErr: string;
  isAuthenticated: boolean;
  setError: (error: boolean) => void;
  setMensajeErr: (mensaje: string) => void;
  login: (username: string, password: string) => Promise<{ success: boolean }>;
  register: (userData: RegisterData) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeErr, setMensajeErr] = useState('');
  const [errorState, setErrorState] = useState(false);

  // Load user on mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          setUser(null);
          return;
        }

        // Validate token and fetch user data
        const isValid = await authService.validateToken();

        if (isValid) {
          const userData = authService.getUser();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setUser(null);
        authService.clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      setError(null);
      setMensajeErr('');
      setErrorState(false);

      const { user: userData } = await authService.login(username, password);
      setUser(userData);

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      setMensajeErr(errorMessage);
      setErrorState(true);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      setError(null);
      setMensajeErr('');
      setErrorState(false);

      await authService.register(userData);

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Error en el registro';
      setError(errorMessage);
      setMensajeErr(errorMessage);
      setErrorState(true);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Error refreshing user:', err);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error: errorState ? error : null,
        mensajeErr,
        isAuthenticated: !!user,
        setError: setErrorState,
        setMensajeErr,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};