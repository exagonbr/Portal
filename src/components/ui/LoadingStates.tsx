'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, AlertCircle, ArrowLeft, Wifi, WifiOff, Loader2 } from 'lucide-react';
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
          // Removido redirecionamento automático para evitar loops
          // O usuário deve clicar manualmente em "Ir Agora"
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

// Componente de Erro simplificado - não mostra telas problemáticas
export function EnhancedErrorState({
  title = 'Ops! Algo deu errado',
  message,
  onRetry,
  onCancel,
  retryText = 'Tentar Novamente',
  cancelText = 'Voltar',
  showRefresh = false, // Desabilitado por padrão
  details
}: ErrorStateProps) {
  // Para erros de carregamento comuns, não mostrar nada
  if (message?.includes('Erro de carregamento') || 
      message?.includes('erro ao carregar') || 
      message?.includes('Loading chunk') ||
      message?.includes('ChunkLoadError')) {
    console.warn('⚠️ Erro de carregamento detectado - não mostrando tela de erro');
    return null;
  }

  // Em produção, apenas logar o erro e não mostrar tela
  if (process.env.NODE_ENV === 'production') {
    console.log('Erro capturado:', { title, message, details });
    return null;
  }

  // Em desenvolvimento, mostrar erro simples
  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm shadow-lg z-50">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">{title}</h4>
          {message && (
            <p className="text-sm text-red-600 mt-1">{message}</p>
          )}
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {retryText}
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
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

// Componente específico para logout com efeito blur sem fundo
export function LogoutLoadingState({
  message = 'Fazendo logout e limpando dados...'
}: {
  message?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50"
      style={{
        background: 'rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="flex flex-col items-center max-w-md mx-auto p-8">
        {/* Ícone de carregamento animado */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 className="w-12 h-12 text-white/80" />
        </motion.div>

        {/* Mensagem com legibilidade aprimorada */}
        <div
          className="px-8 py-4 rounded-2xl text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <h3
            className="text-lg font-semibold text-white"
            style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
          >
            {message}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}