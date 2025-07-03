'use client';

import { LoginForm } from './LoginForm';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ThemeSelectorCompact } from '@/components/ui/ThemeSelector';
import { useAuthSafe as useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { clearAllDataForUnauthorized } from '@/utils/clearAllData';
import { getDashboardPath } from '@/utils/roleRedirect';
import { MotionDiv, MotionH1, MotionP } from '@/components/ui/MotionWrapper';
import { getTheme } from '@/config/themes';
import { useEffect, useState } from 'react';

export function LoginPage() {
  const router = useRouter();
  const authContext = useAuth();
  const searchParams = useSearchParams();
  const [showUnauthorizedMessage, setShowUnauthorizedMessage] = useState(false);

  const [showExpiredMessage, setShowExpiredMessage] = useState(false);
  const [contextLoading, setContextLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Usar tema padrão seguro
  const [theme, setTheme] = useState(() => getTheme('academic'));
  
  // Tentar obter tema do contexto quando disponível
  useEffect(() => {
    if (mounted) {
      try {
        // Importar dinamicamente para evitar erro de hidratação
        import('@/contexts/ThemeContext').then(({ useTheme }) => {
          try {
            const themeContext = useTheme();
            if (themeContext?.theme) {
              setTheme(themeContext.theme);
            }
          } catch (error) {
            // Contexto não disponível, manter tema padrão
            console.log('ThemeContext não disponível, usando tema padrão');
          }
        }).catch(() => {
          // Erro ao importar, manter tema padrão
          console.log('Erro ao importar ThemeContext, usando tema padrão');
        });
      } catch (error) {
        // Qualquer erro, manter tema padrão
        console.log('Erro ao acessar tema, usando padrão');
      }
    }
  }, [mounted]);
  
  const { settings, isLoading } = useSystemSettings();

  // Aguardar montagem no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Aguardar o contexto estar disponível
  useEffect(() => {
    if (authContext !== undefined) {
      setContextLoading(false);
    }
  }, [authContext]);

  // Processar parâmetros da URL apenas no cliente
  useEffect(() => {
    if (!mounted || !authContext) return;
    
    const error = searchParams?.get('error');
    const authError = searchParams?.get('auth_error');
    const logout = searchParams?.get('logout');
    
    if (error === 'unauthorized') {
      setShowUnauthorizedMessage(true);
      
      // Limpar todos os dados quando redirecionar para login com erro unauthorized
      clearAllDataForUnauthorized().then(() => {
        console.log('✅ Limpeza completa de dados concluída para erro unauthorized');
      }).catch((error) => {
        console.log('❌ Erro durante limpeza de dados:', error);
      });
    }
    
    if (authError === 'expired') {
      setShowExpiredMessage(true);
      
      // Limpar todos os dados quando o login expirar
      clearAllDataForUnauthorized().then(() => {
        console.log('✅ Limpeza completa de dados concluída para login expirado');
      }).catch((error) => {
        console.log('❌ Erro durante limpeza de dados:', error);
      });
    }
    
    if (logout === 'true') {
      // Mostrar mensagem de logout bem-sucedido
      console.log('✅ Logout realizado com sucesso');
    }
    
    // Limpar parâmetros da URL após processar (apenas no cliente)
    if (typeof window !== 'undefined' && (error || authError || logout)) {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('auth_error');
      url.searchParams.delete('logout');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, authContext, mounted]);

  // Redirecionar usuário já autenticado para o dashboard correto
  useEffect(() => {
    if (!mounted || !authContext) return;
    
    const { user } = authContext;
    
    if (user) {
      // CORREÇÃO: Verificar se há loop de redirecionamento
      const redirectLoopKey = 'login_redirect_loop_check';
      const lastRedirectTime = sessionStorage.getItem(redirectLoopKey);
      const now = Date.now();
      
      if (lastRedirectTime && (now - parseInt(lastRedirectTime)) < 2000) {
        console.warn('🔄 Loop de redirecionamento detectado no login, aguardando...');
        return;
      }
      
      sessionStorage.setItem(redirectLoopKey, now.toString());
      
      // Verificar se há returnTo válido primeiro
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo');
      let targetPath: string | null = null;
      
      if (returnTo) {
        const decodedReturnTo = decodeURIComponent(returnTo);
        console.log('🎯 ReturnTo encontrado no login:', decodedReturnTo);
        
        // Validar returnTo
        const validPaths = ['/dashboard/system-admin', '/dashboard/institution-manager', '/dashboard/coordinator', '/dashboard/teacher', '/dashboard/student', '/dashboard/guardian'];
        
        if (validPaths.some(path => decodedReturnTo.startsWith(path))) {
          targetPath = decodedReturnTo;
          console.log('✅ ReturnTo validado:', targetPath);
        }
      }
      
      // Se não há returnTo válido, usar dashboard baseado na role
      if (!targetPath) {
        const normalizedRole = user.role?.toLowerCase();
        targetPath = getDashboardPath(normalizedRole || user.role);
        
        if (!targetPath) {
          console.warn(`⚠️ Dashboard não encontrado para role ${user.role}, usando fallback`);
          targetPath = '/dashboard/student';
        }
      }
      
      console.log(`🎯 Redirecionando usuário autenticado para: ${targetPath}`);
      
      // CORREÇÃO: Usar window.location.href para redirecionamento mais confiável
      setTimeout(() => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
        window.location.href = `${baseUrl}${targetPath}`;
      }, 300);
    }
  }, [authContext, router, mounted]);

  // Se não estiver montado ou contexto não disponível, mostrar loading
  if (!mounted || !authContext || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background.primary }}>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <MotionDiv
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto"
              style={{ borderColor: theme.colors.primary.DEFAULT }}
            />
            <p className="mt-2" style={{ color: theme.colors.text.secondary }}>
              {!mounted ? 'Carregando...' : !authContext ? 'Inicializando autenticação...' : 'Carregando...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { user } = authContext;

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
            <MotionDiv 
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
      <MotionDiv 
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
        <MotionDiv 
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
          <MotionH1 
            className="text-2xl font-bold"
            style={{ color: theme.colors.text.primary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Portal Educacional
          </MotionH1>
          <MotionP 
            className="text-sm mt-2"
            style={{ color: theme.colors.text.secondary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Transformando a educação com tecnologia
          </MotionP>
        </MotionDiv>

        {/* Unauthorized Message */}
        {showUnauthorizedMessage && (
          <MotionDiv
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
          </MotionDiv>
        )}

        {/* Expired Login Message */}
        {showExpiredMessage && (
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: `${theme.colors.status.error}20`,
              borderColor: theme.colors.status.error,
              color: theme.colors.text.primary
            }}
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <span
                  className="material-symbols-outlined"
                  style={{ color: theme.colors.status.error }}
                  aria-hidden="true"
                >
                  schedule
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Login Expirado</h3>
                <p className="text-sm mt-1 opacity-90">
                  Sua sessão expirou. Por favor, faça login novamente para continuar.
                </p>
              </div>
            </div>
          </MotionDiv>
        )}

        {/* Login Form */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <LoginForm />
        </MotionDiv>

        {/* Footer Links */}
        <MotionDiv 
          className="text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mt-4">
            <MotionDiv
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
              style={{ 
                backgroundColor: theme.colors.primary.light + '20',
                color: theme.colors.primary.DEFAULT
              }}
            >
              <span className="material-symbols-outlined">school</span>
            </MotionDiv>
            <MotionDiv
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
              style={{ 
                backgroundColor: theme.colors.secondary.light + '20',
                color: theme.colors.secondary.DEFAULT
              }}
            >
              <span className="material-symbols-outlined">groups</span>
            </MotionDiv>
            <MotionDiv
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
              style={{ 
                backgroundColor: theme.colors.accent.light + '20',
                color: theme.colors.accent.DEFAULT
              }}
            >
              <span className="material-symbols-outlined">auto_stories</span>
            </MotionDiv>
          </div>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}