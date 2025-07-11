'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole, ROLE_PERMISSIONS } from '@/types/roles'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { clearAllDataForUnauthorized } from '@/utils/clearAllData'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN] | Array<keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN]>
  redirectTo?: string
  showUnauthorized?: boolean
}

function ProtectedRouteContent({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/auth/login',
  showUnauthorized = true
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [reloadCounter, setReloadCounter] = useState(0)

  // Tratamento de erro e recuperação automática
  useEffect(() => {
    if (hasError && reloadCounter < 3) {
      const timer = setTimeout(() => {
        console.log('🔄 Tentando recuperar de erro de carregamento...');
        setReloadCounter(prev => prev + 1);
        // Forçar recarregamento do componente
        window.location.reload();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasError, reloadCounter]);

  useEffect(() => {
    // Captura de erros globais relacionados ao factory
    const handleError = (event: ErrorEvent) => {
      if (event.error && 
          event.error.toString().includes("can't access property \"call\", originalFactory is undefined")) {
        console.error('⚠️ Erro de factory detectado, preparando recuperação');
        event.preventDefault();
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    try {
      if (!loading) {
        if (!user) {
          // Se redirecionando para login, limpar dados primeiro
          if (redirectTo.includes('/login')) {
            clearAllDataForUnauthorized().then(() => {
              router.push(redirectTo + '?error=unauthorized')
            }).catch((error) => {
              console.error('❌ Erro durante limpeza de dados:', error);
              router.push(redirectTo + '?error=unauthorized')
            });
          } else {
            router.push(redirectTo)
          }
          return
        }

        // SYSTEM_ADMIN pode acessar TODAS as rotas
        if (user.role === UserRole.SYSTEM_ADMIN.toString() || user.role?.toLowerCase() === 'system_admin') {
          console.log('✅ SYSTEM_ADMIN detectado, permitindo acesso total');
          setIsAuthorized(true);
          return;
        }

        // Verificar role
        if (requiredRole) {
          const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
          const hasRole = roles.includes(user.role as UserRole)
          
          if (!hasRole) {
            console.log(`🔒 ProtectedRoute: Role ${user.role} não permitida`);
            setIsAuthorized(false)
            if (!showUnauthorized) {
              router.push('/dashboard')
            }
            return
          }
        }

        // Verificar permissão
        if (requiredPermission && user.role) {
          const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
          const userPermissions = ROLE_PERMISSIONS[user.role as UserRole]
          
          const hasPermission = permissions.every(permission => 
            userPermissions[permission] === true
          )
          
          if (!hasPermission) {
            console.log(`🔒 ProtectedRoute: Permissão ${requiredPermission} não encontrada para role ${user.role}`);
            setIsAuthorized(false)
            if (!showUnauthorized) {
              router.push('/dashboard')
            }
            return
          }
        }

        console.log('✅ ProtectedRoute: Acesso autorizado para role:', user.role);
        setIsAuthorized(true)
      }
    } catch (error) {
      console.error('❌ Erro durante verificação de autorização:', error);
      setHasError(true);
    }
  }, [user, loading, requiredRole, requiredPermission, router, redirectTo, showUnauthorized])

  // Modal de carregamento quando há erro
  if (hasError) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center flex-col"
        style={{ backgroundColor: theme.colors.background.primary }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-transparent rounded-full mb-6"
          style={{ 
            borderColor: theme.colors.primary.DEFAULT,
            borderTopColor: 'transparent'
          }}
        />
        <h2 
          className="text-xl font-medium mb-2 text-center"
          style={{ color: theme.colors.text.primary }}
        >
          Aguarde enquanto preparamos tudo para você
        </h2>
        <p
          className="text-sm text-center max-w-xs"
          style={{ color: theme.colors.text.secondary }}
        >
          Estamos carregando os recursos necessários...
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.colors.background.primary }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-transparent rounded-full"
          style={{ 
            borderColor: theme.colors.primary.DEFAULT,
            borderTopColor: 'transparent'
          }}
        />
      </div>
    )
  }

  if (!isAuthorized && showUnauthorized) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: theme.colors.background.primary }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-xl text-center"
          style={{ 
            backgroundColor: theme.colors.background.card,
            boxShadow: theme.shadows.lg
          }}
        >
          <span 
            className="material-symbols-outlined text-6xl mb-4"
            style={{ color: theme.colors.status.error }}
          >
            block
          </span>
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: theme.colors.text.primary }}
          >
            Acesso Negado
          </h2>
          <p 
            className="mb-6"
            style={{ color: theme.colors.text.secondary }}
          >
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
            style={{ 
              backgroundColor: theme.colors.primary.DEFAULT,
              color: theme.colors.primary.contrast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary.dark
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT
            }}
          >
            Voltar ao Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  // Captura de erros no componente principal
  try {
    return (
      <ProtectedRouteContent {...props} />
    );
  } catch (error) {
    console.error('❌ Erro fatal no ProtectedRoute:', error);
    // Fallback para caso de erro fatal
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-6 animate-spin"></div>
        <h2 className="text-xl font-medium mb-2 text-center text-gray-800">
          Aguarde enquanto preparamos tudo para você
        </h2>
      </div>
    );
  }
} 