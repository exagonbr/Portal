'use client'

import { useAuth, useRequireAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import DashboardLayout from './DashboardLayout'

export default function AuthenticatedDashboardLayout({
  children,
  requiredPermissions = [],
}: {
  children: React.ReactNode
  requiredPermissions?: string[]
}) {
  const { user, loading, hasAllPermissions } = useAuth()
  const router = useRouter()
  const redirectAttempts = useRef(0)
  const maxRedirectAttempts = 2

  // Utilize o hook useRequireAuth para garantir autenticação
  const { loading: authLoading } = useRequireAuth()

  useEffect(() => {
    // Evita múltiplos redirecionamentos
    if (redirectAttempts.current >= maxRedirectAttempts) {
      console.warn('🚫 AuthenticatedDashboardLayout: Máximo de tentativas de redirecionamento atingido')
      return
    }

    // Verificação adicional de permissões específicas, se necessário
    if (!loading && user) {
      // Se há permissões específicas exigidas para esta página
      if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
        console.log('🔒 AuthenticatedDashboardLayout: Usuário não possui permissões necessárias:', requiredPermissions)
        redirectAttempts.current++
        
        // Redireciona para o dashboard adequado ao perfil do usuário
        if (user.role) {
          const userDashboard = user.role === 'student' ? '/dashboard/student' : `/dashboard/${user.role}`
          router.push(`${userDashboard}?error=forbidden`)
        } else {
          router.push('/login?error=invalid_role')
        }
        return
      }

      // Reset contador se chegou até aqui sem redirecionamento
      redirectAttempts.current = 0
    }
  }, [loading, user, router, requiredPermissions, hasAllPermissions])

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  // Se não há usuário, não renderize nada (o redirecionamento ocorrerá pelo useRequireAuth)
  if (!user) {
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
