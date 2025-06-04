'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Header } from './Header'

export default function AuthenticatedLayout({
  children,
  requiredRole,
  requiredPermissions = [],
}: {
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher' | 'admin' | 'manager' | 'institution_manager' | 'academic_coordinator' | 'guardian' | 'system_admin'
  requiredPermissions?: string[]
}) {
  const { user, loading, hasAllPermissions } = useAuth()
  const router = useRouter()
  const redirectAttempts = useRef(0)
  const maxRedirectAttempts = 2

  useEffect(() => {
    // Evita múltiplos redirecionamentos
    if (redirectAttempts.current >= maxRedirectAttempts) {
      console.warn('🚫 AuthenticatedLayout: Máximo de tentativas de redirecionamento atingido')
      return
    }

    if (!loading) {
      if (!user) {
        console.log('🔄 AuthenticatedLayout: Usuário não autenticado, redirecionando para login')
        redirectAttempts.current++
        router.push('/login?error=unauthorized')
        return
      }

      // Verificação de role específica
      if (requiredRole && user.role !== requiredRole) {
        console.log(`🔄 AuthenticatedLayout: Role incorreta (atual: ${user.role}, necessária: ${requiredRole})`)
        redirectAttempts.current++
        
        // Redireciona para o dashboard correto baseado na role do usuário
        const userDashboard = user.role === 'student' ? '/dashboard/student' : `/dashboard/${user.role}`
        router.push(`${userDashboard}?error=role_mismatch`)
        return
      }

      // Verificação de permissões específicas
      if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
        console.log('🔒 AuthenticatedLayout: Usuário não possui permissões necessárias:', requiredPermissions)
        redirectAttempts.current++
        
        // Redireciona para o dashboard do usuário com erro
        const userDashboard = user.role === 'student' ? '/dashboard/student' : `/dashboard/${user.role}`
        router.push(`${userDashboard}?error=forbidden`)
        return
      }

      // Reset contador se chegou até aqui sem redirecionamento
      redirectAttempts.current = 0
    }
  }, [user, loading, router, requiredRole, requiredPermissions, hasAllPermissions])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
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
