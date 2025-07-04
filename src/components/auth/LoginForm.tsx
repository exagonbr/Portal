'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LicenseValidationModal } from './LicenseValidationModal';
import { MotionDiv, MotionSpan } from '@/components/ui/MotionWrapper';
import { FRONTEND_URL } from '@/config/urls';

export function LoginForm() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice || isTouchDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await login('admin@sabercon.edu.br', 'password123');
    } catch (error: any) {
      setSubmitError(error.message || 'Falha no login. Verifique as credenciais e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [login]);

  return (
    <>
      <div className="space-y-6 mt-8" role="form" aria-label="Formulário de login">
        {submitError && (
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg p-4 flex items-start gap-3" 
            style={{
              backgroundColor: `${theme.colors.status.error}20`,
              border: `1px solid ${theme.colors.status.error}40`
            }}
            role="alert"
          >
            <span 
              className="material-symbols-outlined text-xl mt-0.5" 
              style={{ color: theme.colors.status.error }}
              aria-hidden="true"
            >
              error
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-medium" style={{ color: theme.colors.status.error }}>
                {submitError}
              </h3>
            </div>
          </MotionDiv>
        )}

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="button"
            onClick={handleLogin}
            disabled={isSubmitting}
            className={`w-full flex justify-center items-center gap-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isMobile ? 'py-4 px-4' : 'py-3 px-4'
            }`}
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              color: theme.colors.primary.contrast,
              boxShadow: theme.shadows.md,
              minHeight: isMobile ? '48px' : 'auto',
              fontSize: isMobile ? '16px' : '14px'
            }}
          >
            {isSubmitting ? (
              <>
                <MotionSpan
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="material-symbols-outlined"
                >
                  progress_activity
                </MotionSpan>
                Acessando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">login</span>
                Acessar como SYSTEM_ADMIN
              </>
            )}
          </button>
        </MotionDiv>

        <MotionDiv 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: theme.colors.border.light }} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span 
              className="px-2" 
              style={{ 
                backgroundColor: theme.type === 'modern' ? theme.colors.background.card : theme.colors.background.primary,
                color: theme.colors.text.tertiary 
              }}
            >
              ou continue com
            </span>
          </div>
        </MotionDiv>

        <MotionDiv 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <a
            href={`${FRONTEND_URL}/api/auth/signin/google`}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            style={{
              color: theme.colors.text.primary,
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.DEFAULT,
              minHeight: isMobile ? '48px' : 'auto',
            }}
          >
            <Image src="/google-logo.svg" alt="Google logo" width={20} height={20} className="mr-2" />
            Entrar com o Google
          </a>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg shadow-sm text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: theme.colors.secondary.DEFAULT,
              color: theme.colors.secondary.contrast,
              boxShadow: theme.shadows.md
            }}
          >
            <span className="material-symbols-outlined" aria-hidden="true">verified</span>
            Validar Licença
          </button>
        </MotionDiv>
      </div>

      <LicenseValidationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
