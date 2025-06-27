'use client'

import { ReactNode } from 'react'

/**
 * Providers simplificados para evitar problemas de carregamento de chunks
 * Esta é uma versão mínima que pode ser expandida gradualmente
 */
export function SimpleProviders({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  )
} 