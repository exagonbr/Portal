'use client'

import { useEffect } from 'react'
import { initChunkErrorHandler } from '@/utils/chunkErrorHandler'

export default function ChunkErrorInitializer() {
  useEffect(() => {
    initChunkErrorHandler()
  }, [])

  return null // Este componente não renderiza nada
} 