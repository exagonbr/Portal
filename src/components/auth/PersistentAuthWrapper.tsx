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
          
          // Salvar em localStorage
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Salvar em sessionStorage também para redundância
          sessionStorage.setItem('user', JSON.stringify(userData));
          
          // Obter token atual
          persistentSession.getCurrentToken().then(token => {
            if (token) {
              localStorage.setItem('accessToken', token);
              localStorage.setItem('auth_token', token);
              localStorage.setItem('token', token);
              
              // Salvar em sessionStorage também
              sessionStorage.setItem('accessToken', token);
              sessionStorage.setItem('auth_token', token);
              sessionStorage.setItem('token', token);
              
              // Definir cookie de autenticação para compatibilidade com backend
              document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
              
              console.log('✅ Token sincronizado em todos os storages');
            }
          }).catch(error => {
            console.warn('⚠️ Erro ao obter token atual:', error);
          });
          
          // Verificar se já existe um session_id
          const sessionId = persistentSession.user.id + '_' + Date.now();
          localStorage.setItem('session_id', sessionId);
          sessionStorage.setItem('session_id', sessionId);
          document.cookie = `session_id=${sessionId}; path=/; max-age=86400; SameSite=Lax`;
        }
      } else if (!persistentSession.isLoading) {
        console.log('ℹ️ Nenhuma sessão persistente encontrada');
        
        // Verificar se existe user no localStorage mas não na sessão persistente
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            if (userData && userData.id) {
              console.log('🔄 Encontrado user no localStorage, sincronizando com sessão persistente');
              
              // Obter token
              const token = localStorage.getItem('accessToken') || 
                          localStorage.getItem('auth_token') || 
                          localStorage.getItem('token');
              
              if (token) {
                // Tentar salvar na sessão persistente
                UnifiedAuthService.saveAuthData({
                  user: userData,
                  accessToken: token,
                  refreshToken: localStorage.getItem('refreshToken') || token,
                  expiresIn: 3600 // 1 hora
                }).then(() => {
                  console.log('✅ Dados sincronizados do localStorage para sessão persistente');
                  // Recarregar a página para aplicar as mudanças
                  window.location.reload();
                }).catch(error => {
                  console.error('❌ Erro ao sincronizar dados:', error);
                });
              }
            }
          }
        } catch (error) {
          console.error('❌ Erro ao verificar localStorage:', error);
        }
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized, persistentSession.isAuthenticated, persistentSession.user, persistentSession.isLoading]);

  // Monitorar mudanças no localStorage para manter sincronização
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user' || event.key === 'accessToken' || 
          event.key === 'auth_token' || event.key === 'token') {
        console.log('🔄 Detectada mudança no storage:', event.key);
        
        // Recarregar sessão persistente
        persistentSession.loadSession();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isInitialized, persistentSession]);

  return <>{children}</>;
} 