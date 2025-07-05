'use client'

import { useState, useEffect, ReactNode } from 'react'

interface ClientOnlyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente que só renderiza no cliente para evitar problemas de hidratação
 * Útil para componentes que dependem de APIs do browser ou estado do cliente
 */
export function ClientOnlyWrapper({ children, fallback = null }: ClientOnlyWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 