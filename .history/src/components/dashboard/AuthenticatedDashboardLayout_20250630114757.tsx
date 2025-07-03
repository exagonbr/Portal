'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from './DashboardLayout'

export default function AuthenticatedDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

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

  // Se não há usuário, não renderizar nada (vai redirecionar)
  if (!user) {
    return null;
  }

  // Se usuário está autenticado, renderizar o dashboard
  return <DashboardLayout>{children}</DashboardLayout>
}
