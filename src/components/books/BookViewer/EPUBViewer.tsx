'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Book as EpubBook, Rendition } from 'epubjs';
import { Book } from '@/constants/mockData';
import { Annotation, Highlight, Bookmark, ViewerState } from './types';
import { v4 as uuidv4 } from 'uuid';
import screenfull from 'screenfull';
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
  FiX,
  FiHome
} from 'react-icons/fi';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

interface EPUBViewerProps {
  fileUrl: string;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onBack?: () => void;
}

const EPUBViewer: React.FC<EPUBViewerProps> = ({ 
  fileUrl,
  initialAnnotations = [],
  initialHighlights = [],
  initialBookmarks = [],
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd,
  onBack
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  const [isClient, setIsClient] = useState(false);
  const [book, setBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [viewerState, setViewerState] = useState<ViewerState>({
    annotations: initialAnnotations,
    highlights: initialHighlights,
    bookmarks: initialBookmarks,
    isFullscreen: false,
    currentScale: 1.0,
    isDualPage: false,
    currentPage: 1
  });
  
  const [totalPages, setTotalPages] = useState<number>(0);
  const [bookMetadata, setBookMetadata] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{page: number, text: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [epubLoaded, setEpubLoaded] = useState(false);
  const initLockRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Função para obter URL completa do arquivo
  const getFileUrl = useCallback((url: string): string => {
    if (!url) return '';
    
    // Se já é uma URL completa
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Se é uma URL relativa
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }
    
    // Se não tem protocolo, assume que é relativo
    return `${window.location.origin}/${url}`;
  }, []);

  // Redimensionamento responsivo
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isObserving = false;

    const updateDimensions = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!containerRef.current || isObserving) return;
        
        isObserving = true;
        
        try {
          const container = containerRef.current;
          const rect = container.getBoundingClientRect();
          const availableWidth = rect.width - 40; // margem
          const availableHeight = rect.height - 80; // margem + controles
          
          const newDimensions = {
            width: Math.max(600, availableWidth),
            height: Math.max(400, availableHeight)
          };
          
          // Só atualizar se houve mudança significativa (> 10px)
          setDimensions(prevDimensions => {
            const widthDiff = Math.abs(newDimensions.width - prevDimensions.width);
            const heightDiff = Math.abs(newDimensions.height - prevDimensions.height);
            
            if (widthDiff > 10 || heightDiff > 10) {
              return newDimensions;
            }
            return prevDimensions;
          });
        } catch (error) {
          // Ignorar erros do ResizeObserver
        } finally {
          isObserving = false;
        }
      }, 200); // Aumentar throttle para 200ms
    };

    updateDimensions();
    
    let resizeObserver: ResizeObserver | null = null;
    
    try {
      resizeObserver = new ResizeObserver((entries) => {
        // Verificar se há mudanças significativas antes de processar
        const entry = entries[0];
        if (entry && entry.contentRect) {
          updateDimensions();
        }
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
    } catch (error) {
      // Fallback para resize da window se ResizeObserver falhar
      const handleWindowResize = () => updateDimensions();
      window.addEventListener('resize', handleWindowResize);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleWindowResize);
      };
    }

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserver) {
        try {
          resizeObserver.disconnect();
        } catch (error) {
          // Ignorar erros ao desconectar
        }
      }
    };
  }, []);

  // Função de cleanup melhorada
  const cleanupEPUB = useCallback(() => {
    console.log('🧹 Iniciando cleanup EPUB...');
    
    try {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      if (rendition) {
        console.log('🧹 Destruindo rendition...');
        rendition.destroy();
        setRendition(null);
      }

      if (book) {
        console.log('🧹 Destruindo book...');
        book.destroy();
        setBook(null);
      }

      setEpubLoaded(false);
      setError(null);
      initLockRef.current = false;
      
      console.log('✅ Cleanup EPUB completo');
    } catch (error) {
      console.warn('⚠️ Erro durante cleanup EPUB:', error);
    }
  }, [book, rendition]);

  const initializeEPUB = useCallback(async () => {
    // Prevenir múltiplas inicializações
    if (initLockRef.current) {
      console.log('🔒 Inicialização EPUB já em andamento, ignorando...');
      return;
    }

    initLockRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Iniciando inicialização EPUB robusta...');
      
      // Cleanup anterior
      cleanupEPUB();

      const absoluteUrl = getFileUrl(fileUrl);
      console.log('📚 Carregando EPUB:', absoluteUrl);

      // Verificar se o arquivo existe
      const response = await fetch(absoluteUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Arquivo EPUB não encontrado (Status: ${response.status})`);
      }

      // Aguardar próximo tick para garantir que o DOM está pronto
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar se o container existe
      const container = document.getElementById('epub-viewer');
      if (!container) {
        throw new Error('Container #epub-viewer não encontrado');
      }

      console.log('📚 Criando instância EPUB com configurações robustas...');
      
      // Criar nova instância com configurações seguras
      const newBook = new EpubBook(absoluteUrl, {
        openAs: 'epub',
        requestHeaders: {
          'Accept': 'application/epub+zip, application/zip',
          'Cache-Control': 'no-cache'
        }
      });

      // Aguardar o book estar completamente pronto com timeout
      console.log('⏳ Aguardando EPUB estar completamente pronto...');
      
      const readyBook = await Promise.race([
        new Promise<EpubBook>((resolve, reject) => {
          newBook.ready.then(() => {
            console.log('✅ EPUB.ready resolvido');
            
            // Validações básicas
            if (!newBook.spine) {
              reject(new Error('EPUB sem spine válido'));
              return;
            }

            if (!newBook.navigation) {
              console.warn('⚠️ EPUB sem navigation, mas continuando...');
            }

            console.log('✅ EPUB book validado e pronto');
            resolve(newBook);
          }).catch(reject);
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: EPUB não carregou em 30 segundos')), 30000)
        )
      ]);

      console.log('✅ EPUB book completamente pronto');
      setBook(readyBook);

      // Aguardar um tick antes de renderizar
      await new Promise(resolve => setTimeout(resolve, 50));

      // Criar rendition com configurações robustas
      console.log('🎨 Criando rendition EPUB...');
      
      const newRendition = readyBook.renderTo('epub-viewer', {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'paginated',
        manager: 'default',
        minSpreadWidth: 600
      });

      // Aguardar renderização com timeout
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          newRendition.display().then(() => {
            console.log('🎨 EPUB renderizado com sucesso');
            resolve();
          }).catch(reject);
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Renderização EPUB falhou em 15 segundos')), 15000)
        )
      ]);

      setRendition(newRendition);
      setEpubLoaded(true);

      // Configurar cleanup para este componente
      cleanupRef.current = () => {
        try {
          newRendition.destroy();
          readyBook.destroy();
        } catch (error) {
          console.warn('Erro no cleanup específico:', error);
        }
      };

      console.log('✅ EPUB inicializado com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao inicializar EPUB:', error);
      setError(error instanceof Error ? error.message : 'Falha ao carregar o documento EPUB');
      cleanupEPUB();
    } finally {
      setLoading(false);
      initLockRef.current = false;
    }
  }, [fileUrl, getFileUrl]);

  // Effect para inicialização
  useEffect(() => {
    if (fileUrl && !epubLoaded && !initLockRef.current) {
      const timer = setTimeout(() => {
        initializeEPUB();
      }, 100);

      return () => clearInterval(timer);
    }
  }, [fileUrl, epubLoaded, initializeEPUB]);

  // Effect para cleanup na desmontagem
  useEffect(() => {
    return () => {
      console.log('🔄 Componente EPUBViewer desmontando...');
      cleanupEPUB();
    };
  }, [cleanupEPUB]);

  // Separar useEffect para redimensionamento da renderização existente
  useEffect(() => {
    if (rendition && dimensions.width > 0 && dimensions.height > 0) {
      rendition.resize(dimensions.width, dimensions.height);
    }
  }, [rendition, dimensions]);

  // Atualizar renderização quando o modo de página dupla muda
  useEffect(() => {
    if (rendition) {
      rendition.spread(viewerState.isDualPage ? 'auto' : 'none');
    }
  }, [viewerState.isDualPage, rendition]);

  // Atualizar escala da renderização
  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${viewerState.currentScale * 100}%`);
    }
  }, [viewerState.currentScale, rendition]);

  const handlePageChange = useCallback((newPage: number) => {
    if (book && rendition && newPage >= 1 && newPage <= totalPages) {
      const cfi = book.locations.cfiFromLocation(newPage - 1);
      rendition.display(cfi);
    }
  }, [book, rendition, totalPages]);

  const handleZoomChange = useCallback((zoomLevel: number) => {
    const clampedZoom = Math.max(50, Math.min(300, zoomLevel));
    setViewerState(prev => ({ ...prev, currentScale: clampedZoom / 100 }));
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const currentZoom = viewerState.currentScale * 100;
    const step = 25;
    const newZoom = direction === 'in' ? currentZoom + step : currentZoom - step;
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

  const handleTextSelection = useCallback((cfiRange: string, text: string) => {
    if (!rendition) return;

    const highlight: Omit<Highlight, 'id' | 'createdAt'> = {
      pageNumber: viewerState.currentPage,
      content: text,
      color: '#ffeb3b',
      position: { x: 0, y: 0, width: 0, height: 0 }
    };

    handleHighlightAdd(highlight);

    // Adicionar destaque à renderização EPUB
    rendition.annotations.highlight(cfiRange, {}, (e: MouseEvent) => {
      console.log('Destaque clicado:', text);
    }, '', { fill: '#ffeb3b', 'fill-opacity': '0.3' });
  }, [rendition, viewerState.currentPage]);

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
    
    // Simular pesquisa (em implementação real, usar API do EPUB.js)
    setTimeout(() => {
      const results = Array.from({ length: Math.min(5, totalPages || 0) }, (_, i) => {
        const randomPage = Math.floor(Math.random() * (totalPages || 10)) + 1;
        return {
          page: randomPage,
          text: `...${searchQuery} encontrado no contexto da página ${randomPage}...`
        };
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }, [searchQuery, totalPages]);

  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(prev => !prev);
    
    if (rendition) {
      rendition.themes.register('dark', {
        'body': { 'color': '#e5e7eb !important', 'background-color': '#1f2937 !important' },
        'a': { 'color': '#60a5fa !important' }
      });
      rendition.themes.register('light', {
        'body': { 'color': '#1f2937 !important', 'background-color': '#ffffff !important' },
        'a': { 'color': '#3b82f6 !important' }
      });
      
      rendition.themes.select(isDarkMode ? 'light' : 'dark');
    }
  }, [rendition, isDarkMode]);

  // Calcular progresso de leitura
  const readingProgress = totalPages ? (viewerState.currentPage / totalPages) * 100 : 0;

  const mockBook: Book = {
    id: 'epub-viewer',
    title: bookMetadata?.title || "Documento EPUB",
    author: bookMetadata?.creator || "Autor Desconhecido",
    publisher: bookMetadata?.publisher || "Editora Desconhecida",
    thumbnail: "",
    synopsis: bookMetadata?.description || "",
    duration: "N/A",
    pageCount: totalPages,
    format: 'epub'
  };

  // Effect para detectar client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Não renderizar nada no servidor
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando visualizador EPUB...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-screen w-full flex flex-col overflow-hidden ${
        viewerState.isFullscreen ? 'fixed inset-0 z-50' : ''
      } ${isDarkMode ? 'dark' : ''} bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-100 dark:via-blue-100/10 dark:to-purple-100/10`}
      style={{ height: '100vh' }}
    >
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-100/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-300/50 shadow-lg flex-shrink-0">
        {/* Controles à esquerda - Botão Voltar Proeminente */}
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium"
              title="Voltar ao Portal"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Voltar</span>
            </button>
          )}

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100/80 dark:bg-gray-200/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
              <button
                onClick={() => handlePageChange(1)}
                disabled={viewerState.currentPage <= 1}
                className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-100/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Primeira página"
              >
                <FiChevronsLeft className="w-4 h-4 text-gray-700" />
              </button>
              
              <button
                onClick={() => handlePageChange(viewerState.currentPage - (viewerState.isDualPage ? 2 : 1))}
                disabled={viewerState.currentPage <= 1}
                className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-100/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Página anterior"
              >
                <FiChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              
              <div className="flex items-center space-x-2 px-4">
                <input
                  type="number"
                  value={viewerState.currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= totalPages) {
                      handlePageChange(value);
                    }
                  }}
                  className="w-16 px-2 py-1 text-center bg-white/80 dark:bg-gray-100/80 backdrop-blur-sm rounded-lg border border-gray-300/50 dark:border-gray-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min={1}
                  max={totalPages}
                />
                <span className="text-sm text-gray-600 dark:text-gray-700 font-medium">
                  / {totalPages || '—'}
                </span>
              </div>
              
              <button
                onClick={() => handlePageChange(viewerState.currentPage + (viewerState.isDualPage ? 2 : 1))}
                disabled={viewerState.currentPage >= totalPages}
                className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-100/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Próxima página"
              >
                <FiChevronRight className="w-4 h-4 text-gray-700" />
              </button>
              
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={viewerState.currentPage >= totalPages}
                className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-100/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Última página"
              >
                <FiChevronsRight className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Informações do livro */}
          <div className="text-gray-600 dark:text-gray-700">
            <span className="font-bold text-blue-700 dark:text-blue-600">{mockBook.title}</span>
            <span className="text-gray-600 dark:text-gray-700 ml-3">• {mockBook.author}</span>
          </div>
        </div>

        {/* Controles centrais */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100/80 dark:bg-gray-200/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-100/80 transition-all duration-200"
              title="Diminuir zoom"
            >
              <FiZoomOut className="w-4 h-4 text-gray-700" />
            </button>
            <span className="px-4 text-sm font-semibold min-w-[3.5rem] text-center text-blue-600 dark:text-blue-600">
              {Math.round(viewerState.currentScale * 100)}%
            </span>
            <button
              onClick={() => handleZoom('in')}
              className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-100/80 transition-all duration-200"
              title="Aumentar zoom"
            >
              <FiZoomIn className="w-4 h-4 text-gray-700" />
            </button>
            <div className="w-px h-6 bg-gray-300/50 dark:bg-gray-400/50 mx-1" />
            <button
              onClick={() => handleZoomChange(100)}
              className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-100/80 transition-all duration-200"
              title="Redefinir zoom"
            >
              <FiRotateCw className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          <div className="flex bg-gray-100/80 dark:bg-gray-200/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
            <button
              onClick={handleDualPageToggle}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewerState.isDualPage
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'hover:bg-white/80 dark:hover:bg-gray-100/80'
              }`}
              title="Alternar visualização de página dupla"
            >
              <FiColumns className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Controles à direita */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100/80 dark:bg-gray-200/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                showSearch
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'hover:bg-white/80 dark:hover:bg-gray-100/80'
              }`}
              title="Pesquisar"
            >
              <FiSearch className="w-4 h-4 text-gray-700" />
            </button>
            
            <button
              onClick={() => {
                const bookmark = viewerState.bookmarks.find(b => b.pageNumber === viewerState.currentPage);
                if (bookmark) {
                  setViewerState(prev => ({
                    ...prev,
                    bookmarks: prev.bookmarks.filter(b => b.id !== bookmark.id)
                  }));
                } else {
                  setIsAddingBookmark(true);
                }
              }}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewerState.bookmarks.some(b => b.pageNumber === viewerState.currentPage)
                  ? 'text-yellow-500 bg-yellow-50/80 dark:bg-yellow-100/30'
                  : 'hover:bg-white/80 dark:hover:bg-gray-100/80'
              }`}
              title="Alternar marcador"
            >
              <FiBookmark className="w-4 h-4 text-gray-700" fill={viewerState.bookmarks.some(b => b.pageNumber === viewerState.currentPage) ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          <div className="flex bg-gray-100/80 dark:bg-gray-200/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-100/80 transition-all duration-200"
              title="Alternar modo escuro"
            >
              {isDarkMode ? <FiSun className="w-4 h-4 text-gray-700" /> : <FiMoon className="w-4 h-4 text-gray-700" />}
            </button>
            
            <button
              onClick={handleFullscreenToggle}
              className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-100/80 transition-all duration-200"
              title="Alternar tela cheia"
            >
              {viewerState.isFullscreen ? <FiMinimize className="w-4 h-4 text-gray-700" /> : <FiMaximize className="w-4 h-4 text-gray-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de progresso com gradiente */}
      <div className="h-1 bg-gray-200/50 dark:bg-gray-300/50 flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Barra de pesquisa */}
      {showSearch && (
        <div className="px-6 py-4 bg-white/80 dark:bg-gray-100/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-300/50 flex-shrink-0">
          <div className="flex items-center space-x-4 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Pesquisar no documento EPUB..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100/80 dark:bg-gray-100/80 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300/50 dark:border-gray-400/50"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
            >
              {isSearching ? 'Pesquisando...' : 'Pesquisar'}
            </button>
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="p-3 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-100/80 transition-all duration-200"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          {/* Resultados da pesquisa */}
          {searchResults.length > 0 && (
            <div className="mt-4 bg-gray-50/80 dark:bg-gray-100/50 backdrop-blur-sm rounded-xl p-4 max-h-64 overflow-y-auto max-w-3xl mx-auto shadow-lg">
              <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-700">Resultados da Pesquisa</h4>
              <div className="space-y-2">
                {searchResults.map((result, i) => (
                  <div
                    key={i}
                    onClick={() => handlePageChange(result.page)}
                    className="p-4 bg-white/80 dark:bg-gray-600/80 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-blue-50/80 dark:hover:bg-blue-900/30 transition-all duration-200 border border-gray-200/50 dark:border-gray-400/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Página {result.page}</span>
                      <button className="text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Ir para página</button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-700">{result.text}</p>
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
          <div className="bg-white/95 dark:bg-gray-100/95 backdrop-blur-sm rounded-2xl p-8 w-96 max-w-full mx-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-xl font-bold mb-6 text-gray-600 dark:text-gray-700">Adicionar Marcador</h3>
            <input
              type="text"
              value={newBookmarkTitle}
              onChange={(e) => setNewBookmarkTitle(e.target.value)}
              placeholder="Título do marcador..."
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-100/80 backdrop-blur-sm"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setIsAddingBookmark(false);
                  setNewBookmarkTitle('');
                }}
                className="px-6 py-3 text-gray-600 dark:text-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleBookmarkSubmit}
                disabled={!newBookmarkTitle.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo EPUB - Layout Fit to Screen */}
      <div className="flex-1 overflow-hidden relative p-4">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-700 dark:text-gray-700 text-xl font-semibold mb-2">Carregando EPUB...</p>
              <p className="text-gray-500 dark:text-gray-600 text-sm">Preparando visualização</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md bg-white/80 dark:bg-gray-100/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-red-500 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 dark:text-gray-700 mb-6 text-lg font-semibold">{error}</p>
              <button
                onClick={initializeEPUB}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="h-full flex items-center justify-center">
            <div className="relative bg-white dark:bg-gray-100 rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
              <div
                ref={viewerRef}
                className="bg-white dark:bg-gray-100"
                style={{ 
                  width: `${dimensions.width}px`, 
                  height: `${dimensions.height}px`,
                  minWidth: '600px',
                  minHeight: '400px'
                }}
              />
              
              {/* Overlay de informações do livro */}
              {bookMetadata && (
                <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-xl text-sm backdrop-blur-sm shadow-lg">
                  <div className="font-semibold">{bookMetadata.title || mockBook.title}</div>
                  <div className="text-xs opacity-75">{bookMetadata.creator || mockBook.author}</div>
                </div>
              )}

              {/* Overlay para anotações na página atual */}
              {viewerState.annotations
                .filter(a => a.pageNumber === viewerState.currentPage)
                .map(annotation => (
                  <div
                    key={annotation.id}
                    className="absolute bg-yellow-100/90 dark:bg-yellow-900/40 p-3 rounded-lg shadow-lg border border-yellow-200/50 dark:border-yellow-800/30 backdrop-blur-sm"
                    style={{
                      left: `${annotation.position.x}px`,
                      top: `${annotation.position.y}px`,
                      zIndex: 10,
                      maxWidth: '250px'
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Anotação</span>
                      <span className="text-xs text-gray-500">{new Date(annotation.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-700">{annotation.content}</p>
                    <button
                      onClick={() => {
                        setViewerState(prev => ({
                          ...prev,
                          annotations: prev.annotations.filter(a => a.id !== annotation.id)
                        }));
                      }}
                      className="text-xs text-red-500 hover:text-red-600 mt-2 flex items-center transition-colors"
                    >
                      <FiX className="w-3 h-3 mr-1" /> Remover
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EPUBViewer;
