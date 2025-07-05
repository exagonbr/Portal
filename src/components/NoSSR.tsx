'use client'

import { useState, useEffect, ReactNode } from 'react'

interface NoSSRProps {
  children: ReactNode
}

/**
 * Componente que desabilita SSR para o conteúdo filho
 * Use apenas quando absolutamente necessário para resolver problemas de hidratação
 */
export function NoSSR({ children }: NoSSRProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <>{children}</>
} 