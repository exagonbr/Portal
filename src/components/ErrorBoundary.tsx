'use client'

import React, { Component, ReactNode, useState, useCallback, ErrorInfo } from 'react'
import { useRouter } from 'next/navigation'

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
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
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
    // Verificar se é erro de chunk loading - APENAS LOGAR, NÃO MOSTRAR TELA
    const isChunkError = error.message?.includes('Loading chunk') || 
                        error.message?.includes('ChunkLoadError') ||
                        error.message?.includes('originalFactory') ||
                        error.message?.includes("can't access property \"call\", originalFactory is undefined") ||
                        error.message?.includes('Cannot read properties of undefined') ||
                        error.message?.includes('MIME type') ||
                        error.name === 'ChunkLoadError';
    
    if (isChunkError) {
      console.warn('⚠️ Erro de chunk detectado - falhando silenciosamente');
      // Para erros de chunk, não mostrar tela de erro
      return { hasError: false };
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Para erros de chunk, apenas logar e não fazer nada
    const isChunkError = error.message?.includes('Loading chunk') || 
                        error.message?.includes('ChunkLoadError') ||
                        error.message?.includes('originalFactory') ||
                        error.message?.includes("can't access property \"call\", originalFactory is undefined") ||
                        error.message?.includes('Cannot read properties of undefined') ||
                        error.message?.includes('MIME type') ||
                        error.name === 'ChunkLoadError';
    
    if (isChunkError) {
      console.warn('⚠️ Erro de chunk ignorado pelo ErrorBoundary');
      
      // Tentar recarregar automaticamente após um breve atraso
      if (typeof window !== 'undefined' && 
          (error.message?.includes('originalFactory') || 
           error.message?.includes("can't access property \"call\", originalFactory is undefined"))) {
        
        console.log('🔄 Preparando recuperação automática para erro de factory...');
        
        // Armazenar informação de tentativa de recuperação
        const recoveryAttempts = parseInt(sessionStorage.getItem('errorRecoveryAttempts') || '0');
        
        if (recoveryAttempts < 3) {
          sessionStorage.setItem('errorRecoveryAttempts', (recoveryAttempts + 1).toString());
          
          setTimeout(() => {
            console.log('🔄 Recarregando página para recuperação...');
            window.location.reload();
          }, 2000);
        } else {
          console.warn('⚠️ Muitas tentativas de recuperação, parando ciclo de recarregamento');
          // Limpar contador após 1 minuto para permitir novas tentativas futuras
          setTimeout(() => {
            sessionStorage.removeItem('errorRecoveryAttempts');
          }, 60000);
        }
      }
      
      return;
    }
    
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

      // Para desenvolvimento, mostrar erro simples
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="text-red-800 font-medium">Erro de desenvolvimento</h3>
            <p className="text-red-600 text-sm mt-1">
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        );
      }

      // Em produção, falhar silenciosamente (não mostrar nada)
      return null;
    }

    return this.props.children;
  }
}

// Hook para resetar o error boundary
export function useErrorBoundary() {
  const [, setState] = useState();
  
  return useCallback((error: Error) => {
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
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {message}
          </h3>
          {action && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  onClick={action}
                  className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
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
}: {
  title?: string
  message?: string
  actionText?: string
  actionHref?: string
}) {
  return (
    <div className="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <p className="text-4xl font-extrabold text-indigo-600 sm:text-5xl">404</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-1 text-base text-gray-500">
                {message}
              </p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <a
                href={actionHref}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {actionText}
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
