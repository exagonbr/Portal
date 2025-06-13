'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SmartRefreshOptions {
  maxAttempts?: number;
  retryDelay?: number;
  fallbackUrl?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMaxAttemptsReached?: () => void;
}

interface SmartRefreshState {
  isRefreshing: boolean;
  attempts: number;
  lastError: Error | null;
  canRetry: boolean;
}

export function useSmartRefresh(options: SmartRefreshOptions = {}) {
  const {
    maxAttempts = 3,
    retryDelay = 2000,
    fallbackUrl,
    onSuccess,
    onError,
    onMaxAttemptsReached
  } = options;

  const router = useRouter();
  const [state, setState] = useState<SmartRefreshState>({
    isRefreshing: false,
    attempts: 0,
    lastError: null,
    canRetry: true
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Limpar timeouts e abort controllers ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Função para verificar se a página/recurso está acessível
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: abortControllerRef.current.signal
      });

      return response.ok;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      throw error;
    }
  }, []);

  // Refresh inteligente - tenta alternativas antes do reload completo
  const smartRefresh = useCallback(async () => {
    if (state.isRefreshing || !state.canRetry) {
      return;
    }

    setState(prev => ({
      ...prev,
      isRefreshing: true,
      attempts: prev.attempts + 1,
      lastError: null
    }));

    try {
      // Primeiro, verificar se o servidor está acessível
      const isHealthy = await checkHealth();
      
      if (isHealthy) {
        // Se o servidor está ok, tentar recarregar apenas os dados
        await new Promise(resolve => setTimeout(resolve, 500)); // Pequeno delay
        
        // Tentar usar router.refresh() primeiro (mais leve que window.location.reload)
        router.refresh();
        
        // Aguardar um pouco para ver se funcionou
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setState(prev => ({
          ...prev,
          isRefreshing: false
        }));
        
        onSuccess?.();
        return;
      }

      throw new Error('Servidor não está acessível');

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro desconhecido');
      
      setState(prev => {
        const newAttempts = prev.attempts;
        const canRetry = newAttempts < maxAttempts;
        
        return {
          ...prev,
          isRefreshing: false,
          lastError: err,
          canRetry
        };
      });

      onError?.(err);

      // Se ainda pode tentar novamente, agendar próxima tentativa
      if (state.attempts < maxAttempts) {
        timeoutRef.current = setTimeout(() => {
          smartRefresh();
        }, retryDelay);
      } else {
        onMaxAttemptsReached?.();
      }
    }
  }, [state.isRefreshing, state.canRetry, state.attempts, maxAttempts, retryDelay, checkHealth, router, onSuccess, onError, onMaxAttemptsReached]);

  // Refresh forçado (último recurso)
  const forceRefresh = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    window.location.reload();
  }, []);

  // Navegar para URL de fallback
  const goToFallback = useCallback(() => {
    if (fallbackUrl) {
      router.push(fallbackUrl);
    } else {
      router.push('/');
    }
  }, [router, fallbackUrl]);

  // Reset do estado
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      isRefreshing: false,
      attempts: 0,
      lastError: null,
      canRetry: true
    });
  }, []);

  // Retry manual
  const retry = useCallback(() => {
    if (state.canRetry && !state.isRefreshing) {
      smartRefresh();
    }
  }, [state.canRetry, state.isRefreshing, smartRefresh]);

  return {
    // Estado
    ...state,
    
    // Ações
    smartRefresh,
    forceRefresh,
    goToFallback,
    retry,
    reset,
    
    // Utilitários
    hasReachedMaxAttempts: state.attempts >= maxAttempts,
    shouldShowFallback: state.attempts >= maxAttempts && !!fallbackUrl
  };
}

// Hook específico para componentes de erro
export function useErrorRefresh(onRetry?: () => Promise<void>) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = useCallback(async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      if (onRetry) {
        await onRetry();
      } else {
        // Fallback para refresh da página
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro durante retry:', error);
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, onRetry]);

  const handleForceRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    isRetrying,
    retryCount,
    handleRetry,
    handleForceRefresh
  };
}

// Hook para detectar problemas de conectividade
export function useConnectivityRefresh() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const smartRefresh = useSmartRefresh();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // Se estava offline, tentar refresh inteligente
      if (wasOffline) {
        setWasOffline(false);
        smartRefresh.smartRefresh();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificação inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, smartRefresh]);

  return {
    isOnline,
    wasOffline,
    ...smartRefresh
  };
} 