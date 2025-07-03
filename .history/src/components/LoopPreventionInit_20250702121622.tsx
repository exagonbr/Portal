'use client'

import { useEffect } from 'react'

/**
 * Componente para inicializar o sistema de prevenção de loops
 * FIXED: Inicialização adequada para Next.js
 */
export function LoopPreventionInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Inicializar sistema de prevenção de loops
    import('@/utils/loop-prevention')
      .then((module) => {
        const system = module.initializeLoopPrevention()
        console.log('✅ Sistema de prevenção de loops inicializado')
        
        // Disponibilizar globalmente para debug
        if (typeof window !== 'undefined') {
          (window as any).loopPrevention = {
            clearBlocks: module.clearLoopBlocks,
            emergencyReset: module.emergencyLoopReset,
            getStats: () => system?.getStats?.() || 'Sistema não disponível'
          }
        }
      })
      .catch((err) => {
        console.warn('Sistema de prevenção de loops não pôde ser inicializado:', err)
      })
  }, [])

  // Este componente não renderiza nada
  return null
} 