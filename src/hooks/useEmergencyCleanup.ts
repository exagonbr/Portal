import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Mock do EmergencyCleanupService para remover a dependência externa

export interface CleanupResult {
  localStorageCleared: boolean;
  sessionStorageCleared: boolean;
  cookiesCleared: boolean;
  indexedDBCleared: boolean;
  redirectedToLogin: boolean;
  timestamp: string;
}

class MockEmergencyCleanupService {
  private static instance: MockEmergencyCleanupService;
  private redirectCountKey = 'redirect_count';
  private lastCleanupKey = 'last_cleanup_timestamp';
  private redirectLimit = 5;
  private timeLimit = 10000; // 10 segundos

  private constructor() {}

  public static getInstance(): MockEmergencyCleanupService {
    if (!MockEmergencyCleanupService.instance) {
      MockEmergencyCleanupService.instance = new MockEmergencyCleanupService();
    }
    return MockEmergencyCleanupService.instance;
  }

  async executeFullCleanup(): Promise<CleanupResult> {
    console.log('🚨 Executando mock de limpeza de emergência...');
    const result: CleanupResult = {
      localStorageCleared: this.clearLocalStorage(),
      sessionStorageCleared: this.clearSessionStorage(),
      cookiesCleared: this.clearCookies(),
      indexedDBCleared: await this.clearIndexedDB(),
      redirectedToLogin: false,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem(this.lastCleanupKey, result.timestamp);
    console.log('✅ Mock de limpeza concluído:', result);
    return result;
  }

  detectLoopCondition(): boolean {
    try {
      const count = parseInt(sessionStorage.getItem(this.redirectCountKey) || '0');
      const lastCleanup = sessionStorage.getItem(this.lastCleanupKey);
      if (lastCleanup && new Date().getTime() - new Date(lastCleanup).getTime() < this.timeLimit) {
        if (count > this.redirectLimit) {
          console.warn(`🔄 Condição de loop detectada! Contagem de redirecionamento: ${count}`);
          return true;
        }
      } else if (count > 0) {
        sessionStorage.removeItem(this.redirectCountKey);
      }
    } catch (e) {
      console.error('Erro ao detectar condição de loop', e);
    }
    return false;
  }

  incrementRedirectCount(): void {
    try {
      let count = parseInt(sessionStorage.getItem(this.redirectCountKey) || '0');
      count++;
      sessionStorage.setItem(this.redirectCountKey, count.toString());
    } catch (e) {
      console.error('Erro ao incrementar contagem de redirecionamento', e);
    }
  }

  private clearLocalStorage(): boolean {
    try {
      // localStorage.clear(); // Comentado para não limpar dados reais durante o mock
      console.log('Mock: localStorage.clear() chamado');
      return true;
    } catch (e) {
      console.error('Erro ao limpar localStorage (mock)', e);
      return false;
    }
  }

  private clearSessionStorage(): boolean {
    try {
      // sessionStorage.clear(); // Comentado para não limpar dados reais durante o mock
      console.log('Mock: sessionStorage.clear() chamado');
      return true;
    } catch (e) {
      console.error('Erro ao limpar sessionStorage (mock)', e);
      return false;
    }
  }

  private clearCookies(): boolean {
    console.log('Mock: Limpeza de cookies não implementada no mock.');
    return true;
  }

  private async clearIndexedDB(): Promise<boolean> {
    console.log('Mock: Limpeza de IndexedDB não implementada no mock.');
    return Promise.resolve(true);
  }
}

const EmergencyCleanupService = MockEmergencyCleanupService;

interface UseEmergencyCleanupOptions {
  autoDetect?: boolean;
  autoCleanup?: boolean;
  redirectAfterCleanup?: boolean;
  onCleanupComplete?: (result: CleanupResult) => void;
  onLoopDetected?: () => void;
}

interface UseEmergencyCleanupReturn {
  isCleaningUp: boolean;
  lastCleanupResult: CleanupResult | null;
  executeCleanup: () => Promise<CleanupResult>;
  checkForLoops: () => boolean;
  clearCleanupHistory: () => void;
}

/**
 * Hook para gerenciar limpeza de emergência e detecção de loops
 */
export const useEmergencyCleanup = (
  options: UseEmergencyCleanupOptions = {}
): UseEmergencyCleanupReturn => {
  const {
    autoDetect = true,
    autoCleanup = true,
    redirectAfterCleanup = true,
    onCleanupComplete,
    onLoopDetected
  } = options;

  const router = useRouter();
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [lastCleanupResult, setLastCleanupResult] = useState<CleanupResult | null>(null);

  const cleanupService = EmergencyCleanupService.getInstance();

  /**
   * Executa limpeza completa de emergência
   */
  const executeCleanup = useCallback(async (): Promise<CleanupResult> => {
    if (isCleaningUp) {
      console.warn('⚠️ Limpeza já em andamento, ignorando nova solicitação');
      return lastCleanupResult || {
        localStorageCleared: false,
        sessionStorageCleared: false,
        cookiesCleared: false,
        indexedDBCleared: false,
        redirectedToLogin: false,
        timestamp: new Date().toISOString()
      };
    }

    setIsCleaningUp(true);

    try {
      console.log('🚨 Iniciando limpeza de emergência via hook...');
      
      const result = await cleanupService.executeFullCleanup();
      setLastCleanupResult(result);
      
      // Chamar callback se fornecido
      if (onCleanupComplete) {
        onCleanupComplete(result);
      }

      // Redirecionar se configurado (e se não foi redirecionado automaticamente)
      if (redirectAfterCleanup && !result.redirectedToLogin) {
        setTimeout(() => {
          router.push('/login?cleanup=true&source=hook');
        }, 1000);
      }

      return result;

    } catch (error) {
      console.error('❌ Erro durante limpeza de emergência:', error);
      throw error;
    } finally {
      setIsCleaningUp(false);
    }
  }, [isCleaningUp, lastCleanupResult, onCleanupComplete, redirectAfterCleanup, router, cleanupService]);

  /**
   * Verifica se há condições de loop
   */
  const checkForLoops = useCallback((): boolean => {
    try {
      const hasLoop = cleanupService.detectLoopCondition();
      
      if (hasLoop && onLoopDetected) {
        onLoopDetected();
      }

      return hasLoop;
    } catch (error) {
      console.error('❌ Erro ao verificar loops:', error);
      return false;
    }
  }, [cleanupService, onLoopDetected]);

  /**
   * Limpa histórico de limpeza
   */
  const clearCleanupHistory = useCallback(() => {
    setLastCleanupResult(null);
  }, []);

  /**
   * Efeito para detecção automática de loops
   */
  useEffect(() => {
    if (!autoDetect) return;

    const intervalId = setInterval(() => {
      if (isCleaningUp) return;

      const hasLoop = checkForLoops();
      
      if (hasLoop && autoCleanup) {
        console.log('🔄 Loop detectado, executando limpeza automática...');
        executeCleanup().catch(error => {
          console.error('❌ Erro na limpeza automática:', error);
        });
      }
    }, 10000); // Verifica a cada 10 segundos

    return () => clearInterval(intervalId);
  }, [autoDetect, autoCleanup, isCleaningUp, checkForLoops, executeCleanup]);

  /**
   * Efeito para incrementar contador de redirecionamentos
   */
  useEffect(() => {
    // Incrementa contador quando o componente é montado
    cleanupService.incrementRedirectCount();
  }, [cleanupService]);

  /**
   * Efeito para detectar erros não capturados
   */
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Incrementa contador de erros
      try {
        const errorKey = 'console_error_count';
        const count = parseInt(sessionStorage.getItem(errorKey) || '0');
        sessionStorage.setItem(errorKey, (count + 1).toString());
      } catch (error) {
        console.warn('⚠️ Erro ao incrementar contador de erros:', error);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Incrementa contador de erros para promises rejeitadas
      try {
        const errorKey = 'console_error_count';
        const count = parseInt(sessionStorage.getItem(errorKey) || '0');
        sessionStorage.setItem(errorKey, (count + 1).toString());
      } catch (error) {
        console.warn('⚠️ Erro ao incrementar contador de erros:', error);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return {
    isCleaningUp,
    lastCleanupResult,
    executeCleanup,
    checkForLoops,
    clearCleanupHistory
  };
};

/**
 * Hook simplificado para limpeza rápida
 */
export const useQuickCleanup = () => {
  const { executeCleanup, isCleaningUp } = useEmergencyCleanup({
    autoDetect: false,
    autoCleanup: false,
    redirectAfterCleanup: true
  });

  return {
    cleanupAndRedirect: executeCleanup,
    isCleaningUp
  };
};

/**
 * Hook para monitoramento de loops sem limpeza automática
 */
export const useLoopDetection = (onLoopDetected?: () => void) => {
  const { checkForLoops } = useEmergencyCleanup({
    autoDetect: true,
    autoCleanup: false,
    onLoopDetected
  });

  return {
    checkForLoops
  };
};

export default useEmergencyCleanup; 