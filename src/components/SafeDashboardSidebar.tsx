'use client'

import { Suspense, lazy, useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

// Fallback component para quando o DashboardSidebar falha
const SidebarFallback = ({ error }: { error?: Error }) => {
  const { theme } = useTheme() || { theme: null }
  
  return (
    <div 
      className="w-64 flex flex-col h-screen shadow-xl border-r"
      style={{
        backgroundColor: theme?.colors?.sidebar?.bg || '#1e3a8a',
        borderColor: theme?.colors?.sidebar?.border || '#3b82f6',
        color: theme?.colors?.sidebar?.text || '#e0e7ff'
      }}
    >
      {/* Logo */}
      <div className="border-b p-4 h-20 flex items-center justify-center">
        <div className="text-white font-bold text-lg">Portal Educacional</div>
      </div>
      
      {/* Error message */}
      <div className="flex-1 p-4">
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 mb-4">
          <h3 className="text-red-300 font-semibold mb-2">Erro no Sidebar</h3>
          <p className="text-red-200 text-sm mb-3">
            Ocorreu um erro ao carregar o menu lateral. Tentando recarregar...
          </p>
          {error && (
            <details className="text-xs text-red-200">
              <summary className="cursor-pointer">Detalhes técnicos</summary>
              <pre className="mt-2 p-2 bg-red-900/30 rounded text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        
        {/* Basic navigation */}
        <nav className="space-y-2">
          <a 
            href="/dashboard" 
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </a>
          <a 
            href="/chat" 
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            <span className="text-sm">Mensagens</span>
          </a>
        </nav>
      </div>
      
      {/* Retry button */}
      <div className="border-t p-4">
        <button 
          onClick={() => window.location.reload()}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
        >
          Recarregar Página
        </button>
      </div>
    </div>
  )
}

// Loading component
const SidebarLoading = () => {
  const { theme } = useTheme() || { theme: null }
  
  return (
    <div 
      className="w-64 flex flex-col h-screen shadow-xl border-r"
      style={{
        backgroundColor: theme?.colors?.sidebar?.bg || '#1e3a8a',
        borderColor: theme?.colors?.sidebar?.border || '#3b82f6'
      }}
    >
      <div className="border-b p-4 h-20 flex items-center justify-center">
        <div className="animate-pulse bg-white/20 h-8 w-32 rounded"></div>
      </div>
      
      <div className="flex-1 p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white/10 h-8 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Lazy load the DashboardSidebar with retry logic
const LazyDashboardSidebar = lazy(() => 
  import('./dashboard/DashboardSidebar')
    .catch((error) => {
      console.error('Erro ao carregar DashboardSidebar:', error)
      // Return a fallback module
      return {
        default: () => <SidebarFallback error={error} />
      }
    })
)

export default function SafeDashboardSidebar() {
  const [retryCount, setRetryCount] = useState(0)
  const [hasError, setHasError] = useState(false)

  // Reset error state when retrying
  useEffect(() => {
    if (retryCount > 0) {
      setHasError(false)
    }
  }, [retryCount])

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('DashboardSidebar') || 
          event.error?.message?.includes('Cannot read properties of undefined')) {
        console.error('Erro capturado no SafeDashboardSidebar:', event.error)
        setHasError(true)
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError && retryCount < 3) {
    // Auto retry after error
    setTimeout(() => {
      setRetryCount(prev => prev + 1)
    }, 1000)
  }

  if (hasError && retryCount >= 3) {
    return <SidebarFallback />
  }

  return (
    <Suspense fallback={<SidebarLoading />}>
      <LazyDashboardSidebar key={retryCount} />
    </Suspense>
  )
} 