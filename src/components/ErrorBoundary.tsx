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
    <div className="min-h-screen bg-background-primary px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <p className="text-4xl font-extrabold text-primary-DEFAULT sm:text-5xl">Ops!</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-border-DEFAULT sm:pl-6">
              <h1 className="text-4xl font-extrabold text-text-primary tracking-tight sm:text-5xl">
                Algo deu errado
              </h1>
              <p className="mt-4 text-base text-text-secondary">
                {error.message || 'Ocorreu um erro inesperado.'}
              </p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
              >
                Voltar para Início
              </button>
              <button
                onClick={resetError}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-dark bg-primary-light/30 hover:bg-primary-light/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
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
    <div className="rounded-md bg-error-light/20 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-error-DEFAULT"
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
          <h3 className="text-sm font-medium text-error-dark">Erro</h3>
          <div className="mt-2 text-sm text-error-text">
            <p>{message}</p>
          </div>
          {action && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  onClick={action}
                  className="bg-error-light/30 px-2 py-1.5 rounded-md text-sm font-medium text-error-dark hover:bg-error-light/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-error-light focus:ring-error-DEFAULT"
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
    <div className="min-h-screen bg-background-primary px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <p className="text-4xl font-extrabold text-primary-DEFAULT sm:text-5xl">404</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-border-DEFAULT sm:pl-6">
              <h1 className="text-4xl font-extrabold text-text-primary tracking-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-1 text-base text-text-secondary">{message}</p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <button
                onClick={() => router.push(actionHref)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
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
