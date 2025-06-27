'use client'

import { ReactNode, useState, useEffect } from 'react'

/**
 * Providers simplificados para evitar problemas de carregamento de chunks
 * Esta é uma versão mínima que pode ser expandida gradualmente
 */
export function SimpleProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Renderizar fallback até estar montado no cliente
  if (!mounted) {
    return (
      <div className="min-h-screen w-full">
        {children}
      </div>
    )
  }

  // Importar providers dinamicamente apenas no cliente
  const AuthProvider = require('@/contexts/AuthContext').AuthProvider
  
  return (
    <div className="min-h-screen w-full">
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  )
} 