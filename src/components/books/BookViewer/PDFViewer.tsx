import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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

  // Memoizar as opções do PDF para evitar recarregamentos desnecessários
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    verbosity: 0,
  }), []);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-screen ${
        isDarkMode ? 'dark' : ''
      } bg-background-secondary`}
    >
      {/* Header com controles */}
      <div className="flex items-center justify-between px-4 py-3 bg-background-primary border-b border-border-DEFAULT shadow-lg flex-shrink-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-text-primary truncate">{mockBook.title}</h2>
          
          {showSearch && (
            <div className="text-sm text-text-secondary">
              {searchResults.length > 0 && `${searchResults.length} resultados encontrados`}
            </div>
          )}
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center bg-background-tertiary rounded-xl p-1">
          <button
            onClick={() => handlePageChange(Math.max(1, viewerState.currentPage - 1))}
            disabled={viewerState.currentPage <= 1}
            className="p-2 rounded-lg hover:bg-background-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Página anterior"
          >
            <FiChevronLeft className="w-4 h-4 text-text-primary" />
          </button>
          
          <button
            onClick={() => handlePageChange(Math.min(numPages || 1, viewerState.currentPage + 1))}
            disabled={viewerState.currentPage >= (numPages || 1)}
            className="p-2 rounded-lg hover:bg-background-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Próxima página"
          >
            <FiChevronRight className="w-4 h-4 text-text-primary" />
          </button>

          <div className="flex items-center mx-2">
            <input
              type="number"
              min={1}
              max={numPages || 1}
              value={viewerState.currentPage}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= (numPages || 1)) {
                  handlePageChange(value);
                }
              }}
              className="w-16 px-2 py-1 text-center bg-background-primary rounded-lg border border-border-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <span className="text-sm text-text-secondary">
              / {numPages || '?'}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(1)}
            disabled={viewerState.currentPage <= 1}
            className="p-2 rounded-lg hover:bg-background-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Primeira página"
          >
            <FiChevronsLeft className="w-4 h-4 text-text-primary" />
          </button>
          
          <button
            onClick={() => handlePageChange(numPages || 1)}
            disabled={viewerState.currentPage >= (numPages || 1)}
            className="p-2 rounded-lg hover:bg-background-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Última página"
          >
            <FiChevronsRight className="w-4 h-4 text-text-primary" />
          </button>
        </div>

        <div className="text-text-secondary">
          <div className="font-medium text-text-primary">{mockBook.title}</div>
          <span className="text-text-secondary ml-2">• {mockBook.author}</span>
        </div>

        {/* Controles de Zoom e Ferramentas */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-background-tertiary rounded-xl p-1">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 rounded-lg hover:bg-background-primary transition-colors"
              title="Diminuir zoom"
            >
              <FiZoomOut className="w-4 h-4 text-text-primary" />
            </button>
            
            <span className="text-sm font-medium px-2 text-text-primary">{Math.round(viewerState.currentScale * 100)}%</span>
            
            <button
              onClick={() => handleZoom('in')}
              className="p-2 rounded-lg hover:bg-background-primary transition-colors"
              title="Aumentar zoom"
            >
              <FiZoomIn className="w-4 h-4 text-text-primary" />
            </button>
          </div>

          <div className="w-px h-6 bg-border-DEFAULT mx-1" />

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg hover:bg-background-primary transition-colors"
            title="Buscar no texto"
          >
            <FiSearch className="w-4 h-4 text-text-primary" />
          </button>

          <div className="flex bg-background-tertiary rounded-xl p-1">
            {(['fit-width', 'fit-page'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  // Implement the logic to set the fit mode
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  viewerState.isDualPage === (mode === 'fit-page')
                    ? 'bg-primary text-white'
                    : 'hover:bg-background-primary text-text-primary'
                }`}
                title={mode === 'fit-width' ? 'Ajustar à largura' : 'Ajustar à página'}
              >
                {mode === 'fit-width' ? 'Largura' : 'Página'}
              </button>
            ))}
          </div>

          <div className="flex bg-background-tertiary rounded-xl p-1">
            {(['single', 'double'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewerState(prev => ({ ...prev, isDualPage: mode === 'double' }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  viewerState.isDualPage === (mode === 'double')
                    ? 'bg-primary text-white'
                    : 'hover:bg-background-primary text-text-primary'
                }`}
                title={mode === 'single' ? 'Página única' : 'Páginas duplas'}
              >
                {mode === 'single' ? 'Única' : 'Dupla'}
              </button>
            ))}
          </div>

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
                ? 'text-warning bg-warning-light'
                : 'hover:bg-background-primary text-text-primary'
            }`}
            title={viewerState.bookmarks.some(b => b.pageNumber === viewerState.currentPage) ? 'Remover marcador' : 'Adicionar marcador'}
          >
            <FiBookmark className="w-4 h-4" fill={viewerState.bookmarks.some(b => b.pageNumber === viewerState.currentPage) ? 'currentColor' : 'none'} />
          </button>

          <div className="flex bg-background-tertiary rounded-xl p-1">
            <button
              onClick={() => {
                // Implement the logic to show table of contents
              }}
              className="p-2 rounded-lg hover:bg-background-primary transition-colors"
              title="Índice"
            >
              {/* Placeholder for table of contents button */}
            </button>
            
            <button
              onClick={() => {
                // Implement the logic to show notes
              }}
              className="p-2 rounded-lg hover:bg-background-primary transition-colors"
              title="Anotações"
            >
              {/* Placeholder for notes button */}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-1 bg-border-light flex-shrink-0">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Barra de busca */}
      {showSearch && (
        <div className="px-4 py-3 bg-background-primary border-b border-border-DEFAULT flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar no livro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background-tertiary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50"
            >
              Buscar
            </button>
            
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchResults([]);
                setSearchQuery('');
              }}
              className="p-2 rounded-xl hover:bg-background-tertiary"
            >
              <FiX className="w-4 h-4 text-text-primary" />
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 bg-background-tertiary rounded-xl p-3 max-h-60 overflow-y-auto max-w-2xl mx-auto">
              <h4 className="text-sm font-medium mb-2 text-text-primary">Resultados da Pesquisa</h4>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handlePageChange(result.page)}
                    className="p-3 bg-background-primary rounded-lg cursor-pointer hover:bg-secondary-light transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-accent-blue">Página {result.page}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{result.text}</p>
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
          <div className="bg-white dark:bg-gray-100 rounded-2xl p-6 w-96 max-w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Adicionar Marcador</h3>
            <input
              type="text"
              value={newBookmarkTitle}
              onChange={(e) => setNewBookmarkTitle(e.target.value)}
              placeholder="Título do marcador..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-100"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsAddingBookmark(false);
                  setNewBookmarkTitle('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
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
        className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-200"
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
              <p className="text-gray-600 dark:text-gray-600 text-lg">Carregando PDF...</p>
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
              <p className="text-gray-600 dark:text-gray-600 mb-6 text-lg">{error}</p>
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
            options={pdfOptions}
          >
            <div className={`flex ${viewerState.isDualPage ? 'space-x-6' : ''} justify-center items-center h-full w-full p-4`}>
              {getPagesToDisplay().map((pageNum) => (
                <div 
                  key={pageNum} 
                  className="relative bg-white dark:bg-gray-100 shadow-2xl rounded-xl overflow-hidden"
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
                      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-100 rounded-xl" style={{ width: contentDimensions.width, height: contentDimensions.height }}>
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
