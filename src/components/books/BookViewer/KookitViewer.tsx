'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize,
  List,
  Bookmark,
  Settings,
  Search,
  X,
  BookOpen,
  Highlighter,
  MessageCircle,
  Volume2,
  Globe,
} from 'lucide-react';
import { Book } from '@/constants/mockData';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';
import { EnhancedErrorState } from '@/components/ui/LoadingStates';

interface KookitViewerProps {
  book: Book | {
    id: string;
    title: string;
    author?: string;
    format: string;
    filePath: string;
  };
  onClose?: () => void;
}

const KookitViewer: React.FC<KookitViewerProps> = ({ book, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pageAreaRef = useRef<HTMLDivElement>(null);
  
  // Estado para acompanhar o objeto Kookit
  const kookitRef = useRef<any>(null);
  
  // Estado para seleção de texto
  const [selectedText, setSelectedText] = useState('');
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'green' | 'blue'>('yellow');

  const smartRefresh = useSmartRefresh({
    maxAttempts: 3,
    retryDelay: 2000,
    fallbackUrl: '/portal/books',
    onSuccess: () => {
      setError(null);
      setIsLoading(true);
    },
    onError: (error) => {
      console.error('Erro no refresh inteligente:', error);
    },
    onMaxAttemptsReached: () => {
      setError('Não foi possível recarregar o livro após várias tentativas. Tente novamente mais tarde.');
    }
  });

  const initializeKookit = async () => {
    try {
      setIsLoading(true);
      
      // Determinar a URL do livro
      let fileUrl = book.filePath;
      
      // Verificar se a URL é externa ou se precisamos usar o cloudfront
      if (!fileUrl.startsWith('http')) {
        fileUrl = `https://d1hxtyafwtqtm4.cloudfront.net/upload/${fileUrl}`;
      }
      
      // Verificar se estamos lidando com uma URL para lib.sabercon.com.br
      if (fileUrl.includes('lib.sabercon.com.br') && fileUrl.includes('#/pdf/')) {
        // Extrair o ID do PDF da URL
        const pdfId = fileUrl.split('/pdf/')[1].split('?')[0];
        fileUrl = `https://d1hxtyafwtqtm4.cloudfront.net/upload/${pdfId}`;
      }
      
      console.log(`Carregando livro de: ${fileUrl}`);
      
      // Identificar o tipo de renderizador correto
      let renderer;
      switch (book.format.toLowerCase()) {
        case 'epub':
          renderer = new (window as any).Kookit.EpubRender(
            { load: () => fileUrl },
            { spread: 'auto' },
            { flow: 'paginated' }
          );
          break;
        case 'pdf':
          // Carregar PDF usando Kookit
          renderer = new (window as any).Kookit.CacheRender(
            { load: () => fileUrl },
            { spread: 'auto' },
            { flow: 'paginated' }
          );
          break;
        case 'mobi':
          renderer = new (window as any).Kookit.MobiRender(
            { load: () => fileUrl },
            { spread: 'auto' },
            { flow: 'paginated' }
          );
          break;
        default:
          throw new Error(`Formato não suportado: ${book.format}`);
      }
      
      // Guardar referência
      kookitRef.current = renderer;
      
      // Renderizar no elemento page-area
      if (pageAreaRef.current) {
        await renderer.renderTo(pageAreaRef.current);
        
        // Adicionar listeners para eventos
        renderer.on('relocated', (location: any) => {
          if (location && location.start) {
            setCurrentPage(location.start.index + 1);
            setTotalPages(location.total || 1);
          }
        });
        
        renderer.on('rendered', () => {
          setIsLoading(false);
          console.log('Livro renderizado com sucesso!');
          
          // Configurar o handler para seleção de texto
          if (pageAreaRef.current) {
            setupTextSelectionHandlers(pageAreaRef.current);
          }
        });
        
        renderer.on('error', (error: any) => {
          console.error('Erro ao renderizar:', error);
          setError('Erro ao renderizar o livro');
          setIsLoading(false);
        });
      }
    } catch (err) {
      console.error('Erro ao inicializar Kookit:', err);
      setError(`Falha ao inicializar o visualizador: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Verificar se a biblioteca Kookit está disponível no escopo global
    if (typeof window !== 'undefined' && (window as any).Kookit) {
      initializeKookit();
    } else {
      // Carregar script se não estiver disponível
      const script = document.createElement('script');
      script.src = '/kookit/kookit.min.js';
      script.async = true;
      script.onload = initializeKookit;
      script.onerror = () => setError('Falha ao carregar a biblioteca Kookit');
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);
  
  // Configurar handlers para seleção de texto
  const setupTextSelectionHandlers = (container: HTMLElement) => {
    if (!container) return;
    
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 0) {
        setSelectedText(text);
        
        // Posicionar o menu próximo à seleção
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          setMenuPosition({
            x: rect.left + (rect.width / 2),
            y: rect.bottom + 10
          });
          
          setShowTextMenu(true);
        }
      } else {
        setShowTextMenu(false);
      }
    };
    
    // Adicionar listener para capturar seleção de texto
    container.addEventListener('mouseup', handleSelection);
    
    // Adicionar listener para clicks fora do menu
    document.addEventListener('mousedown', (e) => {
      const target = e.target as Node;
      const menu = document.getElementById('text-selection-menu');
      
      if (menu && !menu.contains(target)) {
        setShowTextMenu(false);
      }
    });
  };
  
  const goToPage = (page: number) => {
    if (kookitRef.current && page >= 1 && page <= totalPages) {
      try {
        kookitRef.current.goToPosition({ index: page - 1 });
        setCurrentPage(page);
      } catch (err) {
        console.error('Erro ao navegar:', err);
      }
    }
  };
  
  const nextPage = () => {
    if (kookitRef.current) {
      try {
        kookitRef.current.next();
      } catch (err) {
        console.error('Erro ao avançar página:', err);
      }
    }
  };
  
  const prevPage = () => {
    if (kookitRef.current) {
      try {
        kookitRef.current.prev();
      } catch (err) {
        console.error('Erro ao retroceder página:', err);
      }
    }
  };
  
  const changeZoom = (delta: number) => {
    const newZoom = zoom + delta;
    if (newZoom >= 50 && newZoom <= 200) {
      setZoom(newZoom);
      
      // Aplicar zoom no conteúdo
      if (pageAreaRef.current) {
        const iframe = pageAreaRef.current.querySelector('iframe');
        if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
          iframe.contentDocument.body.style.fontSize = `${newZoom}%`;
        }
      }
    }
  };
  
  // Funções para as ações do menu de texto
  const handleTextAction = (action: 'highlight' | 'note' | 'search' | 'translate' | 'listen' | 'google') => {
    if (!selectedText) return;
    
    switch (action) {
      case 'highlight':
        console.log(`Destacando texto "${selectedText}" com cor ${highlightColor}`);
        // Aqui implementaríamos a funcionalidade de destaque através da API do Kookit
        break;
      case 'note':
        console.log(`Adicionando nota ao texto "${selectedText}"`);
        // Implementação da adição de nota
        break;
      case 'search':
        console.log(`Buscando texto "${selectedText}" no documento`);
        // Implementação da busca no documento
        break;
      case 'translate':
        console.log(`Traduzindo texto "${selectedText}"`);
        window.open(`https://translate.google.com/?sl=auto&tl=pt&text=${encodeURIComponent(selectedText)}`, '_blank');
        break;
      case 'listen':
        console.log(`Ouvindo texto "${selectedText}"`);
        // Usar a API Web Speech para síntese de voz
        const utterance = new SpeechSynthesisUtterance(selectedText);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
        break;
      case 'google':
        console.log(`Buscando no Google: "${selectedText}"`);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedText)}`, '_blank');
        break;
    }
    
    setShowTextMenu(false);
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Tentar recarregar o Kookit
      await initializeKookit();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  };
  
  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (kookitRef.current) {
        try {
          // Limpar recursos
          kookitRef.current.off('relocated');
          kookitRef.current.off('rendered');
          kookitRef.current.off('error');
          
          // Destruir renderizador se suportar
          if (typeof kookitRef.current.destroy === 'function') {
            kookitRef.current.destroy();
          }
        } catch (err) {
          console.warn('Erro ao limpar Kookit:', err);
        }
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`flex flex-col w-full h-full min-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {book.title || 'Livro'}
          </h3>
        </div>

        <div className="flex items-center space-x-1">
          <button 
            onClick={() => changeZoom(-10)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Diminuir zoom"
          >
            <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <span className="text-sm text-gray-700 dark:text-gray-300 w-16 text-center">
            {zoom}%
          </span>
          
          <button 
            onClick={() => changeZoom(10)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <button 
            onClick={() => setShowToc(!showToc)}
            className={`p-2 rounded-lg transition-colors ${
              showToc 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            aria-label="Índice"
          >
            <List className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Tela cheia"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Maximize className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Área principal de visualização */}
        <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Carregando {book.format}...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <EnhancedErrorState
                title="Erro ao carregar arquivo"
                message={error}
                onRetry={handleRetry}
                onCancel={onClose}
                retryText="Tentar novamente"
                cancelText="Voltar"
                showRefresh={true}
                details={`Tentativas de refresh: ${smartRefresh.attempts}/3`}
              />
            </div>
          )}
          
          {/* Área de renderização do Kookit */}
          <div 
            id="page-area" 
            ref={pageAreaRef}
            className="w-full h-full"
            style={{ 
              maxWidth: '100%',
              height: '100%',
              minHeight: '500px',
              visibility: isLoading || error ? 'hidden' : 'visible'
            }}
          ></div>
      
          {/* Menu de seleção de texto */}
          {showTextMenu && selectedText && (
            <div 
              id="text-selection-menu"
              className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
              style={{
                left: `${menuPosition.x}px`,
                top: `${menuPosition.y}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="flex space-x-2 px-3 mb-2">
                <button 
                  onClick={() => setHighlightColor('yellow')}
                  className={`w-6 h-6 rounded-full bg-yellow-200 border ${highlightColor === 'yellow' ? 'border-yellow-500 ring-2 ring-yellow-300' : 'border-gray-300'}`}
                  title="Amarelo"
                />
                <button 
                  onClick={() => setHighlightColor('green')}
                  className={`w-6 h-6 rounded-full bg-green-200 border ${highlightColor === 'green' ? 'border-green-500 ring-2 ring-green-300' : 'border-gray-300'}`}
                  title="Verde"
                />
                <button 
                  onClick={() => setHighlightColor('blue')}
                  className={`w-6 h-6 rounded-full bg-blue-200 border ${highlightColor === 'blue' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'}`}
                  title="Azul"
                />
              </div>
              
              <div className="flex flex-col divide-y divide-gray-100">
                <button 
                  onClick={() => handleTextAction('highlight')}
                  className="flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100"
                >
                  <Highlighter className="w-4 h-4 mr-2 text-yellow-500" /> Destacar
                </button>
                <button 
                  onClick={() => handleTextAction('note')}
                  className="flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100"
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-blue-500" /> Adicionar nota
                </button>
                <button 
                  onClick={() => handleTextAction('search')}
                  className="flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100"
                >
                  <Search className="w-4 h-4 mr-2 text-gray-500" /> Buscar no documento
                </button>
                <button 
                  onClick={() => handleTextAction('translate')}
                  className="flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100"
                >
                  <Globe className="w-4 h-4 mr-2 text-green-500" /> Traduzir
                </button>
                <button 
                  onClick={() => handleTextAction('listen')}
                  className="flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100"
                >
                  <Volume2 className="w-4 h-4 mr-2 text-purple-500" /> Ouvir
                </button>
                <button 
                  onClick={() => handleTextAction('google')}
                  className="flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100"
                >
                  <Globe className="w-4 h-4 mr-2 text-red-500" /> Buscar no Google
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de navegação inferior */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        
        <div className="flex items-center">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (!isNaN(page)) {
                goToPage(page);
              }
            }}
            className="w-16 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-center text-sm text-gray-700 dark:text-gray-300"
          />
          <span className="mx-2 text-sm text-gray-600 dark:text-gray-400">
            de {totalPages}
          </span>
        </div>
        
        <button 
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Próxima página"
        >
          <ArrowRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default KookitViewer;