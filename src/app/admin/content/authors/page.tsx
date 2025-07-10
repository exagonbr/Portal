'use client'

import dynamic from 'next/dynamic'

// Importar o componente diretamente usando dynamic import
const AuthorsPageContent = dynamic(() => import('./AuthorsPageContent'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Carregando autores...</span>
    </div>
  ),
  ssr: false
})

export default function AuthorsPage() {
  return <AuthorsPageContent />
} 