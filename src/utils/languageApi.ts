// Language API integration utilities
import i18n from '../i18n';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Get the current language code
 */
export const getCurrentLanguage = (): string => {
  return i18n.language || 'es';
};

/**
 * Get language headers for API requests
 */
export const getLanguageHeaders = () => {
  return {
    'Accept-Language': getCurrentLanguage(),
  };
};

/**
 * Enhanced axios instance with language and authentication support
 * This is the MAIN API client to be used throughout the application
 */
const API_BASE_URL = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token and language headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authentication token if exists
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Token ${token}`;
    }

    // Add language header
    if (config.headers) {
      config.headers['Accept-Language'] = getCurrentLanguage();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors and token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle unauthorized (401) - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/start')) {
        window.location.href = '/login';
      }
    }

    // Handle forbidden (403) - user doesn't have permission
    if (error.response?.status === 403) {
      console.error('Acceso denegado: No tienes permisos para esta acción');
    }

    // Handle server errors (5xx)
    if (error.response?.status && error.response.status >= 500) {
      console.error('Error del servidor. Por favor, intenta más tarde.');
    }

    return Promise.reject(error);
  }
);

/**
 * Language change handler for API synchronization
 */
export const syncLanguageWithAPI = async (newLanguage: string): Promise<void> => {
  try {
    // Save user's language preference to backend
    const token = localStorage.getItem('authToken');
    if (token) {
      await apiClient.patch('/api/users/me/', {
        preferred_language: newLanguage
      });
    }
  } catch (error) {
    console.warn('Failed to sync language preference with API:', error);
    // Don't throw - language change should still work locally
  }
};
