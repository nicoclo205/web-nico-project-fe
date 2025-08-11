// Language API integration utilities
import i18n from '../i18n';
import axios from 'axios';

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
 * Enhanced axios instance with language support
 */
const API_BASE_URL = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add language header to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if exists
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Add language header
    config.headers['Accept-Language'] = getCurrentLanguage();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Language change handler for API synchronization
 */
export const syncLanguageWithAPI = async (newLanguage: string) => {
  try {
    // Optionally save user's language preference to backend
    const token = localStorage.getItem('authToken');
    if (token) {
      await apiClient.patch('/api/users/me/', {
        preferred_language: newLanguage
      });
    }
  } catch (error) {
    console.warn('Failed to sync language preference with API:', error);
  }
};
