'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedLoadingState } from './LoadingStates';
import { clearAllDataForUnauthorized } from '@/utils/clearAllData';

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

      // Chamar callback de logout se fornecido ANTES da limpeza
      if (onLogout) {
        try {
          await onLogout();
        } catch (error) {
          console.warn('⚠️ Erro no callback de logout (ignorando):', error);
        }
      }

      // Usar limpeza completa de dados
      await clearAllDataForUnauthorized();

      // Redirecionar para login usando window.location para garantir limpeza completa
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?logout=true';
      } else {
        router.push('/auth/login?logout=true');
      }
    } catch (error) {
      console.error('❌ LogoutHandler: Erro ao fazer logout:', error);
      
      // Limpeza de emergência
      try {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
          window.location.href = '/auth/login?logout=error';
        }
      } catch (emergencyError) {
        console.error('❌ Erro na limpeza de emergência:', emergencyError);
        // Como último recurso
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login?logout=emergency';
        }
      }
    }
    // Nota: Não resetamos isLoggingOut porque vamos redirecionar
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