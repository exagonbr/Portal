'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Header } from './Header'
import { clearAllDataForUnauthorized } from '../utils/clearAllData'
import { buildLoginUrl, buildDashboardUrl } from '../utils/urlBuilder'
import { UserRole, hasPermission } from '@/types/roles'

export default function AuthenticatedLayout({
  children,
  requiredRole,
  requiredPermission,
}: {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: string
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Limpar todos os dados antes de redirecionar para login
        const loginUrl = buildLoginUrl({ error: 'unauthorized' });
        clearAllDataForUnauthorized().then(() => {
          router.push(loginUrl)
        }).catch((error) => {
          console.log('❌ Erro durante limpeza de dados:', error);
          // Redirecionar mesmo com erro na limpeza
          router.push(loginUrl)
        });
        return;
      }

      // SYSTEM_ADMIN tem acesso a TODAS as páginas
      if (user.role === UserRole.SYSTEM_ADMIN) {
        return;
      }

      // Verificar role específica se fornecida
      if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const hasRequiredRole = roles.includes(user.role);
        
        if (!hasRequiredRole) {
          console.log(`🔒 AuthenticatedLayout: Role ${user.role} não permitida. Roles necessárias: ${roles.join(', ')}`);
          const dashboardUrl = buildDashboardUrl(user.role);
          router.push(dashboardUrl);
          return;
        }
      }

      // Verificar permissão específica se fornecida
      if (requiredPermission && !hasPermission(user.role, requiredPermission as any)) {
        console.log(`🔒 AuthenticatedLayout: Permissão ${requiredPermission} não encontrada para role ${user.role}`);
        const dashboardUrl = buildDashboardUrl(user.role);
        router.push(dashboardUrl);
        return;
      }
    }
  }, [user, isLoading, router, requiredRole, requiredPermission])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen min-w-screen bg-background-secondary flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[95%] md:max-w-[90%] lg:max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
