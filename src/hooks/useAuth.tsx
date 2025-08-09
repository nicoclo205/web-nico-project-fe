import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: number;
  nombre_usuario: string;
  username: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  mensajeErr: string;
  setError: (error: boolean) => void;
  setMensajeErr: (mensaje: string) => void;
  login: (username: string, password: string) => Promise<{ success: boolean }>;
  register: (userData: any) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
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
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          setUser(null);
          return;
        }
        
        const res = await fetch('/api/usuario/me', {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      setError(null);
      setMensajeErr('');
      
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Credenciales inválidas');
      }
      
      const data = await res.json();
      
      // Save token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      setMensajeErr(err.message);
      setErrorState(true);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      setError(null);
      setMensajeErr('');
      
      const res = await fetch('/api/usuarios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Error en el registro');
      }
      
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      setMensajeErr(err.message);
      setErrorState(true);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
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
        setError: setErrorState,
        setMensajeErr,
        login, 
        register,
        logout 
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