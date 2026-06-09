// Central API configuration
// Set VITE_API_URL in your .env.local (local dev) or Vercel environment variables (production)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// WebSocket URL: mirrors the API URL but with ws:// or wss:// scheme
export const WS_BASE_URL = API_BASE_URL.replace(/^https/, 'wss').replace(/^http/, 'ws');
