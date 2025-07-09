'use client'

import ChunkSafePageWrapper from '@/components/ChunkSafePageWrapper'

export default function AuthorsPage() {
  return (
    <ChunkSafePageWrapper 
      componentPath="./AuthorsPageContent"
      loadingMessage="Carregando autores..."
      errorTitle="página de Autores"
    />
  )
} 