/**
 * Botão de Logout Ultra-Completo
 * Limpa TUDO TUDO TUDO e volta para o login
 */

import React, { useState } from 'react';
import { useUltraLogout } from '../../hooks/useUltraLogout';

interface UltraLogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'emergency' | 'silent';
  showConfirmation?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function UltraLogoutButton({
  children = 'Sair',
  className = '',
  variant = 'default',
  showConfirmation = true,
  disabled = false,
  size = 'md',
  icon
}: UltraLogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, logoutWithoutConfirmation, emergencyLogout } = useUltraLogout();

  const handleLogout = async () => {
    if (isLoggingOut || disabled) return;

    try {
      setIsLoggingOut(true);

      let success = false;

      switch (variant) {
        case 'emergency':
          success = await emergencyLogout();
          break;
        case 'silent':
          success = await logoutWithoutConfirmation();
          break;
        default:
          success = showConfirmation ? await logout() : await logoutWithoutConfirmation();
          break;
      }

      if (!success) {
        setIsLoggingOut(false);
      }
      // Se success = true, o usuário será redirecionado, então não precisamos resetar o estado
    } catch (error) {
      console.error('❌ UltraLogoutButton: Erro no logout:', error);
      setIsLoggingOut(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-md transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const variantStyles = {
      default: `
        bg-red-600 hover:bg-red-700 text-white
        focus:ring-red-500 border border-transparent
      `,
      emergency: `
        bg-red-800 hover:bg-red-900 text-white
        focus:ring-red-600 border border-red-600
        shadow-lg hover:shadow-xl animate-pulse
      `,
      silent: `
        bg-gray-600 hover:bg-gray-700 text-white
        focus:ring-gray-500 border border-transparent
      `
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();
  };

  const getLoadingIcon = () => {
    if (variant === 'emergency') {
      return (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    
    return (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );
  };

  const getDefaultIcon = () => {
    if (variant === 'emergency') {
      return (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    );
  };

  const getButtonText = () => {
    if (isLoggingOut) {
      switch (variant) {
        case 'emergency':
          return 'Saindo de Emergência...';
        case 'silent':
          return 'Saindo...';
        default:
          return 'Limpando dados...';
      }
    }

    if (variant === 'emergency') {
      return children || 'Sair de Emergência';
    }

    return children;
  };

  return (
    <button
      onClick={handleLogout}
      disabled={disabled || isLoggingOut}
      className={getButtonStyles()}
      title={variant === 'emergency' ? 'Logout de emergência - limpa tudo imediatamente' : 'Fazer logout completo'}
    >
      {isLoggingOut ? getLoadingIcon() : (icon || getDefaultIcon())}
      {getButtonText()}
    </button>
  );
}

// Componente de conveniência para logout de emergência
export function EmergencyLogoutButton(props: Omit<UltraLogoutButtonProps, 'variant'>) {
  return <UltraLogoutButton {...props} variant="emergency" />;
}

// Componente de conveniência para logout silencioso
export function SilentLogoutButton(props: Omit<UltraLogoutButtonProps, 'variant'>) {
  return <UltraLogoutButton {...props} variant="silent" showConfirmation={false} />;
} 