'use client'

import { useState, useEffect } from 'react'
// REMOVIDO: SessionProvider do NextAuth para evitar erros 404
// import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '../contexts/AuthContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ToastManager } from '../components/ToastManager'
import { GamificationProvider } from '@/contexts/GamificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    try {
      // Aguardar um pouco para garantir que o DOM está pronto
      const timer = setTimeout(() => {
        setMounted(true)
      }, 100)

      return () => clearTimeout(timer)
    } catch (error) {
      console.error('❌ Erro na inicialização do AppProviders:', error)
      setHasError(true)
    }
  }, [])

  // Se houve erro na inicialização, renderizar apenas o children
  if (hasError) {
    console.warn('⚠️ AppProviders em modo de fallback devido a erro')
    return <>{children}</>
  }

  // Se não montou ainda, renderizar apenas o children para evitar hidration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  try {
    return (
      <ErrorBoundary>
        {/* REMOVIDO: SessionProvider para evitar chamadas para /api/auth/session */}
        <ThemeProvider>
          <AuthProvider>
            <ToastManager>
              <GamificationProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#4aed88',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 4000,
                      iconTheme: {
                        primary: '#ff6b6b',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </GamificationProvider>
            </ToastManager>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('❌ Erro ao renderizar AppProviders:', error)
    // Fallback para renderizar apenas o children
    return <>{children}</>
  }
}
