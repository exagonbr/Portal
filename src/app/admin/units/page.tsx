'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Componente de fallback para carregamento
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Carregando página de unidades...</span>
  </div>
)

// Componente de erro para chunk loading
const ChunkErrorFallback = () => (
  <div className="container mx-auto px-4 py-6 max-w-7xl">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <h2 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar a página</h2>
      <p className="text-red-600 mb-4">
        Houve um problema ao carregar os recursos da página. Isso pode ser devido a uma atualização recente.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Recarregar Página
      </button>
    </div>
  </div>
)

// Importação dinâmica da página principal para melhor controle de loading
const UnitsPageContent = dynamic(
  () => import('./UnitsPageContent').catch((error) => {
    console.error('Erro ao importar UnitsPageContent:', error)
    return { default: ChunkErrorFallback }
  }),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
)

export default function ManageUnits() {
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Capturar erros de chunk loading globalmente
    const handleError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('Loading chunk')) {
        console.error('ChunkLoadError detectado:', event.error)
        setHasError(true)
        // Tentar recarregar automaticamente após um delay
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    }

    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])

  if (!mounted) {
    return <LoadingFallback />
  }

  if (hasError) {
    return <ChunkErrorFallback />
  }

  return <UnitsPageContent />
}

