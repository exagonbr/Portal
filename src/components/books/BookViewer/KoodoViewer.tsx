'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Book } from '@/constants/mockData';
import { Document, Page, pdfjs } from 'react-pdf';
import { Annotation, Highlight, Bookmark } from './types';

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface KoodoViewerProps {
  book: Book;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onClose?: () => void;
}

// Configurações do leitor (como no koodo-reader)
interface ReaderSettings {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margin: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  readingMode: 'single' | 'double' | 'scroll';
  autoScroll: boolean;
  speechRate: number;
  speechVoice: string;
  highlightColor: string;
}

const defaultSettings: ReaderSettings = {
  theme: 'light',
  fontSize: 16,
  fontFamily: 'Arial',
  lineHeight: 1.5,
  margin: 20,
  textAlign: 'left',
  readingMode: 'single',
  autoScroll: false,
  speechRate: 1.0,
  speechVoice: '',
  highlightColor: '#ffff00'
};

export default function KoodoViewer({
  book,
  initialAnnotations = [],
  initialHighlights = [],
  initialBookmarks = [],
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd,
  onClose
}: KoodoViewerProps) {
  // Estados principais
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados da interface
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<'contents' | 'bookmarks' | 'annotations' | 'highlights'>('contents');
  const [activeRightTab, setActiveRightTab] = useState<'settings' | 'search' | 'info'>('settings');
  
  // Estados para funcionalidades
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Estados para TTS (Text-to-Speech)
  const [isReading, setIsReading] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Estados para configurações
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const viewerRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<HTMLDivElement>(null);
  
  // EPUB states (para EPUBs)
  const [epubBook, setEpubBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [toc, setToc] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  // Inicializar speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Carregar livro
  useEffect(() => {
    if (book.format === 'epub') {
      loadEpub();
    }
  }, [book]);

  // Carregar EPUB
  const loadEpub = async () => {
    try {
      setIsLoading(true);
      
      // Simular carregamento do EPUB
      const { default: ePub } = await import('epubjs');
      
      const bookInstance = ePub(book.filePath);
      setEpubBook(bookInstance);
      
      await bookInstance.ready;
      
      if (viewerRef.current) {
        const renditionInstance = bookInstance.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: settings.readingMode === 'double' ? 'auto' : 'none'
        });
        
        setRendition(renditionInstance);
        await renditionInstance.display();
        
        // Configurar tema
        applyTheme(renditionInstance);
        
        // Carregar sumário
        const navigation = await bookInstance.loaded.navigation;
        if (navigation && navigation.toc) {
          setToc(navigation.toc);
        }
        
        // Eventos
        renditionInstance.on('relocated', (location: any) => {
          setCurrentLocation(location);
        });
        
        renditionInstance.on('selected', (cfiRange: string, contents: any) => {
          const selection = contents.window.getSelection();
          if (selection && selection.toString()) {
            setSelectedText(selection.toString());
            setShowTextMenu(true);
          }
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao carregar EPUB:', err);
      setError('Erro ao carregar o livro EPUB');
      setIsLoading(false);
    }
  };

  // Aplicar tema
  const applyTheme = (renditionInstance?: any) => {
    const target = renditionInstance || rendition;
    if (!target) return;
    
    const themeStyles = {
      light: {
        body: { 
          background: '#ffffff', 
          color: '#000000',
          'font-size': `${settings.fontSize}px`,
          'font-family': settings.fontFamily,
          'line-height': settings.lineHeight,
          'text-align': settings.textAlign
        }
      },
      dark: {
        body: { 
          background: '#1a1a1a', 
          color: '#ffffff',
          'font-size': `${settings.fontSize}px`,
          'font-family': settings.fontFamily,
          'line-height': settings.lineHeight,
          'text-align': settings.textAlign
        }
      },
      sepia: {
        body: { 
          background: '#f4f1ea', 
          color: '#5c4b37',
          'font-size': `${settings.fontSize}px`,
          'font-family': settings.fontFamily,
          'line-height': settings.lineHeight,
          'text-align': settings.textAlign
        }
      }
    };
    
    target.themes.default(themeStyles[settings.theme]);
  };

  // Navegação
  const goToPage = (page: number) => {
    if (book.format === 'pdf') {
      setCurrentPage(Math.max(1, Math.min(page, numPages)));
    } else if (rendition) {
      rendition.display(`page-${page}`);
    }
  };

  const nextPage = () => {
    if (book.format === 'pdf') {
      goToPage(currentPage + 1);
    } else if (rendition) {
      rendition.next();
    }
  };

  const prevPage = () => {
    if (book.format === 'pdf') {
      goToPage(currentPage - 1);
    } else if (rendition) {
      rendition.prev();
    }
  };

  // Zoom
  const zoomIn = () => {
    if (book.format === 'pdf') {
      setScale(prev => Math.min(prev + 0.1, 3.0));
    } else if (settings.fontSize < 24) {
      updateSettings({ fontSize: settings.fontSize + 2 });
    }
  };

  const zoomOut = () => {
    if (book.format === 'pdf') {
      setScale(prev => Math.max(prev - 0.1, 0.5));
    } else if (settings.fontSize > 12) {
      updateSettings({ fontSize: settings.fontSize - 2 });
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Atualizar configurações
  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Aplicar mudanças imediatamente
    if (rendition) {
      applyTheme();
    }
  };

  // Text-to-Speech
  const startReading = () => {
    if (!speechSynthesis) return;
    
    const text = selectedText || getCurrentPageText();
    if (!text) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.speechRate;
    utterance.voice = speechSynthesis.getVoices().find(v => v.name === settings.speechVoice) || null;
    
    utterance.onend = () => {
      setIsReading(false);
      setCurrentUtterance(null);
    };
    
    setCurrentUtterance(utterance);
    setIsReading(true);
    speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    if (speechSynthesis && currentUtterance) {
      speechSynthesis.cancel();
      setIsReading(false);
      setCurrentUtterance(null);
    }
  };

  const getCurrentPageText = () => {
    // Implementar extração de texto da página atual
    return '';
  };

  // Anotações
  const addAnnotation = (content: string, position: { x: number; y: number }) => {
    const annotation: Annotation = {
      id: Date.now(),
      bookId: book.id,
      pageNumber: currentPage,
      content,
      position,
      createdAt: new Date().toISOString()
    };
    
    setAnnotations(prev => [...prev, annotation]);
    onAnnotationAdd?.(annotation);
  };

  // Destaques
  const addHighlight = (content: string, color: string = settings.highlightColor) => {
    const highlight: Highlight = {
      id: Date.now(),
      bookId: book.id,
      pageNumber: currentPage,
      content,
      color,
      createdAt: new Date().toISOString()
    };
    
    setHighlights(prev => [...prev, highlight]);
    onHighlightAdd?.(highlight);
  };

  // Marcadores
  const addBookmark = () => {
    const bookmark: Bookmark = {
      id: Date.now(),
      bookId: book.id,
      pageNumber: currentPage,
      title: `Página ${currentPage}`,
      createdAt: new Date().toISOString()
    };
    
    setBookmarks(prev => [...prev, bookmark]);
    onBookmarkAdd?.(bookmark);
  };

  // Busca
  const performSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Implementar busca no livro
    // Para PDF: usar pdf.js search
    // Para EPUB: usar epubjs search
    
    setSearchResults([]);
  };

  // Manipuladores de eventos
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
      const range = selection.getRangeAt(0);
      setSelectionRect(range.getBoundingClientRect());
      setShowTextMenu(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prevPage();
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'Escape') setShowTextMenu(false);
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      setRightPanelOpen(true);
      setActiveRightTab('search');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handleTextSelection);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);

  // Renderizar painel esquerdo
  const renderLeftPanel = () => (
    <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform z-40 ${
      leftPanelOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Navegação</h3>
          <button onClick={() => setLeftPanelOpen(false)} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex space-x-1 mt-3">
          {(['contents', 'bookmarks', 'annotations', 'highlights'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveLeftTab(tab)}
              className={`px-3 py-1 text-sm rounded ${
                activeLeftTab === tab ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              {tab === 'contents' && '📑'}
              {tab === 'bookmarks' && '🔖'}
              {tab === 'annotations' && '📝'}
              {tab === 'highlights' && '🎨'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto h-[calc(100%-120px)]">
        {activeLeftTab === 'contents' && (
          <div>
            {book.format === 'epub' && toc.length > 0 ? (
              <ul className="space-y-2">
                {toc.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => rendition?.display(item.href)}
                      className="text-left w-full p-2 hover:bg-gray-100 rounded"
                    >
                      <span className="text-sm">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-full text-left p-2 rounded hover:bg-gray-100 ${
                      currentPage === page ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="text-sm">Página {page}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeLeftTab === 'bookmarks' && (
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="p-3 border rounded hover:bg-gray-50">
                <button
                  onClick={() => goToPage(bookmark.pageNumber)}
                  className="text-left w-full"
                >
                  <div className="font-medium">{bookmark.title}</div>
                  <div className="text-sm text-gray-600">Página {bookmark.pageNumber}</div>
                </button>
              </div>
            ))}
          </div>
        )}
        
        {activeLeftTab === 'annotations' && (
          <div className="space-y-2">
            {annotations.map((annotation) => (
              <div key={annotation.id} className="p-3 border rounded">
                <div className="text-sm font-medium mb-1">Página {annotation.pageNumber}</div>
                <div className="text-sm text-gray-700">{annotation.content}</div>
              </div>
            ))}
          </div>
        )}
        
        {activeLeftTab === 'highlights' && (
          <div className="space-y-2">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="p-3 border rounded">
                <div className="text-sm font-medium mb-1">Página {highlight.pageNumber}</div>
                <div 
                  className="text-sm p-2 rounded"
                  style={{ backgroundColor: highlight.color + '40' }}
                >
                  {highlight.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar painel direito
  const renderRightPanel = () => (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform z-40 ${
      rightPanelOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Configurações</h3>
          <button onClick={() => setRightPanelOpen(false)} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex space-x-1 mt-3">
          {(['settings', 'search', 'info'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveRightTab(tab)}
              className={`px-3 py-1 text-sm rounded ${
                activeRightTab === tab ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              {tab === 'settings' && '⚙️'}
              {tab === 'search' && '🔍'}
              {tab === 'info' && 'ℹ️'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto h-[calc(100%-120px)]">
        {activeRightTab === 'settings' && (
          <div className="space-y-6">
            {/* Tema */}
            <div>
              <label className="block text-sm font-medium mb-2">Tema</label>
              <select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="sepia">Sépia</option>
              </select>
            </div>
            
            {/* Fonte */}
            <div>
              <label className="block text-sm font-medium mb-2">Tamanho da Fonte</label>
              <input
                type="range"
                min="12"
                max="24"
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{settings.fontSize}px</div>
            </div>
            
            {/* Família da fonte */}
            <div>
              <label className="block text-sm font-medium mb-2">Família da Fonte</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
              </select>
            </div>
            
            {/* Espaçamento entre linhas */}
            <div>
              <label className="block text-sm font-medium mb-2">Espaçamento</label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{settings.lineHeight}</div>
            </div>
            
            {/* Modo de leitura */}
            <div>
              <label className="block text-sm font-medium mb-2">Modo de Leitura</label>
              <select
                value={settings.readingMode}
                onChange={(e) => updateSettings({ readingMode: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="single">Página Única</option>
                <option value="double">Página Dupla</option>
                <option value="scroll">Rolagem</option>
              </select>
            </div>
            
            {/* TTS */}
            <div>
              <label className="block text-sm font-medium mb-2">Velocidade da Fala</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.speechRate}
                onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{settings.speechRate}x</div>
            </div>
          </div>
        )}
        
        {activeRightTab === 'search' && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar no livro..."
                value={searchQuery}
                onChange={(e) => performSearch(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              {searchResults.map((result, index) => (
                <div key={index} className="p-3 border rounded hover:bg-gray-50">
                  <div className="text-sm font-medium">Página {result.page}</div>
                  <div className="text-sm text-gray-700">{result.excerpt}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeRightTab === 'info' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Título</h4>
              <p className="text-sm text-gray-600">{book.title}</p>
            </div>
            <div>
              <h4 className="font-medium">Autor</h4>
              <p className="text-sm text-gray-600">{book.author}</p>
            </div>
            <div>
              <h4 className="font-medium">Formato</h4>
              <p className="text-sm text-gray-600">{book.format.toUpperCase()}</p>
            </div>
            <div>
              <h4 className="font-medium">Progresso</h4>
              <p className="text-sm text-gray-600">{book.progress || 0}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar menu de texto selecionado
  const renderTextMenu = () => {
    if (!showTextMenu || !selectionRect) return null;
    
    return (
      <div
        className="fixed bg-white shadow-lg rounded-lg p-2 z-50 flex space-x-2"
        style={{
          left: selectionRect.left,
          top: selectionRect.top - 50
        }}
      >
        <button
          onClick={() => addHighlight(selectedText)}
          className="p-2 hover:bg-yellow-100 rounded"
          title="Destacar"
        >
          🎨
        </button>
        <button
          onClick={() => {
            const content = prompt('Digite sua anotação:');
            if (content) {
              addAnnotation(content, { x: selectionRect.left, y: selectionRect.top });
            }
          }}
          className="p-2 hover:bg-blue-100 rounded"
          title="Anotar"
        >
          📝
        </button>
        <button
          onClick={startReading}
          className="p-2 hover:bg-green-100 rounded"
          title="Ler em voz alta"
        >
          🔊
        </button>
        <button
          onClick={() => setShowTextMenu(false)}
          className="p-2 hover:bg-gray-100 rounded"
          title="Fechar"
        >
          ✕
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando livro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar livro</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">{book.title}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button onClick={zoomOut} className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm text-gray-600 w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button onClick={addBookmark} className="p-2 hover:bg-gray-100 rounded">
            🔖
          </button>
          <button
            onClick={isReading ? stopReading : startReading}
            className="p-2 hover:bg-gray-100 rounded"
          >
            {isReading ? '⏸️' : '🔊'}
          </button>
          <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ⚙️
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div 
        ref={viewerRef}
        className="flex-1 overflow-hidden"
        style={{ height: 'calc(100vh - 80px)' }}
      >
        {book.format === 'pdf' ? (
          <div className="h-full flex items-center justify-center bg-gray-200">
            <Document
              file={book.filePath}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setIsLoading(false);
              }}
              onLoadError={(error) => {
                console.error('Erro ao carregar PDF:', error);
                setError('Erro ao carregar o arquivo PDF');
              }}
              className="max-w-full max-h-full"
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                className="shadow-lg"
              />
            </Document>
          </div>
        ) : (
          <div 
            className="h-full bg-white"
            style={{
              backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : 
                             settings.theme === 'sepia' ? '#f4f1ea' : '#ffffff'
            }}
          />
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-white border-t p-4 flex items-center justify-between">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Página {currentPage} de {numPages || '?'}
          </span>
          <input
            type="number"
            min="1"
            max={numPages}
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value))}
            className="w-16 px-2 py-1 border rounded text-center"
          />
        </div>
        
        <button
          onClick={nextPage}
          disabled={currentPage === numPages}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Panels */}
      {renderLeftPanel()}
      {renderRightPanel()}
      {renderTextMenu()}
      
      {/* Overlay */}
      {(leftPanelOpen || rightPanelOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => {
            setLeftPanelOpen(false);
            setRightPanelOpen(false);
          }}
        />
      )}
    </div>
  );
} 