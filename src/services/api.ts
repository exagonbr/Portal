<<<<<<< HEAD
import axios, { AxiosRequestConfig } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001/api';

if (!API_URL) {
  console.warn('API_URL não está definido no ambiente!');
}
=======
import axios from 'axios';
import { UnifiedAuthService } from './unifiedAuthService';
import { AuthHeaderService } from './authHeaderService';
>>>>>>> 2b9a658619be4be8442857987504eeff79e3f6b9

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

<<<<<<< HEAD
api.interceptors.request.use((config) => {
  // Tenta pegar o token do localStorage (cliente) ou do cookie (servidor)
  let token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
=======
api.interceptors.request.use(async (config) => {
  const headers = await AuthHeaderService.getHeadersObject();
  
  // Adicionar headers de forma segura para tipagem do Axios
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization;
>>>>>>> 2b9a658619be4be8442857987504eeff79e3f6b9
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
<<<<<<< HEAD
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
=======
      await UnifiedAuthService.clearAuthData();
      window.location.href = '/login';
>>>>>>> 2b9a658619be4be8442857987504eeff79e3f6b9
    }
    return Promise.reject(error);
  }
);

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

// API methods
export const apiService = {
  async get<T>(endpoint: string, config?: AxiosRequestConfig) {
    const response = await api.get<T>(endpoint, config);
    return response.data;
  },

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    const response = await api.post<T>(endpoint, data, config);
    return response.data;
  },

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    const response = await api.put<T>(endpoint, data, config);
    return response.data;
  },

  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    const response = await api.patch<T>(endpoint, data, config);
    return response.data;
  },

  async delete<T>(endpoint: string, config?: AxiosRequestConfig) {
    const response = await api.delete<T>(endpoint, config);
    return response.data;
  },
};

export default api;