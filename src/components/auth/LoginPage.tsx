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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background com gradiente animado */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 8s ease infinite'
          }}
        />
        
        {/* Overlay com pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <MotionDiv
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-white text-center backdrop-blur-sm bg-white/10 p-8 rounded-2xl border border-white/20"
        >
          <MotionDiv
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-t-transparent border-white/80 rounded-full mx-auto mb-6"
          />
          <MotionP
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-medium"
          >
            Carregando Portal...
          </MotionP>
        </MotionDiv>
        
        <style jsx>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
    );
  }

  const { user } = authContext;

  if (user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden" 
        style={{ 
          background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}20, ${theme.colors.secondary.DEFAULT}20)`
        }}
      >
        {/* Padrão de fundo animado */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(theme.colors.primary.DEFAULT)}' fill-opacity='0.1'%3E%3Cpath d='M50 30a20 20 0 1 1 0 40 20 20 0 0 1 0-40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        
        <MotionDiv
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md w-full mx-4 text-center backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20"
          style={{ backgroundColor: `${theme.colors.background.primary}95` }}
        >
          <MotionDiv 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-12 h-12 border-3 border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: theme.colors.primary.DEFAULT }}
          />
          <MotionP 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-semibold" 
            style={{ color: theme.colors.text.primary }}
          >
            Redirecionando para o Portal...
          </MotionP>
          <MotionP 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm mt-2" 
            style={{ color: theme.colors.text.secondary }}
          >
            Aguarde um momento
          </MotionP>
        </MotionDiv>
        
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <LoginBackground className="overflow-hidden relative">
      {/* Overlay adicional para mais profundidade */}
      <div 
        className="absolute inset-0 z-5"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${theme.colors.primary.DEFAULT}15 0%, transparent 50%), 
                       radial-gradient(circle at 70% 80%, ${theme.colors.secondary.DEFAULT}10 0%, transparent 50%)`,
        }}
      />
      
      {/* Padrão geométrico sutil */}
      <div 
        className="absolute inset-0 z-5 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(theme.colors.text.primary)}' fill-opacity='0.8'%3E%3Cpath d='M60 60l30-30v60l-30-30zm30 0l30-30v60l-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Demo Credentials - Flutuante na lateral esquerda */}
      <DemoCredentials onCredentialSelect={handleCredentialSelect} />

      {/* Content - Container centralizado */}
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
        {/* Box de login com todo o conteúdo */}
        <MotionDiv 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative z-10 bg-white rounded-xl shadow-xl border border-gray-200/50 flex flex-col w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl"
          style={{ 
            minHeight: '500px',
            maxHeight: '95vh',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Header com logo dentro da div branca */}
          <div className="text-center pt-8 sm:pt-10 pb-6 sm:pb-8 px-4 sm:px-6 md:px-8">
            <MotionDiv
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="relative w-40 h-12 sm:w-48 sm:h-16 md:w-56 md:h-18 mx-auto mb-3">
                <Image
                  src="/sabercon-logo.png"
                  alt="Sabercon Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
                />
              </div>
              
              <MotionH1 
                className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Portal Educacional
              </MotionH1>
              
              <MotionP 
                className="text-xs sm:text-sm text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Faça login para continuar
              </MotionP>
            </MotionDiv>
          </div>

          {/* Mensagens de feedback */}
          {showUnauthorizedMessage && (
            <MotionDiv 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-4 sm:mx-6 md:mx-8 mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                <div>
                  <p className="text-sm font-medium text-red-800">Acesso não autorizado</p>
                  <p className="text-xs text-red-600">Você precisa fazer login para acessar esta área.</p>
                </div>
              </div>
            </MotionDiv>
          )}

          {showExpiredMessage && (
            <MotionDiv 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-4 sm:mx-6 md:mx-8 mb-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-sm">schedule</span>
                <div>
                  <p className="text-sm font-medium text-amber-800">Sessão expirada</p>
                  <p className="text-xs text-amber-600">Sua sessão expirou. Por favor, faça login novamente.</p>
                </div>
              </div>
            </MotionDiv>
          )}

          {/* Form Section */}
          <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <LoginForm />
            </MotionDiv>
          </div>
        </MotionDiv>
      </div>
    </LoginBackground>
  );
}