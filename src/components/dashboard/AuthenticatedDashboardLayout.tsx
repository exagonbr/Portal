'use client'

import { useAuth, useRequireAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from './DashboardLayout'
import { getDashboardPath, convertBackendRole } from '@/utils/roleRedirect'

export default function AuthenticatedDashboardLayout({
  children,
  requiredPermissions = [],
}: {
  children: React.ReactNode
  requiredPermissions?: string[]
}) {
  const { user, loading, hasAllPermissions } = useAuth()
  const router = useRouter()

  // Utilize o hook useRequireAuth para garantir autenticação
  const { loading: authLoading } = useRequireAuth()

  useEffect(() => {
    // Verificação adicional de permissões específicas, se necessário
    if (!loading && user) {
      // Se há permissões específicas exigidas para esta página
      if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
        console.log('🔒 Usuário não possui permissões necessárias:', requiredPermissions)
        
        // Redireciona para o dashboard adequado ao perfil do usuário
        const normalizedRole = convertBackendRole(user.role)
        const dashboardPath = getDashboardPath(normalizedRole || '')
        
        if (dashboardPath) {
          router.push(`${dashboardPath}?error=forbidden`)
        } else {
          router.push('/login?error=invalid_role')
        }
      }
    }
  }, [loading, user, router, requiredPermissions, hasAllPermissions])

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Se não há usuário, não renderize nada (o redirecionamento ocorrerá pelo useRequireAuth)
  if (!user) {
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
