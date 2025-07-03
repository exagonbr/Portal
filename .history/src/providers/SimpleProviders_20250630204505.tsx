'use client'

import React, { ReactNode, useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { setupGlobalErrorHandler } from '@/utils/errorHandling'
import { SessionProvider } from 'next-auth/react'
import { AuthWrapper } from '../contexts/AuthContext'
import { isDevelopment } from '@/utils/env'

const ThemeProvider = dynamic(() =>
  import('@/contexts/ThemeContext')
    .then(mod => {
      if (!mod.ThemeProvider) {
        console.warn('ThemeProvider não encontrado, usando fallback');
        return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
      }
      return { default: mod.ThemeProvider };
    })
    .catch(error => {
      if (isDevelopment()) {
        console.error('❌ Erro ao carregar ThemeProvider:', error);
      }
      // Retornar um provider vazio em caso de erro
      return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
    }), {
  ssr: false,
  loading: () => null
})

const GamificationProvider = dynamic(() =>
  import('@/contexts/GamificationContext')
    .then(mod => {
      if (!mod.GamificationProvider) {
        console.warn('GamificationProvider não encontrado, usando fallback');
        return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
      }
      return { default: mod.GamificationProvider };
    })
    .catch(error => {
      if (isDevelopment()) {
        console.error('❌ Erro ao carregar GamificationProvider:', error);
      }
      // Retornar um provider vazio em caso de erro
      return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
    }), {
  ssr: false,
  loading: () => null
})

const NavigationLoadingProvider = dynamic(() =>
  import('@/contexts/NavigationLoadingContext')
    .then(mod => {
      if (!mod.NavigationLoadingProvider) {
        console.warn('NavigationLoadingProvider não encontrado, usando fallback');
        return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
      }
      return { default: mod.NavigationLoadingProvider };
    })
    .catch(error => {
      if (isDevelopment()) {
        console.error('❌ Erro ao carregar NavigationLoadingProvider:', error);
      }
      // Retornar um provider vazio em caso de erro
      return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
    }), {
  ssr: false,
  loading: () => null
})

const ToastManager = dynamic(() =>
  import('@/components/ToastManager')
    .then(mod => {
      if (!mod.ToastManager) {
        console.warn('ToastManager não encontrado, usando fallback');
        return { default: () => null };
      }
      return { default: mod.ToastManager };
    })
    .catch(error => {
      if (isDevelopment()) {
        console.error('❌ Erro ao carregar ToastManager:', error);
      }
      // Retornar um componente vazio em caso de erro
      return { default: () => null };
    }), {
  ssr: false,
  loading: () => null
})

const UpdateProvider = dynamic(() =>
  import('@/components/PWAUpdateManager')
    .then(mod => {
      if (!mod.UpdateProvider) {
        console.warn('UpdateProvider não encontrado, usando fallback');
        return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
      }
      return { default: mod.UpdateProvider };
    })
    .catch(error => {
      if (isDevelopment()) {
        console.error('❌ Erro ao carregar UpdateProvider:', error);
      }
      // Retornar um provider vazio em caso de erro
      return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
    }), {
  ssr: false,
  loading: () => null
})

/**
 * Loading fallback minimalista
 */
function MinimalLoadingFallback() {
  return null; // Não mostrar nada durante carregamento
}

/**
 * Error boundary simples para AuthWrapper
 */
function AuthWrapperWithErrorBoundary({ children }: { children: ReactNode }) {
  try {
    return <AuthWrapper>{children}</AuthWrapper>;
  } catch (error) {
    if (isDevelopment()) {
      console.error('❌ Erro no AuthWrapper:', error);
    }
    return <>{children}</>;
  }
}

/**
 * Providers simplificados SEM telas de erro
 */
function SimpleProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Configurar manipulador global de erros apenas no cliente
  useEffect(() => {
    setMounted(true);
    
    // Configurar manipulador global de erros para factory/chunk
    const cleanupErrorHandler = setupGlobalErrorHandler();

    return () => {
      cleanupErrorHandler(); // Limpar manipulador de erros
    };
  }, [])

  // Renderizar uma versão simplificada no servidor
  if (!mounted) {
    return (
      <div className="min-h-screen w-full">
        {children}
      </div>
    );
  }

  // Renderizar versão completa no cliente
  return (
    <div className="min-h-screen w-full">
      <Suspense fallback={null}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationLoadingProvider>
              <Suspense fallback={null}>
                <SessionProvider>
                  <AuthWrapperWithErrorBoundary>
                    <Suspense fallback={null}>
                      <UpdateProvider>
                        <Suspense fallback={null}>
                          <GamificationProvider>
                            <Suspense fallback={null}>
                              <ToastManager>
                                {children}
                              </ToastManager>
                            </Suspense>
                          </GamificationProvider>
                        </Suspense>
                      </UpdateProvider>
                    </Suspense>
                  </AuthWrapperWithErrorBoundary>
                </SessionProvider>
              </Suspense>
            </NavigationLoadingProvider>
          </Suspense>
        </ThemeProvider>
      </Suspense>
    </div>
  )
}

// Exportação explícita para evitar problemas com lazy loading
export default SimpleProviders;