'use client'

import React, { ReactNode, useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Importações dinâmicas para evitar problemas de chunk loading
const AuthProvider = dynamic(() => import('@/contexts/AuthContext').then(mod => ({ default: mod.AuthProvider })), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando autenticação...</p>
    </div>
  </div>
})

const ThemeProvider = dynamic(() => import('@/contexts/ThemeContext').then(mod => ({ default: mod.ThemeProvider })), {
  ssr: false,
  loading: () => null
})

const GamificationProvider = dynamic(() => import('@/contexts/GamificationContext').then(mod => ({ default: mod.GamificationProvider })), {
  ssr: false,
  loading: () => null
})

const ToastManager = dynamic(() => import('@/components/ToastManager').then(mod => ({ default: mod.ToastManager })), {
  ssr: false,
  loading: () => null
})

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando aplicação...</p>
      </div>
    </div>
  )
}

/**
 * Error boundary para capturar erros de chunk loading
 */
class ChunkErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    // Verificar se é erro de chunk loading
    const isChunkError = error.message?.includes('Loading chunk') || 
                        error.message?.includes('ChunkLoadError') ||
                        error.message?.includes('originalFactory') ||
                        error.name === 'ChunkLoadError'
    
    if (isChunkError) {
      console.warn('🔄 Erro de chunk detectado, recarregando página...')
      // Recarregar a página após um pequeno delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }, 1000)
    }

    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ Erro capturado pelo ChunkErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro de carregamento</h2>
            <p className="text-gray-600 mb-4">Recarregando a página...</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Recarregar agora
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Providers simplificados para evitar problemas de carregamento de chunks
 * Esta é uma versão robusta que lida com erros de chunk loading
 */
export function SimpleProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Aguardar um pouco para garantir que todos os chunks foram carregados
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [])

  // Não renderizar nada até estar montado no cliente
  if (!mounted) {
    return <LoadingFallback />
  }

  return (
    <ChunkErrorBoundary>
      <div className="min-h-screen w-full">
        <Suspense fallback={<LoadingFallback />}>
          <ThemeProvider>
            <Suspense fallback={<LoadingFallback />}>
              <AuthProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <GamificationProvider>
                    <Suspense fallback={<LoadingFallback />}>
                      <ToastManager>
                        {isReady ? children : <LoadingFallback />}
                      </ToastManager>
                    </Suspense>
                  </GamificationProvider>
                </Suspense>
              </AuthProvider>
            </Suspense>
          </ThemeProvider>
        </Suspense>
      </div>
    </ChunkErrorBoundary>
  )
} 