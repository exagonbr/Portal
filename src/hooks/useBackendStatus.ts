import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Tipos para o hook
export interface BackendStatusOptions {
  url?: string;
  interval?: number;
  timeout?: number;
  onStatusChange?: (isOnline: boolean) => void;
  showToasts?: boolean;
  retryCount?: number;
}

export interface BackendStatus {
  isOnline: boolean;
  lastChecked: Date | null;
  responseTime: number | null;
  error: Error | null;
  checkNow: () => Promise<boolean>;
}

/**
 * Hook para verificar a conectividade com o backend
 * 
 * @param options Opções de configuração
 * @returns Estado atual da conectividade com o backend
 */
export function useBackendStatus(options: BackendStatusOptions = {}): BackendStatus {
  // Valores padrão para as opções
  const {
    url = process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api',
    interval = 60000, // Verificar a cada 1 minuto por padrão
    timeout = 5000, // Timeout de 5 segundos
    onStatusChange,
    showToasts = true,
    retryCount = 2
  } = options;

  // Estado para armazenar o status do backend
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Função para verificar o status do backend
  const checkBackendStatus = useCallback(async (): Promise<boolean> => {
    const startTime = Date.now();
    let success = false;
    let currentError: Error | null = null;
    
    try {
      // Usar um endpoint de health check ou status
      const healthEndpoint = `${url}/status`;
      
      // Configuração do Axios com timeout
      const response = await axios.get(healthEndpoint, {
        timeout,
        // Não enviar credenciais para este endpoint específico
        withCredentials: false,
        // Headers mínimos para evitar problemas de CORS
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Verificar se a resposta é válida
      success = response.status >= 200 && response.status < 300;
      
      // Calcular o tempo de resposta
      const endTime = Date.now();
      const latency = endTime - startTime;
      setResponseTime(latency);
      
      // Atualizar o timestamp da última verificação
      setLastChecked(new Date());
      
    } catch (err) {
      // Capturar e armazenar o erro
      currentError = err instanceof Error ? err : new Error(String(err));
      setError(currentError);
      success = false;
      
      // Atualizar o timestamp da última verificação mesmo em caso de erro
      setLastChecked(new Date());
    }
    
    // Atualizar o estado de online/offline
    setIsOnline(success);
    
    // Chamar o callback se o status mudou
    if (onStatusChange && isOnline !== success) {
      onStatusChange(success);
    }
    
    // Mostrar toast se configurado
    if (showToasts && isOnline !== success) {
      if (success) {
        toast.success('Conexão com o servidor restaurada', {
          id: 'backend-status',
          duration: 3000
        });
      } else {
        toast.error('Servidor temporariamente indisponível', {
          id: 'backend-status',
          duration: 5000
        });
      }
    }
    
    return success;
  }, [url, timeout, isOnline, onStatusChange, showToasts]);
  
  // Função exposta para verificar o status sob demanda
  const checkNow = useCallback(async (): Promise<boolean> => {
    return checkBackendStatus();
  }, [checkBackendStatus]);
  
  // Efeito para verificar o status periodicamente
  useEffect(() => {
    // Verificar imediatamente ao montar o componente
    checkBackendStatus();
    
    // Configurar o intervalo para verificações periódicas
    const intervalId = setInterval(async () => {
      await checkBackendStatus();
    }, interval);
    
    // Limpar o intervalo ao desmontar
    return () => {
      clearInterval(intervalId);
    };
  }, [checkBackendStatus, interval]);
  
  return {
    isOnline,
    lastChecked,
    responseTime,
    error,
    checkNow
  };
} 