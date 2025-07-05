// Hook para monitorar atividade da sessão (heartbeat)
import { useEffect, useRef } from 'react';
import { UnifiedAuthService } from '@/services/unifiedAuthService';

interface UseSessionHeartbeatOptions {
  enabled?: boolean;
  interval?: number; // em milissegundos
  onSessionExpired?: () => void;
  onError?: (error: any) => void;
}

export function useSessionHeartbeat(options: UseSessionHeartbeatOptions = {}) {
  const {
    enabled = true,
    interval = 5 * 60 * 1000, // 5 minutos por padrão
    onSessionExpired,
    onError
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Função para atualizar atividade
  const updateActivity = async () => {
    try {
      if (!UnifiedAuthService.isAuthenticated()) {
        console.log('👻 Usuário não autenticado, parando heartbeat');
        stopHeartbeat();
        return;
      }

      await UnifiedAuthService.updateActivity();
      lastActivityRef.current = Date.now();
      console.log('💓 Heartbeat enviado');
      
    } catch (error) {
      console.error('❌ Erro no heartbeat:', error);
      
      if (onError) {
        onError(error);
      }

      // Se erro 401/403, sessão provavelmente expirou
      if (error instanceof Response && (error.status === 401 || error.status === 403)) {
        console.log('🔒 Sessão expirada detectada no heartbeat');
        if (onSessionExpired) {
          onSessionExpired();
        }
      }
    }
  };

  // Função para iniciar heartbeat
  const startHeartbeat = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    console.log(`💓 Iniciando heartbeat (intervalo: ${interval / 1000}s)`);
    
    intervalRef.current = setInterval(() => {
      updateActivity();
    }, interval);

    // Enviar primeiro heartbeat imediatamente
    updateActivity();
  };

  // Função para parar heartbeat
  const stopHeartbeat = () => {
    if (intervalRef.current) {
      console.log('💓 Parando heartbeat');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Função para detectar atividade do usuário
  const handleUserActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Efeito para gerenciar o heartbeat
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Verificar se está autenticado antes de iniciar
    if (UnifiedAuthService.isAuthenticated()) {
      startHeartbeat();
    }

    // Listeners para atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Cleanup
    return () => {
      stopHeartbeat();
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, interval]);

  // Efeito para detectar quando a aba fica visível novamente
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && enabled && UnifiedAuthService.isAuthenticated()) {
        console.log('👁️ Aba visível novamente, enviando heartbeat');
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  // Função para forçar heartbeat manual
  const forceHeartbeat = () => {
    updateActivity();
  };

  // Função para obter tempo desde última atividade
  const getTimeSinceLastActivity = () => {
    return Date.now() - lastActivityRef.current;
  };

  return {
    startHeartbeat,
    stopHeartbeat,
    forceHeartbeat,
    getTimeSinceLastActivity,
    isActive: !!intervalRef.current
  };
} 