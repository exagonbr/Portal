'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

interface ChunkSafePageWrapperProps {
  componentPath: string
  loadingMessage?: string
  errorTitle?: string
}

// Componente de fallback para carregamento
const LoadingFallback = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">{message}</span>
  </div>
)

// Componente de erro para chunk loading
const ChunkErrorFallback = ({ title }: { title: string }) => (
  <div className="container mx-auto px-4 py-6 max-w-7xl">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <h2 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar {title}</h2>
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

// Função para tentar carregar o componente com diferentes extensões
const tryImportComponent = async (basePath: string) => {
  const possibleExtensions = ['', '.tsx', '.ts', '.jsx', '.js'];
  
  for (const ext of possibleExtensions) {
    try {
      const fullPath = basePath + ext;
      console.log(`🔄 Tentando carregar: ${fullPath}`);
      const module = await import(fullPath);
      console.log(`✅ Sucesso ao carregar: ${fullPath}`);
      return module;
    } catch (error) {
      console.log(`❌ Falha ao carregar: ${basePath + ext}`, error);
      continue;
    }
  }
  
  throw new Error(`Não foi possível carregar o componente: ${basePath}`);
};

export default function ChunkSafePageWrapper({ 
  componentPath, 
  loadingMessage = "Carregando página...",
  errorTitle = "a página"
}: ChunkSafePageWrapperProps) {
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Criar o componente dinâmico com retry automático
  const DynamicComponent = dynamic(
    () => tryImportComponent(componentPath).catch((error) => {
      console.error(`Erro ao importar ${componentPath}:`, error)
      return { default: () => <ChunkErrorFallback title={errorTitle} /> }
    }),
    {
      loading: () => <LoadingFallback message={loadingMessage} />,
      ssr: false
    }
  )

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
    return <LoadingFallback message={loadingMessage} />
  }

  if (hasError) {
    return <ChunkErrorFallback title={errorTitle} />
  }

  return <DynamicComponent />
} 