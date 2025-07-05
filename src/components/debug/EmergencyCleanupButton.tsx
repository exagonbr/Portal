'use client';

import React, { useState } from 'react';
import { useEmergencyCleanup, useQuickCleanup } from '@/hooks/useEmergencyCleanup';
import { CleanupResult } from '@/services/emergencyCleanupService';

interface EmergencyCleanupButtonProps {
  variant?: 'primary' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  autoHide?: boolean;
  className?: string;
}

const EmergencyCleanupButton: React.FC<EmergencyCleanupButtonProps> = ({
  variant = 'danger',
  size = 'md',
  showStats = true,
  autoHide = false,
  className = ''
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastResult, setLastResult] = useState<CleanupResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { 
    isCleaningUp, 
    executeCleanup, 
    checkForLoops, 
    lastCleanupResult 
  } = useEmergencyCleanup({
    autoDetect: false,
    autoCleanup: false,
    onCleanupComplete: (result) => {
      setLastResult(result);
      setShowConfirmation(false);
      if (autoHide) {
        setTimeout(() => setShowDetails(false), 5000);
      }
    },
    onLoopDetected: () => {
      console.log('🔄 Loop detectado pelo componente');
    }
  });

  const handleEmergencyCleanup = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      await executeCleanup();
    } catch (error) {
      console.error('❌ Erro na limpeza de emergência:', error);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleCheckLoops = () => {
    const hasLoop = checkForLoops();
    if (hasLoop) {
      alert('🔄 Condição de loop detectada! Considere executar limpeza.');
    } else {
      alert('✅ Nenhum loop detectado no momento.');
    }
  };

  // Classes CSS baseadas nas props
  const getButtonClasses = () => {
    const baseClasses = 'font-semibold rounded focus:outline-none focus:ring-2 transition-all duration-200';
    
    const sizeClasses = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getIconForVariant = () => {
    switch (variant) {
      case 'danger':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'primary':
      default:
        return '🧹';
    }
  };

  return (
    <div className="emergency-cleanup-container">
      {/* Botão Principal */}
      <div className="flex flex-col sm:flex-row gap-2 items-start">
        <button
          onClick={handleEmergencyCleanup}
          disabled={isCleaningUp}
          className={`${getButtonClasses()} ${isCleaningUp ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Executa limpeza completa do sistema (cookies, localStorage, sessionStorage, cache)"
        >
          {isCleaningUp ? (
            <>
              <span className="animate-spin inline-block mr-2">🔄</span>
              Limpando...
            </>
          ) : showConfirmation ? (
            <>
              {getIconForVariant()} Confirmar Limpeza?
            </>
          ) : (
            <>
              {getIconForVariant()} Limpeza de Emergência
            </>
          )}
        </button>

        {/* Botões secundários */}
        <div className="flex gap-2">
          {showConfirmation && (
            <button
              onClick={handleCancel}
              className="px-3 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancelar
            </button>
          )}

          <button
            onClick={handleCheckLoops}
            className="px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Verifica se há condições de loop no sistema"
          >
            🔍 Verificar Loops
          </button>

          {showStats && (lastResult || lastCleanupResult) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              📊 {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes
            </button>
          )}
        </div>
      </div>

      {/* Confirmação */}
      {showConfirmation && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Confirmar Limpeza de Emergência
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Esta ação irá:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Limpar todos os cookies do navegador</li>
                  <li>Limpar localStorage e sessionStorage</li>
                  <li>Limpar cache do IndexedDB</li>
                  <li>Limpar cache do navegador (se possível)</li>
                  <li>Redirecionar para a página de login</li>
                </ul>
                <p className="mt-2 font-medium">
                  Esta ação não pode ser desfeita. Continuar?
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes do resultado */}
      {showDetails && (lastResult || lastCleanupResult) && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-3">
            📊 Resultado da Última Limpeza
          </h3>
          <div className="text-sm text-green-700 space-y-2">
            {(() => {
              const result = lastResult || lastCleanupResult;
              if (!result) return null;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <span className={`mr-2 ${result.localStorageCleared ? 'text-green-600' : 'text-red-600'}`}>
                      {result.localStorageCleared ? '✅' : '❌'}
                    </span>
                    localStorage
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${result.sessionStorageCleared ? 'text-green-600' : 'text-red-600'}`}>
                      {result.sessionStorageCleared ? '✅' : '❌'}
                    </span>
                    sessionStorage
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${result.cookiesCleared ? 'text-green-600' : 'text-red-600'}`}>
                      {result.cookiesCleared ? '✅' : '❌'}
                    </span>
                    Cookies
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${result.indexedDBCleared ? 'text-green-600' : 'text-red-600'}`}>
                      {result.indexedDBCleared ? '✅' : '❌'}
                    </span>
                    IndexedDB
                  </div>
                </div>
              );
            })()}
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs text-green-600">
                Executado em: {lastResult?.timestamp || lastCleanupResult?.timestamp}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status de carregamento */}
      {isCleaningUp && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="animate-spin text-blue-500 text-xl mr-3">🔄</span>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Executando Limpeza de Emergência...
              </h3>
              <p className="text-sm text-blue-600 mt-1">
                Por favor, aguarde. Você será redirecionado automaticamente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente simplificado para uso rápido
export const QuickEmergencyCleanupButton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  const { cleanupAndRedirect, isCleaningUp } = useQuickCleanup();

  return (
    <button
      onClick={cleanupAndRedirect}
      disabled={isCleaningUp}
      className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${isCleaningUp ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title="Limpeza rápida e redirecionamento para login"
    >
      {isCleaningUp ? (
        <>
          <span className="animate-spin inline-block mr-2">🔄</span>
          Limpando...
        </>
      ) : (
        <>
          🚨 Limpeza Rápida
        </>
      )}
    </button>
  );
};

export default EmergencyCleanupButton; 