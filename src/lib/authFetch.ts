import axios from 'axios';
import { toast } from 'react-hot-toast';

// 1. Configuração da Instância Axios
const apiClient = axios.create({
  baseURL: 'https://portal.sabercon.com.br/api',
  withCredentials: true,
  timeout: 60000, // 60 segundos
});

// Cache para detecção de loops
const requestCache = new Map<string, {
  count: number;
  timestamp: number;
  blockedUntil?: number;
}>();

// Configurações para prevenção de loops
const LOOP_DETECTION = {
  WINDOW_MS: 10000, // 10 segundos
  MAX_REQUESTS: 5, // Máximo de requisições em 10 segundos
  BLOCK_DURATION_MS: 30000, // 30 segundos de bloqueio
  CLEANUP_INTERVAL_MS: 60000 * 5 // Limpar cache a cada 5 minutos
};

// Função para detectar loops
function detectRequestLoop(url: string): boolean {
  const now = Date.now();
  const key = url;
  
  // Verificar se a URL está bloqueada
  const cachedData = requestCache.get(key);
  if (cachedData?.blockedUntil && cachedData.blockedUntil > now) {
    console.warn(`🚨 [API-CLIENT] URL bloqueada por loop: ${url}`);
    return true;
  }
  
  // Se não existe no cache, inicializar
  if (!cachedData) {
    requestCache.set(key, { count: 1, timestamp: now });
    return false;
  }
  
  // Se passou o tempo da janela, resetar contador
  if (now - cachedData.timestamp > LOOP_DETECTION.WINDOW_MS) {
    cachedData.count = 1;
    cachedData.timestamp = now;
    return false;
  }
  
  // Incrementar contador
  cachedData.count++;
  
  // Verificar se excedeu o limite
  if (cachedData.count > LOOP_DETECTION.MAX_REQUESTS) {
    console.warn(`🚨 [API-CLIENT] Loop detectado para URL: ${url} (${cachedData.count} requisições em ${LOOP_DETECTION.WINDOW_MS}ms)`);
    cachedData.blockedUntil = now + LOOP_DETECTION.BLOCK_DURATION_MS;
    
    // Limpar tokens se for uma URL de autenticação
    if (url.includes('/auth/')) {
      try {
        console.log('🧹 Limpando tokens devido a loop detectado');
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('auth_token');
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('auth_token');
        }
      } catch (e) {
        console.error('Erro ao limpar tokens:', e);
      }
    }
    
    return true;
  }
  
  return false;
}

// Limpar cache periodicamente
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    // Usar uma abordagem que não depende de iteradores
    const keysToDelete: string[] = [];
    
    requestCache.forEach((data, key) => {
      if (now - data.timestamp > LOOP_DETECTION.CLEANUP_INTERVAL_MS) {
        keysToDelete.push(key);
      }
    });
    
    // Remover as chaves marcadas para exclusão
    keysToDelete.forEach(key => requestCache.delete(key));
  }, LOOP_DETECTION.CLEANUP_INTERVAL_MS);
}

// 2. Interceptor para Adicionar o Access Token
apiClient.interceptors.request.use(
  (config) => {
    // Verificar se a requisição pode causar um loop
    if (config.url && detectRequestLoop(config.url)) {
      // Cancelar a requisição se detectar um loop
      const error = new Error(`Requisição bloqueada para prevenir loop: ${config.url}`);
      return Promise.reject(error);
    }
    
    if (typeof window !== 'undefined') {
      try {
        // Buscar token em múltiplas chaves possíveis
        let accessToken = null;
        
        // Verificar localStorage
        if (typeof localStorage !== 'undefined') {
          accessToken = 
            localStorage.getItem('accessToken') || 
            localStorage.getItem('auth_token') || 
            localStorage.getItem('token') || 
            localStorage.getItem('authToken');
        }
        
        // Se não encontrou no localStorage, verificar sessionStorage
        if (!accessToken && typeof sessionStorage !== 'undefined') {
          accessToken = 
            sessionStorage.getItem('accessToken') ||
            sessionStorage.getItem('auth_token') ||
            sessionStorage.getItem('token') ||
            sessionStorage.getItem('authToken');
        }
        
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error('Erro ao acessar storage no interceptor:', error);
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
    
    // Verificar se é erro 429 (Too Many Requests) - possível loop
    if (error.response?.status === 429) {
      console.warn('🚨 Erro 429 detectado - possível loop de requisições');
      
      // Se for uma URL de autenticação, limpar tokens
      if (originalRequest.url && originalRequest.url.includes('/auth/')) {
        try {
          console.log('🧹 Limpando tokens devido a erro 429 em rota de autenticação');
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('auth_token');
          }
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('auth_token');
          }
        } catch (e) {
          console.error('Erro ao limpar tokens:', e);
        }
        
        // Disparar evento para notificar o sistema
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-loop-detected'));
        }
      }
      
      // Não tentar novamente
      return Promise.reject(error);
    }

    // Verifica se o erro é 401 e não é uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Não tentar refresh para o endpoint /auth/me para evitar loops
      if (originalRequest.url && originalRequest.url.includes('/auth/me')) {
        console.warn('⚠️ Não tentando refresh para /auth/me para evitar loops');
        return Promise.reject(error);
      }
      
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

        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('accessToken', newAccessToken);
          } catch (error) {
            console.error('Erro ao salvar token no localStorage:', error);
          }
        }
        
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        
        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Se o refresh falhar, limpa tudo e notifica o usuário
        if (typeof window !== 'undefined') {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('auth_token');
              localStorage.removeItem('token');
              localStorage.removeItem('authToken');
            }
            
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.removeItem('accessToken');
              sessionStorage.removeItem('auth_token');
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('authToken');
            }
            
            // O AuthContext será responsável pelo redirecionamento
            window.dispatchEvent(new Event('auth-error'));
          } catch (error) {
            console.error('Erro ao limpar tokens nos storages:', error);
          }
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
