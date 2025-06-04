'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ePub, { Book as EpubBook, Rendition } from 'epubjs';
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
  const [isInitializing, setIsInitializing] = useState(false); // Lock para prevenir múltiplas inicializações

  // Estados para buffer de arquivos
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileBufferRef = useRef<ArrayBuffer | null>(null);

  // Cache inteligente para evitar recarregamentos
  const fileCacheRef = useRef<Map<string, ArrayBuffer>>(new Map());

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

  // Cleanup completo e controlado
  const performCleanup = useCallback(async () => {
    console.log('🧹 Iniciando cleanup completo...');
    
    try {
      // Limpar rendition primeiro
      if (rendition) {
        console.log('🧹 Destruindo rendition...');
        try {
          rendition.destroy();
        } catch (error) {
          console.warn('⚠️ Erro ao destruir rendition:', error);
        }
        setRendition(null);
      }

      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 100));

      // Limpar book
      if (epubBook) {
        console.log('🧹 Destruindo EPUB book...');
        try {
          epubBook.destroy();
        } catch (error) {
          console.warn('⚠️ Erro ao destruir EPUB book:', error);
        }
        setEpubBook(null);
      }

      // Aguardar cleanup completo
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('✅ Cleanup completo finalizado');
    } catch (error) {
      console.error('❌ Erro durante cleanup:', error);
    }
  }, [rendition, epubBook]);

  // Função para carregar arquivo como ArrayBuffer (OCTET-STREAM)
  const loadFileAsBuffer = useCallback(async (fileUrl: string): Promise<ArrayBuffer> => {
    // Verificar cache primeiro
    const cacheKey = `${fileUrl}-${book.id}`;
    const cachedBuffer = fileCacheRef.current.get(cacheKey);
    if (cachedBuffer) {
      console.log('✅ Arquivo encontrado no cache:', fileUrl);
      return cachedBuffer;
    }

    console.log('📥 Carregando arquivo como ArrayBuffer:', fileUrl);
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Fazer requisição com suporte a progresso
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream, application/epub+zip, application/pdf, */*',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

      console.log(`📊 Tamanho do arquivo: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

      if (!response.body) {
        throw new Error('Response body não disponível');
      }

      // Ler stream com progresso
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedSize += value.length;

        // Atualizar progresso
        if (totalSize > 0) {
          const progress = Math.round((receivedSize / totalSize) * 100);
          setDownloadProgress(progress);
          console.log(`📥 Download: ${progress}% (${(receivedSize / 1024 / 1024).toFixed(2)} MB)`);
        }
      }

      // Combinar chunks em ArrayBuffer
      const buffer = new ArrayBuffer(receivedSize);
      const uint8Array = new Uint8Array(buffer);
      let position = 0;

      for (const chunk of chunks) {
        uint8Array.set(chunk, position);
        position += chunk.length;
      }

      console.log('✅ Arquivo carregado como ArrayBuffer:', buffer.byteLength, 'bytes');

      // Salvar no cache
      fileCacheRef.current.set(cacheKey, buffer);
      
      // Limitar tamanho do cache (máximo 3 arquivos)
      if (fileCacheRef.current.size > 3) {
        const firstKey = fileCacheRef.current.keys().next().value;
        if (firstKey) {
          fileCacheRef.current.delete(firstKey);
          console.log('🧹 Cache limpo:', firstKey);
        }
      }

      setFileBuffer(buffer);
      fileBufferRef.current = buffer;
      
      return buffer;

    } catch (error) {
      console.error('❌ Erro ao carregar arquivo como buffer:', error);
      throw new Error(`Falha no download: ${error instanceof Error ? error.message : error}`);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(100);
    }
  }, [book.id]);

  // Função para validar ArrayBuffer de EPUB
  const validateEpubBuffer = useCallback((buffer: ArrayBuffer): boolean => {
    try {
      // Verificar se é um buffer válido
      if (!buffer || buffer.byteLength === 0) {
        console.warn('⚠️ Buffer vazio ou inválido');
        return false;
      }

      // Verificar assinatura ZIP (EPUB é baseado em ZIP)
      const uint8Array = new Uint8Array(buffer);
      const signature = uint8Array.slice(0, 4);
      
      // Assinatura ZIP: PK (0x50, 0x4B)
      if (signature[0] === 0x50 && signature[1] === 0x4B) {
        console.log('✅ Buffer EPUB válido (assinatura ZIP detectada)');
        return true;
      }

      console.warn('⚠️ Buffer não parece ser um arquivo ZIP/EPUB válido');
      return false;
    } catch (error) {
      console.error('❌ Erro ao validar buffer EPUB:', error);
      return false;
    }
  }, []);

  // Função para criar Blob a partir do ArrayBuffer (mais compatível)
  const createEpubBlob = useCallback((buffer: ArrayBuffer): Blob => {
    return new Blob([buffer], { 
      type: 'application/epub+zip' 
    });
  }, []);

  // Função de logging melhorada para debug
  const logEpubState = useCallback((stage: string, details?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`📊 [${timestamp}] EPUB ${stage}:`, details || '');
  }, []);

  // Sistema de retry inteligente para EPUB.js
  const retryWithDifferentStrategy = useCallback(async (fileUrl: string, buffer: ArrayBuffer, pageAreaElement: HTMLElement, attempt = 1): Promise<EpubBook> => {
    const maxAttempts = 3;
    
    console.log(`🔄 Tentativa ${attempt}/${maxAttempts} de inicialização EPUB`);
    logEpubState('RETRY_ATTEMPT', { attempt, maxAttempts });
    
    const strategies = [
      // Estratégia 1: Blob URL (mais compatível)
      async () => {
        logEpubState('STRATEGY_BLOB', { attempt });
        const epubBlob = createEpubBlob(buffer);
        const blobUrl = URL.createObjectURL(epubBlob);
        const book = ePub(blobUrl, { openAs: 'epub' });
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        return book;
      },
      
      // Estratégia 2: ArrayBuffer direto
      async () => {
        logEpubState('STRATEGY_BUFFER', { attempt });
        return ePub(buffer, { openAs: 'epub' });
      },
      
      // Estratégia 3: URL tradicional
      async () => {
        logEpubState('STRATEGY_URL', { attempt });
        return ePub(fileUrl, { openAs: 'epub' });
      }
    ];
    
    const strategy = strategies[attempt - 1];
    if (!strategy) {
      throw new Error('Todas as estratégias de carregamento falharam');
    }
    
    try {
      const book = await strategy();
      
      // Aguardar com timeout mais longo
      await Promise.race([
        book.ready,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout na tentativa ${attempt}`)), 20000)
        )
      ]);
      
      // Verificar se resources está inicializado
      await new Promise<void>((resolve, reject) => {
        const checkResources = (retries = 0) => {
          if ((book as any).resources) {
            console.log(`✅ Resources inicializados na tentativa ${attempt}`);
            logEpubState('RESOURCES_READY', { attempt, retries });
            resolve();
          } else if (retries < 10) {
            console.log(`⏳ Aguardando resources... (${retries + 1}/10)`);
            setTimeout(() => checkResources(retries + 1), 500);
          } else {
            logEpubState('RESOURCES_TIMEOUT', { attempt, retries });
            reject(new Error(`Resources não inicializados após 10 tentativas na estratégia ${attempt}`));
          }
        };
        checkResources();
      });
      
      return book;
      
    } catch (error) {
      console.error(`❌ Estratégia ${attempt} falhou:`, error);
      logEpubState('STRATEGY_FAILED', { attempt, error: error instanceof Error ? error.message : error });
      
      if (attempt < maxAttempts) {
        // Aguardar antes de tentar próxima estratégia
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return retryWithDifferentStrategy(fileUrl, buffer, pageAreaElement, attempt + 1);
      } else {
        throw new Error(`Todas as ${maxAttempts} estratégias falharam. Último erro: ${error instanceof Error ? error.message : error}`);
      }
    }
  }, [createEpubBlob, logEpubState]);

  // Inicialização do EPUB com ArrayBuffer ROBUSTA
  const initializeEPUB = useCallback(async (fileUrl: string) => {
    if (isInitializing) {
      console.warn('⚠️ Inicialização já em progresso, ignorando duplicata');
      return;
    }

    console.log('🔄 Inicializando EPUB com validação robusta:', fileUrl);
    setIsInitializing(true);
    setState(prev => ({ ...prev, loading: true, error: null }));
    logEpubState('INICIANDO', { fileUrl });

    let pageAreaElement: HTMLElement | null = null;
    let buffer: ArrayBuffer | null = null;

    try {
      // Buscar elemento page-area
      pageAreaElement = document.getElementById('page-area');
      if (!pageAreaElement) {
        throw new Error('Elemento page-area não encontrado no DOM');
      }
      logEpubState('DOM_READY', { pageAreaFound: true });

      // CLEANUP COMPLETO
      await performCleanup();
      await new Promise(resolve => setTimeout(resolve, 100));
      logEpubState('CLEANUP_COMPLETE');

      // CARREGAR E VALIDAR ARQUIVO
      try {
        buffer = await loadFileAsBuffer(fileUrl);
        logEpubState('BUFFER_LOADED', { size: buffer.byteLength });
        
        // VALIDAR BUFFER
        if (!validateEpubBuffer(buffer)) {
          throw new Error('Buffer EPUB inválido ou corrompido');
        }
        logEpubState('BUFFER_VALIDATED');

        console.log('📚 Buffer EPUB validado, usando sistema de retry...');

        // USAR SISTEMA DE RETRY INTELIGENTE
        const readyBook = await retryWithDifferentStrategy(fileUrl, buffer, pageAreaElement);
        console.log('✅ EPUB carregado com sucesso via retry system');
        logEpubState('BOOK_READY', { hasSpine: !!readyBook.spine });

        setEpubBook(readyBook);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Calcular dimensões
        const dimensions = KoodoUtils.getPageWidth(
          state.readerMode,
          state.scale,
          20,
          false,
          false
        );

        console.log('🎨 Criando rendition...');

        // Criar rendition
        const newRendition = readyBook.renderTo(pageAreaElement, {
          width: dimensions.pageWidth,
          height: "100%",
          spread: state.readerMode === 'double' ? 'auto' : 'none',
          flow: state.readerMode === 'scroll' ? 'scrolled-doc' : 'paginated',
          allowScriptedContent: false,
          manager: 'default'
        });

        if (!newRendition) {
          throw new Error('Falha ao criar rendition');
        }

        console.log('✅ Rendition criado');
        logEpubState('RENDITION_CREATED');

        // Display
        console.log('🎨 Fazendo display inicial...');
        
        const displayPromise = Promise.race([
          newRendition.display().then(() => {
            console.log('✅ Display completado!');
            logEpubState('DISPLAY_COMPLETE');
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: Display não completou em 15 segundos')), 15000)
          )
        ]);

        await displayPromise;
        setRendition(newRendition);
        logEpubState('RENDITION_SET');

        // Event listeners
        newRendition.on('relocated', (location: any) => {
          if (location && location.start && location.start.cfi && readyBook.locations) {
            try {
              const locationsLength = readyBook.locations.length();
              if (locationsLength > 0) {
                const currentLocation = readyBook.locations.locationFromCfi(location.start.cfi);
                if (typeof currentLocation === 'number') {
                  setState(prev => ({ ...prev, currentPage: currentLocation + 1 }));
                }
              }
            } catch (error) {
              console.warn('⚠️ Erro ao processar localização:', error);
            }
          }
        });

        newRendition.on('rendered', () => {
          console.log('🎨 EPUB renderizado');
          try {
            handleLocation();
            setState(prev => ({ ...prev, loading: false }));
            
            const pageArea = document.getElementById('page-area');
            if (pageArea) {
              pageArea.style.display = 'block';
            }
            
            console.log('✅ EPUB inicializado com sucesso!');
          } catch (error) {
            console.error('❌ Erro no rendered handler:', error);
          }
        });

        newRendition.on('error', (error: any) => {
          console.error('❌ Erro na renderização EPUB:', error);
        });

        // Gerar localizações em background
        setTimeout(async () => {
          try {
            console.log('📍 Gerando localizações em background...');
            
            await Promise.race([
              readyBook.locations.generate(1024),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout background de locations')), 20000)
              )
            ]);

            const totalPages = readyBook.locations.length();
            if (totalPages > 0) {
              setState(prev => ({ ...prev, totalPages }));
              console.log(`✅ Localizações: ${totalPages} páginas`);
            } else {
              setState(prev => ({ ...prev, totalPages: 100 }));
            }
          } catch (locationError) {
            console.warn('⚠️ Erro nas localizações:', locationError);
            setState(prev => ({ ...prev, totalPages: 100 }));
          }
        }, 2000);

        // Aplicar tema
        setTimeout(() => {
          try {
            applyTheme(newRendition);
          } catch (themeError) {
            console.warn('⚠️ Erro ao aplicar tema:', themeError);
          }
        }, 1000);

        setState(prev => ({ ...prev, loading: false }));

      } catch (bufferError) {
        console.error('❌ Erro com ArrayBuffer:', bufferError);
        throw bufferError;
      }

    } catch (error) {
      console.error('❌ Erro crítico ao inicializar EPUB:', error);
      
      // Determinar tipo de erro para mensagem mais específica
      let errorMessage = 'Falha ao carregar EPUB';
      
      if (error instanceof Error) {
        if (error.message.includes('resources')) {
          errorMessage = 'Arquivo EPUB corrompido ou incompatível. Tente um arquivo diferente.';
        } else if (error.message.includes('Timeout')) {
          errorMessage = 'Arquivo muito grande ou conexão lenta. Tente novamente.';
        } else if (error.message.includes('ZIP')) {
          errorMessage = 'Arquivo não é um EPUB válido. Verifique o formato.';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage
      }));
    } finally {
      setIsInitializing(false);
      logEpubState('FINALIZANDO', { success: !state.error });
    }
  }, [state.readerMode, state.scale, handleLocation, performCleanup, isInitializing, loadFileAsBuffer, validateEpubBuffer, createEpubBlob, retryWithDifferentStrategy, logEpubState]);

  // Inicialização do PDF com ArrayBuffer
  const initializePDF = useCallback(async (fileUrl: string) => {
    console.log('🔄 Inicializando PDF com ArrayBuffer:', fileUrl);
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // CARREGAR PDF COMO ARRAYBUFFER
      const buffer = await loadFileAsBuffer(fileUrl);
      
      console.log('📄 PDF carregado como ArrayBuffer, configurando...');
      
      // Definir buffer para o componente PDF
      setFileBuffer(buffer);
      fileBufferRef.current = buffer;
      
      setState(prev => ({ ...prev, loading: false }));
      console.log('✅ PDF pronto para renderização');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar PDF:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Falha ao carregar PDF: ${error instanceof Error ? error.message : error}` 
      }));
    }
  }, [loadFileAsBuffer]);

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
      // ESTRATÉGIA OTIMIZADA: tentar usar locations, mas não bloquear
      
      // Atualizar estado imediatamente
      setState(prev => ({ ...prev, currentPage: newPage }));
      
      // Tentar navegação com locations se disponível
      if (epubBook.locations) {
        try {
          const locationsLength = epubBook.locations.length();
          if (locationsLength > 0) {
            const cfi = epubBook.locations.cfiFromLocation(newPage - 1);
            if (cfi) {
              rendition.display(cfi).catch((error) => {
                console.warn('⚠️ Erro ao navegar via CFI, tentando método alternativo:', error);
                // Fallback: navegação por spine
                try {
                  const spine = epubBook.spine.get(Math.floor((newPage - 1) / 10));
                  if (spine) {
                    rendition.display(spine.href);
                  }
                } catch (spineError) {
                  console.warn('⚠️ Fallback de spine também falhou:', spineError);
                }
              });
            } else {
              console.warn('⚠️ CFI não encontrado para página:', newPage);
            }
          } else {
            console.warn('⚠️ Locations ainda não geradas, aguardando...');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao acessar locations:', error);
        }
      } else {
        console.warn('⚠️ Locations não inicializadas ainda');
      }
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
      // Limpar cache de arquivos
      fileCacheRef.current.clear();
      
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
      
      // Limpar buffer refs
      setFileBuffer(null);
      fileBufferRef.current = null;
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

        {(state.loading || isDownloading) && (
          <div className="koodo-loading">
            <div className="koodo-spinner"></div>
            {isDownloading ? (
              <>
                <p>Baixando {book.format?.toUpperCase()}... {downloadProgress}%</p>
                <div style={{ 
                  width: '300px', 
                  height: '6px', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '3px',
                  overflow: 'hidden',
                  margin: '10px 0'
                }}>
                  <div style={{
                    width: `${downloadProgress}%`,
                    height: '100%',
                    backgroundColor: '#4285f4',
                    transition: 'width 0.3s ease',
                    borderRadius: '3px'
                  }} />
                </div>
              </>
            ) : (
              <p>Carregando {book.format?.toUpperCase()}...</p>
            )}
          </div>
        )}

        {state.error && (
          <div className="koodo-error">
            <h3>⚠️ Erro ao carregar o livro</h3>
            <p>{state.error}</p>
            
            {/* Dicas específicas para problemas de EPUB */}
            {state.error.includes('corrompido') && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '8px', fontSize: '14px' }}>
                <strong>💡 Dicas:</strong>
                <ul style={{ textAlign: 'left', marginTop: '8px' }}>
                  <li>Verifique se o arquivo EPUB não está corrompido</li>
                  <li>Tente fazer download do arquivo novamente</li>
                  <li>Alguns EPUBs antigos podem ser incompatíveis</li>
                </ul>
              </div>
            )}
            
            {state.error.includes('grande') && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#d1ecf1', borderRadius: '8px', fontSize: '14px' }}>
                <strong>⏱️ Arquivo grande:</strong>
                <ul style={{ textAlign: 'left', marginTop: '8px' }}>
                  <li>Aguarde alguns segundos a mais</li>
                  <li>Verifique sua conexão com internet</li>
                  <li>Arquivos maiores podem demorar mais para carregar</li>
                </ul>
              </div>
            )}
            
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setState(prev => ({ ...prev, error: null }));
                  window.location.reload();
                }}
                className="koodo-btn primary"
              >
                🔄 Tentar Novamente
              </button>
              
              {onBack && (
                <button onClick={onBack} className="koodo-btn">
                  ← Voltar
                </button>
              )}
            </div>
          </div>
        )}

        {!state.loading && !state.error && book.format === 'pdf' && fileBuffer && (
          <Document
            file={fileBuffer}
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

// Adicionar displayName para debug
KoodoViewer.displayName = 'KoodoViewer';

// Verificação de tipo para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  if (typeof KoodoViewer !== 'function') {
    console.error('⚠️ KoodoViewer não é uma função válida:', typeof KoodoViewer);
  }
} 