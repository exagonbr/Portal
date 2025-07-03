'use client';

import React from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { EnhancedLoadingState } from './LoadingStates';

interface LogoutHandlerProps {
  onLogout?: () => Promise<void>;
  children: (handleLogout: () => void) => React.ReactNode;
}

export function LogoutHandler({ onLogout, children }: LogoutHandlerProps) {
  const { logout, isLoading } = useOptimizedAuth();

  const handleLogout = async () => {
    await logout();
    if (onLogout) {
      await onLogout();
    }
  };

  return (
    <>
      {children(handleLogout)}
      
      {isLoading && (
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