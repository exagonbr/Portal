'use client'

import React, { ReactNode, useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { setupGlobalErrorHandler } from '@/utils/errorHandling'
import { SessionProvider } from 'next-auth/react'
import { AuthWrapper } from '../contexts/AuthContext'

const ThemeProvider = dynamic(() => 
  import('@/contexts/ThemeContext')
    .then(mod => ({ default: mod.ThemeProvider }))
    .catch(error => {
      console.error('❌ Erro ao carregar ThemeProvider:', error);
      // Retornar um provider vazio em caso de erro
      return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
    }), {
  ssr: false,
  loading: () => null
})

const GamificationProvider = dynamic(() => 
  import('@/contexts/GamificationContext')
    .then(mod => ({ default: mod.GamificationProvider }))
    .catch(error => {
      console.error('❌ Erro ao carregar GamificationProvider:', error);
      // Retornar um provider vazio em caso de erro
      return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
    }), {
  ssr: false,
  loading: () => null
})

const NavigationLoadingProvider = dynamic(() =>
  import('@/contexts/NavigationLoadingContext')
    .then(mod => ({ default: mod.NavigationLoadingProvider }))
    .catch(error => {
      console.error('❌ Erro ao carregar NavigationLoadingProvider:', error);
      // Retornar um provider vazio em caso de erro
      return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
    }), {
  ssr: false,
  loading: () => null
})

const ToastManager = dynamic(() =>
  import('@/components/ToastManager')
    .then(mod => ({ default: mod.ToastManager }))
    .catch(error => {
      console.error('❌ Erro ao carregar ToastManager:', error);
      // Retornar um componente vazio em caso de erro
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
    console.error('❌ Erro no AuthWrapper:', error);
    return <>{children}</>;
  }
}

/**
 * Providers simplificados SEM telas de erro
 */
export function SimpleProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [providersReady, setProvidersReady] = useState(false)

  // Configurar manipulador global de erros
  useEffect(() => {
    // Configurar manipulador global de erros para factory/chunk
    const cleanupErrorHandler = setupGlobalErrorHandler();
    
    // Apenas marcar como montado após um pequeno delay
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanupErrorHandler(); // Limpar manipulador de erros
    };
  }, [])

  // Aguardar um pouco mais para garantir que os providers estão prontos
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        setProvidersReady(true);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [mounted]);

  // Não renderizar nada até estar montado no cliente e providers prontos
  if (!mounted || !providersReady) {
    return null;
  }

  // Renderizar sem error boundaries que mostram telas de erro
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
                      <GamificationProvider>
                        <Suspense fallback={null}>
                          <ToastManager>
                            {children}
                          </ToastManager>
                        </Suspense>
                      </GamificationProvider>
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