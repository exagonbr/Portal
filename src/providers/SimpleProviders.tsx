'use client'

import { ReactNode, useState, useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { GamificationProvider } from '@/contexts/GamificationContext'

/**
 * Providers simplificados para evitar problemas de carregamento de chunks
 * Esta é uma versão mínima que pode ser expandida gradualmente
 */
export function SimpleProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sempre renderizar os providers, mesmo durante o carregamento
  return (
    <div className="min-h-screen w-full">
      <ThemeProvider>
        <AuthProvider>
          <GamificationProvider>
            {mounted ? children : (
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando...</p>
                </div>
              </div>
            )}
          </GamificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  )
} 