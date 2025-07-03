'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Book as EpubBook, Rendition } from 'epubjs';
import { 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize,
  List,
  Bookmark,
  Settings,
  Search,
  X
} from 'lucide-react';

// Tipos
interface SimpleBookViewerProps {
  fileUrl: string;
  fileType: 'pdf' | 'epub';
  initialPage?: number;
  onClose?: () => void;
}

// Importar os visualizadores específicos de forma dinâmica para evitar SSR
const PDFViewer = dynamic(
  () => import('./PDFViewer').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <ViewerLoadingState message="Carregando visualizador de PDF..." />
  }
);

const EPUBViewer = dynamic(
  () => import('./EPUBViewer').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <ViewerLoadingState message="Carregando visualizador de EPUB..." />
  }
);

// Componente de loading
const ViewerLoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center w-full h-full min-h-[500px] bg-white dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {message}
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Inicializando visualizador...
      </p>
      <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-64 mx-auto">
        <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
    </div>
  </div>
);

// Componente principal
const SimpleBookViewer: React.FC<SimpleBookViewerProps> = ({
  fileUrl,
  fileType,
  initialPage = 1,
  onClose
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // Manipuladores para EPUB
  const [book, setBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<any[]>([]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Manipular saída do modo fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Aumentar/diminuir zoom
  const changeZoom = useCallback((delta: number) => {
    setZoom(prev => {
      const newZoom = prev + delta;
      return Math.min(Math.max(newZoom, 50), 200);
    });
  }, []);

  // Navegar entre páginas
  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  }, [totalPages]);

  // Manipular erro no carregamento
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  // Informações do livro carregado
  const handleBookLoaded = useCallback((pages: number, toc?: any[]) => {
    setTotalPages(pages);
    setIsLoading(false);
    if (toc) {
      setTableOfContents(toc);
    }
  }, []);

  // Registrar manipuladores globais de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft') {
        goToPage(currentPage - 1);
      } else if (e.key === '+' || e.key === '=') {
        changeZoom(10);
      } else if (e.key === '-') {
        changeZoom(-10);
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, goToPage, changeZoom, onClose]);

  // Limpeza na desmontagem
  useEffect(() => {
    return () => {
      if (book) {
        book.destroy();
      }
      if (rendition) {
        rendition.destroy();
      }
    };
  }, [book, rendition]);

  // Renderizar o visualizador correto baseado no tipo de arquivo
  const renderViewer = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <X className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Erro ao carregar arquivo
          </h3>
          <p className="text-red-600 dark:text-red-300 text-center max-w-md">
            {error}
          </p>
          <button 
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      );
    }

    if (isLoading) {
      return <ViewerLoadingState message={`Carregando ${fileType === 'pdf' ? 'PDF' : 'EPUB'}...`} />;
    }

    if (fileType === 'pdf') {
      return (
        <PDFViewer
          fileUrl={fileUrl}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          zoom={zoom}
          onDocumentLoaded={(numPages) => handleBookLoaded(numPages)}
          onError={handleError}
        />
      );
    } else {
      return (
        <EPUBViewer
          fileUrl={fileUrl}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          zoom={zoom}
          onDocumentLoaded={(numPages, toc) => handleBookLoaded(numPages, toc)}
          onError={handleError}
          showToc={showToc}
          setShowToc={setShowToc}
          tableOfContents={tableOfContents}
          setTableOfContents={setTableOfContents}
        />
      );
    }
  };

  return (
    <div 
      ref={viewerRef}
      className={`flex flex-col w-full h-full min-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
    >
      {/* Barra de ferramentas superior */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
            {fileUrl.split('/').pop()?.split('#')[0].split('?')[0]}
          </h3>
        </div>

        <div className="flex items-center space-x-1">
          <button 
            onClick={() => changeZoom(-10)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Diminuir zoom"
          >
            <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <span className="text-sm text-gray-700 dark:text-gray-300 w-16 text-center">
            {zoom}%
          </span>
          
          <button 
            onClick={() => changeZoom(10)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <button 
            onClick={() => setShowToc(!showToc)}
            className={`p-2 rounded-lg transition-colors ${
              showToc 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            aria-label="Índice"
          >
            <List className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Tela cheia"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Maximize className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Painel de índice */}
        {showToc && tableOfContents.length > 0 && (
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Índice</h4>
            </div>
            <ul className="p-2">
              {tableOfContents.map((item, index) => (
                <li key={index} className="mb-1">
                  <button
                    onClick={() => {
                      if (rendition && item.href) {
                        rendition.display(item.href);
                      }
                    }}
                    className="text-sm text-left w-full px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 truncate"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Área do visualizador */}
        <div className="flex-1 min-h-0">
          {renderViewer()}
        </div>
      </div>

      {/* Barra de navegação inferior */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        
        <div className="flex items-center">
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
            className="w-16 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-center text-sm text-gray-700 dark:text-gray-300"
          />
          <span className="mx-2 text-sm text-gray-600 dark:text-gray-400">
            de {totalPages}
          </span>
        </div>
        
        <button 
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Próxima página"
        >
          <ArrowRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default SimpleBookViewer; 