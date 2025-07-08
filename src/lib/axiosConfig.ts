import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// Configurações globais do Axios
axios.defaults.timeout = 30000; // 30 segundos
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Códigos de status que devem ser retentados automaticamente
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Configurações de retry
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 segundo

// Armazenar informações sobre retries em andamento
interface RetryQueue {
  [key: string]: {
    retryCount: number;
    lastRetry: number;
  };
}

const retryQueue: RetryQueue = {};

// Função para gerar uma chave única para a requisição
const getRequestKey = (config: AxiosRequestConfig): string => {
  return `${config.method || 'GET'}-${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;
};

// Função para calcular o delay com backoff exponencial
const getRetryDelay = (retryCount: number): number => {
  return Math.min(
    RETRY_DELAY_BASE * Math.pow(2, retryCount - 1), // Backoff exponencial
    30000 // Máximo de 30 segundos
  );
};

// Interceptor de requisição para adicionar headers comuns
axios.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se disponível
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken') || 
                    localStorage.getItem('auth_token') || 
                    localStorage.getItem('token') ||
                    localStorage.getItem('authToken');
      
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para lidar com erros e retry
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // Limpar qualquer entrada na fila de retry para esta requisição
    const requestKey = getRequestKey(response.config);
    if (retryQueue[requestKey]) {
      delete retryQueue[requestKey];
    }
    
    return response;
  },
  async (error: AxiosError) => {
    // Se não tiver config, não podemos fazer retry
    if (!error.config) {
      return Promise.reject(error);
    }
    
    const { config } = error;
    const requestKey = getRequestKey(config);
    
    // Verificar se deve fazer retry
    const shouldRetry = error.response && 
                        RETRY_STATUS_CODES.includes(error.response.status) &&
                        (!retryQueue[requestKey] || retryQueue[requestKey].retryCount < MAX_RETRIES);
    
    if (shouldRetry) {
      // Inicializar ou incrementar contador de retry
      if (!retryQueue[requestKey]) {
        retryQueue[requestKey] = {
          retryCount: 0,
          lastRetry: Date.now()
        };
      }
      
      retryQueue[requestKey].retryCount += 1;
      retryQueue[requestKey].lastRetry = Date.now();
      
      const retryCount = retryQueue[requestKey].retryCount;
      
      // Calcular delay
      const delay = getRetryDelay(retryCount);
      
      // Log para debug
      console.log(`🔄 Retry ${retryCount}/${MAX_RETRIES} para ${config.url} após ${delay}ms - Status: ${error.response?.status}`);
      
      // Mostrar toast apenas para o primeiro retry de erro 503
      if (error.response?.status === 503 && retryCount === 1) {
        toast.loading('Servidor temporariamente indisponível. Tentando reconectar...', {
          id: `retry-${requestKey}`,
          duration: delay * 1.5
        });
      }
      
      // Esperar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Tentar novamente
      return axios(config);
    }
    
    // Se chegou aqui, todas as tentativas falharam ou não é um erro que deve ser retentado
    
    // Limpar entrada na fila de retry
    if (retryQueue[requestKey]) {
      delete retryQueue[requestKey];
    }
    
    // Mostrar mensagem de erro para 503 após todas as tentativas
    if (error.response?.status === 503) {
      toast.error('Servidor indisponível. Tente novamente mais tarde.', {
        id: `error-${requestKey}`,
        duration: 5000
      });
    }
    
    return Promise.reject(error);
  }
);

// Limpar entradas antigas da fila de retry periodicamente
setInterval(() => {
  const now = Date.now();
  Object.keys(retryQueue).forEach(key => {
    if (now - retryQueue[key].lastRetry > 60000) { // 1 minuto
      delete retryQueue[key];
    }
  });
}, 60000); // Verificar a cada minuto

// Função para criar uma instância do Axios com as mesmas configurações
export const createAxiosInstance = (baseURL?: string) => {
  return axios.create({
    baseURL,
    timeout: 30000
  });
};

// Exportar a instância padrão
export default axios; 