'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';

interface KookitLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Declarar tipos para Kookit
declare global {
  interface Window {
    Kookit?: {
      EpubRender: any;
      CacheRender: any;
      MobiRender: any;
      PdfRender: any;
      version?: string;
    };
  }
}

const KookitLoader: React.FC<KookitLoaderProps> = ({ children, fallback }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kookitLoaded, setKookitLoaded] = useState(false);

  useEffect(() => {
    loadKookit();
  }, []);

  const loadKookit = async () => {
    try {
      // Verificar se já está carregado
      if (typeof window !== 'undefined' && window.Kookit) {
        console.log('✅ Kookit já carregado:', window.Kookit.version || 'versão desconhecida');
        setKookitLoaded(true);
        setIsLoading(false);
        return;
      }

      console.log('📚 Carregando biblioteca Kookit...');

      // Carregar o script principal
      await loadScript('/kookit/kookit.min.js');

      // Verificar se foi carregado corretamente
      if (window.Kookit) {
        console.log('✅ Kookit carregado com sucesso:', window.Kookit.version || 'versão desconhecida');
        
        // Verificar se os renderizadores estão disponíveis
        const renderers = ['EpubRender', 'CacheRender', 'MobiRender', 'PdfRender'];
        const availableRenderers = renderers.filter(renderer => (window.Kookit as any)?.[renderer]);
        
        console.log('📖 Renderizadores disponíveis:', availableRenderers);
        
        if (availableRenderers.length === 0) {
          throw new Error('Nenhum renderizador encontrado na biblioteca Kookit');
        }

        setKookitLoaded(true);
      } else {
        throw new Error('Biblioteca Kookit não foi carregada corretamente');
      }
    } catch (err) {
      console.log('❌ Erro ao carregar Kookit:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar Kookit');
    } finally {
      setIsLoading(false);
    }
  };

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar se o script já existe
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log(`✅ Script carregado: ${src}`);
        resolve();
      };

      script.onerror = () => {
        console.log(`❌ Erro ao carregar script: ${src}`);
        reject(new Error(`Falha ao carregar ${src}`));
      };

      document.head.appendChild(script);
    });
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[500px] bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="relative mb-6">
            <BookOpen className="w-16 h-16 text-blue-500 mx-auto" />
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -bottom-1 -right-1" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Carregando Visualizador
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Inicializando biblioteca Kookit...
          </p>
          <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[500px] bg-white dark:bg-gray-900">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Erro ao Carregar Visualizador
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-6">
            {error}
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              💡 Possíveis soluções:
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 text-left space-y-1">
              <li>• Verifique se o arquivo kookit.min.js está na pasta /public/kookit/</li>
              <li>• Recarregue a página</li>
              <li>• Verifique sua conexão com a internet</li>
              <li>• Tente usar um navegador diferente</li>
            </ul>
          </div>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                loadKookit();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Tentar Novamente
            </button>
            
            {fallback && (
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                📖 Usar Visualizador Alternativo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar children se Kookit foi carregado com sucesso
  if (kookitLoaded) {
    return <>{children}</>;
  }

  // Fallback se fornecido
  return fallback ? <>{fallback}</> : null;
};

export default KookitLoader; 