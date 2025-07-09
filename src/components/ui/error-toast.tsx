import React from 'react';
import { AlertTriangle, Wifi, RefreshCw, Clock } from 'lucide-react';

export interface ErrorToastProps {
  error: Error | string;
  onRetry?: () => void;
  autoClose?: boolean;
  duration?: number;
}

/**
 * Analisa o tipo de erro e retorna informações sobre ele
 */ 
const analyzeError = (error: Error | string) => {
  const message = typeof error === 'string' ? error : error.message;
  
  if (message.includes('Timeout') || message.includes('504')) {
    return {
      type: 'timeout',
      icon: Clock,
      title: 'Tempo Limite Esgotado',
      description: 'O servidor está demorando para responder',
      suggestion: 'Tente novamente em alguns momentos',
      color: 'orange'
    };
  }
  
  if (message.includes('Network') || message.includes('fetch') || message.includes('502') || message.includes('503')) {
    return {
      type: 'network',
      icon: Wifi,
      title: 'Problema de Conexão',
      description: 'Não foi possível conectar ao servidor',
      suggestion: 'Verifique sua conexão e tente novamente',
      color: 'red'
    };
  }
  
  if (message.includes('500') || message.includes('Erro interno')) {
    return {
      type: 'server',
      icon: AlertTriangle,
      title: 'Erro do Servidor',
      description: 'Ocorreu um erro interno no servidor',
      suggestion: 'Tente novamente mais tarde',
      color: 'red'
    };
  }
  
  if (message.includes('401') || message.includes('não autenticado')) {
    return {
      type: 'auth',
      icon: AlertTriangle,
      title: 'Sessão Expirada',
      description: 'Sua sessão expirou ou é inválida',
      suggestion: 'Faça login novamente',
      color: 'yellow'
    };
  }
  
  return {
    type: 'generic',
    icon: AlertTriangle,
    title: 'Erro',
    description: message,
    suggestion: 'Tente novamente',
    color: 'red'
  };
};

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onRetry,
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const errorInfo = analyzeError(error);
  const Icon = errorInfo.icon;

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  if (!isVisible) return null;

  const colorClasses = {
    red: {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      text: 'text-red-700',
      button: 'bg-red-100 hover:bg-red-200 text-red-800'
    },
    orange: {
      bg: 'bg-orange-50 border-orange-200',
      icon: 'text-orange-500',
      title: 'text-orange-800',
      text: 'text-orange-700',
      button: 'bg-orange-100 hover:bg-orange-200 text-orange-800'
    },
    yellow: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
    }
  };

  const colors = colorClasses[errorInfo.color as keyof typeof colorClasses] || colorClasses.red;

  return (
    <div className={`fixed top-4 right-4 max-w-md w-full z-50 border rounded-lg p-4 shadow-lg ${colors.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${colors.icon}`} />
        <div className="flex-1">
          <h4 className={`font-medium ${colors.title}`}>
            {errorInfo.title}
          </h4>
          <p className={`text-sm mt-1 ${colors.text}`}>
            {errorInfo.description}
          </p>
          <p className={`text-xs mt-1 ${colors.text} opacity-75`}>
            {errorInfo.suggestion}
          </p>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`p-1 rounded-md ${colors.button} transition-colors`}
              title="Tentar novamente"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className={`p-1 rounded-md ${colors.button} transition-colors`}
            title="Fechar"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para mostrar toasts de erro
 */
export const useErrorToast = () => {
  const [errors, setErrors] = React.useState<Array<{
    id: string;
    error: Error | string;
    onRetry?: () => void;
  }>>([]);

  const showError = React.useCallback((error: Error | string, onRetry?: () => void) => {
    const id = Date.now().toString();
    setErrors(prev => [...prev, { id, error, onRetry }]);
  }, []);

  const removeError = React.useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  }, []);

  const ErrorToasts = React.useMemo(() => 
    errors.map(({ id, error, onRetry }) => (
      <ErrorToast
        key={id}
        error={error}
        onRetry={onRetry}
        autoClose
        duration={6000}
      />
    )), [errors]
  );

  return { showError, removeError, ErrorToasts };
};

export default ErrorToast; 