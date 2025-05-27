'use client';

import React, { useState, useCallback } from 'react';
import PDFReader from './readers/PDFReader';
import EPUBReader from './readers/EPUBReader';
import HTMLReader from './readers/HTMLReader';
import { 
  PencilSquareIcon, 
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';

type SupportedFormats = 'pdf' | 'epub' | 'html';

interface BookReaderProps {
  url: string;
  format: SupportedFormats;
  onAnnotationsChange?: (count: number) => void;
  onHighlightsChange?: (count: number) => void;
}

interface Annotation {
  id: string;
  page: number;
  text: string;
  highlight?: string;
  date: string;
}

interface Highlight {
  id: string;
  page: number;
  text: string;
  color: 'yellow' | 'green' | 'blue';
  date: string;
}

export default function BookReader({ 
  url, 
  format,
  onAnnotationsChange,
  onHighlightsChange 
}: BookReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'annotation' | 'highlight' | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'green' | 'blue'>('yellow');

  // Update counts when annotations or highlights change
  React.useEffect(() => {
    onAnnotationsChange?.(annotations.length);
  }, [annotations, onAnnotationsChange]);

  React.useEffect(() => {
    onHighlightsChange?.(highlights.length);
  }, [highlights, onHighlightsChange]);

  // Handle text selection for annotations/highlights
  const handleTextSelect = useCallback((selectedText: string) => {
    if (!selectedTool) return;

    if (selectedTool === 'annotation') {
      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}`,
        page: pageNumber,
        text: '',
        highlight: selectedText,
        date: new Date().toISOString()
      };

      // Show annotation input dialog
      const annotationText = window.prompt('Adicionar anotação:', '');
      if (annotationText !== null) {
        newAnnotation.text = annotationText;
        setAnnotations(prev => [...prev, newAnnotation]);
      }
    } else if (selectedTool === 'highlight') {
      const newHighlight: Highlight = {
        id: `highlight-${Date.now()}`,
        page: pageNumber,
        text: selectedText,
        color: highlightColor,
        date: new Date().toISOString()
      };
      setHighlights(prev => [...prev, newHighlight]);
    }
  }, [selectedTool, pageNumber, highlightColor]);

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
            onTextSelect={handleTextSelect}
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
    <div className="flex h-full bg-gray-900">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
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

            {/* Page counter - shown for PDF only */}
            {format === 'pdf' && (
              <div className="text-white" aria-live="polite" aria-atomic="true">
                Página {pageNumber} de {numPages}
              </div>
            )}
          </div>

          {/* Tools */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
              aria-label="Favoritar"
            >
              {isFavorite ? <HeartSolidIcon className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
            </button>

            <button
              onClick={() => {
                setSelectedTool(prev => prev === 'annotation' ? null : 'annotation');
                setShowSidebar(true);
              }}
              className={`p-2 rounded-lg transition-colors ${
                selectedTool === 'annotation' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Adicionar anotação"
            >
              <PencilSquareIcon className="w-6 h-6" />
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setSelectedTool(prev => prev === 'highlight' ? null : 'highlight');
                  setShowSidebar(true);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  selectedTool === 'highlight' ? 'bg-yellow-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Destacar texto"
              >
                <StarIcon className="w-6 h-6" />
              </button>

              {/* Highlight color picker */}
              {selectedTool === 'highlight' && (
                <div className="absolute top-full right-0 mt-2 p-2 bg-gray-800 rounded-lg shadow-lg flex space-x-2">
                  {(['yellow', 'green', 'blue'] as const).map(color => (
                    <button
                      key={color}
                      onClick={() => setHighlightColor(color)}
                      className={`w-6 h-6 rounded-full ${
                        color === 'yellow' ? 'bg-yellow-200' :
                        color === 'green' ? 'bg-green-200' :
                        'bg-blue-200'
                      } ${
                        highlightColor === color ? 'ring-2 ring-white' : ''
                      }`}
                      aria-label={`Cor ${color}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label={showSidebar ? "Fechar barra lateral" : "Abrir barra lateral"}
            >
              {showSidebar ? <ChevronDoubleRightIcon className="w-6 h-6" /> : <ChevronDoubleLeftIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {renderReader()}
        </div>
      </div>

      {/* Right Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {selectedTool === 'annotation' ? 'Anotações' :
               selectedTool === 'highlight' ? 'Destaques' :
               'Notas e Destaques'}
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-auto p-4">
            {selectedTool === 'annotation' && annotations.length === 0 && (
              <p className="text-gray-400 text-center">
                Nenhuma anotação ainda. Selecione um texto e clique no ícone de lápis para adicionar.
              </p>
            )}

            {selectedTool === 'highlight' && highlights.length === 0 && (
              <p className="text-gray-400 text-center">
                Nenhum destaque ainda. Selecione um texto e clique no ícone de estrela para destacar.
              </p>
            )}

            {/* List annotations */}
            {selectedTool === 'annotation' && annotations.map(annotation => (
              <div key={annotation.id} className="mb-4 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Página {annotation.page}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(annotation.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {annotation.highlight && (
                  <blockquote className="mb-2 pl-3 border-l-4 border-blue-500 text-sm text-gray-300 italic">
                    "{annotation.highlight}"
                  </blockquote>
                )}
                <p className="text-white">{annotation.text}</p>
              </div>
            ))}

            {/* List highlights */}
            {selectedTool === 'highlight' && highlights.map(highlight => (
              <div key={highlight.id} className="mb-4 p-4 rounded-lg" style={{
                backgroundColor: highlight.color === 'yellow' ? 'rgb(253, 224, 71, 0.2)' :
                                highlight.color === 'green' ? 'rgb(134, 239, 172, 0.2)' :
                                'rgb(147, 197, 253, 0.2)'
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Página {highlight.page}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(highlight.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-white">{highlight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
