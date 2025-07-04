'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualizar state para mostrar a UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para debugging
    console.log('❌ AuthErrorBoundary capturou um erro:', error, errorInfo);
    
    // Se for erro relacionado ao AuthContext, tentar recuperar
    if (error.message.includes('useAuth deve ser usado dentro de um AuthProvider')) {
      console.log('🔄 Tentando recuperar do erro de AuthContext...');
      
      // Aguardar um pouco e tentar resetar
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined });
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI customizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-4 p-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-600">error</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Erro de Carregamento
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Houve um problema ao carregar a autenticação. Recarregando...
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export default e named exports para compatibilidade
export default AuthErrorBoundary;
export const ErrorBoundary = AuthErrorBoundary;
