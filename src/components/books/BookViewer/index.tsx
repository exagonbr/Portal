'use client';

import React from 'react';
import { Book } from '../../../constants/mockData';
// import KookitViewer from './KookitViewer'; // Comentado temporariamente devido a erros de sintaxe

interface BookViewerProps {
  book?: Book;
  onClose?: () => void;
}

/**
 * Componente unificado para visualização de livros
 * Suporta formatos PDF e EPUB através de vários visualizadores
 */
const BookViewer: React.FC<BookViewerProps> = ({
  book,
  onClose
}) => {
  // Retornando componente temporário enquanto o KookitViewer está com problemas
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold mb-2">Visualizador Temporariamente Indisponível</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
        O visualizador de livros está em manutenção. Por favor, tente novamente mais tarde.
      </p>
      {onClose && (
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Voltar
        </button>
      )}
    </div>
  );
};

export default BookViewer;
