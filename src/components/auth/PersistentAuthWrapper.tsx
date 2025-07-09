'use client';

import { useEffect, useState } from 'react';
import { usePersistentSession } from '@/hooks/usePersistentSession';
import { UnifiedAuthService } from '@/services/unifiedAuthService';
import { toast } from 'react-hot-toast';

interface PersistentAuthWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper que integra o sistema de sessão persistente com o contexto existente
 * Garante que a sessão seja mantida até logout explícito
 */
export function PersistentAuthWrapper({ children }: PersistentAuthWrapperProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const persistentSession = usePersistentSession();

  // Integração com sistema legado
  useEffect(() => {
    if (!isInitialized) {
      console.log('🔧 Inicializando sistema de sessão persistente...');
      
      // Verificar se há sessão válida
      if (persistentSession.isAuthenticated && persistentSession.user) {
        console.log('✅ Sessão persistente encontrada:', persistentSession.user.email);
        
        // Sincronizar com localStorage legado para compatibilidade
        if (typeof window !== 'undefined') {
          const userData = {
            id: persistentSession.user.id,
            name: persistentSession.user.name,
            email: persistentSession.user.email,
            role: persistentSession.user.role,
            permissions: persistentSession.user.permissions,
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Obter token atual
          persistentSession.getCurrentToken().then(token => {
            if (token) {
              localStorage.setItem('accessToken', token);
              localStorage.setItem('auth_token', token);
              localStorage.setItem('token', token);
            }
          }).catch(error => {
            console.warn('⚠️ Erro ao obter token atual:', error);
          });
        }
      } else if (!persistentSession.isLoading) {
        console.log('ℹ️ Nenhuma sessão persistente encontrada');
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized, persistentSession.isAuthenticated, persistentSession.user, persistentSession.isLoading]);

  // Monitorar erros de sessão
  useEffect(() => {
    if (persistentSession.error) {
      console.error('❌ Erro no sistema de sessão persistente:', persistentSession.error);
      
      // Mostrar toast apenas para erros críticos
      if (persistentSession.error.includes('Erro ao carregar sessão')) {
        toast.error('Erro ao carregar sua sessão. Faça login novamente.');
      }
    }
  }, [persistentSession.error]);

  // Interceptar tentativas de limpeza do localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalClear = localStorage.clear;
    const originalRemoveItem = localStorage.removeItem;

    // Interceptar localStorage.clear()
    localStorage.clear = function() {
      console.log('🛡️ Interceptando localStorage.clear() - mantendo sessão persistente');
      
      // Salvar dados importantes antes da limpeza
      const sessionData = localStorage.getItem('session_data');
      const lastActivity = localStorage.getItem('last_activity');
      
      // Executar limpeza original
      originalClear.call(this);
      
      // Restaurar dados da sessão persistente
      if (sessionData) {
        localStorage.setItem('session_data', sessionData);
      }
      if (lastActivity) {
        localStorage.setItem('last_activity', lastActivity);
      }
      
      // Atualizar atividade para indicar que a sessão ainda está ativa
      persistentSession.updateActivity();
    };

    // Interceptar remoção de itens críticos
    localStorage.removeItem = function(key: string) {
      if (key === 'session_data' || key === 'last_activity') {
        console.log(`🛡️ Interceptando tentativa de remover ${key} - mantendo sessão persistente`);
        return; // Não permitir remoção
      }
      
      originalRemoveItem.call(this, key);
    };

    // Cleanup
    return () => {
      localStorage.clear = originalClear;
      localStorage.removeItem = originalRemoveItem;
    };
  }, [persistentSession.updateActivity]);

  // Configurar listener para eventos de beforeunload
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      // Atualizar atividade antes de fechar/recarregar a página
      if (persistentSession.isAuthenticated) {
        persistentSession.updateActivity();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [persistentSession.isAuthenticated, persistentSession.updateActivity]);

  // Função global para logout forçado (para compatibilidade)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).forceLogout = async () => {
        console.log('🔓 Logout forçado solicitado via global function');
        await persistentSession.logout();
        
        // Garantir que a página seja recarregada
        setTimeout(() => {
          window.location.href = '/auth/login?logout=forced';
        }, 100);
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).forceLogout;
      }
    };
  }, [persistentSession.logout]);

  return <>{children}</>;
} 