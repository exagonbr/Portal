'use client';

import React, { useState } from 'react';
import { MotionDiv, MotionSpan } from '@/components/ui/MotionWrapper';
import { useTheme } from '@/contexts/ThemeContext';

interface GoogleLoginButtonProps {
  disabled?: boolean;
  onLoginStart?: () => void;
  className?: string;
}

export function GoogleLoginButton({ 
  disabled = false, 
  onLoginStart, 
  className = '' 
}: GoogleLoginButtonProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    onLoginStart?.();

    try {
      // Redirecionar para o endpoint do NextAuth para Google OAuth
      window.location.href = '/api/auth/signin/google?callbackUrl=' + 
        encodeURIComponent(window.location.origin + '/dashboard');
    } catch (error) {
      console.error('Erro ao iniciar login do Google:', error);
      setIsLoading(false);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className={className}
    >
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={disabled || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl border shadow-sm text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:shadow-md"
        style={{
          backgroundColor: '#ffffff',
          borderColor: theme.colors.border.DEFAULT,
          color: '#1f2937',
          boxShadow: theme.shadows.sm,
          minHeight: '44px',
          fontSize: '14px'
        }}
      >
        {isLoading ? (
          <>
            <MotionSpan
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full"
            />
            Conectando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path 
                fill="#4285F4" 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path 
                fill="#34A853" 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path 
                fill="#FBBC05" 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path 
                fill="#EA4335" 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-xs sm:text-sm">Entrar com o Google</span>
          </>
        )}
      </button>
    </MotionDiv>
  );
}

export default GoogleLoginButton; 