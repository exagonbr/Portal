'use client'

import React, { ReactNode, useEffect, Suspense, useState } from 'react'
import { setupGlobalErrorHandler } from '@/utils/errorHandling'
import { initializeFactoryDiagnostic } from '@/utils/factory-diagnostic'
import { isDevelopment } from '@/utils/env'
import { suppressHydrationWarnings } from '@/utils/suppressHydrationWarnings'
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import dynamic from 'next/dynamic'

// Carregamento dinâmico dos providers menos críticos
const GamificationProvider = dynamic(() => import('@/contexts/GamificationContext').then(mod => mod.GamificationProvider), {
  ssr: false
})
const NavigationLoadingProvider = dynamic(() => import('@/contexts/NavigationLoadingContext').then(mod => mod.NavigationLoadingProvider), {
  ssr: false
})
const ToastManager = dynamic(() => import('@/components/ToastManager').then(mod => mod.ToastManager), {
  ssr: false
})
const UpdateProvider = dynamic(() => import('@/components/PWAUpdateManager').then(mod => mod.UpdateProvider), {
  ssr: false
})
const CacheCleanerProvider = dynamic(() => import('@/components/layout/CacheCleanerProvider').then(mod => mod.default), {
  ssr: false
})

function ErrorBoundaryFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary?: () => void }) {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const isMobile = typeof window !== 'undefined' && /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);

  useEffect(() => {
    // Armazenar contagem de tentativas
    const storedCount = parseInt(sessionStorage.getItem('error-retry-count') || '0');
    setRetryCount(storedCount);
  }, []);

  const handleRetry = () => {
    const newCount = retryCount + 1;
    setRetryCount(newCount);
    sessionStorage.setItem('error-retry-count', newCount.toString());

    if (newCount <= maxRetries) {
      if (resetErrorBoundary) {
        resetErrorBoundary();
      } else {
        window.location.reload();
      }
    } else {
      // Em dispositivos móveis, apenas limpar cache sem deslogar
      if (isMobile) {
        // Salvar dados de autenticação
        const authToken = localStorage.getItem('auth-token');
        const refreshToken = localStorage.getItem('refresh-token');
        const userId = localStorage.getItem('user-id');
        const userPrefs = localStorage.getItem('user-preferences');

        // Limpar storage
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
        sessionStorage.clear();
        localStorage.clear();

        // Restaurar dados de autenticação
        if (authToken) localStorage.setItem('auth-token', authToken);
        if (refreshToken) localStorage.setItem('refresh-token', refreshToken);
        if (userId) localStorage.setItem('user-id', userId);
        if (userPrefs) localStorage.setItem('user-preferences', userPrefs);

        // Recarregar a página
        window.location.reload();
      } else {
        // Em desktop, manter comportamento original
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    }
  };

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
            {retryCount >= maxRetries 
              ? (isMobile 
                ? "Precisamos recarregar alguns recursos. Você continuará logado."
                : "Não foi possível carregar a aplicação após várias tentativas. Tente limpar o cache e fazer login novamente.")
              : "Houve um problema ao carregar a aplicação. Isso pode ser devido a problemas de rede ou atualizações."}
          </p>
          <div className="space-y-2">
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {retryCount >= maxRetries 
                ? (isMobile ? 'Recarregar Recursos' : 'Limpar Cache e Voltar ao Login')
                : 'Tentar Novamente'}
            </button>
          </div>
          {error && error.message && (
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
          console.log('❌ Auth ErrorBoundary:', error, errorInfo);
        }
      }}
    >
      <AuthProvider>
        <ErrorBoundary
          FallbackComponent={ErrorBoundaryFallback}
          onError={(error, errorInfo) => {
            if (isDevelopment()) {
              console.log('❌ General ErrorBoundary:', error, errorInfo);
            }
          }}
        >
          <Suspense fallback={null}>
            <CacheCleanerProvider>
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
            </CacheCleanerProvider>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  );
}