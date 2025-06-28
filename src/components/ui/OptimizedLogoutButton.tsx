'use client';

import React from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { Button } from '@/components/ui/Button';

interface OptimizedLogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
  children?: React.ReactNode;
}

export function OptimizedLogoutButton({
  variant = 'ghost',
  size = 'default',
  className = '',
  showText = true,
  children
}: OptimizedLogoutButtonProps) {
  const { logout, isLoading } = useOptimizedAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      {children || (showText && (isLoading ? 'Saindo...' : 'Sair'))}
    </Button>
  );
}

// Componente de logout simples para uso em menus
export function OptimizedLogoutMenuItem({
  className = '',
  onLogout
}: {
  className?: string;
  onLogout?: () => void;
}) {
  const { logout, isLoading } = useOptimizedAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onLogout?.();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <button
      className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 ${className}`}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Saindo...' : 'Sair'}
    </button>
  );
}

// Hook para logout programático
export function useOptimizedLogout() {
  const { logout, isLoading } = useOptimizedAuth();

  const performLogout = async () => {
    try {
      await logout();
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error };
    }
  };

  return {
    logout: performLogout,
    isLoading
  };
} 