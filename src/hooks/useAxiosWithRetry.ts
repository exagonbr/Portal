import { useState, useCallback, useRef } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryStatusCodes?: number[];
  onRetry?: (retryCount: number, error: AxiosError) => void;
  shouldRetry?: (error: AxiosError) => boolean;
}

interface UseAxiosWithRetryOptions extends AxiosRequestConfig {
  retry?: RetryConfig;
}

interface UseAxiosWithRetryState<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
  retryCount: number;
  isRetrying: boolean;
}

interface UseAxiosWithRetryReturn<T> extends UseAxiosWithRetryState<T> {
  execute: (config?: AxiosRequestConfig) => Promise<AxiosResponse<T> | null>;
  reset: () => void;
  retry: () => Promise<AxiosResponse<T> | null>;
}

/**
 * Hook para fazer requisições Axios com retry automático para erros específicos
 * 
 * @param defaultConfig Configuração padrão do Axios
 * @returns Objeto com estado e funções para executar a requisição
 */
export function useAxiosWithRetry<T = any>(
  defaultConfig?: UseAxiosWithRetryOptions
): UseAxiosWithRetryReturn<T> {
  // Estado para armazenar o resultado da requisição
  const [state, setState] = useState<UseAxiosWithRetryState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0,
    isRetrying: false
  });

  // Referência para a última configuração usada
  const lastConfigRef = useRef<AxiosRequestConfig | null>(null);

  // Configurações padrão de retry
  const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],
    shouldRetry: (error: AxiosError) => {
      // Verificar se o erro tem um código de status
      if (error.response?.status) {
        // Verificar se o código de status está na lista de códigos para retry
        return defaultRetryConfig.retryStatusCodes!.includes(error.response.status);
      }
      
      // Para erros de rede (sem resposta), também fazer retry
      return error.code === 'ECONNABORTED' || 
             error.message.includes('timeout') || 
             error.message.includes('Network Error');
    }
  };

  // Função para calcular o delay com backoff exponencial
  const getRetryDelay = (retryCount: number, baseDelay: number): number => {
    return Math.min(
      baseDelay * Math.pow(2, retryCount), // Backoff exponencial
      30000 // Máximo de 30 segundos
    );
  };

  // Função para executar a requisição com retry
  const executeRequest = useCallback(async (
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T> | null> => {
    // Mesclar configurações
    const mergedConfig = {
      ...defaultConfig,
      ...config
    };

    // Extrair configurações de retry
    const retryConfig = {
      ...defaultRetryConfig,
      ...(defaultConfig?.retry || {})
    };

    // Salvar a configuração para possíveis retries manuais
    lastConfigRef.current = mergedConfig;

    // Inicializar estado
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      retryCount: 0,
      isRetrying: false
    }));

    let retryCount = 0;
    let lastError: AxiosError | null = null;

    // Loop de retry
    while (retryCount <= retryConfig.maxRetries!) {
      try {
        // Fazer a requisição
        const response = await axios(mergedConfig);
        
        // Atualizar o estado com sucesso
        setState({
          data: response.data,
          loading: false,
          error: null,
          retryCount,
          isRetrying: false
        });
        
        // Retornar a resposta
        return response;
        
      } catch (err) {
        // Converter para AxiosError
        const error = err as AxiosError;
        lastError = error;
        
        // Verificar se deve tentar novamente
        const shouldRetry = retryConfig.shouldRetry!(error);
        
        if (shouldRetry && retryCount < retryConfig.maxRetries!) {
          // Incrementar contador de retry
          retryCount++;
          
          // Notificar sobre o retry
          if (retryConfig.onRetry) {
            retryConfig.onRetry(retryCount, error);
          }
          
          // Atualizar estado para mostrar que está retentando
          setState(prev => ({ 
            ...prev, 
            isRetrying: true, 
            retryCount,
            error
          }));
          
          // Calcular delay com backoff exponencial
          const delay = getRetryDelay(retryCount, retryConfig.retryDelay!);
          
          // Esperar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Continuar para a próxima tentativa
          continue;
        }
        
        // Se não deve tentar novamente ou atingiu o limite, atualizar estado com erro
        setState({
          data: null,
          loading: false,
          error,
          retryCount,
          isRetrying: false
        });
        
        // Propagar o erro
        throw error;
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    setState({
      data: null,
      loading: false,
      error: lastError,
      retryCount,
      isRetrying: false
    });
    
    return null;
  }, [defaultConfig]);

  // Função para resetar o estado
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    });
  }, []);

  // Função para tentar novamente manualmente
  const retry = useCallback(async (): Promise<AxiosResponse<T> | null> => {
    if (!lastConfigRef.current) {
      return null;
    }
    
    return executeRequest(lastConfigRef.current);
  }, [executeRequest]);

  return {
    ...state,
    execute: executeRequest,
    reset,
    retry
  };
} 