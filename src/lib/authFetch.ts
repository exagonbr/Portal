import axios from 'axios';
import { toast } from 'react-hot-toast';

// 1. Configuração da Instância Axios
const apiClient = axios.create({
  baseURL: 'https://portal.sabercon.com.br/api',
  withCredentials: true,
  timeout: 30000, // 30 segundos
});


// 2. Interceptor para Adicionar o Access Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Buscar token em múltiplas chaves possíveis
      const accessToken = 
        localStorage.getItem('accessToken') || 
        localStorage.getItem('auth_token') || 
        localStorage.getItem('token') || 
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('accessToken') ||
        sessionStorage.getItem('auth_token') ||
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('authToken');
        
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor para Lidar com Token Expirado (401) e Fazer Refresh
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Verifica se o erro é 401 e não é uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já estiver fazendo refresh, adiciona a requisição na fila
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post('/auth/refresh_token');
        const newAccessToken = data.data.accessToken;

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', newAccessToken);
        }
        
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        
        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Se o refresh falhar, limpa tudo e notifica o usuário
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('authToken');
          // O AuthContext será responsável pelo redirecionamento
          window.dispatchEvent(new Event('auth-error'));
        }
        toast.error('Sua sessão expirou. Por favor, faça login novamente.');
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
