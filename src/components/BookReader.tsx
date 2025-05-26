'use client';

import React, { useState } from 'react';
import PDFReader from './readers/PDFReader';
import EPUBReader from './readers/EPUBReader';
import HTMLReader from './readers/HTMLReader';

type SupportedFormats = 'pdf' | 'epub' | 'html';

interface BookReaderProps {
  url: string;
  format: SupportedFormats;
}

export default function BookReader({ url, format }: BookReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadSuccess = (pages?: number) => {
    if (pages) setNumPages(pages);
    setIsLoading(false);
    setError(null);
  };

  const handleLoadError = (err: Error) => {
    setError(`Erro ao carregar o arquivo ${format.toUpperCase()}. Verifique se o arquivo é válido.`);
    console.error(`${format.toUpperCase()} loading error:`, err);
    setIsLoading(false);
  };

  const changePage = (offset: number) => {
    if (format === 'pdf') {
      setPageNumber(prevPageNumber => {
        const newPage = prevPageNumber + offset;
        return newPage >= 1 && newPage <= numPages ? newPage : prevPageNumber;
      });
    }
  };

  const renderReader = () => {
    switch (format) {
      case 'pdf':
        return (
          <PDFReader
            url={url}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            pageNumber={pageNumber}
          />
        );
      case 'epub':
        return (
          <EPUBReader
            url={url}
            onLoadSuccess={() => handleLoadSuccess()}
            onLoadError={handleLoadError}
          />
        );
      case 'html':
        return (
          <HTMLReader
            url={url}
            onLoadSuccess={() => handleLoadSuccess()}
            onLoadError={handleLoadError}
          />
        );
      default:
        return <div>Formato não suportado</div>;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md mx-auto">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <p className="text-white text-lg font-semibold">{error}</p>
          <p className="text-sm text-gray-400 mt-2">Por favor, tente novamente ou contate o suporte se o problema persistir.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Carregando arquivo {format.toUpperCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Navigation Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Navigation buttons - shown for PDF only */}
          {format === 'pdf' && (
            <>
              <button
                onClick={() => changePage(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={pageNumber <= 1}
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <button
                onClick={() => changePage(1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={pageNumber >= numPages}
                aria-label="Próxima página"
              >
                Próxima
              </button>
            </>
          )}
        </div>

        {/* Page counter - shown for PDF only */}
        {format === 'pdf' && (
          <div className="text-white" aria-live="polite" aria-atomic="true">
            Página {pageNumber} de {numPages}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4">
        {renderReader()}
      </div>
    </div>
  );
}
