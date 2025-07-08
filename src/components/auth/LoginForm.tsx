'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LicenseValidationModal } from './LicenseValidationModal';
import { MotionDiv, MotionSpan } from '@/components/ui/MotionWrapper';
import { FRONTEND_URL } from '@/config/urls';
import { clearAllDataForUnauthorized } from '@/utils/clearAllData';

export function LoginForm() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 640;
      setIsMobile(isMobileDevice || isTouchDevice || isSmallScreen);
    };
    
    // Escutar evento de seleção de credenciais demo
    const handleDemoCredentialSelected = (event: CustomEvent) => {
      const { email, password } = event.detail;
      setEmail(email);
      setPassword(password);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('demoCredentialSelected', handleDemoCredentialSelected as EventListener);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('demoCredentialSelected', handleDemoCredentialSelected as EventListener);
    };
  }, []);

  const handleLogin = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // CORREÇÃO: Evitar múltiplas submissões
    if (isSubmitting) {
      console.log('Login já em andamento, ignorando nova tentativa');
      return;
    }

    // Validação básica
    if (!email || !password) {
      setSubmitError('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Limpar todos os dados antes do login
      console.log('🧹 Limpando todos os dados antes do login...');
      await clearAllDataForUnauthorized();
      console.log('✅ Dados limpos com sucesso');
      
      // CORREÇÃO: Adicionar timeout específico para o login
      const loginPromise = login(email, password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tempo limite excedido. Tente novamente.')), 20000)
      );
      
      await Promise.race([loginPromise, timeoutPromise]);
    } catch (error: any) {
      console.error('❌ Erro no handleLogin:', error);
      setSubmitError(error.message || 'Falha no login. Verifique as credenciais e tente novamente.');
    } finally {
      // CORREÇÃO: Garantir que o botão seja desbloqueado sempre
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  }, [login, email, password, isSubmitting]);

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6 mt-6 sm:mt-8" role="form" aria-label="Formulário de login">
        {submitError && (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3"
            style={{
              backgroundColor: `${theme.colors.status.error}20`,
              border: `1px solid ${theme.colors.status.error}40`
            }}
            role="alert"
          >
            <span
              className="material-symbols-outlined text-lg sm:text-xl mt-0.5"
              style={{ color: theme.colors.status.error }}
              aria-hidden="true"
            >
              error
            </span>
            <div className="flex-1">
              <h3 className="text-xs sm:text-sm font-medium" style={{ color: theme.colors.status.error }}>
                {submitError}
              </h3>
            </div>
          </MotionDiv>
        )}

        {/* Campo de Email */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: theme.colors.text.primary }}>
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isSubmitting}
              className={`w-full px-4 py-3 pl-10 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2`}
              style={{
                backgroundColor: theme.colors.background.primary,
                borderColor: theme.colors.border.DEFAULT,
                color: theme.colors.text.primary,
                fontSize: isMobile ? '16px' : '14px',
                minHeight: '48px'
              }}
            />
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-xl"
              style={{ color: theme.colors.text.tertiary }}
            >
              mail
            </span>
          </div>
        </MotionDiv>

        {/* Campo de Senha */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: theme.colors.text.primary }}>
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
              className={`w-full px-4 py-3 pl-10 pr-10 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2`}
              style={{
                backgroundColor: theme.colors.background.primary,
                borderColor: theme.colors.border.DEFAULT,
                color: theme.colors.text.primary,
                fontSize: isMobile ? '16px' : '14px',
                minHeight: '48px'
              }}
            />
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-xl"
              style={{ color: theme.colors.text.tertiary }}
            >
              lock
            </span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl hover:opacity-70 transition-opacity"
              style={{ color: theme.colors.text.tertiary }}
            >
              <span className="material-symbols-outlined">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </MotionDiv>

        {/* Botão de Login */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none py-3 sm:py-4 px-4"
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              color: theme.colors.primary.contrast,
              boxShadow: theme.shadows.md,
              minHeight: '48px',
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
                Acessar
              </>
            )}
          </button>
        </MotionDiv>

        {/* Botão de Validação de Licença */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-2 sm:mt-0"
        >
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg shadow-sm text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: theme.colors.secondary.DEFAULT,
              color: theme.colors.secondary.contrast,
              boxShadow: theme.shadows.md,
              minHeight: '48px'
            }}
          >
            <span className="material-symbols-outlined" aria-hidden="true">verified</span>
            Validar Licença
          </button>
        </MotionDiv>
      </form>

      <LicenseValidationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
