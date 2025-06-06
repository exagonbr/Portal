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

// Ícones do Koodo Reader
import {
  BookOpenIcon,
  HeartIcon,
  StarIcon,
  PencilSquareIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  HomeIcon,
  ListBulletIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  Bars3Icon,
  Square2StackIcon,
  DocumentIcon,
  ClockIcon,
  LanguageIcon,
  PaintBrushIcon,
  SpeakerWaveIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

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
        background: #f9f9fa;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        position: relative;
      }
      
      .koodo-content {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: auto;
        transition: all 0.3s ease;
        background: #f9f9fa;
      }
      
      .koodo-content.nav-locked {
        margin-left: 280px;
      }
      
      .koodo-content.setting-locked {
        margin-right: 280px;
      }
      
      .koodo-page-container {
        max-width: 100%;
        max-height: 100%;
        margin: 0 auto;
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.05);
        border: 1px solid #e8e8e8;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      #page-area {
        width: 100%;
        height: 100%;
        min-height: 500px;
        min-width: 300px;
        background: white;
        border-radius: 0;
        box-shadow: none;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        margin: 0 auto;
        contain: layout style;
        will-change: auto;
        transform: translateZ(0);
      }
      
      /* Menu lateral esquerdo - Navegação */
      .koodo-nav-panel {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 280px;
        background: #fff;
        box-shadow: 2px 0 8px rgba(0,0,0,0.08);
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1001;
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      .koodo-nav-panel.active {
        transform: translateX(0);
      }
      
      /* Menu lateral direito - Configurações */
      .koodo-setting-panel {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 280px;
        background: #fff;
        box-shadow: -2px 0 8px rgba(0,0,0,0.08);
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1001;
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      .koodo-setting-panel.active {
        transform: translateX(0);
      }
      
      /* Estilos dos painéis */
      .koodo-panel-header {
        height: 60px;
        padding: 0 24px;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fafafa;
      }
      
      .koodo-panel-header span {
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }
      
      .koodo-panel-section {
        padding: 20px 24px;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .koodo-panel-section-title {
        font-size: 12px;
        font-weight: 600;
        color: #999;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }
      
      .koodo-panel-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 8px;
        margin: 4px -16px;
        position: relative;
      }
      
      .koodo-panel-item:hover {
        background: #f5f5f5;
      }
      
      .koodo-panel-item.active {
        background: #e8f4fd;
        color: #1890ff;
      }
      
      .koodo-panel-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: #1890ff;
        border-radius: 0 2px 2px 0;
      }
      
      .koodo-panel-item-icon {
        width: 20px;
        height: 20px;
        margin-right: 16px;
        opacity: 0.6;
      }
      
      .koodo-panel-item.active .koodo-panel-item-icon {
        opacity: 1;
        color: #1890ff;
      }
      
      .koodo-panel-item-text {
        flex: 1;
        font-size: 14px;
        font-weight: 400;
      }
      
      .koodo-panel-item-badge {
        background: #f0f0f0;
        color: #666;
        font-size: 12px;
        padding: 2px 10px;
        border-radius: 10px;
        margin-left: 8px;
        font-weight: 500;
      }
      
      /* Controles de configuração */
      .koodo-setting-control {
        margin: 12px 0;
      }
      
      .koodo-setting-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      .koodo-slider {
        width: 100%;
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        outline: none;
        -webkit-appearance: none;
      }
      
      .koodo-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        background: #4285f4;
        border-radius: 50%;
        cursor: pointer;
      }
      
      .koodo-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        cursor: pointer;
      }
      
      .koodo-color-picker {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .koodo-color-option {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s;
      }
      
      .koodo-color-option:hover {
        transform: scale(1.1);
      }
      
      .koodo-color-option.selected {
        border-color: #4285f4;
        box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
      }
      
      /* Overlay */
      .koodo-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      
      .koodo-overlay.active {
        opacity: 1;
        visibility: visible;
      }
      
      /* Tema escuro */
      .dark .koodo-nav-panel,
      .dark .koodo-setting-panel {
        background: #1a1a1a;
        border-color: #333;
      }
      
      .dark .koodo-panel-header,
      .dark .koodo-panel-section {
        border-color: #333;
      }
      
      .dark .koodo-panel-item:hover {
        background: #2a2a2a;
      }
      
      .dark .koodo-panel-item.active {
        background: #1e3a5f;
        color: #64b5f6;
      }
      
      .dark .koodo-select {
        background: #2a2a2a;
        border-color: #444;
        color: #e0e0e0;
      }
      
      .dark .koodo-slider {
        background: #444;
      }
      
      .koodo-controls {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: #fff;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      }
      
      .koodo-progress {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: #f0f0f0;
        z-index: 999;
      }
      
      .koodo-progress-bar {
        height: 100%;
        background: #1890ff;
        transition: width 0.3s ease;
        box-shadow: 0 0 4px rgba(24, 144, 255, 0.4);
      }
      
      .koodo-btn {
        padding: 8px 16px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-weight: 400;
        color: #333;
      }
      
      .koodo-btn:hover {
        background: #f5f5f5;
        border-color: #d0d0d0;
      }
      
      .koodo-btn.primary {
        background: #1890ff;
        color: white;
        border-color: #1890ff;
      }
      
      .koodo-btn.primary:hover {
        background: #40a9ff;
        border-color: #40a9ff;
      }
      
      .koodo-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      
      .koodo-btn.icon-only {
        padding: 8px;
        width: 36px;
        height: 36px;
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

  // Estados para os menus laterais
  const [isNavPanelOpen, setIsNavPanelOpen] = useState(false);
  const [isSettingPanelOpen, setIsSettingPanelOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('contents');
  const [activeSettingTab, setActiveSettingTab] = useState('reading');
  
  // Estados de configuração adicionais
  const [fontSize, setFontSize] = useState(100);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [fontFamily, setFontFamily] = useState('default');
  const [textAlign, setTextAlign] = useState('left');
  const [margin, setMargin] = useState(20);
  const [highlightColor, setHighlightColor] = useState('#ffeb3b');

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

  // Função para verificar se o DOM está completamente pronto
  const isDOMReady = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const checkDOM = () => {
        // Verificar se document está disponível
        if (typeof document === 'undefined') {
          setTimeout(checkDOM, 100);
          return;
        }

        // Verificar se o elemento page-area existe e está visível
        const pageArea = document.getElementById('page-area');
        if (!pageArea) {
          setTimeout(checkDOM, 100);
          return;
        }

        // Verificar se o elemento tem dimensões válidas
        const rect = pageArea.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          setTimeout(checkDOM, 100);
          return;
        }

        // Verificar se getComputedStyle está disponível
        if (!window.getComputedStyle) {
          setTimeout(checkDOM, 100);
          return;
        }

        // Testar getComputedStyle no elemento
        try {
          const computedStyle = window.getComputedStyle(pageArea);
          if (!computedStyle) {
            setTimeout(checkDOM, 100);
            return;
          }
        } catch (error) {
          console.warn('⚠️ getComputedStyle não disponível ainda:', error);
          setTimeout(checkDOM, 100);
          return;
        }

        console.log('✅ DOM completamente pronto para EPUB.js');
        resolve(true);
      };

      checkDOM();
    });
  }, []);

  // Função para aguardar elemento estar estável
  const waitForElementStability = useCallback(async (elementId: string, timeout = 5000): Promise<HTMLElement> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let lastRect: DOMRect | null = null;
      let stableCount = 0;
      const requiredStableChecks = 3;

      const checkStability = () => {
        const element = document.getElementById(elementId);
        
        if (!element) {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Elemento ${elementId} não encontrado após ${timeout}ms`));
            return;
          }
          setTimeout(checkStability, 100);
          return;
        }

        const rect = element.getBoundingClientRect();
        
        // Verificar se as dimensões são válidas
        if (rect.width === 0 || rect.height === 0) {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Elemento ${elementId} sem dimensões válidas após ${timeout}ms`));
            return;
          }
          setTimeout(checkStability, 100);
          return;
        }

        // Verificar estabilidade das dimensões
        if (lastRect && 
            Math.abs(rect.width - lastRect.width) < 1 && 
            Math.abs(rect.height - lastRect.height) < 1) {
          stableCount++;
        } else {
          stableCount = 0;
        }

        lastRect = rect;

        if (stableCount >= requiredStableChecks) {
          console.log(`✅ Elemento ${elementId} estável:`, {
            width: rect.width,
            height: rect.height,
            checks: stableCount
          });
          resolve(element);
        } else {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Elemento ${elementId} não estabilizou após ${timeout}ms`));
            return;
          }
          setTimeout(checkStability, 100);
        }
      };

      checkStability();
    });
  }, []);

  // Sistema de retry inteligente para EPUB.js
  const retryWithDifferentStrategy = useCallback(async (fileUrl: string, buffer: ArrayBuffer, pageAreaElement: HTMLElement, attempt = 1): Promise<EpubBook> => {
    const maxAttempts = 3;
    
    console.log(`🔄 Tentativa ${attempt}/${maxAttempts} de inicialização EPUB`);
    logEpubState('RETRY_ATTEMPT', { attempt, maxAttempts });
    
    // Aguardar DOM estar completamente estável antes de cada tentativa
    console.log('⏳ Aguardando DOM estar completamente estável...');
    await isDOMReady();
    await waitForElementStability('page-area', 10000);
    
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
  }, [createEpubBlob, logEpubState, isDOMReady, waitForElementStability]);

  // Função para garantir que o elemento page-area existe e está pronto
  const ensurePageAreaElement = useCallback(async (): Promise<HTMLElement> => {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // 5 segundos
      let attempts = 0;

      const checkElement = () => {
        attempts++;
        
        let pageArea = document.getElementById('page-area');
        
        // Se não existe, tentar criar
        if (!pageArea) {
          console.log('🔧 Elemento page-area não encontrado, criando...');
          
          const container = document.querySelector('.koodo-content');
          if (container) {
            pageArea = document.createElement('div');
            pageArea.id = 'page-area';
            pageArea.style.cssText = `
              width: 90%;
              height: 90%;
              max-width: 800px;
              max-height: 90vh;
              min-width: 300px;
              min-height: 400px;
              margin: 0 auto;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
              contain: layout style;
              will-change: auto;
              transform: translateZ(0);
            `;
            container.appendChild(pageArea);
            console.log('✅ Elemento page-area criado dinamicamente');
          }
        }

        if (pageArea) {
          // Verificar se tem dimensões válidas
          const rect = pageArea.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            console.log('✅ Elemento page-area válido:', {
              width: rect.width,
              height: rect.height,
              attempts
            });
            resolve(pageArea);
            return;
          }
        }

        if (attempts >= maxAttempts) {
          reject(new Error(`Elemento page-area não pôde ser criado após ${maxAttempts} tentativas`));
          return;
        }

        setTimeout(checkElement, 100);
      };

      checkElement();
    });
  }, []);

  // Inicialização do EPUB com ArrayBuffer ROBUSTA
  const initializeEPUB = useCallback(async (fileUrl: string) => {
    if (isInitializing) {
      console.warn('⚠️ Inicialização já em progresso, ignorando duplicata');
      return;
    }

    console.log('🔄 Inicializando EPUB com validação DOM robusta:', fileUrl);
    setIsInitializing(true);
    setState(prev => ({ ...prev, loading: true, error: null }));
    logEpubState('INICIANDO', { fileUrl });

    let pageAreaElement: HTMLElement | null = null;
    let buffer: ArrayBuffer | null = null;

    try {
      // ETAPA 1: VERIFICAR DOM BÁSICO
      console.log('🔍 Verificando disponibilidade do DOM...');
      await isDOMReady();
      logEpubState('DOM_BASIC_READY');

      // ETAPA 2: AGUARDAR ELEMENTO ESTAR ESTÁVEL
      console.log('⏳ Aguardando elemento page-area estar estável...');
      pageAreaElement = await waitForElementStability('page-area', 15000);
      logEpubState('DOM_ELEMENT_STABLE', { 
        width: pageAreaElement.getBoundingClientRect().width,
        height: pageAreaElement.getBoundingClientRect().height 
      });

      // ETAPA 3: VERIFICAÇÕES ADICIONAIS DE SEGURANÇA
      console.log('🔒 Executando verificações finais de segurança...');
      
      // Verificar se o elemento ainda está no DOM
      if (!document.contains(pageAreaElement)) {
        throw new Error('Elemento page-area removido do DOM durante inicialização');
      }

      // Verificar se window.getComputedStyle está funcionando
      try {
        const testStyle = window.getComputedStyle(pageAreaElement);
        if (!testStyle) {
          throw new Error('getComputedStyle retornou null');
        }
        console.log('✅ getComputedStyle funcionando corretamente');
      } catch (styleError) {
        throw new Error(`getComputedStyle não disponível: ${styleError}`);
      }

      // Verificar se o elemento é visível
      const rect = pageAreaElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        throw new Error('Elemento page-area não tem dimensões válidas');
      }

      logEpubState('SAFETY_CHECKS_PASSED');

      // ETAPA 4: CLEANUP SEGURO
      await performCleanup();
      await new Promise(resolve => setTimeout(resolve, 200));
      logEpubState('CLEANUP_COMPLETE');

      // ETAPA 5: CARREGAR E VALIDAR ARQUIVO
      try {
        buffer = await loadFileAsBuffer(fileUrl);
        logEpubState('BUFFER_LOADED', { size: buffer.byteLength });
        
        if (!validateEpubBuffer(buffer)) {
          throw new Error('Buffer EPUB inválido ou corrompido');
        }
        logEpubState('BUFFER_VALIDATED');

        console.log('📚 Buffer EPUB validado, usando sistema de retry estável...');

        // ETAPA 6: USAR SISTEMA DE RETRY COM DOM ESTÁVEL
        const readyBook = await retryWithDifferentStrategy(fileUrl, buffer, pageAreaElement);
        console.log('✅ EPUB carregado com sucesso via retry system');
        logEpubState('BOOK_READY', { hasSpine: !!readyBook.spine });

        setEpubBook(readyBook);
        await new Promise(resolve => setTimeout(resolve, 100));

        // ETAPA 7: CRIAR RENDITION COM VERIFICAÇÕES EXTRAS
        const dimensions = KoodoUtils.getPageWidth(
          state.readerMode,
          state.scale,
          20,
          false,
          false
        );

        console.log('🎨 Criando rendition com DOM estável...');

        // Verificar novamente se o elemento ainda é válido
        if (!document.contains(pageAreaElement)) {
          throw new Error('Elemento page-area foi removido durante o processo');
        }

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

        console.log('✅ Rendition criado com DOM estável');
        logEpubState('RENDITION_CREATED');

        // ETAPA 8: DISPLAY COM PROTEÇÃO DOM
        console.log('🎨 Fazendo display com proteção DOM...');
        
        const displayPromise = Promise.race([
          newRendition.display().then(() => {
            console.log('✅ Display completado com DOM estável!');
            logEpubState('DISPLAY_COMPLETE');
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: Display não completou em 15 segundos')), 15000)
          )
        ]);

        await displayPromise;
        setRendition(newRendition);
        logEpubState('RENDITION_SET');

        // Event listeners com proteção DOM
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
          console.log('🎨 EPUB renderizado com DOM estável');
          try {
            handleLocation();
            setState(prev => ({ ...prev, loading: false }));
            
            const pageArea = document.getElementById('page-area');
            if (pageArea) {
              pageArea.style.display = 'block';
            }
            
            console.log('✅ EPUB inicializado com sucesso e DOM estável!');
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
        if (error.message.includes('getComputedStyle')) {
          errorMessage = 'Erro de renderização. Tente recarregar a página.';
        } else if (error.message.includes('DOM') || error.message.includes('elemento')) {
          errorMessage = 'Erro de interface. Recarregue a página e tente novamente.';
        } else if (error.message.includes('resources')) {
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
  }, [state.readerMode, state.scale, handleLocation, performCleanup, isInitializing, loadFileAsBuffer, validateEpubBuffer, createEpubBlob, retryWithDifferentStrategy, logEpubState, isDOMReady, waitForElementStability]);

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

  // Inicialização principal melhorada (copiado do koodo-reader)
  useEffect(() => {
    if (!book || !book.id) return;

    const initializeBook = async () => {
      try {
        const fileUrl = getFileUrl();
        if (!fileUrl) {
          throw new Error('URL do arquivo não pode ser determinada');
        }

        // Aguardar mais tempo para garantir que o componente esteja completamente montado
        await new Promise(resolve => setTimeout(resolve, 500));

        // Garantir que o elemento page-area existe para EPUB
        if (book.format === 'epub') {
          console.log('🔧 Garantindo elemento page-area para EPUB...');
          await ensurePageAreaElement();
        }

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
  }, [book?.id, book?.format, getFileUrl, initializeEPUB, initializePDF, ensurePageAreaElement]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Menu de navegação */}
          <button
            onClick={() => setIsNavPanelOpen(!isNavPanelOpen)}
            className="koodo-btn icon-only"
            title="Menu de navegação"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          
          {/* Voltar */}
          {onBack && (
            <button onClick={onBack} className="koodo-btn" title="Voltar para biblioteca">
              <HomeIcon className="w-4 h-4" />
              <span>Biblioteca</span>
            </button>
          )}
          
          <div style={{ width: '1px', height: '24px', background: '#e0e0e0', margin: '0 8px' }} />
          
          {/* Navegação de páginas */}
          <button
            onClick={() => handlePageChange(state.currentPage - 1)}
            disabled={state.currentPage <= 1}
            className="koodo-btn icon-only"
            title="Página anterior"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              value={state.currentPage}
              onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
              className="koodo-input"
              min={1}
              max={state.totalPages}
              style={{ width: '60px' }}
            />
            <span style={{ color: '#666', fontSize: '14px' }}>/ {state.totalPages}</span>
          </div>
          
          <button
            onClick={() => handlePageChange(state.currentPage + 1)}
            disabled={state.currentPage >= state.totalPages}
            className="koodo-btn icon-only"
            title="Próxima página"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Centro - Informações do livro */}
        <div style={{ 
          textAlign: 'center', 
          flex: 1,
          overflow: 'hidden',
          padding: '0 20px'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '500',
            color: '#333',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {book.title}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#666',
            marginTop: '2px'
          }}>
            {book.author} • {formatReadingTime} de leitura
          </div>
        </div>

        {/* Lado direito - Controles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
            <button
              onClick={() => handleScaleChange(state.scale - 0.1)}
              className="koodo-btn icon-only"
              title="Diminuir zoom"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <span style={{ 
              minWidth: '50px', 
              textAlign: 'center',
              fontSize: '13px',
              color: '#666'
            }}>
              {Math.round(state.scale * 100)}%
            </span>
            <button
              onClick={() => handleScaleChange(state.scale + 0.1)}
              className="koodo-btn icon-only"
              title="Aumentar zoom"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          <div style={{ width: '1px', height: '24px', background: '#e0e0e0' }} />

          {/* Modo de leitura */}
          <button
            onClick={handleReaderModeToggle}
            className="koodo-btn icon-only"
            title={`Modo: ${state.readerMode === 'single' ? 'Página única' : state.readerMode === 'double' ? 'Página dupla' : 'Rolagem'}`}
          >
            {state.readerMode === 'single' ? (
              <DocumentIcon className="w-5 h-5" />
            ) : state.readerMode === 'double' ? (
              <Square2StackIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>

          {/* Tema */}
          <button
            onClick={handleThemeToggle}
            className="koodo-btn icon-only"
            title={state.isDarkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {state.isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          {/* Tela cheia */}
          <button
            onClick={handleFullscreenToggle}
            className="koodo-btn icon-only"
            title={state.isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {state.isFullscreen ? (
              <ArrowsPointingInIcon className="w-5 h-5" />
            ) : (
              <ArrowsPointingOutIcon className="w-5 h-5" />
            )}
          </button>

          {/* Configurações */}
          <button
            onClick={() => setIsSettingPanelOpen(!isSettingPanelOpen)}
            className="koodo-btn icon-only"
            title="Configurações"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Área de conteúdo (copiado do koodo-reader) */}
      <div 
        className={`koodo-content ${isNavPanelOpen ? 'nav-locked' : ''} ${isSettingPanelOpen ? 'setting-locked' : ''}`}
        style={{ paddingTop: '60px', paddingBottom: '4px' }}
      >
        {/* Elemento page-area sempre presente para EPUB (mesmo durante loading) */}
        {book.format === 'epub' && (
          <div 
            id="page-area"
            style={{
              width: '90%',
              height: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              minWidth: '300px',
              minHeight: '400px',
              margin: '0 auto',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              position: 'relative',
              display: state.loading ? 'none' : 'block',
              overflow: 'hidden',
              // Proteções para getComputedStyle
              boxSizing: 'border-box',
              visibility: state.loading ? 'hidden' : 'visible',
              opacity: state.loading ? 0 : 1,
              transition: 'opacity 0.3s ease'
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

      {/* Overlay */}
      {(isNavPanelOpen || isSettingPanelOpen) && (
        <div 
          className={`koodo-overlay ${isNavPanelOpen || isSettingPanelOpen ? 'active' : ''}`}
          onClick={() => {
            setIsNavPanelOpen(false);
            setIsSettingPanelOpen(false);
          }}
        />
      )}

      {/* Menu lateral esquerdo - Navegação */}
      <div className={`koodo-nav-panel ${isNavPanelOpen ? 'active' : ''}`}>
        <div className="koodo-panel-header">
          <span>Navegação</span>
          <button 
            onClick={() => setIsNavPanelOpen(false)} 
            className="koodo-btn icon-only"
            style={{ border: 'none', background: 'transparent' }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo/Capítulos */}
        <div className="koodo-panel-section">
          <div className="koodo-panel-section-title">Conteúdo</div>
          <div
            className={`koodo-panel-item ${activeNavItem === 'contents' ? 'active' : ''}`}
            onClick={() => setActiveNavItem('contents')}
          >
            <ListBulletIcon className="koodo-panel-item-icon" />
            <span className="koodo-panel-item-text">Capítulos</span>
          </div>
        </div>

        {/* Marcadores */}
        <div className="koodo-panel-section">
          <div className="koodo-panel-section-title">Marcadores</div>
          <div
            className={`koodo-panel-item ${activeNavItem === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveNavItem('bookmarks')}
          >
            <BookmarkIcon className="koodo-panel-item-icon" />
            <span className="koodo-panel-item-text">Meus Marcadores</span>
            <span className="koodo-panel-item-badge">{initialBookmarks.length}</span>
          </div>
        </div>

        {/* Destaques */}
        <div className="koodo-panel-section">
          <div className="koodo-panel-section-title">Destaques</div>
          <div
            className={`koodo-panel-item ${activeNavItem === 'highlights' ? 'active' : ''}`}
            onClick={() => setActiveNavItem('highlights')}
          >
            <StarIcon className="koodo-panel-item-icon" />
            <span className="koodo-panel-item-text">Meus Destaques</span>
            <span className="koodo-panel-item-badge">{initialHighlights.length}</span>
          </div>
        </div>

        {/* Anotações */}
        <div className="koodo-panel-section">
          <div className="koodo-panel-section-title">Anotações</div>
          <div
            className={`koodo-panel-item ${activeNavItem === 'annotations' ? 'active' : ''}`}
            onClick={() => setActiveNavItem('annotations')}
          >
            <PencilSquareIcon className="koodo-panel-item-icon" />
            <span className="koodo-panel-item-text">Minhas Anotações</span>
            <span className="koodo-panel-item-badge">{initialAnnotations.length}</span>
          </div>
        </div>

        {/* Lista de itens baseada na seleção */}
        {activeNavItem === 'highlights' && initialHighlights.length > 0 && (
          <div className="koodo-panel-section">
            {initialHighlights.map((highlight, index) => (
              <div key={highlight.id} className="koodo-panel-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Página {highlight.pageNumber}
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  "{highlight.content.substring(0, 50)}..."
                </div>
              </div>
            ))}
          </div>
        )}

        {activeNavItem === 'annotations' && initialAnnotations.length > 0 && (
          <div className="koodo-panel-section">
            {initialAnnotations.map((annotation, index) => (
              <div key={annotation.id} className="koodo-panel-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Página {annotation.pageNumber}
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  {annotation.content.substring(0, 50)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu lateral direito - Configurações */}
      <div className={`koodo-setting-panel ${isSettingPanelOpen ? 'active' : ''}`}>
        <div className="koodo-panel-header">
          <span>Configurações</span>
          <button 
            onClick={() => setIsSettingPanelOpen(false)} 
            className="koodo-btn icon-only"
            style={{ border: 'none', background: 'transparent' }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de configuração */}
        <div className="koodo-panel-section" style={{ display: 'flex', gap: '8px', padding: '12px 20px' }}>
          <button
            className={`koodo-btn ${activeSettingTab === 'reading' ? 'primary' : ''}`}
            onClick={() => setActiveSettingTab('reading')}
            style={{ flex: 1, fontSize: '13px' }}
          >
            Leitura
          </button>
          <button
            className={`koodo-btn ${activeSettingTab === 'theme' ? 'primary' : ''}`}
            onClick={() => setActiveSettingTab('theme')}
            style={{ flex: 1, fontSize: '13px' }}
          >
            Tema
          </button>
          <button
            className={`koodo-btn ${activeSettingTab === 'more' ? 'primary' : ''}`}
            onClick={() => setActiveSettingTab('more')}
            style={{ flex: 1, fontSize: '13px' }}
          >
            Mais
          </button>
        </div>

        {/* Configurações de Leitura */}
        {activeSettingTab === 'reading' && (
          <>
            <div className="koodo-panel-section">
              <div className="koodo-setting-control">
                <div className="koodo-setting-label">
                  <span>Tamanho da Fonte</span>
                  <span>{fontSize}%</span>
                </div>
                <input
                  type="range"
                  className="koodo-slider"
                  min="50"
                  max="200"
                  value={fontSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    setFontSize(newSize);
                    if (rendition) {
                      rendition.themes.fontSize(`${newSize}%`);
                    }
                  }}
                />
              </div>

              <div className="koodo-setting-control">
                <div className="koodo-setting-label">
                  <span>Altura da Linha</span>
                  <span>{lineHeight}</span>
                </div>
                <input
                  type="range"
                  className="koodo-slider"
                  min="1"
                  max="3"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => {
                    const newHeight = parseFloat(e.target.value);
                    setLineHeight(newHeight);
                    if (rendition) {
                      rendition.themes.default({ 'line-height': `${newHeight} !important` });
                    }
                  }}
                />
              </div>

              <div className="koodo-setting-control">
                <div className="koodo-setting-label">
                  <span>Margem</span>
                  <span>{margin}px</span>
                </div>
                <input
                  type="range"
                  className="koodo-slider"
                  min="0"
                  max="100"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                />
              </div>

              <div className="koodo-setting-control">
                <div className="koodo-setting-label">
                  <span>Fonte</span>
                </div>
                <select
                  className="koodo-select"
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    if (rendition) {
                      rendition.themes.font(e.target.value);
                    }
                  }}
                >
                  <option value="default">Padrão</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>

              <div className="koodo-setting-control">
                <div className="koodo-setting-label">
                  <span>Alinhamento</span>
                </div>
                <select
                  className="koodo-select"
                  value={textAlign}
                  onChange={(e) => {
                    setTextAlign(e.target.value);
                    if (rendition) {
                      rendition.themes.default({ 'text-align': `${e.target.value} !important` });
                    }
                  }}
                >
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                  <option value="justify">Justificado</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Configurações de Tema */}
        {activeSettingTab === 'theme' && (
          <div className="koodo-panel-section">
            <div className="koodo-setting-control">
              <div className="koodo-setting-label">
                <span>Cor de Destaque</span>
              </div>
              <div className="koodo-color-picker">
                {['#ffeb3b', '#4caf50', '#2196f3', '#ff5722', '#9c27b0', '#00bcd4'].map(color => (
                  <div
                    key={color}
                    className={`koodo-color-option ${highlightColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setHighlightColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="koodo-panel-item" onClick={handleThemeToggle}>
              {state.isDarkMode ? <MoonIcon className="koodo-panel-item-icon" /> : <SunIcon className="koodo-panel-item-icon" />}
              <span className="koodo-panel-item-text">Modo {state.isDarkMode ? 'Escuro' : 'Claro'}</span>
            </div>
          </div>
        )}

        {/* Mais Opções */}
        {activeSettingTab === 'more' && (
          <div className="koodo-panel-section">
            <div className="koodo-panel-item">
              <ArrowDownTrayIcon className="koodo-panel-item-icon" />
              <span className="koodo-panel-item-text">Baixar Livro</span>
            </div>
            <div className="koodo-panel-item">
              <ShareIcon className="koodo-panel-item-icon" />
              <span className="koodo-panel-item-text">Compartilhar</span>
            </div>
            <div className="koodo-panel-item">
              <InformationCircleIcon className="koodo-panel-item-icon" />
              <span className="koodo-panel-item-text">Informações do Livro</span>
            </div>
          </div>
        )}
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