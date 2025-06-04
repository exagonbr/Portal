'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Book as EpubBook, Rendition } from 'epubjs';
import { Book } from '@/constants/mockData';
import { Annotation, Highlight, Bookmark, ViewerState } from './types';
import { ConfigService, ReaderConfig } from './utils/configService';
import { ReaderUtils } from './utils/readerUtils';
import { v4 as uuidv4 } from 'uuid';
import screenfull from 'screenfull';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  MinusIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

// Configuração do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface EnhancedViewerProps {
  book: Book;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onBack?: () => void;
}

const EnhancedViewer: React.FC<EnhancedViewerProps> = ({
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
  const readingTimerRef = useRef<NodeJS.Timeout>();
  
  // Configurações do leitor
  const [config, setConfig] = useState<ReaderConfig>(ConfigService.getConfig());
  
  // Estado do visualizador
  const [viewerState, setViewerState] = useState<ViewerState>({
    annotations: initialAnnotations,
    highlights: initialHighlights,
    bookmarks: initialBookmarks,
    isFullscreen: false,
    currentScale: config.scale,
    isDualPage: config.readerMode === 'double',
    currentPage: 1
  });
  
  // Estados específicos para PDF
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  
  // Estados específicos para EPUB
  const [epubBook, setEpubBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  
  // Estados da interface
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  // Função para construir URL do arquivo
  const getFileUrl = useCallback(() => {
    if (!book) throw new Error('Dados do livro não disponíveis');
    
    if (book.filePath && typeof book.filePath === 'string') {
      if (book.filePath.startsWith('http')) {
        return book.filePath;
      }
      const fullPath = book.filePath.startsWith('/') ? book.filePath : `/${book.filePath}`;
      return `${window.location.origin}${fullPath}`;
    }
    
    const extension = book.format === 'epub' ? 'epub' : 'pdf';
    return `/books/${book.id}.${extension}`;
  }, [book?.id, book?.filePath, book?.format]);

  // Timer de leitura
  useEffect(() => {
    readingTimerRef.current = setInterval(() => {
      setReadingTime(prev => {
        const newTime = prev + 1;
        ConfigService.updateReadingTime(book.id, 1);
        return newTime;
      });
    }, 1000);

    return () => {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
    };
  }, [book.id]);

  // Salvar localização automaticamente
  const saveLocation = useCallback(
    ReaderUtils.debounce(() => {
      if (!book.id) return;
      
      ConfigService.saveBookLocation(book.id, {
        page: viewerState.currentPage,
        chapterIndex: 0,
        chapterTitle: 'Capítulo Atual',
        percentage: ReaderUtils.getReadingProgress(viewerState.currentPage, totalPages || 0),
        readingTime,
      });
    }, 2000),
    [book.id, viewerState.currentPage, totalPages, readingTime]
  );

  // Carregar localização salva
  useEffect(() => {
    if (!book.id) return;
    
    const savedLocation = ConfigService.getBookLocation(book.id);
    if (savedLocation) {
      setViewerState(prev => ({
        ...prev,
        currentPage: savedLocation.page
      }));
      setReadingTime(savedLocation.readingTime || 0);
    }
  }, [book.id]);

  // Salvar localização quando a página muda
  useEffect(() => {
    saveLocation();
  }, [viewerState.currentPage, saveLocation]);

  // Inicialização do PDF
  const initializePDF = useCallback(async (fileUrl: string) => {
    console.log('🔄 Inicializando PDF:', fileUrl);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(fileUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Arquivo PDF não encontrado (Status: ${response.status})`);
      }
      
      console.log('✅ Arquivo PDF encontrado, carregando...');
      setLoading(false);
    } catch (error) {
      console.error('💥 Erro ao inicializar PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha ao carregar PDF: ${errorMessage}`);
      setLoading(false);
    }
  }, []);

  // Inicialização do EPUB
  const initializeEPUB = useCallback(async (fileUrl: string) => {
    console.log('🔄 Inicializando EPUB:', fileUrl);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(fileUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Arquivo EPUB não encontrado (Status: ${response.status})`);
      }

      console.log('✅ Arquivo EPUB encontrado, carregando...');
      
      const newBook = new EpubBook(fileUrl, {
        openAs: 'epub',
        requestHeaders: {
          'Accept': 'application/epub+zip',
          'Access-Control-Allow-Origin': '*'
        }
      });

      setEpubBook(newBook);
      await newBook.ready;
      
      if (!contentRef.current) {
        throw new Error('Elemento de conteúdo não encontrado para renderização EPUB');
      }

      const dimensions = ReaderUtils.getPageDimensions(
        config.readerMode,
        config.scale,
        config.margin
      );

      const newRendition = newBook.renderTo(contentRef.current, {
        width: dimensions.width,
        height: dimensions.height,
        spread: config.readerMode === 'double' ? 'auto' : 'none',
        flow: config.readerMode === 'scroll' ? 'scrolled-doc' : 'paginated',
        allowScriptedContent: false
      });

      setRendition(newRendition);

      await newRendition.display();

      // Gerar localizações para navegação
      try {
        await newBook.locations.generate(1024);
        const totalPages = newBook.locations.length();
        setTotalPages(totalPages);
      } catch (locationError) {
        console.warn('⚠️ Erro ao gerar localizações:', locationError);
        setTotalPages(100);
      }

      // Configurar listeners de eventos
      newRendition.on('relocated', (location: any) => {
        if (location && location.start && location.start.cfi && newBook.locations) {
          const currentLocation = newBook.locations.locationFromCfi(location.start.cfi);
          if (typeof currentLocation === 'number') {
            setViewerState(prev => ({ ...prev, currentPage: currentLocation + 1 }));
          }
        }
      });

      newRendition.on('selected', (cfiRange: string, contents: any) => {
        try {
          if (contents && contents.window && contents.window.getSelection) {
            const selection = contents.window.getSelection();
            const text = selection ? selection.toString() : null;
            if (text && text.trim().length > 0) {
              console.log('✏️ Texto selecionado:', text.substring(0, 50) + '...');
            }
          }
        } catch (selectionError) {
          console.warn('⚠️ Erro ao processar seleção de texto:', selectionError);
        }
      });

      // Aplicar tema
      applyTheme(newRendition);
      
      setLoading(false);
      console.log('🎉 EPUB inicializado com sucesso!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar EPUB';
      console.error('💥 Erro ao inicializar EPUB:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  }, [config]);

  // Aplicar tema ao EPUB
  const applyTheme = useCallback((renditionInstance?: Rendition) => {
    const targetRendition = renditionInstance || rendition;
    if (!targetRendition) return;

    const themeStyles = ConfigService.getThemeStyles(config.theme);
    
    targetRendition.themes.register('current', {
      'body': {
        'color': `${themeStyles.textColor} !important`,
        'background-color': `${themeStyles.backgroundColor} !important`,
        'font-size': `${config.fontSize}px !important`,
        'font-family': `${config.fontFamily} !important`,
        'line-height': `${config.lineHeight} !important`,
        'margin': `${config.margin}px !important`,
      },
      'a': {
        'color': `${themeStyles.linkColor} !important`
      }
    });
    
    targetRendition.themes.select('current');
    targetRendition.themes.fontSize(`${config.fontSize}px`);
  }, [config, rendition]);

  // Inicialização baseada no formato do livro
  useEffect(() => {
    if (initialized || !book || !book.id) return;

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
  }, [book?.id, book?.format]);

  // Aplicar configurações quando mudam
  useEffect(() => {
    applyTheme();
    ConfigService.setConfig(config);
  }, [config, applyTheme]);

  // Cleanup
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
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
    };
  }, []);

  // Manipuladores de eventos
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > (totalPages || 1)) return;
    
    if (book.format === 'pdf') {
      setViewerState(prev => ({ ...prev, currentPage: newPage }));
    } else if (book.format === 'epub' && epubBook && rendition) {
      const cfi = epubBook.locations.cfiFromLocation(newPage - 1);
      rendition.display(cfi);
    }
  }, [totalPages, book.format, epubBook, rendition]);

  const handleZoomChange = useCallback((newScale: number) => {
    const clampedScale = Math.max(0.5, Math.min(3.0, newScale));
    setConfig(prev => ({ ...prev, scale: clampedScale }));
    setViewerState(prev => ({ ...prev, currentScale: clampedScale }));
    
    if (book.format === 'epub' && rendition) {
      rendition.themes.fontSize(`${config.fontSize * clampedScale}px`);
    }
  }, [book.format, rendition, config.fontSize]);

  const handleThemeToggle = useCallback(() => {
    const themes: Array<ReaderConfig['theme']> = ['light', 'dark', 'sepia'];
    const currentIndex = themes.indexOf(config.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setConfig(prev => ({ ...prev, theme: themes[nextIndex] }));
  }, [config.theme]);

  const handleReaderModeToggle = useCallback(() => {
    const modes: Array<ReaderConfig['readerMode']> = ['single', 'double', 'scroll'];
    const currentIndex = modes.indexOf(config.readerMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    
    setConfig(prev => ({ ...prev, readerMode: newMode }));
    setViewerState(prev => ({ ...prev, isDualPage: newMode === 'double' }));
    
    if (book.format === 'epub' && rendition) {
      rendition.spread(newMode === 'double' ? 'auto' : 'none');
      rendition.flow(newMode === 'scroll' ? 'scrolled-doc' : 'paginated');
    }
  }, [config.readerMode, book.format, rendition]);

  const handleFullscreenToggle = useCallback(() => {
    if (containerRef.current && screenfull.isEnabled) {
      screenfull.toggle(containerRef.current).then(() => {
        setViewerState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
      });
    }
  }, []);

  // Cálculos derivados
  const readingProgress = useMemo(() => 
    ReaderUtils.getReadingProgress(viewerState.currentPage, totalPages || 0), 
    [viewerState.currentPage, totalPages]
  );

  const formattedReadingTime = useMemo(() => 
    ReaderUtils.formatReadingTime(readingTime), 
    [readingTime]
  );

  // Memoizar as opções do PDF para evitar recarregamentos desnecessários
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    verbosity: 0,
  }), []);

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

  return (
    <div 
      ref={containerRef}
      className={`h-screen w-full flex flex-col ${viewerState.isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      style={{ 
        backgroundColor: ConfigService.getThemeStyles(config.theme).backgroundColor,
        color: ConfigService.getThemeStyles(config.theme).textColor
      }}
    >
      {/* Header com controles */}
      <div className="flex-shrink-0 bg-background-primary/95 backdrop-blur-sm border-b border-border-DEFAULT shadow-lg z-30">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Controles à esquerda */}
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Voltar</span>
              </button>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(viewerState.currentPage - 1)}
                disabled={viewerState.currentPage <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={viewerState.currentPage}
                  onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 text-center border rounded"
                  min={1}
                  max={totalPages || 1}
                />
                <span className="text-sm text-gray-600">/ {totalPages || '?'}</span>
              </div>
              
              <button
                onClick={() => handlePageChange(viewerState.currentPage + 1)}
                disabled={viewerState.currentPage >= (totalPages || 1)}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>

          {/* Informações do livro */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold truncate">{book.title}</h1>
            <p className="text-sm text-gray-600 truncate">{book.author}</p>
            <p className="text-xs text-gray-500">{formattedReadingTime} lendo</p>
          </div>

          {/* Controles à direita */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleZoomChange(viewerState.currentScale - 0.1)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="text-sm min-w-[3rem] text-center">
                {Math.round(viewerState.currentScale * 100)}%
              </span>
              <button
                onClick={() => handleZoomChange(viewerState.currentScale + 0.1)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleReaderModeToggle}
              className="p-2 rounded-lg hover:bg-gray-100"
              title={`Modo: ${config.readerMode}`}
            >
              {config.readerMode === 'double' ? <DocumentDuplicateIcon className="w-4 h-4" /> : <DocumentIcon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {config.theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>

            <button
              onClick={handleFullscreenToggle}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {viewerState.isFullscreen ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Cog6ToothIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>

      {/* Área de conteúdo */}
      <div className="flex-1 overflow-hidden relative">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
              <p className="text-lg">Carregando {book.format?.toUpperCase()}...</p>
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
              <p className="text-lg mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setInitialized(false);
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="h-full w-full flex items-center justify-center p-4">
            {book.format === 'pdf' ? (
              <Document
                file={getFileUrl()}
                onLoadSuccess={({ numPages }) => {
                  setTotalPages(numPages);
                  console.log('✅ PDF carregado com sucesso!', numPages, 'páginas');
                }}
                onLoadError={(error) => {
                  console.error('❌ Erro ao carregar PDF:', error);
                  setError('Falha ao carregar o documento PDF');
                }}
                className="flex justify-center items-center max-w-full max-h-full"
                options={pdfOptions}
              >
                <div className={`flex ${viewerState.isDualPage ? 'space-x-6' : ''} justify-center items-center`}>
                  <div 
                    className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
                    style={{ 
                      transform: `scale(${viewerState.currentScale})`,
                      transformOrigin: 'center',
                      transition: 'transform 0.3s ease-out'
                    }}
                  >
                    <Page
                      pageNumber={viewerState.currentPage}
                      width={800}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </div>
                </div>
              </Document>
            ) : (
              <div 
                ref={contentRef}
                className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden"
                style={{
                  backgroundColor: ConfigService.getThemeStyles(config.theme).backgroundColor
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Painel de configurações */}
      {showSettings && (
        <div className="absolute top-0 right-0 w-80 h-full bg-background-primary shadow-xl z-40 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Configurações</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tamanho da fonte</label>
              <input
                type="range"
                min="12"
                max="24"
                value={config.fontSize}
                onChange={(e) => setConfig(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{config.fontSize}px</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Altura da linha</label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={config.lineHeight}
                onChange={(e) => setConfig(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{config.lineHeight}</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Margens</label>
              <input
                type="range"
                min="0"
                max="100"
                value={config.margin}
                onChange={(e) => setConfig(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{config.margin}px</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Família da fonte</label>
              <select
                value={config.fontFamily}
                onChange={(e) => setConfig(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="w-full p-2 border rounded"
              >
                <option value="Georgia, serif">Georgia</option>
                <option value="Times, serif">Times</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Verdana, sans-serif">Verdana</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedViewer; 