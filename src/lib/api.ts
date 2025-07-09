import axios from 'axios';
import { buildLoginUrl } from '@/utils/urlBuilder';

// Cria uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona o token de autenticação a todas as requisições
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erros de autenticação (401)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Redirecionar para a página de login apenas se não estiver em um ambiente de servidor
        if (typeof document !== 'undefined' && !document.URL.includes('/api/')) {
          console.log('🔄 [API] Redirecionando para página de login após erro 401');
          window.location.href = buildLoginUrl({ error: 'unauthorized' });
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 