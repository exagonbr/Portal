'use client'

import { ReactNode } from 'react'
import { useAuthSafe as useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { LogoutLoadingState } from '@/components/ui/LoadingStates'
import Sidebar from '@/components/layout/Sidebar'

interface AuthenticatedDashboardLayoutProps {
  children: ReactNode
}

export default function AuthenticatedDashboardLayout({ children }: AuthenticatedDashboardLayoutProps) {
  const { user, loading, isLoggingOut } = useAuth()
  const { theme } = useTheme()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!theme || !theme.colors) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        <div className="w-64 bg-gray-100 border-r border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando tema...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {isLoggingOut && (
          <LogoutLoadingState message="Estamos finalizando sua sessão. Sempre bom ter você por aqui!" />
        )}
      </AnimatePresence>

      <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: theme.colors.background.secondary }}>
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
          <header className="shadow-sm border-b flex-shrink-0" style={{ 
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.border.DEFAULT 
          }}>
            <div className="px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold truncate" style={{ color: theme.colors.text.primary }}>
                    Portal Educacional Sabercon
                  </h1>
                  <p className="text-xs sm:text-sm truncate" style={{ color: theme.colors.text.secondary }}>
                    Bem-vindo(a), {user?.name}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto" style={{ backgroundColor: theme.colors.background.secondary }}>
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
} 