'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LicenseValidationModal } from './LicenseValidationModal';
import { GoogleLoginButton } from './GoogleLoginButton';
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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
      
      // Chamar login sem timeout adicional, pois o AuthContext já gerencia isso
      await login(email, password);
    } catch (error: any) {
      console.error('❌ Erro no handleLogin:', error);
      // CORREÇÃO: Melhor tratamento de mensagens de erro
      let errorMessage = 'Falha no login. Verifique as credenciais e tente novamente.';
      
      if (error.message && error.message.includes('Tempo limite excedido')) {
        errorMessage = 'Tempo limite excedido. O servidor está demorando para responder. Tente novamente em alguns instantes.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      // CORREÇÃO: Garantir que o botão seja desbloqueado sempre
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  }, [login, email, password, isSubmitting]);

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-6 sm:space-y-7 mt-8" role="form" aria-label="Formulário de login">
        {submitError && (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="rounded-xl p-4 sm:p-5 flex items-start gap-3 backdrop-blur-sm border"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.status.error}15, ${theme.colors.status.error}08)`,
              borderColor: `${theme.colors.status.error}30`,
              boxShadow: `0 4px 20px ${theme.colors.status.error}20`
            }}
            role="alert"
          >
            <MotionDiv
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className="flex-shrink-0"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${theme.colors.status.error}20` }}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ color: theme.colors.status.error }}
                  aria-hidden="true"
                >
                  error
                </span>
              </div>
            </MotionDiv>
            <div className="flex-1 pt-0.5">
              <h3 
                className="text-sm sm:text-base font-semibold leading-tight" 
                style={{ color: theme.colors.status.error }}
              >
                {submitError}
              </h3>
            </div>
          </MotionDiv>
        )}

        {/* Campo de Email */}
        <MotionDiv
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="group"
        >
          <label 
            htmlFor="email" 
            className="block text-sm font-semibold mb-3 transition-colors duration-300" 
            style={{ 
              color: emailFocused ? theme.colors.primary.DEFAULT : theme.colors.text.primary 
            }}
          >
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="seu@email.com"
              required
              disabled={isSubmitting}
              className={`w-full px-5 py-4 pl-12 pr-4 rounded-xl border-2 transition-all duration-300 ease-out focus:outline-none backdrop-blur-sm
                ${emailFocused ? 'transform scale-[1.02]' : ''}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-opacity-80'}
              `}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.background.primary}90, ${theme.colors.background.primary}70)`,
                borderColor: emailFocused ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT,
                color: theme.colors.text.primary,
                fontSize: isMobile ? '16px' : '15px',
                minHeight: '52px',
                boxShadow: emailFocused 
                  ? `0 8px 25px ${theme.colors.primary.DEFAULT}20, 0 0 0 3px ${theme.colors.primary.DEFAULT}10`
                  : `0 2px 10px ${theme.colors.border.DEFAULT}20`
              }}
            />
            <MotionDiv
              initial={{ scale: 1 }}
              animate={{ 
                scale: emailFocused ? 1.1 : 1,
                color: emailFocused ? theme.colors.primary.DEFAULT : theme.colors.text.tertiary
              }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
            >
              <span className="material-symbols-outlined text-xl">mail</span>
            </MotionDiv>
            {/* Indicador de foco */}
            <MotionDiv
              initial={{ width: 0 }}
              animate={{ width: emailFocused ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 h-0.5 rounded-full"
              style={{ backgroundColor: theme.colors.primary.DEFAULT }}
            />
          </div>
        </MotionDiv>

        {/* Campo de Senha */}
        <MotionDiv
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="group"
        >
          <label 
            htmlFor="password" 
            className="block text-sm font-semibold mb-3 transition-colors duration-300" 
            style={{ 
              color: passwordFocused ? theme.colors.primary.DEFAULT : theme.colors.text.primary 
            }}
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
              className={`w-full px-5 py-4 pl-12 pr-12 rounded-xl border-2 transition-all duration-300 ease-out focus:outline-none backdrop-blur-sm
                ${passwordFocused ? 'transform scale-[1.02]' : ''}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-opacity-80'}
              `}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.background.primary}90, ${theme.colors.background.primary}70)`,
                borderColor: passwordFocused ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT,
                color: theme.colors.text.primary,
                fontSize: isMobile ? '16px' : '15px',
                minHeight: '52px',
                boxShadow: passwordFocused 
                  ? `0 8px 25px ${theme.colors.primary.DEFAULT}20, 0 0 0 3px ${theme.colors.primary.DEFAULT}10`
                  : `0 2px 10px ${theme.colors.border.DEFAULT}20`
              }}
            />
            <MotionDiv
              initial={{ scale: 1 }}
              animate={{ 
                scale: passwordFocused ? 1.1 : 1,
                color: passwordFocused ? theme.colors.primary.DEFAULT : theme.colors.text.tertiary
              }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
            >
              <span className="material-symbols-outlined text-xl">lock</span>
            </MotionDiv>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              style={{ 
                color: theme.colors.text.tertiary,
                backgroundColor: showPassword ? `${theme.colors.primary.DEFAULT}15` : 'transparent'
              }}
            >
              <MotionDiv
                animate={{ rotateY: showPassword ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </MotionDiv>
            </button>
            {/* Indicador de foco */}
            <MotionDiv
              initial={{ width: 0 }}
              animate={{ width: passwordFocused ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 h-0.5 rounded-full"
              style={{ backgroundColor: theme.colors.primary.DEFAULT }}
            />
          </div>
        </MotionDiv>

        {/* Botão de Login */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="pt-2"
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center items-center gap-3 rounded-xl shadow-xl text-base font-semibold transition-all duration-300 transform overflow-hidden py-4 px-6"
            style={{
              background: isSubmitting 
                ? `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}60, ${theme.colors.primary.DEFAULT}40)`
                : `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.DEFAULT}E0)`,
              color: theme.colors.primary.contrast,
              boxShadow: isSubmitting 
                ? `0 4px 15px ${theme.colors.primary.DEFAULT}30`
                : `0 8px 25px ${theme.colors.primary.DEFAULT}40, 0 0 0 1px ${theme.colors.primary.DEFAULT}20`,
              minHeight: '56px',
              fontSize: isMobile ? '16px' : '15px'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 12px 35px ${theme.colors.primary.DEFAULT}50, 0 0 0 1px ${theme.colors.primary.DEFAULT}30`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${theme.colors.primary.DEFAULT}40, 0 0 0 1px ${theme.colors.primary.DEFAULT}20`;
              }
            }}
          >
            {/* Efeito de brilho animado */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(45deg, transparent 30%, ${theme.colors.primary.contrast}20 50%, transparent 70%)`
              }}
            />
            
            {isSubmitting ? (
              <>
                <MotionSpan
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="material-symbols-outlined relative z-10"
                >
                  progress_activity
                </MotionSpan>
                <span className="relative z-10">Acessando...</span>
              </>
            ) : (
              <>
                <MotionDiv
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span className="material-symbols-outlined relative z-10">login</span>
                </MotionDiv>
                <span className="relative z-10">Acessar Portal</span>
              </>
            )}
          </button>
        </MotionDiv>

        {/* Divisor "ou" aprimorado */}
        <MotionDiv
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="relative py-4"
        >
          <div className="absolute inset-0 flex items-center">
            <div 
              className="w-full h-px"
              style={{ 
                background: `linear-gradient(90deg, transparent, ${theme.colors.border.DEFAULT}60, transparent)`
              }}
            />
          </div>
          <div className="relative flex justify-center">
            <span 
              className="px-4 py-2 text-sm font-medium rounded-full backdrop-blur-sm border"
              style={{ 
                backgroundColor: `${theme.colors.background.primary}95`,
                color: theme.colors.text.secondary,
                borderColor: `${theme.colors.border.DEFAULT}40`
              }}
            >
              ou continue com
            </span>
          </div>
        </MotionDiv>

        {/* Botão Entrar com Google */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <GoogleLoginButton 
            disabled={isSubmitting}
            onLoginStart={() => setIsSubmitting(true)}
          />
        </MotionDiv>

        {/* Botão de Validação de Licença */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="pt-2"
        >
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-98 backdrop-blur-sm border"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.secondary.DEFAULT}95, ${theme.colors.secondary.DEFAULT}80)`,
              color: theme.colors.secondary.contrast,
              borderColor: `${theme.colors.secondary.DEFAULT}30`,
              boxShadow: `0 4px 15px ${theme.colors.secondary.DEFAULT}25`,
              minHeight: '52px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 8px 25px ${theme.colors.secondary.DEFAULT}35`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 4px 15px ${theme.colors.secondary.DEFAULT}25`;
            }}
          >
            <MotionDiv
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <span className="material-symbols-outlined" aria-hidden="true">verified</span>
            </MotionDiv>
            <span>Validar Licença</span>
            
            {/* Efeito de shimmer */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(45deg, transparent 30%, ${theme.colors.secondary.contrast}15 50%, transparent 70%)`,
                animation: 'shimmer 2s infinite'
              }}
            />
          </button>
        </MotionDiv>
      </form>

      <LicenseValidationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}
