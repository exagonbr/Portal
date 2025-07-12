'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePersistentSession } from '@/hooks/usePersistentSession';
import { CookieManager } from '@/utils/cookieManager';

/**
 * Componente que inicializa e sincroniza dados de sessão em todos os storages
 * Garante que o user_id esteja disponível para as chamadas de API
 */
export function SessionInitializer() {
  const { user, isAuthenticated } = useAuth();
  const persistentSession = usePersistentSession();

  // Sincronizar dados de usuário em todos os storages
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 SessionInitializer: Sincronizando dados de usuário em todos os storages');
      
      try {
        // Dados do usuário para armazenamento
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions || []
        };
        
        // Salvar em localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Salvar em sessionStorage
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        // Salvar em cookies
        CookieManager.set('user_data', JSON.stringify(userData), {
          maxAge: 60 * 60 * 24, // 1 dia
          secure: true,
          sameSite: 'lax'
        });
        
        console.log('✅ SessionInitializer: Dados de usuário sincronizados com sucesso');
      } catch (error) {
        console.error('❌ SessionInitializer: Erro ao sincronizar dados de usuário:', error);
      }
    }
  }, [isAuthenticated, user]);

  // Garantir que session_id esteja definido
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        // Verificar se já existe um session_id
        const existingSessionId = localStorage.getItem('session_id') || 
                                 sessionStorage.getItem('session_id') ||
                                 CookieManager.get('session_id');
        
        if (!existingSessionId) {
          // Criar novo session_id
          const newSessionId = `session_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          
          // Salvar em todos os storages
          localStorage.setItem('session_id', newSessionId);
          sessionStorage.setItem('session_id', newSessionId);
          CookieManager.set('session_id', newSessionId, {
            maxAge: 60 * 60 * 24, // 1 dia
            secure: true,
            sameSite: 'lax'
          });
          
          console.log('✅ SessionInitializer: Novo session_id criado e salvo');
        } else {
          console.log('ℹ️ SessionInitializer: session_id já existe:', existingSessionId);
        }
      } catch (error) {
        console.error('❌ SessionInitializer: Erro ao gerenciar session_id:', error);
      }
    }
  }, [isAuthenticated, user]);

  // Não renderiza nada, apenas executa efeitos
  return null;
} 