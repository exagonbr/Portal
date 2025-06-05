'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole, ROLE_PERMISSIONS } from '@/types/roles'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN] | Array<keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN]>
  redirectTo?: string
  showUnauthorized?: boolean
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/login',
  showUnauthorized = true
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      // Verificar role
      if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        const hasRole = roles.includes(user.role as UserRole)
        
        if (!hasRole) {
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
          setIsAuthorized(false)
          if (!showUnauthorized) {
            router.push('/dashboard')
          }
          return
        }
      }

      setIsAuthorized(true)
    }
  }, [user, loading, requiredRole, requiredPermission, router, redirectTo, showUnauthorized])

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