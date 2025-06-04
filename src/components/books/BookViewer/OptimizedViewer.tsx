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
  FiArrowLeft,
  FiSettings
} from 'react-icons/fi';
import { BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { calculateZoom } from './utils';

// Configuração do worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface OptimizedViewerProps {
  book: Book;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onBack?: () => void;
}

const OptimizedViewer: React.FC<OptimizedViewerProps> = ({
  book,
  initialAnnotations = [],
  initialHighlights = [],
  initialBookmarks = [],
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd,
  onBack
}) => {
  // Verificação de segurança para props obrigatórias
  if (!book || !book.id) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Dados do livro inválidos</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

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
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  
  // Estados específicos para EPUB
  const [epubBook, setEpubBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [bookMetadata, setBookMetadata] = useState<any>(null);
  
  // Estados compartilhados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{page: number, text: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Dimensões do conteúdo para fit-to-screen
  const [contentDimensions, setContentDimensions] = useState({
    width: 0,
    height: 0
  });

  // Função para construir URL do arquivo - MELHORADA COM TRATAMENTO DE ERROS
  const getFileUrl = useCallback(() => {
    try {
      console.log('📖 Tentando carregar livro:', {
        id: book?.id,
        title: book?.title,
        format: book?.format,
        filePath: book?.filePath
      });

      if (!book) {
        throw new Error('Dados do livro não disponíveis');
      }

      // 1. Se já tem um filePath válido, usar ele diretamente
      if (book.filePath && typeof book.filePath === 'string') {
        // URL completa
        if (book.filePath.startsWith('http')) {
          console.log('✅ Usando URL externa:', book.filePath);
          return book.filePath;
        }
        // Caminho relativo
        const fullPath = book.filePath.startsWith('/') ? book.filePath : `/${book.filePath}`;
        const finalUrl = `${window.location.origin}${fullPath}`;
        console.log('✅ Usando URL local:', finalUrl);
        return finalUrl;
      }
      
      // 2. Fallback: gerar URL baseada no ID e formato
      const extension = book.format === 'epub' ? 'epub' : 'pdf';
      const fallbackUrl = `/books/${book.id}.${extension}`;
      console.log('⚠️ Usando fallback URL:', fallbackUrl);
      return fallbackUrl;
    } catch (error) {
      console.error('❌ Erro ao construir URL do arquivo:', error);
      throw error;
    }
  }, [book?.id, book?.filePath, book?.format]);

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
    if (newPage < 1 || newPage > (totalPages || 1)) return;
    
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
  }, [totalPages, book.format, epubBook, rendition]);

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

  // Inicialização do PDF - MELHORADA COM LOGGING E TRATAMENTO DE ERROS
  const initializePDF = useCallback(async (fileUrl: string) => {
    if (!fileUrl) {
      throw new Error('URL do arquivo PDF não fornecida');
    }

    console.log('🔄 Inicializando PDF:', fileUrl);
    setLoading(true);
    setError(null);
    
    try {
      // Verificar se o arquivo existe
      console.log('🔍 Verificando se o arquivo PDF existe...');
      const response = await fetch(fileUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        const errorMsg = `Arquivo PDF não encontrado (Status: ${response.status})`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ Arquivo PDF encontrado, carregando...');
      // O PDF será carregado pelo componente Document do react-pdf
      // setLoading(false) será chamado no onLoadSuccess
    } catch (error) {
      console.error('💥 Erro ao inicializar PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao carregar PDF: ${errorMessage}`);
    }
  }, []);

  // Inicialização do EPUB - MELHORADA COM LOGGING E TRATAMENTO DE ERROS
  const initializeEPUB = useCallback(async (fileUrl: string) => {
    if (!fileUrl) {
      throw new Error('URL do arquivo EPUB não fornecida');
    }

    console.log('🔄 Inicializando EPUB:', fileUrl);
    setLoading(true);
    setError(null);

    try {
      // Verificar se o arquivo existe
      console.log('🔍 Verificando se o arquivo EPUB existe...');
      const response = await fetch(fileUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        const errorMsg = `Arquivo EPUB não encontrado (Status: ${response.status})`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Arquivo EPUB encontrado, carregando...');
      
      const newBook = new EpubBook(fileUrl, {
        openAs: 'epub',
        requestHeaders: {
          'Accept': 'application/epub+zip',
          'Access-Control-Allow-Origin': '*'
        }
      });

      if (!newBook) {
        throw new Error('Falha ao criar instância do livro EPUB');
      }

      setEpubBook(newBook);

      console.log('⏳ Aguardando carregamento do EPUB...');
      
      // Aguardar o carregamento do livro
      await newBook.ready;
      
      console.log('📚 EPUB pronto, carregando metadados...');
      
      // Carregar metadados com timeout de segurança
      try {
        const meta = await Promise.race([
          newBook.loaded.metadata,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao carregar metadados')), 10000)
          )
        ]);
        setBookMetadata(meta);
        console.log('📖 Metadados carregados:', meta);
      } catch (metaError) {
        console.warn('⚠️ Erro ao carregar metadados:', metaError);
        // Continuar sem os metadados
      }
      
      // Verificar se contentRef existe
      if (!contentRef.current) {
        throw new Error('Elemento de conteúdo não encontrado para renderização EPUB');
      }

      console.log('🎨 Renderizando EPUB...');
      
      // Renderizar o livro
      const newRendition = newBook.renderTo(contentRef.current, {
        width: '100%',
        height: '100%',
        spread: viewerState.isDualPage ? 'auto' : 'none',
        flow: 'paginated',
        allowScriptedContent: false // Desabilitar scripts para evitar problemas de segurança
      });

      if (!newRendition) {
        throw new Error('Falha ao criar rendition do EPUB');
      }

      setRendition(newRendition);
      console.log('🎭 Rendition criado com sucesso');

      // Aguardar que o rendition esteja completamente carregado
      console.log('⏳ Aguardando renderização completa...');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout ao renderizar EPUB'));
        }, 15000);

        newRendition.on('rendered', () => {
          console.log('✅ EPUB renderizado com sucesso');
          clearTimeout(timeout);
          resolve(true);
        });

        // Fallback - se não houver evento rendered, usar display
        newRendition.display().then(() => {
          console.log('✅ EPUB exibido com sucesso via display()');
          clearTimeout(timeout);
          resolve(true);
        }).catch(reject);
      });

      // Gerar localizações para navegação com timeout
      console.log('📍 Gerando localizações para navegação...');
      try {
        await Promise.race([
          newBook.locations.generate(1024),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao gerar localizações')), 15000)
          )
        ]);
        
        const totalPages = newBook.locations.length();
        setTotalPages(totalPages);
        console.log('📄 Total de páginas:', totalPages);
      } catch (locationError) {
        console.warn('⚠️ Erro ao gerar localizações:', locationError);
        // Usar um número estimado de páginas
        setTotalPages(100);
      }

      // Configurar listeners de eventos com verificações de segurança
      newRendition.on('relocated', (location: any) => {
        if (location && location.start && location.start.cfi && newBook.locations) {
          const currentLocation = newBook.locations.locationFromCfi(location.start.cfi);
          if (typeof currentLocation === 'number') {
            setViewerState(prev => ({ ...prev, currentPage: currentLocation + 1 }));
            console.log('📖 Página atual:', currentLocation + 1);
          }
        }
      });

      // Manipular seleção de texto com verificações de segurança
      newRendition.on('selected', (cfiRange: string, contents: any) => {
        try {
          if (contents && contents.window && contents.window.getSelection) {
            const selection = contents.window.getSelection();
            const text = selection ? selection.toString() : null;
            if (text && text.trim().length > 0) {
              console.log('✏️ Texto selecionado:', text.substring(0, 50) + '...');
              // Aqui você pode adicionar lógica para destaques/anotações
            }
          }
        } catch (selectionError) {
          console.warn('⚠️ Erro ao processar seleção de texto:', selectionError);
        }
      });

      // Adicionar listener para erros de rendering
      newRendition.on('error', (error: any) => {
        console.warn('⚠️ Erro de renderização EPUB:', error);
        // Não parar a execução, apenas registrar o erro
      });

      console.log('🎉 EPUB inicializado com sucesso!');
      setLoading(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar EPUB';
      console.error('💥 Erro ao inicializar EPUB:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  }, [viewerState.isDualPage]);

  // Manipuladores de eventos para PDF com verificações de segurança
  const handlePdfDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    try {
      if (typeof numPages === 'number' && numPages > 0) {
        setTotalPages(numPages);
        setLoading(false);
        console.log('✅ PDF carregado com sucesso!', numPages, 'páginas');
      } else {
        throw new Error('Número de páginas inválido');
      }
    } catch (error) {
      console.error('Erro ao processar sucesso do PDF:', error);
      setError('Erro ao processar documento PDF');
      setLoading(false);
    }
  }, []);

  const handlePdfDocumentLoadError = useCallback((error: Error) => {
    console.error('❌ Erro ao carregar PDF:', error);
    const errorMessage = error?.message || 'Falha ao carregar o documento PDF';
    setError(errorMessage);
    setLoading(false);
    setInitialized(false);
  }, []);

  // Inicialização baseada no formato do livro - CORRIGIDO PARA EVITAR LOOP
  useEffect(() => {
    // Prevenir inicialização múltipla
    if (initialized || !book || !book.id) {
      return;
    }

    const initializeBook = async () => {
      try {
        setInitialized(true);
        setLoading(true);
        setError(null);

        const fileUrl = getFileUrl();
        
        if (book.format === 'epub') {
          await initializeEPUB(fileUrl);
        } else {
          await initializePDF(fileUrl);
        }
      } catch (error) {
        console.error('💥 Erro na inicialização do livro:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na inicialização';
        setError(errorMessage);
        setLoading(false);
        setInitialized(false);
      }
    };

    initializeBook();
  }, [book?.id, book?.format]); // Removidas as dependências das funções para evitar loop

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (epubBook) {
        try {
          epubBook.destroy();
        } catch (error) {
          console.warn('Erro ao destruir EPUB book:', error);
        }
      }
      if (rendition) {
        try {
          rendition.destroy();
        } catch (error) {
          console.warn('Erro ao destruir rendition:', error);
        }
      }
    };
  }, []);

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

  // Efeito para calcular as dimensões do conteúdo para fit-to-screen
  useEffect(() => {
    const updateDimensions = () => {
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
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [viewerState.isDualPage]);

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
    if (secondPage > (totalPages || 0)) {
      return [firstPage];
    }

    return [firstPage, secondPage];
  };

  // Calcular progresso de leitura
  const readingProgress = totalPages ? (viewerState.currentPage / totalPages) * 100 : 0;

  // Renderizar o conteúdo do livro com base no formato
  const renderBookContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <p className="text-gray-600 dark:text-gray-600 text-lg">Carregando {book.format?.toUpperCase()}...</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Por favor, aguarde</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
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
                const fileUrl = getFileUrl();
                if (book.format === 'epub') {
                  initializeEPUB(fileUrl);
                } else {
                  initializePDF(fileUrl);
                }
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    if (book.format === 'pdf') {
      const fileUrl = getFileUrl();
      
      console.log('🔄 Renderizando PDF com URL:', fileUrl);
      
      return (
        <div className="w-full h-full flex items-center justify-center p-4">
          <Document
            file={fileUrl}
            onLoadSuccess={(pdf) => {
              console.log('✅ PDF carregado com sucesso:', pdf);
              setPdfDocument(pdf);
              handlePdfDocumentLoadSuccess(pdf);
            }}
            onLoadError={(error) => {
              console.error('❌ Erro ao carregar PDF:', error);
              const errorMsg = error instanceof Error ? error.message : String(error);
              handlePdfDocumentLoadError(new Error(errorMsg));
            }}
            className="flex justify-center items-center max-w-full max-h-full"
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
              cMapPacked: true,
              verbosity: 0,
            }}
          >
            <div className={`flex ${viewerState.isDualPage ? 'space-x-6' : ''} justify-center items-center`}>
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
                    onLoadSuccess={(page) => {
                      console.log(`✅ Página ${pageNum} carregada:`, page);
                    }}
                    onLoadError={(error) => {
                      console.error(`❌ Erro ao carregar página ${pageNum}:`, error);
                    }}
                    loading={
                      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-100 rounded-xl" style={{ width: contentDimensions.width, height: contentDimensions.height }}>
                        <div className="animate-pulse text-center">
                          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4 mx-auto"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
                        </div>
                      </div>
                    }
                  />
                  
                  {/* Número da página */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
                    Página {pageNum}
                  </div>
                </div>
              ))}
            </div>
          </Document>
        </div>
      );
    }

    if (book.format === 'epub') {
      return (
        <div className="w-full h-full relative bg-white dark:bg-gray-100 rounded-xl overflow-hidden m-4 shadow-lg">
          {/* O conteúdo EPUB será renderizado aqui pelo useEffect */}
          
          {/* Overlay de informações para EPUB */}
          {bookMetadata && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-xl text-sm backdrop-blur-sm z-20">
              <div className="font-medium">{bookMetadata.title || book.title}</div>
              <div className="text-xs opacity-75">{bookMetadata.creator || book.author}</div>
            </div>
          )}

          {/* Indicador de página para EPUB */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm z-20">
            Página {viewerState.currentPage} / {totalPages || '?'}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <BookOpenIcon className="w-20 h-20 mx-auto" />
          </div>
          <p className="text-gray-500 dark:text-gray-600 mb-2 text-lg">Formato não suportado: {book.format}</p>
          <p className="text-sm text-gray-400">Suportamos apenas arquivos PDF e EPUB</p>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`h-screen w-full flex flex-col ${viewerState.isFullscreen ? 'fixed inset-0 z-50' : ''} ${isDarkMode ? 'dark' : ''} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}
    >
      {/* Barra de ferramentas superior - SEMPRE VISÍVEL */}
      <div className="flex-shrink-0 bg-white/95 dark:bg-gray-100/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-lg z-30">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Controles à esquerda - Botão Voltar Proeminente */}
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 z-40"
                title="Voltar ao Portal"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </button>
            )}

            {/* Controles de Navegação */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-100 dark:bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={viewerState.currentPage <= 1}
                  className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-700"
                  title="Primeira página"
                >
                  <FiChevronsLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handlePageChange(viewerState.currentPage - (viewerState.isDualPage ? 2 : 1))}
                  disabled={viewerState.currentPage <= 1}
                  className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-700"
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
                      if (!isNaN(value) && value >= 1 && value <= (totalPages || 1)) {
                        handlePageChange(value);
                      }
                    }}
                    className="w-16 px-2 py-1 text-center bg-white dark:bg-gray-100 rounded-lg border border-gray-300 dark:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 dark:text-gray-700"
                    min={1}
                    max={totalPages || 1}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-600">
                    / {totalPages || '?'}
                  </span>
                </div>
                
                <button
                  onClick={() => handlePageChange(viewerState.currentPage + (viewerState.isDualPage ? 2 : 1))}
                  disabled={viewerState.currentPage >= (totalPages || 1)}
                  className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-700"
                  title="Próxima página"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handlePageChange(totalPages || 1)}
                  disabled={viewerState.currentPage >= (totalPages || 1)}
                  className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-700"
                  title="Última página"
                >
                  <FiChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Informações do livro */}
            <div className="hidden lg:flex items-center space-x-3 text-sm">
              <div className="text-gray-600 dark:text-gray-700">
                <span className="font-bold">{book.title}</span>
                <span className="text-gray-600 dark:text-gray-600 ml-2">• {book.author}</span>
              </div>
            </div>
          </div>

          {/* Controles centrais */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => handleZoom('out')}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-200 transition-colors text-gray-700 dark:text-gray-700"
                title="Diminuir zoom"
              >
                <FiZoomOut className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-medium min-w-[3rem] text-center text-gray-700 dark:text-gray-700">
                {Math.round(viewerState.currentScale * 100)}%
              </span>
              <button
                onClick={() => handleZoom('in')}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-200 transition-colors text-gray-700 dark:text-gray-700"
                title="Aumentar zoom"
              >
                <FiZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <button
                onClick={() => handleZoomChange(100)}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-200 transition-colors text-gray-700 dark:text-gray-700"
                title="Redefinir zoom"
              >
                <FiRotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-100 rounded-xl p-1">
              <button
                onClick={handleDualPageToggle}
                className={`p-2 rounded-lg transition-colors ${
                  viewerState.isDualPage
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-white dark:hover:bg-gray-200 text-gray-700 dark:text-gray-700'
                }`}
                title="Alternar visualização de página dupla"
              >
                <FiColumns className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controles à direita */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 dark:bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-lg transition-colors ${
                  showSearch
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-white dark:hover:bg-gray-200 text-gray-700 dark:text-gray-700'
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
                    : 'hover:bg-white dark:hover:bg-gray-200 text-gray-700 dark:text-gray-700'
                }`}
                title="Alternar marcador"
              >
                <FiBookmark className="w-4 h-4" fill={viewerState.bookmarks.some(b => b.pageNumber === viewerState.currentPage) ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-100 rounded-xl p-1">
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-200 transition-colors text-gray-700 dark:text-gray-700"
                title="Alternar modo escuro"
              >
                {isDarkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={handleFullscreenToggle}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-200 transition-colors text-gray-700 dark:text-gray-700"
                title="Alternar tela cheia"
              >
                {viewerState.isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="h-1 bg-gray-200 dark:bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>

      {/* Barra de pesquisa - QUANDO ATIVA */}
      {showSearch && (
        <div className="flex-shrink-0 px-4 py-3 bg-white/95 dark:bg-gray-100/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-20">
          <div className="flex items-center space-x-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Pesquisar no documento..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-700 placeholder-gray-500 dark:placeholder-gray-600"
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
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-700"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          
          {/* Resultados da pesquisa */}
          {searchResults.length > 0 && (
            <div className="mt-3 bg-gray-50 dark:bg-gray-100/50 rounded-xl p-3 max-h-60 overflow-y-auto max-w-2xl mx-auto">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-700">Resultados da Pesquisa</h4>
              <div className="space-y-2">
                {searchResults.map((result, i) => (
                  <div
                    key={i}
                    onClick={() => handlePageChange(result.page)}
                    className="p-3 bg-white dark:bg-gray-600 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Página {result.page}</span>
                      <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-600">Ir para página</button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-700 mt-1">{result.text}</p>
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
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-700">Adicionar Marcador</h3>
            <input
              type="text"
              value={newBookmarkTitle}
              onChange={(e) => setNewBookmarkTitle(e.target.value)}
              placeholder="Título do marcador..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-100 text-gray-700 dark:text-gray-700 placeholder-gray-500 dark:placeholder-gray-600"
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

      {/* Área de conteúdo principal - FIT TO SCREEN COM Z-INDEX CORRETO */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-200 relative z-10"
      >
        {renderBookContent()}
      </div>
    </div>
  );
};

export default OptimizedViewer;