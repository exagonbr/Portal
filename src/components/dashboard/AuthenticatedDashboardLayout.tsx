'use client'

import { useAuth, useRequireAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  const [redirecting, setRedirecting] = useState(false)

<<<<<<< HEAD
  useEffect(() => {
    if (!loading && !user && !redirecting) {
      console.log('🔒 AuthenticatedDashboardLayout: Usuário não autenticado, redirecionando para login');
      setRedirecting(true);
      
      // Usar setTimeout para evitar problemas de hidratação
      setTimeout(() => {
        router.push('/auth/login?error=unauthorized');
      }, 100);
    }
  }, [loading, user, router, redirecting])

  // Mostrar loading enquanto verifica autenticação ou está redirecionando
  if (loading || redirecting) {
=======
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
>>>>>>> master
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Verificando autenticação...' : 'Redirecionando para login...'}
          </p>
        </div>
      </div>
    )
  }

<<<<<<< HEAD
  // Se não há usuário, não renderizar nada (vai redirecionar)
  if (!user) {
    return null;
=======
  // Se não há usuário, não renderize nada (o redirecionamento ocorrerá pelo useRequireAuth)
  if (!user) {
    return null
>>>>>>> master
  }

  // Se usuário está autenticado, renderizar o dashboard
  return <DashboardLayout>{children}</DashboardLayout>
}
