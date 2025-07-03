'use client'

import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

export default function TestLoadingPage() {
  const { navigateWithLoading } = useNavigationWithLoading()

  const handleNavigate = (href: string, message: string) => {
    navigateWithLoading(href, {
      message,
      delay: 1000
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Teste de Loading de Navegação
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => handleNavigate('/dashboard', 'Carregando Dashboard...')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir para Dashboard
          </button>
          
          <button
            onClick={() => handleNavigate('/portal/books', 'Preparando Portal de Literatura...')}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Portal de Literatura
          </button>
          
          <button
            onClick={() => handleNavigate('/courses', 'Carregando seus cursos...')}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Meus Cursos
          </button>
          
          <button
            onClick={() => handleNavigate('/', 'Voltando ao início...')}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Página Inicial
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">Como funciona:</h2>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Clique em qualquer botão acima</li>
            <li>• Verá o loading "Estamos preparando tudo para você"</li>
            <li>• A navegação acontece após o loading</li>
            <li>• Funciona também nos menus laterais</li>
          </ul>
        </div>
      </div>
    </div>
  )
}