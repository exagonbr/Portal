'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Importar o EPUBViewer de forma dinâmica para evitar SSR
const DynamicEPUBViewer = dynamic(
  () => import('./EPUBViewer').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Carregando Visualizador EPUB
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Inicializando leitor de documentos...
          </p>
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-64 mx-auto">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    ),
  }
);

// Wrapper que adiciona verificações extras de segurança
const EPUBViewerWrapper: ComponentType<any> = (props) => {
  // Verificar se estamos no cliente
  if (typeof window === 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded-md w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return <DynamicEPUBViewer {...props} />;
};

export default EPUBViewerWrapper; 