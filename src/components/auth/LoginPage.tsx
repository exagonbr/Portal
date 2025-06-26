'use client';

import { LoginForm } from './LoginForm';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeSelectorCompact } from '@/components/ui/ThemeSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { clearAllDataForUnauthorized } from '@/utils/clearAllData';
import { getDashboardPath } from '@/utils/roleRedirect';
import { MobileDebugInfo } from '@/components/debug/MobileDebugInfo';

export function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [showUnauthorizedMessage, setShowUnauthorizedMessage] = useState(false);
  const { theme } = useTheme();
  const { settings, isLoading } = useSystemSettings();

  useEffect(() => {
    const error = searchParams?.get('error');
    const logout = searchParams?.get('logout');
    
    if (error === 'unauthorized') {
      setShowUnauthorizedMessage(true);
      
      // Limpar todos os dados quando redirecionar para login com erro unauthorized
      clearAllDataForUnauthorized().then(() => {
        console.log('✅ Limpeza completa de dados concluída para erro unauthorized');
      }).catch((error) => {
        console.error('❌ Erro durante limpeza de dados:', error);
      });
    }
    
    if (logout === 'true') {
      // Mostrar mensagem de logout bem-sucedido
      console.log('✅ Logout realizado com sucesso');
    }
    
    // Limpar parâmetros da URL após processar
    if (error || logout) {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('logout');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  // Redirecionar usuário já autenticado para o dashboard correto
  useEffect(() => {
    if (user) {
      const normalizedRole = user.role?.toLowerCase();
      const dashboardPath = getDashboardPath(normalizedRole || user.role);
      
      if (dashboardPath) {
        console.log(`🎯 Redirecionando usuário autenticado para: ${dashboardPath}`);
        
        // Adicionar delay para evitar loops e usar router.push
        setTimeout(() => {
          router.push(dashboardPath);
        }, 500);
      } else {
        console.warn(`⚠️ Dashboard não encontrado para role ${user.role}, usando fallback`);
        
        setTimeout(() => {
          router.push('/dashboard/student');
        }, 500);
      }
    }
  }, [user, router]);

  const renderBackground = () => {
    if (isLoading) return null;

    // Se settings for null, usar padrão
    if (!settings) {
      return (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-100"
          preload="auto"
        >
          <source src="/back_video4.mp4" type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
      );
    }

    const { background_type, main_background } = settings;

    // Sempre usar o vídeo como padrão se não houver configuração
    if (!background_type || !main_background) {
      return (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-100"
          preload="auto"
        >
          <source src="/back_video4.mp4" type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
      );
    }

    switch (background_type) {
      case 'video':
        return (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute min-w-full min-h-full object-cover opacity-100"
            preload="auto"
          >
            <source src={main_background || '/back_video4.mp4'} type="video/mp4" />
            Seu navegador não suporta a tag de vídeo.
          </video>
        );

      case 'image':
        const isVideo = main_background.match(/\.(mp4|webm|ogg)$/i);
        
        if (isVideo) {
          return (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute min-w-full min-h-full object-cover opacity-100"
              preload="auto"
            >
              <source src={main_background} type="video/mp4" />
              Seu navegador não suporta a tag de vídeo.
            </video>
          );
        } else {
          return (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${main_background})`,
                opacity: 1
              }}
            />
          );
        }

      case 'color':
        return (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: main_background,
              opacity: 1
            }}
          />
        );

      default:
        return (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute min-w-full min-h-full object-cover opacity-100"
            preload="auto"
          >
            <source src="/back_video4.mp4" type="video/mp4" />
            Seu navegador não suporta a tag de vídeo.
          </video>
        );
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background.primary }}>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto"
              style={{ borderColor: theme.colors.primary.DEFAULT }}
            />
            <p className="mt-2" style={{ color: theme.colors.text.secondary }}>Redirecionando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center overflow-hidden" 
      role="main"
    >
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" aria-hidden="true">
        {renderBackground()}
        {/* Overlay opcional para melhor legibilidade */}
        {settings?.background_type === 'video' && (
          <div className="absolute inset-0 bg-black/20" />
        )}
      </div>

      {/* Theme Selector */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSelectorCompact />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-lg w-full space-y-8 p-8 rounded-2xl shadow-2xl backdrop-blur-xl"
        style={{ 
          backgroundColor: theme.type === 'modern' 
            ? 'rgba(26, 26, 26, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${theme.colors.border.DEFAULT}`
        }}
      >
        {/* Logo Section */}
        <motion.div 
          className="text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative w-48 h-16 mx-auto mb-4">
            <Image
              src="/sabercon-logo.png"
              alt="Sabercon Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 192px, 192px"
            />
          </div>
          <motion.h1 
            className="text-2xl font-bold"
            style={{ color: theme.colors.text.primary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Portal Educacional
          </motion.h1>
          <motion.p 
            className="text-sm mt-2"
            style={{ color: theme.colors.text.secondary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Transformando a educação com tecnologia
          </motion.p>
        </motion.div>

        {/* Unauthorized Message */}
        {showUnauthorizedMessage && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: `${theme.colors.status.warning}20`,
              borderColor: theme.colors.status.warning,
              color: theme.colors.text.primary
            }}
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <span 
                  className="material-symbols-outlined"
                  style={{ color: theme.colors.status.warning }}
                  aria-hidden="true"
                >
                  warning
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Não autorizado</h3>
                <p className="text-sm mt-1 opacity-90">
                  Você precisa fazer login para acessar esta página.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <LoginForm />
        </motion.div>

        {/* Footer Links */}
        <motion.div 
          className="text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mt-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
              style={{ 
                backgroundColor: theme.colors.primary.light + '20',
                color: theme.colors.primary.DEFAULT
              }}
            >
              <span className="material-symbols-outlined">school</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
              style={{ 
                backgroundColor: theme.colors.secondary.light + '20',
                color: theme.colors.secondary.DEFAULT
              }}
            >
              <span className="material-symbols-outlined">groups</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
              style={{ 
                backgroundColor: theme.colors.accent.light + '20',
                color: theme.colors.accent.DEFAULT
              }}
            >
              <span className="material-symbols-outlined">auto_stories</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Debug info apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && <MobileDebugInfo />}
    </div>
  );
} 