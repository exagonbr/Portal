'use client'

import React, { ReactNode, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { setupGlobalErrorHandler } from '@/utils/errorHandling'
import { initializeFactoryDiagnostic } from '@/utils/factory-diagnostic'
import { isDevelopment } from '@/utils/env'
import { suppressHydrationWarnings } from '@/utils/suppressHydrationWarnings'
import { ErrorBoundary } from 'react-error-boundary';

// Dynamically import AuthProvider to ensure client-side rendering
const AuthProvider = dynamic(() =>
  import('../contexts/AuthContext')
    .then(mod => mod.AuthProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading AuthProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

const ThemeProvider = dynamic(() =>
  import('@/contexts/ThemeContext')
    .then(mod => mod.ThemeProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading ThemeProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

const GamificationProvider = dynamic(() =>
  import('@/contexts/GamificationContext')
    .then(mod => mod.GamificationProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading GamificationProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

const NavigationLoadingProvider = dynamic(() =>
  import('@/contexts/NavigationLoadingContext')
    .then(mod => mod.NavigationLoadingProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading NavigationLoadingProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

const ToastManager = dynamic(() =>
  import('@/components/ToastManager')
    .then(mod => mod.ToastManager)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading ToastManager:', error);
      }
      return () => null;
    }), {
  ssr: false,
  loading: () => null
})

const UpdateProvider = dynamic(() =>
  import('@/components/PWAUpdateManager')
    .then(mod => mod.UpdateProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading UpdateProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

const CacheCleanerProvider = dynamic(() =>
  import('@/components/layout/CacheCleanerProvider')
    .then(mod => mod.CacheCleanerProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading CacheCleanerProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

function ErrorBoundaryFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-4 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-600">error</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Erro de Carregamento
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Houve um problema ao carregar a aplicação. Isso pode ser devido a problemas de rede ou atualizações.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recarregar Página
            </button>
            {resetErrorBoundary && (
              <button
                onClick={resetErrorBoundary}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Tentar Novamente
              </button>
            )}
          </div>
          {isDevelopment() && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">Detalhes do erro</summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SimpleProviders({ children }: { children: ReactNode }) {
  // Configurar manipulador global de erros e diagnóstico
  useEffect(() => {
    const cleanup = setupGlobalErrorHandler();
    
    // Inicializar diagnóstico de factory
    initializeFactoryDiagnostic();
    
    // Suprimir avisos de hidratação se necessário
    suppressHydrationWarnings();
    
    return cleanup;
  }, []);

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorBoundaryFallback}
      onError={(error, errorInfo) => {
        if (isDevelopment()) {
          console.log('❌ ErrorBoundary capturou erro:', error, errorInfo);
        }
      }}
    >
      <AuthProvider>
        <ThemeProvider>
          <GamificationProvider>
            <NavigationLoadingProvider>
              <UpdateProvider>
              <ToastManager>
                {children}
              </ToastManager>
              </UpdateProvider>
            </NavigationLoadingProvider>
          </GamificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}