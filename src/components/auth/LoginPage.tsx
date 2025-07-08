'use client';

import { LoginForm } from './LoginForm';
import { DemoCredentials } from './DemoCredentials';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

import { useAuthSafe as useAuth } from '@/contexts/AuthContext';
import { LoginBackground } from '@/components/ui/DynamicBackground';
import { clearAllDataForUnauthorized } from '@/utils/clearAllData';
import { getDashboardPath } from '@/utils/roleRedirect';
import { MotionDiv, MotionH1, MotionP } from '@/components/ui/MotionWrapper';
import { getTheme } from '@/config/themes';
import { useEffect, useState, useRef } from 'react';
import { buildUrl } from '@/utils/urlBuilder';
import { isChromeOrChromeMobile, forceReloadIfChrome } from '@/utils/chromeDetection';
// import { ChromeDetectionIndicator } from '@/components/debug/ChromeDetectionIndicator';

export function LoginPage() {
  // Hook para limpeza automática de cache
  
  const router = useRouter();
  const authContext = useAuth();
  const searchParams = useSearchParams();
  const [showUnauthorizedMessage, setShowUnauthorizedMessage] = useState(false);

  const [showExpiredMessage, setShowExpiredMessage] = useState(false);
  const [contextLoading, setContextLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const loginFormRef = useRef<{ setCredentials: (email: string, password: string) => void }>(null);
  
  // Função para lidar com a seleção de credenciais
  const handleCredentialSelect = (email: string, password: string) => {
    // Criar um evento customizado para comunicar com o LoginForm
    const event = new CustomEvent('demoCredentialSelected', {
      detail: { email, password }
    });
    window.dispatchEvent(event);
  };
  
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
  
  // Aguardar montagem no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Correção específica para Chrome (desktop e mobile) - força reload ignorando cache
  useEffect(() => {
    if (!mounted) return;
    
    // Aplicar reload apenas se necessário
    const chromeReloadApplied = forceReloadIfChrome();
    if (chromeReloadApplied) {
      console.log('🔄 Aplicando correção de reload para Chrome no login...');
    }
  }, [mounted]);

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
      
      // CORREÇÃO: Usar FRONTEND_URL para redirecionamento mais confiável
      setTimeout(() => {
        const fullUrl = buildUrl(targetPath!);
        console.log(`🌐 Redirecionando para URL completa: ${fullUrl}`);
        window.location.href = fullUrl;
      }, 300);
    }
  }, [authContext, router, mounted]);

  // Aguardar contexto estar pronto
  if (!mounted || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const { user } = authContext;

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
    <LoginBackground className="overflow-hidden">
      {/* Demo Credentials - Flutuante na lateral esquerda */}
      <DemoCredentials onCredentialSelect={handleCredentialSelect} />

      {/* Content */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-lg w-full mx-4 space-y-8 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl"
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
          <div className="relative w-36 sm:w-48 h-12 sm:h-16 mx-auto mb-3 sm:mb-4">
            <Image
              src="/sabercon-logo.png"
              alt="Sabercon Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 640px) 144px, 192px"
            />
          </div>
          <MotionH1 
            className="text-xl sm:text-2xl font-bold"
            style={{ color: theme.colors.text.primary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Portal Educacional
          </MotionH1>
          <MotionP 
            className="text-sm sm:text-base"
            style={{ color: theme.colors.text.secondary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Acesse sua conta para continuar
          </MotionP>
        </MotionDiv>

        {/* Mensagens de feedback */}
        {showUnauthorizedMessage && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-red-400" aria-hidden="true">error</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Acesso não autorizado</h3>
                <p className="text-sm text-red-700 mt-1">
                  Você precisa fazer login para acessar esta área.
                </p>
              </div>
            </div>
          </div>
        )}

        {showExpiredMessage && (
          <div className="rounded-md bg-amber-50 p-4 border border-amber-200" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-amber-400" aria-hidden="true">schedule</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Sessão expirada</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Sua sessão expirou. Por favor, faça login novamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <LoginForm ref={loginFormRef} />
        </MotionDiv>
      </MotionDiv>
    </LoginBackground>
  );
}