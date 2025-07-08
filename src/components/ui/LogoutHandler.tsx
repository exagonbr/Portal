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

      // Usar limpeza completa de dados em vez de performCompleteLogout para evitar loop
      await clearAllDataForUnauthorized();

      // Chamar callback de logout se fornecido
      if (onLogout) {
        await onLogout();
      }

      // Redirecionar para login
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