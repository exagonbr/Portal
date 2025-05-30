'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorDisplayProps {
  error: Error | null
  resetError: () => void
}

function ErrorDisplay({ error, resetError }: ErrorDisplayProps) {
  const router = useRouter()

  // Tratamento de erro null/undefined
  const errorMessage = error?.message || 'Ocorreu um erro inesperado.'

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
                {errorMessage}
              </p>
              {/* Mostrar detalhes do erro apenas em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-4 text-sm text-gray-500">
                  <summary className="cursor-pointer">Detalhes técnicos</summary>
                  <pre className="mt-2 whitespace-pre-wrap bg-gray-100 p-2 rounded text-xs">
                    {error.stack || error.toString()}
                  </pre>
                </details>
              )}
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

// React Error Boundary tradicional para capturar erros de renderização
class ReactErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    console.error('🚨 React Error Boundary capturou erro:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.group('🚨 React Error Boundary - Erro de Componente');
    console.error('Erro:', error);
    console.error('Stack de componentes:', errorInfo.componentStack);
    console.groupEnd();
    
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay 
          error={this.state.error} 
          resetError={() => this.setState({ hasError: false, error: null })} 
        />
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null)
  const [errorCount, setErrorCount] = useState(0)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Evitar loop infinito de erros
      if (errorCount >= 3) {
        console.warn('Muitos erros detectados, parando captura para evitar loop infinito');
        return;
      }

      // Log detalhado do evento de erro
      console.group('🚨 Error Boundary - Erro Capturado');
      console.log('Event:', event);
      console.log('Error:', event.error);
      console.log('Filename:', event.filename);
      console.log('Lineno:', event.lineno);
      console.log('Colno:', event.colno);
      console.log('Stack trace:', event.error?.stack);
      console.groupEnd();

      // Verificar se o erro é válido
      const errorToCapture = event.error;
      
      if (errorToCapture === null || errorToCapture === undefined) {
        console.warn('Error boundary capturou erro null/undefined. Detalhes do evento:', {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message,
          type: event.type
        });
        
        // Criar um erro mais descritivo baseado nas informações disponíveis
        const errorMessage = event.message || event.filename 
          ? `Erro indefinido em ${event.filename}:${event.lineno}:${event.colno} - ${event.message || 'Sem mensagem'}`
          : 'Erro indefinido capturado pelo Error Boundary';
        
        const syntheticError = new Error(errorMessage);
        syntheticError.stack = `Synthetic Error\n    at handleError (${event.filename}:${event.lineno}:${event.colno})`;
        setError(syntheticError);
      } else if (errorToCapture instanceof Error) {
        console.error('Error caught by boundary:', errorToCapture);
        setError(errorToCapture);
      } else {
        // Converter outros tipos de erro para Error
        const convertedError = new Error(`Erro não-padrão: ${String(errorToCapture)}`);
        console.error('Error caught by boundary (converted):', convertedError);
        setError(convertedError);
      }
      
      setErrorCount(prev => prev + 1);
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Evitar loop infinito
      if (errorCount >= 3) return;

      console.group('🚨 Error Boundary - Promise Rejection');
      console.log('Event:', event);
      console.log('Reason:', event.reason);
      console.groupEnd();

      const reason = event.reason;
      let errorToSet: Error;

      if (reason instanceof Error) {
        errorToSet = reason;
      } else if (reason === null || reason === undefined) {
        errorToSet = new Error('Promise rejeitada com valor null/undefined');
      } else {
        errorToSet = new Error(`Promise rejeitada: ${String(reason)}`);
      }

      console.error('Unhandled promise rejection caught by boundary:', errorToSet);
      setError(errorToSet);
      setErrorCount(prev => prev + 1);
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [errorCount])

  const resetError = () => {
    setError(null)
    setErrorCount(0)
  }

  if (error) {
    return <ErrorDisplay error={error} resetError={resetError} />
  }

  return (
    <ReactErrorBoundary onError={(error) => setError(error)}>
      {children}
    </ReactErrorBoundary>
  )
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
