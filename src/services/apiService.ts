import { apiClient } from '../utils/languageApi';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  // User authentication
  async login(username: string, password: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api-token-auth/', {
        username,
        password,
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  }

  // Get user rooms with language support
  async getUserRooms(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/api/salas/');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch rooms',
      };
    }
  }

  // Get sports matches with language support
  async getSportsMatches(sport?: string): Promise<ApiResponse<any[]>> {
    try {
      const params = sport ? { sport } : {};
      const response = await apiClient.get('/api/partidos/', { params });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch matches',
      };
    }
  }

  // User registration
  async register(userData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/usuarios/', userData);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      };
    }
  }

  // Get user stats
  async getUserStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/usuarios/me/stats/');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch user stats',
      };
    }
  }
}

export const apiService = new ApiService();
