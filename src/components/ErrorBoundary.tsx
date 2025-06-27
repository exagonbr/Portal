'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import React, { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorDisplayProps {
  error: Error | null
  resetError: () => void
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
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

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Verificar se é erro de chunk loading
    const isChunkError = error.message?.includes('Loading chunk') || 
                        error.message?.includes('ChunkLoadError') ||
                        error.message?.includes('originalFactory') ||
                        error.message?.includes('Cannot read properties of undefined') ||
                        error.message?.includes('MIME type') ||
                        error.name === 'ChunkLoadError';
    
    if (isChunkError) {
      console.warn('🔄 Erro de chunk detectado pelo ErrorBoundary, recarregando página...');
      // Recarregar a página após um pequeno delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1000);
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ Erro capturado pelo ErrorBoundary:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Chamar callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full text-center">
            <div className="text-red-500 mb-6">
              <svg 
                className="w-16 h-16 mx-auto" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erro de carregamento
            </h1>
            
            <p className="text-gray-600 mb-6">
              Ocorreu um problema ao carregar a aplicação. Isso pode ser devido a uma atualização do sistema.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={this.handleReload}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Recarregar página
              </button>
              
              <p className="text-sm text-gray-500">
                Se o problema persistir, limpe o cache do navegador ou contate o suporte.
              </p>
            </div>
            
            {/* Mostrar detalhes do erro apenas em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalhes técnicos
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto">
                  <div className="mb-2">
                    <strong>Erro:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para resetar o error boundary
export function useErrorBoundary() {
  const [, setState] = React.useState();
  
  return React.useCallback((error: Error) => {
    setState(() => {
      throw error;
    });
  }, []);
}

export default ErrorBoundary;

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
