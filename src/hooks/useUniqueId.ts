import { useState, useEffect } from 'react'

let idCounter = 0

/**
 * Hook para gerar IDs únicos que são consistentes entre servidor e cliente
 * Resolve problemas de hidratação causados por Math.random()
 */
export function useUniqueId(prefix: string = 'id'): string {
  const [id, setId] = useState<string>(() => `${prefix}-ssr-${++idCounter}`)

  useEffect(() => {
    // Apenas no cliente, gerar um ID único baseado em timestamp + contador
    setId(`${prefix}-${Date.now()}-${++idCounter}`)
  }, [prefix])

  return id
}

/**
 * Função utilitária para gerar IDs únicos de forma síncrona
 * Use apenas quando o useUniqueId não puder ser usado
 */
export function generateUniqueId(prefix: string = 'id'): string {
  if (typeof window === 'undefined') {
    // No servidor, use apenas contador
    return `${prefix}-ssr-${++idCounter}`
  }
  // No cliente, use timestamp + contador
  return `${prefix}-${Date.now()}-${++idCounter}`
} 