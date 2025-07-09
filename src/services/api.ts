import axios from 'axios';
import { UnifiedAuthService } from './unifiedAuthService';
import { AuthHeaderService } from './authHeaderService';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use(async (config) => {
  const headers = await AuthHeaderService.getHeadersObject();
  
  // Adicionar headers de forma segura para tipagem do Axios
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization;
  }
  
  if (headers['Content-Type']) {
    config.headers['Content-Type'] = headers['Content-Type'];
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await UnifiedAuthService.clearAuthData();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 