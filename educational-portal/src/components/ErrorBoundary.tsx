'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorDisplayProps {
  error: Error
  resetError: () => void
}

function ErrorDisplay({ error, resetError }: ErrorDisplayProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <p className="text-4xl font-extrabold text-blue-600 sm:text-5xl">Ops!</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                Algo deu errado
              </h1>
              <p className="mt-4 text-base text-gray-500">
                {error.message || 'Ocorreu um erro inesperado.'}
              </p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voltar para Início
              </button>
              <button
                onClick={resetError}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by boundary:', event.error)
      setError(event.error)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (error) {
    return <ErrorDisplay error={error} resetError={() => setError(null)} />
  }

  return <>{children}</>
}

export function ErrorMessage({ 
  message, 
  action,
  actionText = 'Tentar Novamente'
}: { 
  message: string
  action?: () => void
  actionText?: string
}) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Erro</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {action && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  onClick={action}
                  className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  {actionText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function NotFound({
  title = 'Página não encontrada',
  message = 'Desculpe, não encontramos a página que você está procurando.',
  actionText = 'Voltar para Início',
  actionHref = '/'
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <p className="text-4xl font-extrabold text-blue-600 sm:text-5xl">404</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-1 text-base text-gray-500">{message}</p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <button
                onClick={() => router.push(actionHref)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {actionText}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
