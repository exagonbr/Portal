'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Book } from '@/constants/mockData';
import { Annotation, Highlight, Bookmark } from './types';

// Importação dinâmica do ModernKoodoViewer (mais recente)
const ModernKoodoViewer = dynamic(() => import('./ModernKoodoViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Carregando visualizador moderno...</p>
        <p className="text-gray-400 text-sm mt-2">Baseado no KoodoReader 2.0.0</p>
      </div>
    </div>
  ),
});

// Importação dinâmica do KoodoViewer (legado)
const KoodoViewer = dynamic(() => import('./KoodoViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Carregando visualizador legado...</p>
      </div>
    </div>
  ),
});

interface BookViewerProps {
  book: Book;
  onBack?: () => void;
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  useModernViewer?: boolean; // Permite escolher entre moderno e legado
  modernConfig?: {
    theme?: 'light' | 'dark' | 'sepia';
    fontSize?: number;
    fontFamily?: string;
    aiEnabled?: boolean;
    syncEnabled?: boolean;
    gesturesEnabled?: boolean;
  };
}

const BookViewer: React.FC<BookViewerProps> = ({
  book,
  onBack,
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd,
  useModernViewer = true, // Padrão: usar o visualizador moderno
  modernConfig
}) => {
  console.log('📚 BookViewer inicializando...', {
    book: book?.title,
    format: book?.format,
    useModernViewer,
    modernConfig
  });

  // Verificação de segurança
  if (!book || !book.id) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Livro inválido
          </h3>
          <p className="text-gray-400 mb-6">Os dados do livro não foram encontrados</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

  // Preparar propriedades comuns
  const commonProps = {
    book,
    onAnnotationAdd,
    onHighlightAdd,
    onBookmarkAdd
  };

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Preparando visualizador...</p>
        </div>
      </div>
    }>
      {useModernViewer ? (
        <ModernKoodoViewer
          {...commonProps}
          onClose={onBack}
          config={modernConfig}
          onAIInteraction={(type, data) => {
            console.log('🤖 Interação com IA:', type, data);
            // Aqui você pode implementar a lógica para lidar com interações de IA
          }}
        />
      ) : (
        <KoodoViewer
          {...commonProps}
          onBack={onBack}
        />
      )}
    </Suspense>
  );
};

export default BookViewer;
