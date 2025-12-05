import { apiClient } from '../utils/languageApi';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    nombre_usuario?: string;
    [key: string]: any;
  };
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  nombre_usuario: string;
  celular: string;
  correo: string;
  contrasena: string;

  username: string;
  password: string;
  email: string;
}

export interface User {
  id: number;
  nombre_usuario?: string;
  username: string;
  email: string;
  [key: string]: any;
}

class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'user';

  /**
   * Get the stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get the stored user data
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Save token and user data to localStorage
   */
  private saveAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Login user with username and password
   * Django REST Framework Token Authentication endpoint
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      // Using the Django REST Framework token auth endpoint
      const response = await apiClient.post<{ token: string }>('/api/login', {
        username,
        password,
      });

      const { token } = response.data;

      if (!token) {
        throw new Error('No se recibió token del servidor');
      }

      // Fetch user data with the token
      const userResponse = await apiClient.get<User>('/api/usuario/me', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const user = userResponse.data;

      // Save auth data
      this.saveAuthData(token, user);

      return { token, user };
    } catch (error: any) {
      // Clear any partial auth data
      this.clearAuthData();

      // Format error message
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Error al iniciar sesión';

      throw new Error(errorMessage);
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<void> {
    try {
      const response = await apiClient.post('/api/usuarios/', {
        nombre: userData.nombre,
        apellido: userData.apellido,
        nombre_usuario: userData.nombre_usuario,
        celular: userData.celular,
        correo: userData.correo,
        contrasena: userData.contrasena,
        
        username: userData.nombre_usuario,
        password: userData.contrasena,
        email: userData.correo,
      });

      return response.data;
    } catch (error: any) {
      // Format error message
      let errorMessage = 'Error en el registro';

      if (error.response?.data) {
        const data = error.response.data;

        // Handle field-specific errors
        if (typeof data === 'object') {
          const errors = Object.entries(data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join('\n');

          if (errors) {
            errorMessage = errors;
          }
        } else if (data.detail || data.error || data.message) {
          errorMessage = data.detail || data.error || data.message;
        }
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();

      if (token) {
        // Call logout endpoint to invalidate token on server
        await apiClient.post('/api/logout', {}, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
      // Continue with logout even if server request fails
    } finally {
      // Always clear local auth data
      this.clearAuthData();
    }
  }

  /**
   * Fetch current user data (useful for validating token)
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/api/usuario/me');

      // Update stored user data
      const token = this.getToken();
      if (token) {
        this.saveAuthData(token, response.data);
      }

      return response.data;
    } catch (error: any) {
      // If token is invalid, clear auth data
      if (error.response?.status === 401) {
        this.clearAuthData();
      }
      throw error;
    }
  }

  /**
   * Validate current token by fetching user data
   */
  async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
