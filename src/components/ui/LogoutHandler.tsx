'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedLoadingState } from './LoadingStates';

interface LogoutHandlerProps {
  onLogout?: () => Promise<void>;
  children: (handleLogout: () => void) => React.ReactNode;
}

export function LogoutHandler({ onLogout, children }: LogoutHandlerProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);

      // 1. Limpar localStorage
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'auth_token',
          'refresh_token',
          'session_id',
          'user',
          'user_data',
          'auth_expires_at',
          'next-auth.session-token',
          'next-auth.csrf-token',
          '__Secure-next-auth.session-token',
          '__Host-next-auth.csrf-token'
        ];

        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        // Limpar sessionStorage também
        sessionStorage.clear();
      }

      // 2. Limpar cookies
      if (typeof document !== 'undefined') {
        const cookiesToClear = [
          'auth_token',
          'refresh_token',
          'session_id',
          'user_data',
          'next-auth.session-token',
          'next-auth.csrf-token',
          '__Secure-next-auth.session-token',
          '__Host-next-auth.csrf-token'
        ];

        cookiesToClear.forEach(cookieName => {
          // Limpar para diferentes paths e domínios
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        });
      }

      // 3. Chamar API de logout para limpar Redis/Backend
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      } catch (apiError) {
        console.warn('Erro ao chamar API de logout:', apiError);
        // Continua mesmo se a API falhar
      }

      // 4. Invalidar sessão no Redis via API
      try {
        const sessionId = localStorage.getItem('session_id');
        if (sessionId) {
          await fetch('/api/sessions/invalidate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });
        }
      } catch (redisError) {
        console.warn('Erro ao invalidar sessão no Redis:', redisError);
        // Continua mesmo se falhar
      }

      // 5. Executar callback personalizado se fornecido
      if (onLogout) {
        await onLogout();
      }

      // 6. Aguardar um pouco para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 7. Redirecionar para login
      router.push('/login');
      
      // 8. Recarregar a página para garantir limpeza completa
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);

    } catch (error) {
      console.error('Erro durante logout:', error);
      
      // Fallback: forçar limpeza e redirecionamento mesmo com erro
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      router.push('/login');
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = () => {
    performLogout();
  };

  return (
    <>
      {children(handleLogout)}
      
      {isLoggingOut && (
        <EnhancedLoadingState
          message="Saindo do sistema..."
          submessage="Limpando dados e finalizando sessão"
          showProgress={false}
        />
      )}
    </>
  );
}

export default LogoutHandler; 