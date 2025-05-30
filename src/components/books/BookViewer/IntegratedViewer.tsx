'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Book as EpubBook, Rendition } from 'epubjs';
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
  FiEdit,
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
  FiMenu,
  FiX,
  FiSidebar,
  FiArrowLeft
} from 'react-icons/fi';
import { calculateZoom } from './utils';

// Configuração do worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface IntegratedViewerProps {
  book: Book;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onBack?: () => void;
}

const IntegratedViewer: React.FC<IntegratedViewerProps> = ({
  book,
  initialAnnotations = [],
  initialHighlights = [],
  initialBookmarks = [],
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd,
  onBack
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Estado do visualizador
  const [viewerState, setViewerState] = useState<ViewerState>({
    annotations: initialAnnotations,
    highlights: initialHighlights,
    bookmarks: initialBookmarks,
    isFullscreen: false,
    currentScale: 1.0,
    isDualPage: false,
    currentPage: 1
  });
  
  // Estados específicos para PDF
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  
  // Estados específicos para EPUB
  const [epubBook, setEpubBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [bookMetadata, setBookMetadata] = useState<any>(null);
  
  // Estados compartilhados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{page: number, text: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  
  // Dimensões do conteúdo
  const [contentDimensions, setContentDimensions] = useState({
    width: 0,
    height: 0
  });

  // Manipuladores para anotações, destaques e favoritos
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

  const handleTextSelection = useCallback((cfiRange: string, text: string) => {
    if (!rendition) return;

    const highlight: Omit<Highlight, 'id' | 'createdAt'> = {
      pageNumber: viewerState.currentPage,
      content: text,
      color: '#ffeb3b',
      position: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
    };

    handleHighlightAdd(highlight);

    // Adicionar destaque ao renderizador EPUB
    rendition.annotations.highlight(cfiRange, {}, (e: MouseEvent) => {
      console.log('Destaque clicado:', text);
    }, '', { fill: '#ffeb3b', 'fill-opacity': '0.3' });
  }, [rendition, viewerState.currentPage, handleHighlightAdd]);

  // Manipuladores de eventos compartilhados
  const handleZoomChange = useCallback((zoomLevel: number) => {
    setViewerState(prev => ({ ...prev, currentScale: zoomLevel / 100 }));
    
    // Aplicar zoom ao EPUB
    if (book.format === 'epub' && rendition) {
      rendition.themes.fontSize(`${zoomLevel}%`);
    }
  }, [book.format, rendition]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const newZoom = calculateZoom(viewerState.currentScale * 100, direction);
    handleZoomChange(newZoom);
  }, [viewerState.currentScale, handleZoomChange]);

  const handleDualPageToggle = useCallback(() => {
    setViewerState(prev => ({ ...prev, isDualPage: !prev.isDualPage }));
    
    // Atualizar modo de exibição do EPUB
    if (book.format === 'epub' && rendition) {
      rendition.spread(!viewerState.isDualPage ? 'auto' : 'none');
    }
  }, [viewerState.isDualPage, book.format, rendition]);

  const handleFullscreenToggle = useCallback(() => {
    if (containerRef.current && screenfull.isEnabled) {
      screenfull.toggle(containerRef.current).then(() => {
        setViewerState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
      });
    }
  }, []);

  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > (numPages || 1)) return;
    
    if (book.format === 'pdf') {
      setViewerState(prev => ({ ...prev, currentPage: newPage }));
      
      // Rolagem suave para o topo ao mudar de página
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (book.format === 'epub' && epubBook && rendition) {
      const cfi = epubBook.locations.cfiFromLocation(newPage - 1);
      rendition.display(cfi);
    }
  }, [numPages, book.format, epubBook, rendition]);

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
      // Resultados de pesquisa simulados - em uma implementação real, isso pesquisaria o documento atual
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

  // Manipuladores de eventos para PDF
  const handlePdfDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handlePdfDocumentLoadError = (error: Error) => {
    console.error('Erro ao carregar PDF:', error);
    setError('Falha ao carregar o documento PDF');
    setLoading(false);
  };

  // Efeito para aplicar o modo escuro
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    // Aplicar tema escuro ao EPUB se necessário
    if (rendition && book.format === 'epub') {
      rendition.themes.register('dark', {
        'body': { 'color': '#e5e7eb !important', 'background-color': '#1f2937 !important' },
        'a': { 'color': '#60a5fa !important' }
      });
      rendition.themes.register('light', {
        'body': { 'color': '#1f2937 !important', 'background-color': '#ffffff !important' },
        'a': { 'color': '#3b82f6 !important' }
      });
      
      rendition.themes.select(isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, rendition, book.format]);

  // Efeito para calcular as dimensões do conteúdo
  useEffect(() => {
    const updateDimensions = () => {
      if (contentRef.current) {
        const { clientWidth, clientHeight } = contentRef.current;
        
        // Ajustar dimensões com base no modo de ajuste
        let width = clientWidth - 40; // Padding
        let height = clientHeight - 40; // Padding
        
        // Para modo de página dupla, dividir a largura
        if (viewerState.isDualPage) {
          width = (width - 20) / 2;
        }
        
        setContentDimensions({
          width: Math.min(width, 1200), // Limitar largura máxima
          height
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [viewerState.isDualPage]);

  // Carregar EPUB
  useEffect(() => {
    if (book.format !== 'epub' || !book.filePath || !contentRef.current) return;
    
    setLoading(true);
    setError(null);
    
    // Converter caminho relativo para URL absoluta se necessário
    const absoluteUrl = book.filePath.startsWith('http') 
      ? book.filePath 
      : `${window.location.origin}${book.filePath.startsWith('/') ? book.filePath : `/${book.filePath}`}`;
    
    const newBook = new EpubBook(absoluteUrl, {
      openAs: 'epub',
      requestHeaders: {
        'Accept': 'application/epub+zip',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
    setEpubBook(newBook);
    
    const loadBook = async () => {
      try {
        // Aguardar carregamento inicial do livro
        await newBook.ready;
        
        // Carregar metadados
        const meta = await newBook.loaded.metadata;
        setBookMetadata(meta);
        
        // Renderizar o livro
        const newRendition = newBook.renderTo(contentRef.current!, {
          width: '100%',
          height: '100%',
          spread: viewerState.isDualPage ? 'auto' : 'none',
          flow: 'paginated'
        });
        
        setRendition(newRendition);

        // Exibir a primeira página
        await newRendition.display();

        // Gerar localizações para paginação
        await newBook.locations.generate(1024);
        const total = newBook.locations.length();
        setNumPages(total);

        // Configurar event listeners
        newRendition.on('relocated', (location: any) => {
          const currentLocation = newBook.locations.locationFromCfi(location.start.cfi);
          if (typeof currentLocation === 'number') {
            setViewerState(prev => ({ ...prev, currentPage: currentLocation + 1 }));
          }
        });

        // Manipular seleção de texto para destaques
        newRendition.on('selected', (cfiRange: string, contents: any) => {
          const text = contents.window.getSelection().toString();
          if (text) {
            handleTextSelection(cfiRange, text);
          }
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar EPUB:', error);
        setError('Falha ao carregar o documento EPUB');
        setLoading(false);
      }
    };

    loadBook();

    return () => {
      if (newBook) {
        newBook.destroy();
      }
    };
  }, [book.format, book.filePath, viewerState.isDualPage, handleTextSelection]);

  // Calcular páginas a exibir com base no modo atual e número da página
  const getPagesToDisplay = () => {
    if (!viewerState.isDualPage || viewerState.currentPage === 1) {
      return [viewerState.currentPage];
    }

    // Para visualização de página dupla, mostrar pares ímpar-par (1-2, 3-4, etc.)
    const isOddPage = viewerState.currentPage % 2 === 1;
    const firstPage = isOddPage ? viewerState.currentPage : viewerState.currentPage - 1;
    const secondPage = firstPage + 1;

    // Não mostrar uma página inexistente
    if (secondPage > (numPages || 0)) {
      return [firstPage];
    }

    return [firstPage, secondPage];
  };

  // Calcular progresso de leitura
  const readingProgress = numPages ? (viewerState.currentPage / numPages) * 100 : 0;

  // Renderizar o conteúdo do livro com base no formato
  const renderBookContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando {book.format?.toUpperCase()}...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      );
    }

    if (book.format === 'pdf') {
      return (
        <Document
          file={book.filePath}
          onLoadSuccess={(pdf) => {
            setPdfDocument(pdf);
            handlePdfDocumentLoadSuccess(pdf);
          }}
          onLoadError={handlePdfDocumentLoadError}
          className="flex justify-center h-full"
        >
          <div className={`flex ${viewerState.isDualPage ? 'space-x-4' : ''} justify-center items-center h-full py-4`}>
            {getPagesToDisplay().map((pageNum) => (
              <div 
                key={pageNum} 
                className="relative bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden"
                style={{ 
                  transform: `scale(${viewerState.currentScale})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease-out'
                }}
              >
                <Page
                  pageNumber={pageNum}
                  width={contentDimensions.width || undefined}
                  height={contentDimensions.height || undefined}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="pdf-page"
                  loading={
                    <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  }
                />
                
                {/* Número da página */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  Página {pageNum}
                </div>
              </div>
            ))}
          </div>
        </Document>
      );
    }

    if (book.format === 'epub') {
      return (
        <div className="w-full h-full">
          {/* O conteúdo EPUB será renderizado aqui pelo useEffect */}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Formato não suportado: {book.format}</p>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`h-screen w-full flex flex-col overflow-hidden ${viewerState.isFullscreen ? 'fixed inset-0 z-50' : ''} ${isDarkMode ? 'dark' : ''}`}
    >
      {/* Barra de ferramentas superior */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
        {/* Controles à esquerda */}
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors"
              title="Voltar"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-1">
            <div className="flex items-center bg-gray-100 dark:bg-gray-300 rounded-lg p-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={viewerState.currentPage <= 1}
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Primeira página"
              >
                <FiChevronsLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handlePageChange(viewerState.currentPage - (viewerState.isDualPage ? 2 : 1))}
                disabled={viewerState.currentPage <= 1}
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1 px-2">
                <input
                  type="number"
                  value={viewerState.currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= (numPages || 1)) {
                      handlePageChange(value);
                    }
                  }}
                  className="w-14 px-2 py-1 text-center bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Próxima página"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handlePageChange(numPages || 1)}
                disabled={viewerState.currentPage >= (numPages || 1)}
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                <FiChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {Math.round(readingProgress)}%
            </span>
          </div>
        </div>

        {/* Controles centrais */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-300 rounded-lg p-1">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
              title="Diminuir zoom"
            >
              <FiZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm font-medium min-w-[3rem] text-center">
              {Math.round(viewerState.currentScale * 100)}%
            </span>
            <button
              onClick={() => handleZoom('in')}
              className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
              title="Aumentar zoom"
            >
              <FiZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              onClick={() => handleZoomChange(100)}
              className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
              title="Redefinir zoom"
            >
              <FiRotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-300 rounded-lg p-1">
            <button
              onClick={handleDualPageToggle}
              className={`p-2 rounded transition-colors ${
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
          <div className="flex bg-gray-100 dark:bg-gray-300 rounded-lg p-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded transition-colors ${
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
              className={`p-2 rounded transition-colors ${
                viewerState.bookmarks.some(b => b.pageNumber === viewerState.currentPage)
                  ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'hover:bg-white dark:hover:bg-gray-600'
              }`}
              title="Alternar marcador"
            >
              <FiBookmark className="w-4 h-4" fill={viewerState.bookmarks.some(b => b.pageNumber === viewerState.currentPage) ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-gray-300 rounded-lg p-1">
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
              title="Alternar modo escuro"
            >
              {isDarkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleFullscreenToggle}
              className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
              title="Alternar tela cheia"
            >
              {viewerState.isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de pesquisa */}
      {showSearch && (
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Pesquisar no documento..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? 'Pesquisando...' : 'Pesquisar'}
            </button>
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          
          {/* Resultados da pesquisa */}
          {searchResults.length > 0 && (
            <div className="mt-3 bg-gray-50 dark:bg-gray-300/50 rounded-lg p-3 max-h-60 overflow-y-auto max-w-2xl mx-auto">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Resultados da Pesquisa</h4>
              <div className="space-y-2">
                {searchResults.map((result, i) => (
                  <div
                    key={i}
                    onClick={() => handlePageChange(result.page)}
                    className="p-2 bg-white dark:bg-gray-300 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Adicionar Marcador</h3>
            <input
              type="text"
              value={newBookmarkTitle}
              onChange={(e) => setNewBookmarkTitle(e.target.value)}
              placeholder="Título do marcador..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-300"
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setIsAddingBookmark(false);
                  setNewBookmarkTitle('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBookmarkSubmit}
                disabled={!newBookmarkTitle.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Área de conteúdo principal */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900"
      >
        {renderBookContent()}
      </div>
    </div>
  );
};

export default IntegratedViewer;