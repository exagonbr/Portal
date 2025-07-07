'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedLoadingState } from './LoadingStates';
import { CookieManager } from '@/utils/cookieManager';

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
          'user',
          'user_data',
        ];

        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
      }

      // 2. Limpar cookies usando CookieManager
      CookieManager.clearAuthCookies();

      // 3. Chamar API de logout
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Erro ao chamar API de logout:', error);
      }

      // 4. Callback de logout
      if (onLogout) {
        onLogout();
      }

      // 5. Redirecionar para login
      router.push('/auth/login?logout=true');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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