'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize,
  List,
  Settings,
  X,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { Book } from '@/constants/mockData';
import { useKookit } from '@/hooks/useKookit';
import KookitLoader from './KookitLoader';

interface KookitBookViewerProps {
  book: Book;
  onClose?: () => void;
}

const KookitBookViewer: React.FC<KookitBookViewerProps> = ({ book, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(false);

  // Determinar URL e tipo do arquivo
  const fileUrl = book.filePath || `/books/${book.id}.${book.format.toLowerCase()}`;
  const fileType = book.format.toLowerCase() as 'epub' | 'pdf' | 'mobi';

  // Usar hook do Kookit
  const {
    isLoading,
    error,
    isReady,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setZoom: setKookitZoom
  } = useKookit({
    fileUrl,
    fileType,
    containerId: 'kookit-page-area'
  });

  const handleZoomChange = (delta: number) => {
    const newZoom = Math.min(Math.max(zoom + delta, 50), 200);
    setZoom(newZoom);
    setKookitZoom(newZoom);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const ViewerContent = () => (
    <div 
      className={`flex flex-col w-full h-full min-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
              {book.title}
            </h3>
          </div>
          
          {book.author && (
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              por {book.author}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button 
            onClick={() => handleZoomChange(-10)}
            disabled={zoom <= 50}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Diminuir zoom"
          >
            <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          
          <span className="text-xs text-gray-700 dark:text-gray-300 w-12 text-center">
            {zoom}%
          </span>
          
          <button 
            onClick={() => handleZoomChange(10)}
            disabled={zoom >= 200}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          
          <button 
            onClick={() => setShowToc(!showToc)}
            className={`p-2 rounded-lg transition-colors ${
              showToc 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            aria-label="Índice"
          >
            <List className="w-4 h-4" />
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Tela cheia"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            ) : (
              <Maximize className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Área principal de visualização */}
        <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative">
          {/* Estados de carregamento e erro */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Carregando {fileType.toUpperCase()}...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Powered by Kookit
                </p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 z-10">
              <div className="text-center max-w-md p-6">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                  Erro ao carregar livro
                </h3>
                <p className="text-red-600 dark:text-red-300 text-sm mb-4">
                  {error}
                </p>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    💡 Verifique se o arquivo existe e está no formato correto
                  </p>
                </div>
                
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    🔄 Recarregar
                  </button>
                  {onClose && (
                    <button 
                      onClick={onClose}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      ← Voltar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Área de renderização do Kookit */}
          <div 
            id="kookit-page-area" 
            className="w-full h-full"
            style={{ 
              maxWidth: '100%',
              height: '100%',
              minHeight: '500px',
              visibility: (isLoading || error) ? 'hidden' : 'visible',
              opacity: isReady ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Barra de navegação inferior */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={prevPage}
          disabled={currentPage <= 1 || !isReady}
          className="flex items-center space-x-1 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
            Anterior
          </span>
        </button>
        
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (!isNaN(page)) {
                goToPage(page);
              }
            }}
            disabled={!isReady}
            className="w-16 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-center text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            de {totalPages}
          </span>
          
          {/* Indicador de progresso */}
          <div className="hidden sm:flex items-center ml-4">
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${totalPages > 0 ? (currentPage / totalPages) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0}%
            </span>
          </div>
        </div>
        
        <button 
          onClick={nextPage}
          disabled={currentPage >= totalPages || !isReady}
          className="flex items-center space-x-1 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Próxima página"
        >
          <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
            Próxima
          </span>
          <ArrowRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );

  return (
    <KookitLoader>
      <ViewerContent />
    </KookitLoader>
  );
};

export default KookitBookViewer; 