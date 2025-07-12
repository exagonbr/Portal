import axios, { AxiosRequestConfig } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001/api';

if (!API_URL) {
  console.warn('API_URL não está definido no ambiente!');
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Tenta pegar o token do localStorage (cliente) ou do cookie (servidor)
  let token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
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