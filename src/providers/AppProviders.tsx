'use client'

import { useState, useEffect } from 'react'

// Componente de fallback mais simples
function SimpleFallback({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen w-full">{children}</div>
}

// Componente de providers mínimo
function MinimalProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return <SimpleFallback>{children}</SimpleFallback>
  }

  return <>{children}</>
}

export function AppProviders({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const [hasError, setHasError] = useState(false)

  // Capturar erros de forma simples
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('originalFactory')) {
        console.warn('🔄 Erro de originalFactory detectado, usando fallback')
        setHasError(true)
        event.preventDefault()
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Se houve erro, usar fallback
  if (hasError) {
    return <>{fallback || <SimpleFallback>{children}</SimpleFallback>}</>
  }

  // Renderizar providers mínimos por enquanto
  return <MinimalProviders>{children}</MinimalProviders>
}
