import axios from 'axios';

// Cria uma instância do axios com configurações padrão
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  // Verifica se estamos no browser
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erros de autenticação (401)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Redirecionar para a página de login se necessário
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
); 