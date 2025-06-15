'use client';

import React, { useState } from 'react';
import { 
  EnhancedLoadingState, 
  EnhancedRedirectState, 
  EnhancedErrorState,
  useLoadingState 
} from '@/components/ui/LoadingStates';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';

export function LoadingStatesDemo() {
  const [currentDemo, setCurrentDemo] = useState<'loading' | 'redirect' | 'error' | 'none'>('none');
  const [progress, setProgress] = useState(0);
  const loadingState = useLoadingState();
  const smartRefresh = useSmartRefresh({
    fallbackUrl: '/dashboard',
    onSuccess: () => console.log('Refresh bem-sucedido!'),
    onError: (error) => console.error('Erro no refresh:', error)
  });

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const demoButtons = [
    {
      label: 'Loading Simples',
      onClick: () => setCurrentDemo('loading')
    },
    {
      label: 'Loading com Progresso',
      onClick: () => {
        setCurrentDemo('loading');
        simulateProgress();
      }
    },
    {
      label: 'Redirecionamento',
      onClick: () => setCurrentDemo('redirect')
    },
    {
      label: 'Estado de Erro',
      onClick: () => setCurrentDemo('error')
    },
    {
      label: 'Hook de Loading',
      onClick: () => {
        loadingState.setLoading('Carregando com hook...', 'Usando useLoadingState');
        setTimeout(() => loadingState.reset(), 3000);
      }
    },
    {
      label: 'Smart Refresh',
      onClick: () => smartRefresh.smartRefresh()
    },
    {
      label: 'Fechar Demo',
      onClick: () => {
        setCurrentDemo('none');
        setProgress(0);
        loadingState.reset();
      }
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Demonstração dos Novos Componentes de Loading
      </h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {demoButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {button.label}
          </button>
        ))}
      </div>

      {/* Status do Smart Refresh */}
      {smartRefresh.isRefreshing && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800">Smart Refresh Status:</h3>
          <p className="text-blue-600">
            Tentativa {smartRefresh.attempts} - {smartRefresh.isRefreshing ? 'Executando...' : 'Concluído'}
          </p>
          {smartRefresh.lastError && (
            <p className="text-red-600 text-sm">Erro: {smartRefresh.lastError.message}</p>
          )}
        </div>
      )}

      {/* Demonstrações */}
      {currentDemo === 'loading' && (
        <EnhancedLoadingState
          message="Carregando demonstração..."
          submessage="Este é um exemplo de loading melhorado"
          showProgress={progress > 0}
          progress={progress}
          timeout={10}
          onTimeout={() => alert('Timeout da demonstração!')}
          onCancel={() => setCurrentDemo('none')}
          cancelText="Cancelar Demo"
        />
      )}

      {currentDemo === 'redirect' && (
        <EnhancedRedirectState
          destination="/dashboard"
          message="Redirecionando para o dashboard..."
          countdown={5}
          onCancel={() => setCurrentDemo('none')}
          autoRedirect={false} // Desabilitado para demo
        />
      )}

      {currentDemo === 'error' && (
        <EnhancedErrorState
          title="Erro de Demonstração"
          message="Este é um exemplo de como os erros são exibidos com os novos componentes."
          onRetry={() => {
            alert('Retry executado!');
            setCurrentDemo('none');
          }}
          onCancel={() => setCurrentDemo('none')}
          retryText="Tentar Novamente"
          cancelText="Fechar"
          showRefresh={true}
          details={`Detalhes técnicos do erro:\n- Componente: LoadingStatesDemo\n- Tipo: Demonstração\n- Timestamp: ${new Date().toISOString()}`}
        />
      )}

      {/* Hook de Loading State */}
      {loadingState.state.type === 'loading' && (
        <EnhancedLoadingState
          message={loadingState.state.message || 'Carregando...'}
          submessage={loadingState.state.submessage}
          showProgress={!!loadingState.state.progress}
          progress={loadingState.state.progress || 0}
          onCancel={() => loadingState.reset()}
        />
      )}

      {loadingState.state.type === 'error' && (
        <EnhancedErrorState
          title="Erro do Hook"
          message={loadingState.state.error || 'Erro desconhecido'}
          onRetry={() => loadingState.reset()}
          onCancel={() => loadingState.reset()}
        />
      )}

      {/* Documentação */}
      {currentDemo === 'none' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Melhorias Implementadas</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✅ <strong>Loading Inteligente:</strong> Com timeout, progresso e cancelamento</li>
              <li>✅ <strong>Redirecionamento Melhorado:</strong> Com countdown e opção de cancelar</li>
              <li>✅ <strong>Erro Aprimorado:</strong> Com detalhes, retry inteligente e refresh</li>
              <li>✅ <strong>Detecção de Conectividade:</strong> Mostra status da internet</li>
              <li>✅ <strong>Smart Refresh:</strong> Tenta alternativas antes do reload completo</li>
              <li>✅ <strong>Animações Suaves:</strong> Transições com Framer Motion</li>
              <li>✅ <strong>Hooks Reutilizáveis:</strong> Para gerenciar estados complexos</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Como Usar</h2>
            <div className="space-y-4 text-blue-700">
              <div>
                <h3 className="font-semibold">1. Componentes Diretos:</h3>
                <code className="block bg-white p-2 rounded text-sm mt-1">
                  {`<EnhancedLoadingState message="Carregando..." />`}
                </code>
              </div>
              
              <div>
                <h3 className="font-semibold">2. Hook de Estado:</h3>
                <code className="block bg-white p-2 rounded text-sm mt-1">
                  {`const { setLoading, setError } = useLoadingState();`}
                </code>
              </div>
              
              <div>
                <h3 className="font-semibold">3. Smart Refresh:</h3>
                <code className="block bg-white p-2 rounded text-sm mt-1">
                  {`const { smartRefresh } = useSmartRefresh();`}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 