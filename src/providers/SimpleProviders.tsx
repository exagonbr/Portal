'use client'

import React, { ReactNode, useState, useEffect, Suspense, ErrorInfo } from 'react'
import dynamic from 'next/dynamic'

// Importações dinâmicas mais robustas com retry
const AuthProvider = dynamic(() => 
  import('@/contexts/AuthContext')
    .then(mod => ({ default: mod.AuthProvider }))
    .catch(error => {
      console.error('❌ Erro ao carregar AuthProvider:', error);
      // Remover recarregamento automático - apenas logar o erro
      throw error;
    }), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando autenticação...</p>
    </div>
  </div>
})

const ThemeProvider = dynamic(() => 
  import('@/contexts/ThemeContext')
    .then(mod => ({ default: mod.ThemeProvider }))
    .catch(error => {
      console.error('❌ Erro ao carregar ThemeProvider:', error);
      // Remover recarregamento automático - apenas logar o erro
      throw error;
    }), {
  ssr: false,
  loading: () => null
})

const GamificationProvider = dynamic(() => 
  import('@/contexts/GamificationContext')
    .then(mod => ({ default: mod.GamificationProvider }))
    .catch(error => {
      console.error('❌ Erro ao carregar GamificationProvider:', error);
      // Remover recarregamento automático - apenas logar o erro
      throw error;
    }), {
  ssr: false,
  loading: () => null
})

const ToastManager = dynamic(() => 
  import('@/components/ToastManager')
    .then(mod => ({ default: mod.ToastManager }))
    .catch(error => {
      console.error('❌ Erro ao carregar ToastManager:', error);
      // Remover recarregamento automático - apenas logar o erro
      throw error;
    }), {
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
 * Error boundary simplificado SEM recarregamento automático
 */
class ChunkErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error; retryCount: number }
> {
  private retryTimer?: NodeJS.Timeout;

  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🔍 Erro capturado no ChunkErrorBoundary:', error);
    
    // Apenas logar o erro, SEM recarregamento automático
    const isChunkError = error.message?.includes('Loading chunk') || 
                        error.message?.includes('ChunkLoadError') ||
                        error.message?.includes('originalFactory') ||
                        error.message?.includes("can't access property \"call\"") ||
                        error.message?.includes('__webpack_require__') ||
                        error.name === 'ChunkLoadError'
    
    if (isChunkError) {
      console.warn('⚠️ Erro de chunk/originalFactory detectado - aguardando ação manual do usuário')
    }

    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Erro detalhado capturado pelo ChunkErrorBoundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: errorInfo.errorBoundary
    });

    // Remover tentativa de recuperação automática
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro de carregamento</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Ocorreu um erro ao carregar a aplicação. Clique no botão abaixo para tentar novamente.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Recarregar página
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">Detalhes do erro</summary>
                <pre className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Providers simplificados SEM recarregamento automático
 */
export function SimpleProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;

    const initializeProviders = async () => {
      try {
        // Aguardar um pouco para garantir que o DOM está pronto
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (isMounted) {
          setMounted(true);
          
          // Aguardar mais um pouco para garantir que todos os chunks foram carregados
          await new Promise(resolve => setTimeout(resolve, 300));
          
          if (isMounted) {
            setIsReady(true);
          }
        }
      } catch (error) {
        console.error('❌ Erro na inicialização dos providers:', error);
        if (isMounted) {
          setInitError(error instanceof Error ? error.message : 'Erro desconhecido');
        }
      }
    };

    initializeProviders();

    return () => {
      isMounted = false;
    };
  }, [])

  // Mostrar erro de inicialização se houver
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro de inicialização</h2>
          <p className="text-gray-600 mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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