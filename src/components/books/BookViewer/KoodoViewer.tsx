'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Book as EpubBook, Rendition } from 'epubjs';
import { Book } from '@/constants/mockData';
import { Annotation, Highlight, Bookmark, ViewerState } from './types';
import { v4 as uuidv4 } from 'uuid';
import screenfull from 'screenfull';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configuração do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Sistema de configuração copiado do koodo-reader
class KoodoConfigService {
  static getReaderConfig(key: string): string | null {
    return localStorage.getItem(`koodo-reader-${key}`);
  }

  static setReaderConfig(key: string, value: string): void {
    localStorage.setItem(`koodo-reader-${key}`, value);
  }

  static getObjectConfig(bookKey: string, configKey: string, defaultValue: any): any {
    try {
      const stored = localStorage.getItem(`koodo-book-${bookKey}-${configKey}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static setObjectConfig(bookKey: string, value: any, configKey: string): void {
    try {
      localStorage.setItem(`koodo-book-${bookKey}-${configKey}`, JSON.stringify(value));
    } catch (error) {
      console.warn('Erro ao salvar configuração:', error);
    }
  }
}

// Utilitários copiados do koodo-reader
class KoodoUtils {
  static getPageWidth(readerMode: string, scale: number, margin: number, isNavLocked: boolean, isSettingLocked: boolean) {
    const windowWidth = window.innerWidth;
    let pageWidth = windowWidth;
    let pageOffset = "0px";

    // Ajustar para painéis laterais
    if (isNavLocked) pageWidth -= 300;
    if (isSettingLocked) pageWidth -= 300;
    
    // Aplicar margem
    pageWidth -= margin * 2;
    pageOffset = `${margin}px`;

    // Modo dupla página
    if (readerMode === "double") {
      pageWidth = Math.floor(pageWidth / 2) - 20;
    }

    // Aplicar escala
    pageWidth *= scale;

    return {
      pageWidth: `${Math.max(300, pageWidth)}px`,
      pageOffset,
    };
  }

  static addDefaultCss() {
    const existingStyle = document.getElementById('koodo-default-css');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'koodo-default-css';
    style.textContent = `
      .koodo-viewer {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #f5f5f5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      }
      
      .koodo-content {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: auto;
      }
      
      .koodo-page-container {
        max-width: 100%;
        max-height: 100%;
        margin: 20px;
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        border-radius: 8px;
        overflow: hidden;
      }
      
      #page-area {
        width: 100%;
        height: 100%;
        min-height: 500px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      
      .koodo-controls {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: rgba(255,255,255,0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        z-index: 1000;
      }
      
      .koodo-progress {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: #e0e0e0;
        z-index: 1000;
      }
      
      .koodo-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #4285f4, #7b68ee);
        transition: width 0.3s ease;
      }
      
      .koodo-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        background: #f0f0f0;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .koodo-btn:hover {
        background: #e0e0e0;
      }
      
      .koodo-btn.primary {
        background: #4285f4;
        color: white;
      }
      
      .koodo-btn.primary:hover {
        background: #3367d6;
      }
      
      .koodo-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .koodo-input {
        padding: 6px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        width: 60px;
        text-align: center;
      }
      
      .koodo-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
      }
      
      .koodo-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f0f0f0;
        border-top: 4px solid #4285f4;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .koodo-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #d93025;
        text-align: center;
        padding: 20px;
      }
      
      .dark .koodo-viewer {
        background: #1a1a1a;
        color: #e0e0e0;
      }
      
      .dark .koodo-controls {
        background: rgba(26,26,26,0.95);
        border-bottom-color: #333;
      }
      
      .dark .koodo-page-container {
        background: #2d2d2d;
      }
      
      .dark #page-area {
        background: #2d2d2d;
      }
      
      .dark .koodo-btn {
        background: #333;
        color: #e0e0e0;
      }
      
      .dark .koodo-btn:hover {
        background: #444;
      }
      
      .dark .koodo-input {
        background: #333;
        border-color: #555;
        color: #e0e0e0;
      }
    `;
    document.head.appendChild(style);
  }
}

interface KoodoViewerProps {
  book: Book;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onBack?: () => void;
}

const KoodoViewer: React.FC<KoodoViewerProps> = ({
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
  const readingTimerRef = useRef<NodeJS.Timeout>();

  // Estado principal (copiado do koodo-reader)
  const [state, setState] = useState({
    loading: true,
    error: null as string | null,
    currentPage: 1,
    totalPages: 0,
    scale: parseFloat(KoodoConfigService.getReaderConfig("scale") || "1"),
    readerMode: KoodoConfigService.getReaderConfig("readerMode") || "single",
    isDarkMode: KoodoConfigService.getReaderConfig("isDarkMode") === "yes",
    isFullscreen: false,
    readingTime: 0,
    chapterTitle: "",
    chapterDocIndex: 0,
  });

  // Estados específicos para PDF
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  
  // Estados específicos para EPUB
  const [epubBook, setEpubBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);

  // Aplicar CSS padrão (copiado do koodo-reader)
  useEffect(() => {
    KoodoUtils.addDefaultCss();
  }, []);

  // Timer de leitura (copiado do koodo-reader)
  useEffect(() => {
    let seconds = 0;
    readingTimerRef.current = setInterval(() => {
      seconds += 1;
      setState(prev => ({ ...prev, readingTime: prev.readingTime + 1 }));
      
      // Salvar tempo de leitura
      const totalTime = KoodoConfigService.getObjectConfig(book.id, "readingTime", 0);
      KoodoConfigService.setObjectConfig(book.id, totalTime + 1, "readingTime");
    }, 1000);

    return () => {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
    };
  }, [book.id]);

  // Função para obter URL do arquivo (copiado e adaptado do koodo-reader)
  const getFileUrl = useCallback(() => {
    if (!book) return null;
    
    if (book.filePath && typeof book.filePath === 'string') {
      if (book.filePath.startsWith('http')) {
        return book.filePath;
      }
      const fullPath = book.filePath.startsWith('/') ? book.filePath : `/${book.filePath}`;
      return `${window.location.origin}${fullPath}`;
    }
    
    const extension = book.format === 'epub' ? 'epub' : 'pdf';
    return `/books/${book.id}.${extension}`;
  }, [book]);

  // Salvar posição do livro (copiado do koodo-reader)
  const handleLocation = useCallback(() => {
    if (!book.id) return;
    
    const position = {
      page: state.currentPage,
      chapterTitle: state.chapterTitle,
      chapterDocIndex: state.chapterDocIndex,
      percentage: state.totalPages > 0 ? (state.currentPage / state.totalPages) * 100 : 0,
      timestamp: Date.now(),
    };
    
    KoodoConfigService.setObjectConfig(book.id, position, "recordLocation");
  }, [book.id, state.currentPage, state.chapterTitle, state.chapterDocIndex, state.totalPages]);

  // Carregar posição salva (copiado do koodo-reader)
  useEffect(() => {
    if (!book.id) return;
    
    const savedLocation = KoodoConfigService.getObjectConfig(book.id, "recordLocation", {});
    const savedReadingTime = KoodoConfigService.getObjectConfig(book.id, "readingTime", 0);
    
    if (savedLocation.page) {
      setState(prev => ({
        ...prev,
        currentPage: savedLocation.page,
        chapterTitle: savedLocation.chapterTitle || "",
        chapterDocIndex: savedLocation.chapterDocIndex || 0,
        readingTime: savedReadingTime,
      }));
    }
  }, [book.id]);

  // Inicialização do PDF (melhorado com base no koodo-reader)
  const initializePDF = useCallback(async (fileUrl: string) => {
    console.log('🔄 Inicializando PDF:', fileUrl);
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Verificar se o arquivo existe
      const response = await fetch(fileUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Arquivo PDF não encontrado (Status: ${response.status})`);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      console.log('✅ PDF pronto para carregamento');
    } catch (error) {
      console.error('❌ Erro ao inicializar PDF:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Falha ao carregar PDF: ${error instanceof Error ? error.message : error}` 
      }));
    }
  }, []);

  // Inicialização do EPUB (corrigido para aguardar o DOM)
  const initializeEPUB = useCallback(async (fileUrl: string) => {
    console.log('🔄 Inicializando EPUB:', fileUrl);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Verificar se o arquivo existe
      const response = await fetch(fileUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Arquivo EPUB não encontrado (Status: ${response.status})`);
      }

      // Aguardar um momento para garantir que o DOM esteja pronto
      await new Promise(resolve => setTimeout(resolve, 100));

      // Buscar o elemento page-area que agora está sempre presente
      const pageAreaElement = document.getElementById('page-area');
      if (!pageAreaElement) {
        throw new Error('Elemento page-area não encontrado no DOM');
      }
      console.log('✅ Elemento page-area encontrado');

      const newBook = new EpubBook(fileUrl, {
        openAs: 'epub',
        requestHeaders: {
          'Accept': 'application/epub+zip',
          'Access-Control-Allow-Origin': '*'
        }
      });

      console.log('📚 Carregando EPUB book...');
      setEpubBook(newBook);
      await newBook.ready;
      console.log('✅ EPUB book pronto');

      // Calcular dimensões (copiado do koodo-reader)
      const dimensions = KoodoUtils.getPageWidth(
        state.readerMode,
        state.scale,
        20, // margin
        false, // isNavLocked
        false  // isSettingLocked
      );

      console.log('🎨 Criando rendition com dimensões:', dimensions);
      const newRendition = newBook.renderTo(pageAreaElement, {
        width: dimensions.pageWidth,
        height: "100%",
        spread: state.readerMode === 'double' ? 'auto' : 'none',
        flow: state.readerMode === 'scroll' ? 'scrolled-doc' : 'paginated',
        allowScriptedContent: false
      });

      setRendition(newRendition);
      console.log('📖 Exibindo conteúdo...');
      await newRendition.display();

      // Gerar localizações (copiado do koodo-reader)
      try {
        console.log('📍 Gerando localizações...');
        await newBook.locations.generate(1024);
        const totalPages = newBook.locations.length();
        setState(prev => ({ ...prev, totalPages }));
        console.log(`✅ ${totalPages} localizações geradas`);
      } catch (locationError) {
        console.warn('⚠️ Erro ao gerar localizações:', locationError);
        setState(prev => ({ ...prev, totalPages: 100 }));
      }

      // Event listeners (copiados do koodo-reader)
      newRendition.on('relocated', (location: any) => {
        if (location && location.start && location.start.cfi && newBook.locations) {
          const currentLocation = newBook.locations.locationFromCfi(location.start.cfi);
          if (typeof currentLocation === 'number') {
            setState(prev => ({ ...prev, currentPage: currentLocation + 1 }));
          }
        }
      });

      newRendition.on('rendered', () => {
        console.log('🎨 EPUB renderizado');
        handleLocation();
        setState(prev => ({ ...prev, loading: false }));
        
        // Mostrar o elemento page-area
        const pageArea = document.getElementById('page-area');
        if (pageArea) {
          pageArea.style.display = 'block';
        }
        
        console.log('✅ EPUB inicializado com sucesso!');
      });

      // Aplicar tema
      applyTheme(newRendition);

    } catch (error) {
      console.error('❌ Erro ao inicializar EPUB:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Falha ao carregar EPUB: ${error instanceof Error ? error.message : error}` 
      }));
    }
  }, [state.readerMode, state.scale, handleLocation]);

  // Aplicar tema (copiado do koodo-reader)
  const applyTheme = useCallback((renditionInstance?: Rendition) => {
    const targetRendition = renditionInstance || rendition;
    if (!targetRendition) return;

    const theme = state.isDarkMode ? 'dark' : 'light';
    
    if (state.isDarkMode) {
      targetRendition.themes.register('dark', {
        'body': { 
          'color': '#e0e0e0 !important', 
          'background-color': '#1a1a1a !important' 
        },
        'a': { 'color': '#4fc3f7 !important' }
      });
      targetRendition.themes.select('dark');
    } else {
      targetRendition.themes.register('light', {
        'body': { 
          'color': '#333 !important', 
          'background-color': '#ffffff !important' 
        },
        'a': { 'color': '#4285f4 !important' }
      });
      targetRendition.themes.select('light');
    }
  }, [state.isDarkMode, rendition]);

  // Inicialização principal (copiado do koodo-reader)
  useEffect(() => {
    if (!book || !book.id) return;

    const initializeBook = async () => {
      try {
        const fileUrl = getFileUrl();
        if (!fileUrl) {
          throw new Error('URL do arquivo não pode ser determinada');
        }

        // Aguardar um pouco para garantir que o DOM esteja pronto
        await new Promise(resolve => setTimeout(resolve, 100));

        if (book.format === 'epub') {
          await initializeEPUB(fileUrl);
        } else {
          await initializePDF(fileUrl);
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: `Erro na inicialização: ${error instanceof Error ? error.message : error}` 
        }));
      }
    };

    initializeBook();
  }, [book?.id, book?.format, getFileUrl, initializeEPUB, initializePDF]);

  // Salvar localização quando muda (copiado do koodo-reader)
  useEffect(() => {
    if (state.currentPage > 0) {
      const saveTimer = setTimeout(handleLocation, 2000);
      return () => clearTimeout(saveTimer);
    }
  }, [state.currentPage, handleLocation]);

  // Manipuladores de eventos (copiados do koodo-reader)
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > state.totalPages) return;
    
    if (book.format === 'pdf') {
      setState(prev => ({ ...prev, currentPage: newPage }));
    } else if (book.format === 'epub' && epubBook && rendition) {
      const cfi = epubBook.locations.cfiFromLocation(newPage - 1);
      rendition.display(cfi);
    }
  }, [state.totalPages, book.format, epubBook, rendition]);

  const handleScaleChange = useCallback((newScale: number) => {
    const clampedScale = Math.max(0.5, Math.min(3.0, newScale));
    setState(prev => ({ ...prev, scale: clampedScale }));
    KoodoConfigService.setReaderConfig("scale", clampedScale.toString());
    
    // Recarregar para aplicar nova escala
    if (book.format === 'epub' && rendition) {
      rendition.themes.fontSize(`${clampedScale * 100}%`);
    }
  }, [book.format, rendition]);

  const handleThemeToggle = useCallback(() => {
    const newDarkMode = !state.isDarkMode;
    setState(prev => ({ ...prev, isDarkMode: newDarkMode }));
    KoodoConfigService.setReaderConfig("isDarkMode", newDarkMode ? "yes" : "no");
    
    // Aplicar ao container
    if (containerRef.current) {
      if (newDarkMode) {
        containerRef.current.classList.add('dark');
      } else {
        containerRef.current.classList.remove('dark');
      }
    }
    
    // Aplicar ao EPUB
    setTimeout(() => applyTheme(), 100);
  }, [state.isDarkMode, applyTheme]);

  const handleReaderModeToggle = useCallback(() => {
    const modes = ['single', 'double', 'scroll'];
    const currentIndex = modes.indexOf(state.readerMode);
    const newMode = modes[(currentIndex + 1) % modes.length];
    
    setState(prev => ({ ...prev, readerMode: newMode }));
    KoodoConfigService.setReaderConfig("readerMode", newMode);
    
    // Recarregar EPUB com novo modo
    if (book.format === 'epub' && rendition) {
      rendition.spread(newMode === 'double' ? 'auto' : 'none');
      rendition.flow(newMode === 'scroll' ? 'scrolled-doc' : 'paginated');
    }
  }, [state.readerMode, book.format, rendition]);

  const handleFullscreenToggle = useCallback(() => {
    if (containerRef.current && screenfull.isEnabled) {
      screenfull.toggle(containerRef.current);
      setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
    }
  }, []);

  // Formatação do tempo de leitura (copiado do koodo-reader)
  const formatReadingTime = useMemo(() => {
    const hours = Math.floor(state.readingTime / 3600);
    const minutes = Math.floor((state.readingTime % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${state.readingTime}s`;
    }
  }, [state.readingTime]);

  // Progresso de leitura (copiado do koodo-reader)
  const readingProgress = useMemo(() => {
    if (state.totalPages === 0) return 0;
    return Math.min(100, Math.max(0, (state.currentPage / state.totalPages) * 100));
  }, [state.currentPage, state.totalPages]);

  // Memoizar as opções do PDF para evitar recarregamentos desnecessários
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    verbosity: 0,
  }), []);

  // Cleanup (copiado do koodo-reader)
  useEffect(() => {
    return () => {
      if (epubBook) {
        try {
          epubBook.destroy();
        } catch (error) {
          console.warn('Erro ao destruir EPUB:', error);
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
  }, [epubBook, rendition]);

  // Verificação de segurança
  if (!book || !book.id) {
    return (
      <div className="koodo-viewer">
        <div className="koodo-error">
          <h3>Erro: Dados do livro inválidos</h3>
          {onBack && (
            <button onClick={onBack} className="koodo-btn primary">
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
      className={`koodo-viewer ${state.isDarkMode ? 'dark' : ''} ${state.isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Controles superiores (copiado do koodo-reader) */}
      <div className="koodo-controls">
        {/* Lado esquerdo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button onClick={onBack} className="koodo-btn primary">
              ← Voltar
            </button>
          )}
          
          {/* Navegação */}
          <button
            onClick={() => handlePageChange(state.currentPage - 1)}
            disabled={state.currentPage <= 1}
            className="koodo-btn"
          >
            ←
          </button>
          
          <input
            type="number"
            value={state.currentPage}
            onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
            className="koodo-input"
            min={1}
            max={state.totalPages}
          />
          
          <span>/ {state.totalPages}</span>
          
          <button
            onClick={() => handlePageChange(state.currentPage + 1)}
            disabled={state.currentPage >= state.totalPages}
            className="koodo-btn"
          >
            →
          </button>
        </div>

        {/* Centro - Informações do livro */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{book.title}</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            {book.author} • {formatReadingTime} lendo
          </div>
        </div>

        {/* Lado direito - Controles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Zoom */}
          <button
            onClick={() => handleScaleChange(state.scale - 0.1)}
            className="koodo-btn"
          >
            -
          </button>
          <span style={{ minWidth: '50px', textAlign: 'center' }}>
            {Math.round(state.scale * 100)}%
          </span>
          <button
            onClick={() => handleScaleChange(state.scale + 0.1)}
            className="koodo-btn"
          >
            +
          </button>

          {/* Modo de leitura */}
          <button
            onClick={handleReaderModeToggle}
            className="koodo-btn"
            title={`Modo: ${state.readerMode}`}
          >
            {state.readerMode === 'single' ? '📄' : state.readerMode === 'double' ? '📖' : '📜'}
          </button>

          {/* Tema */}
          <button
            onClick={handleThemeToggle}
            className="koodo-btn"
          >
            {state.isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Tela cheia */}
          <button
            onClick={handleFullscreenToggle}
            className="koodo-btn"
          >
            {state.isFullscreen ? '📱' : '🖥️'}
          </button>
        </div>
      </div>

      {/* Área de conteúdo (copiado do koodo-reader) */}
      <div className="koodo-content" style={{ paddingTop: '60px', paddingBottom: '4px' }}>
        {/* Elemento page-area sempre presente para EPUB (mesmo durante loading) */}
        {book.format === 'epub' && (
          <div 
            id="page-area"
            style={{
              width: '90%',
              height: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              display: state.loading ? 'none' : 'block'
            }}
          />
        )}

        {state.loading && (
          <div className="koodo-loading">
            <div className="koodo-spinner"></div>
            <p>Carregando {book.format?.toUpperCase()}...</p>
          </div>
        )}

        {state.error && (
          <div className="koodo-error">
            <h3>Erro ao carregar o livro</h3>
            <p>{state.error}</p>
            <button
              onClick={() => {
                setState(prev => ({ ...prev, error: null }));
                window.location.reload();
              }}
              className="koodo-btn primary"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {!state.loading && !state.error && book.format === 'pdf' && (
          <Document
            file={getFileUrl()}
            onLoadSuccess={({ numPages }) => {
              console.log('✅ PDF carregado:', numPages, 'páginas');
              setState(prev => ({ ...prev, totalPages: numPages }));
            }}
            onLoadError={(error) => {
              console.error('❌ Erro PDF:', error);
              setState(prev => ({ ...prev, error: 'Falha ao carregar PDF' }));
            }}
            options={pdfOptions}
          >
            <div className="koodo-page-container">
              <Page
                pageNumber={state.currentPage}
                scale={state.scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          </Document>
        )}
      </div>

      {/* Barra de progresso (copiado do koodo-reader) */}
      <div className="koodo-progress">
        <div 
          className="koodo-progress-bar"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
    </div>
  );
};

export default KoodoViewer; 