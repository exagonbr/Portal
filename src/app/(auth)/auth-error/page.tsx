'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { clearAllDataForUnauthorized } from '@/utils/clearAllData';
import { LoginBackground } from '@/components/ui/DynamicBackground';

const ERROR_MESSAGES = {
  unauthorized: {
    title: 'Acesso Não Autorizado',
    message: 'Sua sessão expirou ou você não tem permissão para acessar esta área.',
    action: 'Faça login novamente para continuar.'
  },
  forbidden: {
    title: 'Acesso Negado',
    message: 'Você não tem permissão para acessar este recurso.',
    action: 'Entre em contato com o administrador se precisar de acesso.'
  },
  session_expired: {
    title: 'Sessão Expirada',
    message: 'Sua sessão expirou por motivos de segurança.',
    action: 'Faça login novamente para continuar usando o sistema.'
  },
  invalid_token: {
    title: 'Token Inválido',
    message: 'Seu token de autenticação é inválido ou foi corrompido.',
    action: 'Faça login novamente para obter um novo token.'
  },
  default: {
    title: 'Erro de Autenticação',
    message: 'Ocorreu um erro durante a autenticação.',
    action: 'Tente fazer login novamente.'
  }
};

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [isClearing, setIsClearing] = useState(false);

  const errorType = searchParams?.get('type') || 'default';
  const errorInfo = ERROR_MESSAGES[errorType as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.default;

  useEffect(() => {
    // Limpar dados quando chegar na página de erro
    const clearData = async () => {
      setIsClearing(true);
      try {
        await clearAllDataForUnauthorized();
        console.log('✅ Dados limpos na página de erro de autenticação');
      } catch (error) {
        console.log('❌ Erro ao limpar dados:', error);
      } finally {
        setIsClearing(false);
      }
    };

    clearData();
  }, []);

  const handleReturnToLogin = () => {
    router.push('/auth/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <LoginBackground className="p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full p-8 rounded-xl text-center bg-white/90 backdrop-blur-sm shadow-2xl"
      >
        {/* Ícone de erro */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <span 
            className="material-symbols-outlined text-6xl mb-4 block"
            style={{ color: theme.colors.status.error }}
          >
            error
          </span>
        </motion.div>

        {/* Título */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-4"
          style={{ color: theme.colors.text.primary }}
        >
          {errorInfo.title}
        </motion.h1>

        {/* Mensagem */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-2"
          style={{ color: theme.colors.text.secondary }}
        >
          {errorInfo.message}
        </motion.p>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
          style={{ color: theme.colors.text.tertiary }}
        >
          {errorInfo.action}
        </motion.p>

        {/* Indicador de limpeza de dados */}
        {isClearing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                Limpando dados...
              </span>
            </div>
          </motion.div>
        )}

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <button
            onClick={handleReturnToLogin}
            disabled={isClearing}
            className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: theme.colors.primary.DEFAULT,
              color: theme.colors.primary.contrast
            }}
            onMouseEnter={(e) => {
              if (!isClearing) {
                e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
              }
            }}
            onMouseLeave={(e) => {
              if (!isClearing) {
                e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT;
              }
            }}
          >
            Fazer Login
          </button>

          <button
            onClick={handleGoHome}
            disabled={isClearing}
            className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              borderColor: theme.colors.border.DEFAULT,
              color: theme.colors.text.secondary,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              if (!isClearing) {
                e.currentTarget.style.backgroundColor = theme.colors.background.hover;
              }
            }}
            onMouseLeave={(e) => {
              if (!isClearing) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Página Inicial
          </button>
        </motion.div>

        {/* Link de suporte */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 pt-6 border-t"
          style={{ borderColor: theme.colors.border.light }}
        >
          <p className="text-sm" style={{ color: theme.colors.text.tertiary }}>
            Problemas persistindo?{' '}
            <Link 
              href="/support" 
              className="underline hover:no-underline"
              style={{ color: theme.colors.primary.DEFAULT }}
            >
              Entre em contato com o suporte
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </LoginBackground>
  );
} 