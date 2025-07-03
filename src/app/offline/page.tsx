'use client';

import { useEffect, useState } from 'react';
import { FaWifi } from 'react-icons/fa';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EnhancedErrorState } from '@/components/ui/LoadingStates';

export default function OfflinePage() {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [timeUntilNextCheck, setTimeUntilNextCheck] = useState(5);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const startReconnectionCheck = () => {
      // Countdown timer
      countdownInterval = setInterval(() => {
        setTimeUntilNextCheck((prev) => {
          if (prev <= 1) {
            return 5; // Reset countdown
          }
          return prev - 1;
        });
      }, 1000);

      // Connection check
      checkInterval = setInterval(() => {
        if (navigator.onLine) {
          setIsReconnecting(true);
          setReconnectAttempts(prev => prev + 1);
          
          // Verificar se realmente consegue acessar o servidor
          fetch('/api/health', { 
            method: 'HEAD',
            cache: 'no-cache'
          })
          .then(() => {
            // Conexão restaurada
            window.location.reload();
          })
          .catch(() => {
            // Ainda sem conexão real
            setIsReconnecting(false);
            setTimeUntilNextCheck(5);
          });
        } else {
          setTimeUntilNextCheck(5);
        }
      }, 5000);
    };

    startReconnectionCheck();

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, []);

  const handleManualRetry = async () => {
    setIsReconnecting(true);
    setReconnectAttempts(prev => prev + 1);

    try {
      // Tentar fazer uma requisição para verificar conectividade
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Servidor não disponível');
      }
    } catch (error) {
      console.log('Erro ao tentar reconectar:', error);
      setIsReconnecting(false);
      // Mostrar feedback de erro
    }
  };

  if (isReconnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-start">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto"
          />
          <h2 className="text-xl font-semibold text-text-primary">
            Reconectando...
          </h2>
          <p className="text-text-secondary">
            Tentativa {reconnectAttempts} - Verificando conexão
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-start p-4">
      <div className="text-center space-y-6 max-w-md">
        <motion.div 
          className="flex justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="relative">
            <WifiOff className="text-6xl text-red-500" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </div>
        </motion.div>
        
        <h1 className="text-3xl font-bold text-text-primary">
          Você está offline
        </h1>
        
        <p className="text-text-secondary">
          Não foi possível conectar ao Portal Educacional. Verifique sua conexão com a internet e tente novamente.
        </p>

        {/* Status de reconexão automática */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            🔄 Verificação automática em {timeUntilNextCheck}s
          </p>
          {reconnectAttempts > 0 && (
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
              Tentativas de reconexão: {reconnectAttempts}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleManualRetry}
            disabled={isReconnecting}
            className="w-full button-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>

          <Link
            href="/"
            className="block w-full py-2 px-4 text-center text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Voltar para a página inicial
          </Link>
        </div>

        <div className="text-sm text-text-secondary space-y-2">
          <p>💡 Algumas funcionalidades podem estar disponíveis offline.</p>
          <p>📱 Os dados serão sincronizados quando você estiver online novamente.</p>
          
          {/* Dicas de solução */}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-primary hover:text-primary-dark">
              Ver dicas de solução
            </summary>
            <div className="mt-2 space-y-1 text-xs">
              <p>• Verifique se o Wi-Fi está conectado</p>
              <p>• Tente desligar e ligar o Wi-Fi</p>
              <p>• Verifique se outros sites funcionam</p>
              <p>• Reinicie o roteador se necessário</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
