import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Criar instância do axios
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipos genéricos para respostas
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Classe base para serviços de API
export class BaseApiService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(params?: any): Promise<T[]> {
    const response = await api.get<ApiResponse<T[]>>(this.endpoint, { params });
    return response.data.data;
  }

  async getPaginated(params?: any): Promise<PaginatedResponse<T>> {
    const response = await api.get<ApiResponse<PaginatedResponse<T>>>(this.endpoint, { params });
    return response.data.data;
  }

  async getById(id: string | number): Promise<T> {
    const response = await api.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
    return response.data.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await api.post<ApiResponse<T>>(this.endpoint, data);
    return response.data.data;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await api.put<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string | number): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`);
  }

  async search(query: string, params?: any): Promise<T[]> {
    const response = await api.get<ApiResponse<T[]>>(`${this.endpoint}/search`, {
      params: { q: query, ...params }
    });
    return response.data.data;
  }
}

// Funções auxiliares
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado';
};

export default api;

// Funções auxiliares para requisições
export const apiGet = async <T>(url: string, params?: any): Promise<T> => {
  const response = await api.get<T>(url, { params });
  return response.data;
};

export const apiPost = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.post<T>(url, data);
  return response.data;
};

export const apiPut = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.put<T>(url, data);
  return response.data;
};

export const apiPatch = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.patch<T>(url, data);
  return response.data;
};

export const apiDelete = async <T>(url: string): Promise<T> => {
  const response = await api.delete<T>(url);
  return response.data;
};