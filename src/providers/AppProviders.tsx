'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
// REMOVIDO: SessionProvider do NextAuth para evitar erros 404
// import { SessionProvider } from 'next-auth/react'

// Importações dinâmicas para evitar problemas de inicialização
const AuthProvider = dynamic(() => import('../contexts/AuthContext').then(mod => ({ default: mod.AuthProvider })), {
  ssr: false,
  loading: () => null
})

const ErrorBoundary = dynamic(() => import('../components/ErrorBoundary').then(mod => ({ default: mod.ErrorBoundary })), {
  ssr: false,
  loading: () => null
})

const ToastManager = dynamic(() => import('../components/ToastManager').then(mod => ({ default: mod.ToastManager })), {
  ssr: false,
  loading: () => null
})

const GamificationProvider = dynamic(() => import('@/contexts/GamificationContext').then(mod => ({ default: mod.GamificationProvider })), {
  ssr: false,
  loading: () => null
})

const ThemeProvider = dynamic(() => import('@/contexts/ThemeContext').then(mod => ({ default: mod.ThemeProvider })), {
  ssr: false,
  loading: () => null
})

const Toaster = dynamic(() => import('react-hot-toast').then(mod => ({ default: mod.Toaster })), {
  ssr: false,
  loading: () => null
})

// Componente de fallback simples
function FallbackProvider({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>
}

// Componente interno que renderiza os providers
function ProvidersContent({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
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
}

export function AppProviders({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const defaultFallback = fallback || <FallbackProvider>{children}</FallbackProvider>

  useEffect(() => {
    const initializeProviders = async () => {
      try {
        // Aguardar que o DOM esteja completamente carregado
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', resolve)
            } else {
              window.addEventListener('load', resolve)
            }
          })
        }

        // Aguardar um pouco mais para garantir que todos os chunks estejam carregados
        await new Promise(resolve => setTimeout(resolve, 200))
        
        setMounted(true)
        setHasError(false)
      } catch (error) {
        console.error('❌ Erro na inicialização do AppProviders:', error)
        setHasError(true)
        
        // Tentar novamente até 3 vezes
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
            setHasError(false)
          }, 1000 * (retryCount + 1))
        } else {
          // Após 3 tentativas, marcar como montado para renderizar fallback
          setMounted(true)
        }
      }
    }

    initializeProviders()
  }, [retryCount])

  // Se houve erro após todas as tentativas, usar fallback
  if (hasError && retryCount >= 3) {
    console.warn('⚠️ AppProviders usando fallback após múltiplas tentativas')
    return <>{defaultFallback}</>
  }

  // Se não montou ainda, renderizar loading ou fallback
  if (!mounted) {
    return <>{defaultFallback}</>
  }

  // Tentar renderizar os providers com Suspense para capturar erros de carregamento
  try {
    return (
      <Suspense fallback={defaultFallback}>
        <ProvidersContent>{children}</ProvidersContent>
      </Suspense>
    )
  } catch (error) {
    console.error('❌ Erro ao renderizar AppProviders:', error)
    return <>{defaultFallback}</>
  }
}
