'use client'

import React, { ReactNode, useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { setupGlobalErrorHandler } from '@/utils/errorHandling'

// Importações dinâmicas sem tratamento de erro que mostra telas
const AuthProvider = dynamic(() => 
  import('@/contexts/AuthContext')
    .then(mod => ({ default: mod.AuthProvider }))
    .catch(error => {
      console.error('❌ Erro ao carregar AuthProvider:', error);
      // Retornar um provider vazio em caso de erro
      return { default: ({ children }: { children: ReactNode }) => <>{children}</> };
    }), {
  ssr: false,
  loading: () => null
})

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
 * Providers simplificados SEM telas de erro
 */
export function SimpleProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

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

  // Não renderizar nada até estar montado no cliente
  if (!mounted) {
    return null;
  }

  // Renderizar sem error boundaries que mostram telas de erro
  return (
    <div className="min-h-screen w-full">
      <Suspense fallback={null}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <AuthProvider>
              <Suspense fallback={null}>
                <GamificationProvider>
                  <Suspense fallback={null}>
                    <ToastManager>
                      {children}
                    </ToastManager>
                  </Suspense>
                </GamificationProvider>
              </Suspense>
            </AuthProvider>
          </Suspense>
        </ThemeProvider>
      </Suspense>
    </div>
  )
}