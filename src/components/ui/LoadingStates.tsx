'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, AlertCircle, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  showProgress?: boolean;
  progress?: number;
  onCancel?: () => void;
  cancelText?: string;
  timeout?: number;
  onTimeout?: () => void;
}

interface RedirectStateProps {
  destination?: string;
  message?: string;
  countdown?: number;
  onCancel?: () => void;
  autoRedirect?: boolean;
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onCancel?: () => void;
  retryText?: string;
  cancelText?: string;
  showRefresh?: boolean;
  details?: string;
}

// Hook para detectar conectividade
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificação inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Componente de Loading melhorado
export function EnhancedLoadingState({
  message = 'Carregando...',
  submessage,
  showProgress = false,
  progress = 0,
  onCancel,
  cancelText = 'Cancelar',
  timeout,
  onTimeout
}: LoadingStateProps) {
  const [timeLeft, setTimeLeft] = useState(timeout);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (!timeout) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev <= 1) {
          onTimeout?.();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeout, onTimeout]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50"
    >
      <div className="flex flex-col items-center max-w-md mx-auto p-8">
        {/* Indicador de conectividade */}
        <div className="absolute top-4 right-4">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
        </div>

        {/* Spinner principal */}
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
          />
          {showProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>

        {/* Mensagens */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
          {message}
        </h3>
        
        {submessage && (
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            {submessage}
          </p>
        )}

        {!isOnline && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-red-700 dark:text-red-300 text-sm text-center">
              ⚠️ Sem conexão com a internet
            </p>
          </div>
        )}

        {/* Barra de progresso */}
        {showProgress && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Timeout countdown */}
        {timeLeft && timeLeft > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Timeout em {timeLeft}s
          </p>
        )}

        {/* Botão de cancelar */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline transition-colors"
          >
            {cancelText}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Componente de Redirecionamento melhorado
export function EnhancedRedirectState({
  destination,
  message = 'Redirecionando...',
  countdown = 5,
  onCancel,
  autoRedirect = true
}: RedirectStateProps) {
  const [timeLeft, setTimeLeft] = useState(countdown);
  const router = useRouter();

  useEffect(() => {
    if (!autoRedirect) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (destination) {
            router.push(destination);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, destination, router]);

  const handleManualRedirect = () => {
    if (destination) {
      router.push(destination);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg backdrop-brightness-0 z-990"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          {/* Ícone de redirecionamento */}
          <div className="mb-6">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="w-8 h-8 text-blue-600 dark:text-blue-400 rotate-180" />
            </motion.div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {message}
          </h3>

          {autoRedirect && timeLeft > 0 && (
            <div className="mb-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {timeLeft}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / countdown) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            {destination && (
              <button
                onClick={handleManualRedirect}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir Agora
              </button>
            )}
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente de Erro melhorado
export function EnhancedErrorState({
  title = 'Ops! Algo deu errado',
  message,
  onRetry,
  onCancel,
  retryText = 'Tentar Novamente',
  cancelText = 'Voltar',
  showRefresh = true,
  details
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const isOnline = useNetworkStatus();

  const handleRetry = useCallback(async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  }, [onRetry]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 p-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg mx-auto border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          {/* Ícone de erro */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {!isOnline && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                ⚠️ Verifique sua conexão com a internet
              </p>
            </div>
          )}

          {details && (
            <div className="mb-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
              >
                {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
              </button>
              
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-left"
                  >
                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {details}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            {onRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isRetrying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Tentando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {retryText}
                  </>
                )}
              </button>
            )}

            {showRefresh && (
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Página
              </button>
            )}

            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Hook para gerenciar estados de loading/redirect/error
export function useLoadingState() {
  const [state, setState] = useState<{
    type: 'idle' | 'loading' | 'redirecting' | 'error';
    message?: string;
    submessage?: string;
    progress?: number;
    error?: string;
    destination?: string;
  }>({ type: 'idle' });

  const setLoading = useCallback((message?: string, submessage?: string, progress?: number) => {
    setState({ type: 'loading', message, submessage, progress });
  }, []);

  const setRedirecting = useCallback((destination?: string, message?: string) => {
    setState({ type: 'redirecting', destination, message });
  }, []);

  const setError = useCallback((error: string, message?: string) => {
    setState({ type: 'error', error, message });
  }, []);

  const reset = useCallback(() => {
    setState({ type: 'idle' });
  }, []);

  return {
    state,
    setLoading,
    setRedirecting,
    setError,
    reset
  };
} 