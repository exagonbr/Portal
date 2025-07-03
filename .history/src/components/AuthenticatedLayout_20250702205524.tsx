'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Header } from './Header'
import { clearAllDataForUnauthorized } from '../utils/clearAllData'

export default function AuthenticatedLayout({
  children,
  requiredRole,
}: {
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher' | 'admin'
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      const frontendUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || '';
      
      if (!user) {
        // Limpar todos os dados antes de redirecionar para login
        const loginUrl = frontendUrl ? `${frontendUrl}/auth/login?error=unauthorized` : '/auth/login?error=unauthorized';
        clearAllDataForUnauthorized().then(() => {
          router.push(loginUrl)
        }).catch((error) => {
          console.log('❌ Erro durante limpeza de dados:', error);
          // Redirecionar mesmo com erro na limpeza
          router.push(loginUrl)
        });
      } else if (requiredRole && user.role !== requiredRole) {
        const studentUrl = frontendUrl ? `${frontendUrl}/dashboard/student` : '/dashboard/student';
        const teacherUrl = frontendUrl ? `${frontendUrl}/dashboard/teacher` : '/dashboard/teacher';
        router.push(user.role === 'student' ? studentUrl : teacherUrl)
      }
    }
  }, [user, isLoading, router, requiredRole])

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
