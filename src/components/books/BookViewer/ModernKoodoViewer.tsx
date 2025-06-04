'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ePub, { Book as EpubBook, Rendition } from 'epubjs';
import { Book } from '@/constants/mockData';
import { Annotation, Highlight, Bookmark } from './types';
import { v4 as uuidv4 } from 'uuid';
import screenfull from 'screenfull';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configuração do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Configurações modernas do KoodoReader 2.0.0
interface ModernKoodoConfig {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margin: number;
  background: string;
  textColor: string;
  aiEnabled: boolean;
  syncEnabled: boolean;
  gesturesEnabled: boolean;
  progressTracking: boolean;
  readingGoals: boolean;
  focusMode: boolean;
}

// Sistema de AI moderno
interface AIFeatures {
  askQuestion: (text: string, context: string) => Promise<string>;
  summarize: (content: string) => Promise<string>;
  translate: (text: string, targetLang: string) => Promise<string>;
  recommend: (preferences: any) => Promise<any[]>;
}

// Sistema de sincronização Koodo Sync
interface KoodoSync {
  enabled: boolean;
  lastSync: Date | null;
  autoSync: boolean;
  conflictResolution: 'local' | 'remote' | 'merge';
}

interface ModernKoodoViewerProps {
  book: Book;
  config?: Partial<ModernKoodoConfig>;
  onClose?: () => void;
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onAIInteraction?: (type: string, data: any) => void;
}

const ModernKoodoViewer: React.FC<ModernKoodoViewerProps> = ({
  book,
  config: userConfig,
  onClose,
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd,
  onAIInteraction
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const epubBookRef = useRef<EpubBook | null>(null);

  // Configuração padrão moderna
  const defaultConfig: ModernKoodoConfig = {
    theme: 'light',
    fontSize: 16,
    fontFamily: 'Inter, sans-serif',
    lineHeight: 1.6,
    margin: 20,
    background: '#ffffff',
    textColor: '#1a1a1a',
    aiEnabled: true,
    syncEnabled: true,
    gesturesEnabled: true,
    progressTracking: true,
    readingGoals: true,
    focusMode: false
  };

  const config = { ...defaultConfig, ...userConfig };

  // Estados modernos
  const [viewerState, setViewerState] = useState({
    loading: true,
    error: null as string | null,
    currentPage: 1,
    totalPages: 0,
    progress: 0,
    readingTime: 0,
    focusMode: false,
    isFullscreen: false,
    syncStatus: 'idle' as 'idle' | 'syncing' | 'synced' | 'error'
  });

  // Sistema de AI moderno
  const [aiState, setAiState] = useState({
    enabled: config.aiEnabled,
    context: '',
    suggestions: [] as string[],
    summary: '',
    isProcessing: false
  });

  // Sistema de sincronização
  const [syncState, setSyncState] = useState<KoodoSync>({
    enabled: config.syncEnabled,
    lastSync: null,
    autoSync: true,
    conflictResolution: 'merge'
  });

  // Buffer system moderno
  const [bufferState, setBufferState] = useState({
    arrayBuffer: null as ArrayBuffer | null,
    downloadProgress: 0,
    isDownloading: false,
    cached: false
  });

  // Sistema de cache inteligente
  const cacheManager = useMemo(() => ({
    buffers: new Map<string, ArrayBuffer>(),
    maxSize: 5, // Máximo 5 arquivos
    get: (key: string) => {
      const buffer = cacheManager.buffers.get(key);
      if (buffer) {
        console.log('📦 Cache hit:', key);
        return buffer;
      }
      return null;
    },
    set: (key: string, buffer: ArrayBuffer) => {
      if (cacheManager.buffers.size >= cacheManager.maxSize) {
        const firstKey = cacheManager.buffers.keys().next().value;
        if (firstKey) {
          cacheManager.buffers.delete(firstKey);
          console.log('🧹 Cache evicted:', firstKey);
        }
      }
      cacheManager.buffers.set(key, buffer);
      console.log('📦 Cache stored:', key);
    },
    clear: () => {
      cacheManager.buffers.clear();
      console.log('🧹 Cache cleared');
    }
  }), []);

  // Sistema de AI simulado (integração com APIs reais)
  const aiFeatures: AIFeatures = useMemo(() => ({
    askQuestion: async (text: string, context: string) => {
      if (!aiState.enabled) return '';
      setAiState(prev => ({ ...prev, isProcessing: true }));
      
      try {
        // Simulação de API de AI
        await new Promise(resolve => setTimeout(resolve, 2000));
        const response = `Com base no contexto "${context.substring(0, 100)}...", sobre "${text}": Esta é uma resposta inteligente gerada pela IA baseada no conteúdo do livro.`;
        
        onAIInteraction?.('question', { text, context, response });
        return response;
      } finally {
        setAiState(prev => ({ ...prev, isProcessing: false }));
      }
    },

    summarize: async (content: string) => {
      if (!aiState.enabled) return '';
      setAiState(prev => ({ ...prev, isProcessing: true }));
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const summary = `Resumo: ${content.substring(0, 200)}... [Resumo gerado pela IA]`;
        
        setAiState(prev => ({ ...prev, summary }));
        onAIInteraction?.('summary', { content, summary });
        return summary;
      } finally {
        setAiState(prev => ({ ...prev, isProcessing: false }));
      }
    },

    translate: async (text: string, targetLang: string) => {
      if (!aiState.enabled) return '';
      setAiState(prev => ({ ...prev, isProcessing: true }));
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const translation = `[${targetLang.toUpperCase()}] ${text} [Traduzido pela IA]`;
        
        onAIInteraction?.('translation', { text, targetLang, translation });
        return translation;
      } finally {
        setAiState(prev => ({ ...prev, isProcessing: false }));
      }
    },

    recommend: async (preferences: any) => {
      if (!aiState.enabled) return [];
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const recommendations = [
          { title: 'Livro Recomendado 1', reason: 'Baseado no seu histórico de leitura' },
          { title: 'Livro Recomendado 2', reason: 'Similar ao livro atual' }
        ];
        
        onAIInteraction?.('recommendation', { preferences, recommendations });
        return recommendations;
      } catch (error) {
        console.error('❌ Erro nas recomendações:', error);
        return [];
      }
    }
  }), [aiState.enabled, onAIInteraction]);

  // Sistema de carregamento otimizado
  const loadFileAsBuffer = useCallback(async (fileUrl: string): Promise<ArrayBuffer> => {
    const cacheKey = `${fileUrl}-${book.id}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      setBufferState(prev => ({ ...prev, cached: true }));
      return cached;
    }

    console.log('🚀 Carregando arquivo moderno:', fileUrl);
    setBufferState(prev => ({ ...prev, isDownloading: true, downloadProgress: 0 }));

    try {
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream, application/epub+zip, application/pdf, */*',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

      if (!response.body) {
        throw new Error('Response body não disponível');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedSize += value.length;

        if (totalSize > 0) {
          const progress = Math.round((receivedSize / totalSize) * 100);
          setBufferState(prev => ({ ...prev, downloadProgress: progress }));
        }
      }

      const buffer = new ArrayBuffer(receivedSize);
      const uint8Array = new Uint8Array(buffer);
      let position = 0;

      for (const chunk of chunks) {
        uint8Array.set(chunk, position);
        position += chunk.length;
      }

      cacheManager.set(cacheKey, buffer);
      setBufferState(prev => ({ 
        ...prev, 
        arrayBuffer: buffer, 
        cached: false 
      }));

      return buffer;
    } catch (error) {
      console.error('❌ Erro no carregamento:', error);
      throw error;
    } finally {
      setBufferState(prev => ({ ...prev, isDownloading: false }));
    }
  }, [book.id, cacheManager]);

  // Inicialização moderna do EPUB
  const initializeModernEPUB = useCallback(async (fileUrl: string) => {
    setViewerState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const pageArea = document.getElementById('modern-page-area');
      if (!pageArea) {
        throw new Error('Área de página não encontrada');
      }

      const buffer = await loadFileAsBuffer(fileUrl);
      
      // Criar Blob otimizado
      const epubBlob = new Blob([buffer], { type: 'application/epub+zip' });
      const blobUrl = URL.createObjectURL(epubBlob);
      
      const epubBook = ePub(blobUrl, { openAs: 'epub' });
      await epubBook.ready;
      
      epubBookRef.current = epubBook;

      const rendition = epubBook.renderTo(pageArea, {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'paginated',
        allowScriptedContent: false,
        manager: 'default'
      });

      await rendition.display();
      renditionRef.current = rendition;

      // Event listeners modernos
      rendition.on('relocated', (location: any) => {
        if (location && epubBook.locations) {
          const currentLocation = epubBook.locations.locationFromCfi(location.start.cfi);
          if (typeof currentLocation === 'number') {
            const progress = (currentLocation / epubBook.locations.length()) * 100;
            setViewerState(prev => ({ 
              ...prev, 
              currentPage: currentLocation + 1,
              progress 
            }));
          }
        }
      });

      rendition.on('rendered', () => {
        setViewerState(prev => ({ ...prev, loading: false }));
        applyModernTheme();
        
        // Auto-sync se habilitado
        if (syncState.enabled && syncState.autoSync) {
          performSync();
        }
      });

      // Gerar localizações
      try {
        await epubBook.locations.generate(1024);
        const totalPages = epubBook.locations.length();
        setViewerState(prev => ({ ...prev, totalPages }));
      } catch (error) {
        console.warn('⚠️ Erro nas localizações:', error);
        setViewerState(prev => ({ ...prev, totalPages: 100 }));
      }

      URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar EPUB moderno:', error);
      setViewerState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }));
    }
  }, [loadFileAsBuffer, syncState.enabled, syncState.autoSync]);

  // Sistema de temas moderno
  const applyModernTheme = useCallback(() => {
    const rendition = renditionRef.current;
    if (!rendition) return;

    const themes = {
      light: {
        body: {
          'color': config.textColor,
          'background-color': config.background,
          'font-family': config.fontFamily,
          'font-size': `${config.fontSize}px`,
          'line-height': config.lineHeight.toString(),
          'margin': `${config.margin}px`
        }
      },
      dark: {
        body: {
          'color': '#e0e0e0',
          'background-color': '#1a1a1a',
          'font-family': config.fontFamily,
          'font-size': `${config.fontSize}px`,
          'line-height': config.lineHeight.toString(),
          'margin': `${config.margin}px`
        }
      },
      sepia: {
        body: {
          'color': '#5c4b37',
          'background-color': '#f7f4e7',
          'font-family': config.fontFamily,
          'font-size': `${config.fontSize}px`,
          'line-height': config.lineHeight.toString(),
          'margin': `${config.margin}px`
        }
      }
    };

    const themeConfig = themes[config.theme];
    if (themeConfig) {
      rendition.themes.register(config.theme, themeConfig);
      rendition.themes.select(config.theme);
    }
  }, [config]);

  // Sistema de sincronização moderno
  const performSync = useCallback(async () => {
    if (!syncState.enabled) return;

    setSyncState(prev => ({ ...prev, lastSync: new Date() }));
    setViewerState(prev => ({ ...prev, syncStatus: 'syncing' }));

    try {
      // Simulação de sincronização com Koodo Sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sync dados
      const syncData = {
        bookId: book.id,
        progress: viewerState.progress,
        currentPage: viewerState.currentPage,
        readingTime: viewerState.readingTime,
        annotations: [], // seria carregado das props
        highlights: [],
        bookmarks: [],
        timestamp: new Date().toISOString()
      };

      console.log('☁️ Dados sincronizados:', syncData);
      setViewerState(prev => ({ ...prev, syncStatus: 'synced' }));
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      setViewerState(prev => ({ ...prev, syncStatus: 'error' }));
    }
  }, [syncState.enabled, book.id, viewerState.progress, viewerState.currentPage, viewerState.readingTime]);

  // Navegação otimizada
  const navigateToPage = useCallback((pageNumber: number) => {
    const rendition = renditionRef.current;
    const epubBook = epubBookRef.current;
    
    if (!rendition || !epubBook || !epubBook.locations) return;

    try {
      const cfi = epubBook.locations.cfiFromLocation(pageNumber - 1);
      if (cfi) {
        rendition.display(cfi);
        setViewerState(prev => ({ ...prev, currentPage: pageNumber }));
      }
    } catch (error) {
      console.warn('⚠️ Erro na navegação:', error);
    }
  }, []);

  // Controles de gestos modernos
  const handleGesture = useCallback((gesture: string) => {
    if (!config.gesturesEnabled) return;

    switch (gesture) {
      case 'swipeLeft':
        navigateToPage(viewerState.currentPage + 1);
        break;
      case 'swipeRight':
        navigateToPage(viewerState.currentPage - 1);
        break;
      case 'doubleTap':
        setViewerState(prev => ({ ...prev, focusMode: !prev.focusMode }));
        break;
      case 'longPress':
        if (aiState.enabled) {
          // Ativar contexto AI
          setAiState(prev => ({ ...prev, context: 'Seleção de texto para AI' }));
        }
        break;
    }
  }, [config.gesturesEnabled, viewerState.currentPage, aiState.enabled, navigateToPage]);

  // Inicialização
  useEffect(() => {
    if (!book || !book.id) return;

    const fileUrl = book.filePath || `/books/${book.id}.${book.format}`;
    
    if (book.format === 'epub') {
      initializeModernEPUB(fileUrl);
    }
  }, [book, initializeModernEPUB]);

  // Timer de leitura
  useEffect(() => {
    const timer = setInterval(() => {
      setViewerState(prev => ({ ...prev, readingTime: prev.readingTime + 1 }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      cacheManager.clear();
      if (renditionRef.current) {
        try {
          renditionRef.current.destroy();
        } catch (error) {
          console.warn('⚠️ Erro no cleanup:', error);
        }
      }
      if (epubBookRef.current) {
        try {
          epubBookRef.current.destroy();
        } catch (error) {
          console.warn('⚠️ Erro no cleanup:', error);
        }
      }
    };
  }, [cacheManager]);

  return (
    <div className="modern-koodo-viewer h-screen w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Header moderno */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          {/* Controles esquerdos */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Voltar</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateToPage(viewerState.currentPage - 1)}
                disabled={viewerState.currentPage <= 1}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {viewerState.currentPage} / {viewerState.totalPages}
              </span>

              <button
                onClick={() => navigateToPage(viewerState.currentPage + 1)}
                disabled={viewerState.currentPage >= viewerState.totalPages}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Info central */}
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {book.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {book.author} • {Math.round(viewerState.progress)}% lido
            </p>
          </div>

          {/* Controles direitos */}
          <div className="flex items-center space-x-2">
            {/* Status de sincronização */}
            {syncState.enabled && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  viewerState.syncStatus === 'synced' ? 'bg-green-500' :
                  viewerState.syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                  viewerState.syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'
                }`} />
                <span className="text-xs text-gray-500">
                  {viewerState.syncStatus === 'synced' ? 'Sincronizado' :
                   viewerState.syncStatus === 'syncing' ? 'Sincronizando...' :
                   viewerState.syncStatus === 'error' ? 'Erro' : 'Aguardando'}
                </span>
              </div>
            )}

            {/* AI Status */}
            {aiState.enabled && (
              <button
                onClick={() => aiFeatures.askQuestion('Resumir este capítulo', 'contexto atual')}
                disabled={aiState.isProcessing}
                className="p-2 text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-purple-50"
                title="AI Assistant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
            )}

            {/* Configurações */}
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Área de conteúdo */}
      <div className="pt-20 pb-4 h-full">
        {viewerState.loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                {bufferState.isDownloading ? 
                  `Baixando... ${bufferState.downloadProgress}%` : 
                  'Carregando livro moderno...'}
              </p>
              {bufferState.isDownloading && (
                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${bufferState.downloadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}

        {viewerState.error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Erro ao carregar livro
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{viewerState.error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {!viewerState.loading && !viewerState.error && (
          <div 
            id="modern-page-area"
            className="h-full w-full max-w-4xl mx-auto px-4"
            style={{
              filter: viewerState.focusMode ? 'none' : undefined,
              transition: 'filter 0.3s ease'
            }}
          />
        )}
      </div>

      {/* Barra de progresso moderna */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
          style={{ width: `${viewerState.progress}%` }}
        />
      </div>

      {/* AI Panel (se ativo) */}
      {aiState.isProcessing && (
        <div className="absolute bottom-20 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">IA processando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernKoodoViewer; 