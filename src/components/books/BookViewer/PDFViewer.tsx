import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Book } from '@/constants/mockData';
import { Annotation, Highlight, Bookmark, ViewerState } from './types';
import { v4 as uuidv4 } from 'uuid';
import screenfull from 'screenfull';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  FiChevronLeft,
  FiChevronRight,
  FiBookmark,
  FiSearch,
  FiMaximize,
  FiMinimize,
  FiColumns,
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiMoon,
  FiSun,
  FiChevronsLeft,
  FiChevronsRight,
  FiX
} from 'react-icons/fi';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { calculateZoom } from './utils';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  fileUrl: string;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onBack?: () => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  fileUrl,
  initialAnnotations = [],
  initialHighlights = [],
  initialBookmarks = [],
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd,
  onBack,
  isDarkMode = false,
  onThemeToggle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [viewerState, setViewerState] = useState<ViewerState>({
    annotations: initialAnnotations,
    highlights: initialHighlights,
    bookmarks: initialBookmarks,
    isFullscreen: false,
    currentScale: 1.0,
    isDualPage: false,
    currentPage: 1
  });
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{page: number, text: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);

  // Dimensões do conteúdo para fit-to-screen
  const [contentDimensions, setContentDimensions] = useState({
    width: 0,
    height: 0
  });

  // Calcular dimensões ótimas da página baseado no tamanho do container
  useEffect(() => {
    const updatePageDimensions = () => {
      if (contentRef.current) {
        const { clientWidth, clientHeight } = contentRef.current;
        
        // Calcular dimensões disponíveis (fit-to-screen)
        let width = clientWidth - 40; // Padding
        let height = clientHeight - 40; // Padding
        
        // Para modo de página dupla, dividir a largura
        if (viewerState.isDualPage) {
          width = (width - 20) / 2;
        }
        
        setContentDimensions({
          width: Math.max(300, width), // Largura mínima
          height: Math.max(400, height) // Altura mínima
        });
      }
    };

    updatePageDimensions();
    window.addEventListener('resize', updatePageDimensions);
    return () => window.removeEventListener('resize', updatePageDimensions);
  }, [viewerState.isDualPage]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  }

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setViewerState(prev => ({ ...prev, currentPage: newPage }));
      
      // Smooth scroll to top when changing pages
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [numPages]);

  const handleZoomChange = useCallback((zoomLevel: number) => {
    setViewerState(prev => ({ ...prev, currentScale: zoomLevel / 100 }));
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const newZoom = calculateZoom(viewerState.currentScale * 100, direction);
    handleZoomChange(newZoom);
  }, [viewerState.currentScale, handleZoomChange]);

  const handleDualPageToggle = useCallback(() => {
    setViewerState(prev => ({ ...prev, isDualPage: !prev.isDualPage }));
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    if (containerRef.current && screenfull.isEnabled) {
      screenfull.toggle(containerRef.current).then(() => {
        setViewerState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
      });
    }
  }, []);

  // Annotation handlers
  const handleAnnotationAdd = useCallback((annotation: Omit<Annotation, 'id' | 'createdAt'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setViewerState(prev => ({
      ...prev,
      annotations: [...prev.annotations, newAnnotation]
    }));
    onAnnotationAdd?.(newAnnotation);
  }, [onAnnotationAdd]);

  // Highlight handlers
  const handleHighlightAdd = useCallback((highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setViewerState(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight]
    }));
    onHighlightAdd?.(newHighlight);
  }, [onHighlightAdd]);

  // Bookmark handlers
  const handleBookmarkAdd = useCallback((title: string) => {
    const newBookmark: Bookmark = {
      id: uuidv4(),
      pageNumber: viewerState.currentPage,
      title,
      createdAt: new Date().toISOString()
    };
    setViewerState(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks, newBookmark]
    }));
    onBookmarkAdd?.(newBookmark);
  }, [viewerState.currentPage, onBookmarkAdd]);

  const handleBookmarkSubmit = () => {
    if (newBookmarkTitle.trim()) {
      handleBookmarkAdd(newBookmarkTitle.trim());
      setNewBookmarkTitle('');
      setIsAddingBookmark(false);
    }
  };

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simular atraso de pesquisa
    setTimeout(() => {
      const results = Array.from({ length: Math.min(5, numPages || 0) }, (_, i) => {
        const randomPage = Math.floor(Math.random() * (numPages || 10)) + 1;
        return {
          page: randomPage,
          text: `...${searchQuery} encontrado no contexto da página ${randomPage}...`
        };
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }, [searchQuery, numPages]);

  // Calculate pages to display based on current mode and page number
  const getPagesToDisplay = () => {
    if (!viewerState.isDualPage || viewerState.currentPage === 1) {
      return [viewerState.currentPage];
    }

    // For dual page view, show odd-even pairs (1-2, 3-4, etc)
    const isOddPage = viewerState.currentPage % 2 === 1;
    const firstPage = isOddPage ? viewerState.currentPage : viewerState.currentPage - 1;
    const secondPage = firstPage + 1;

    // Don't show a non-existent page
    if (secondPage > (numPages || 0)) {
      return [firstPage];
    }

    return [firstPage, secondPage];
  };

  // Calcular progresso de leitura
  const readingProgress = numPages ? (viewerState.currentPage / numPages) * 100 : 0;

  const mockBook: Book = {
    id: 'pdf-viewer',
    title: pdfDocument?.info?.title || "PDF Document",
    author: pdfDocument?.info?.author || "Unknown Author",
    publisher: pdfDocument?.info?.producer || "Unknown Publisher",
    thumbnail: "",
    synopsis: pdfDocument?.info?.subject || "",
    duration: "N/A",
    pageCount: numPages || 0,
    format: 'pdf'
  };

  return (
    <div
      ref={containerRef}
      className={`h-screen w-full flex flex-col overflow-hidden ${viewerState.isFullscreen ? 'fixed inset-0 z-50' : ''} ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}
    >
      {/* Barra de ferramentas superior */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg flex-shrink-0">
        {/* Controles à esquerda - Botão Voltar Proeminente */}
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              title="Voltar ao Portal"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>
          )}

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={viewerState.currentPage <= 1}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Primeira página"
              >
                <FiChevronsLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handlePageChange(viewerState.currentPage - (viewerState.isDualPage ? 2 : 1))}
                disabled={viewerState.currentPage <= 1}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-2 px-3">
                <input
                  type="number"
                  value={viewerState.currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= (numPages || 1)) {
                      handlePageChange(value);
                    }
                  }}
                  className="w-16 px-2 py-1 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min={1}
                  max={numPages || 1}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  / {numPages || '?'}
                </span>
              </div>
              
              <button
                onClick={() => handlePageChange(viewerState.currentPage + (viewerState.isDualPage ? 2 : 1))}
                disabled={viewerState.currentPage >= (numPages || 1)}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Próxima página"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handlePageChange(numPages || 1)}
                disabled={viewerState.currentPage >= (numPages || 1)}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                <FiChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Informações do livro */}
          <div className="hidden lg:flex items-center space-x-3 text-sm">
            <div className="text-gray-800 dark:text-gray-200">
              <span className="font-bold">{mockBook.title}</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">• {mockBook.author}</span>
            </div>
          </div>
        </div>

        {/* Controles centrais */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
              title="Diminuir zoom"
            >
              <FiZoomOut className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-medium min-w-[3rem] text-center">
              {Math.round(viewerState.currentScale * 100)}%
            </span>
            <button
              onClick={() => handleZoom('in')}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
              title="Aumentar zoom"
            >
              <FiZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              onClick={() => handleZoomChange(100)}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
              title="Redefinir zoom"
            >
              <FiRotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={handleDualPageToggle}
              className={`p-2 rounded-lg transition-colors ${
                viewerState.isDualPage
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-white dark:hover:bg-gray-600'
              }`}
              title="Alternar visualização de página dupla"
            >
              <FiColumns className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controles à direita */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-colors ${
                showSearch
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-white dark:hover:bg-gray-600'
              }`}
              title="Pesquisar"
            >
              <FiSearch className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                const bookmark = viewerState.bookmarks.find(b => b.pageNumber === viewerState.currentPage);
                if (bookmark) {
                  // Remove bookmark
                  setViewerState(prev => ({
                    ...prev,
                    bookmarks: prev.bookmarks.filter(b => b.id !== bookmark.id)
                  }));
                } else {
                  setIsAddingBookmark(true);
                }
              }}
              className={`p-2 rounded-lg transition-colors ${
                viewerState.bookmarks.some(b => b.pageNumber === viewerState.currentPage)
                  ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'hover:bg-white dark:hover:bg-gray-600'
              }`}
              title="Alternar marcador"
            >
              <FiBookmark className="w-4 h-4" fill={viewerState.bookmarks.some(b => b.pageNumber === viewerState.currentPage) ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
              title="Alternar modo escuro"
            >
              {isDarkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleFullscreenToggle}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
              title="Alternar tela cheia"
            >
              {viewerState.isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Barra de pesquisa */}
      {showSearch && (
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Pesquisar no documento..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? 'Pesquisando...' : 'Pesquisar'}
            </button>
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          
          {/* Resultados da pesquisa */}
          {searchResults.length > 0 && (
            <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 max-h-60 overflow-y-auto max-w-2xl mx-auto">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Resultados da Pesquisa</h4>
              <div className="space-y-2">
                {searchResults.map((result, i) => (
                  <div
                    key={i}
                    onClick={() => handlePageChange(result.page)}
                    className="p-3 bg-white dark:bg-gray-600 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Página {result.page}</span>
                      <button className="text-xs text-gray-500 hover:text-gray-700">Ir para página</button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{result.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para adicionar marcador */}
      {isAddingBookmark && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 max-w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Adicionar Marcador</h3>
            <input
              type="text"
              value={newBookmarkTitle}
              onChange={(e) => setNewBookmarkTitle(e.target.value)}
              placeholder="Título do marcador..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsAddingBookmark(false);
                  setNewBookmarkTitle('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBookmarkSubmit}
                disabled={!newBookmarkTitle.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* PDF Content - Fit to screen */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900"
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Carregando PDF...</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Por favor, aguarde</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="text-red-500 mb-6">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <Document
            file={fileUrl}
            onLoadSuccess={(pdf) => {
              setPdfDocument(pdf);
              onDocumentLoadSuccess(pdf);
            }}
            onLoadError={onDocumentLoadError}
            className="flex justify-center items-center h-full w-full"
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
              cMapPacked: true,
              verbosity: 0,
            }}
          >
            <div className={`flex ${viewerState.isDualPage ? 'space-x-6' : ''} justify-center items-center h-full w-full p-4`}>
              {getPagesToDisplay().map((pageNum) => (
                <div 
                  key={pageNum} 
                  className="relative bg-white dark:bg-gray-800 shadow-2xl rounded-xl overflow-hidden"
                  style={{ 
                    transform: `scale(${viewerState.currentScale})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease-out'
                  }}
                >
                  <Page
                    pageNumber={pageNum}
                    width={contentDimensions.width}
                    height={contentDimensions.height}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="pdf-page"
                    loading={
                      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl" style={{ width: contentDimensions.width, height: contentDimensions.height }}>
                        <div className="animate-pulse text-center">
                          <div className="h-6 bg-gray-200 dark:bg-gray-300 rounded w-3/4 mb-4 mx-auto"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-300 rounded w-1/2 mx-auto"></div>
                        </div>
                      </div>
                    }
                  />
                  
                  {/* Page number overlay */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
                    Página {pageNum}
                  </div>
                </div>
              ))}
            </div>
          </Document>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
