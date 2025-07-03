'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, List } from 'lucide-react';

interface EPUBViewerProps {
  fileUrl: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  zoom: number;
  onDocumentLoaded: (numPages: number, toc?: any[]) => void;
  onError: (error: string) => void;
  showToc: boolean;
  setShowToc: (show: boolean) => void;
  tableOfContents: any[];
  setTableOfContents: (toc: any[]) => void;
}

const EPUBViewer: React.FC<EPUBViewerProps> = ({
  fileUrl,
  currentPage,
  setCurrentPage,
  zoom,
  onDocumentLoaded,
  onError,
  showToc,
  setShowToc,
  tableOfContents,
  setTableOfContents
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  // Carregar EPUB.js dinamicamente
  useEffect(() => {
    const loadEPUBJS = async () => {
      try {
        // Verificar se EPUB.js já está carregado
        if (typeof window !== 'undefined' && (window as any).ePub) {
          return (window as any).ePub;
        }

        // Carregar EPUB.js via CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js';
        script.async = true;
        
        return new Promise((resolve, reject) => {
          script.onload = () => {
            const ePub = (window as any).ePub;
            if (ePub) {
              resolve(ePub);
            } else {
              reject(new Error('EPUB.js não foi carregado corretamente'));
            }
          };
          script.onerror = () => reject(new Error('Falha ao carregar EPUB.js'));
          document.head.appendChild(script);
        });
      } catch (error) {
        console.log('Erro ao carregar EPUB.js:', error);
        onError('Erro ao carregar biblioteca EPUB.js');
        return null;
      }
    };

    const loadDocument = async () => {
      try {
        setIsLoading(true);
        const ePub = await loadEPUBJS();
        
        if (!ePub) {
          onError('EPUB.js não está disponível');
          return;
        }

        // Criar instância do livro
        const bookInstance = ePub(fileUrl);
        setBook(bookInstance);

        // Aguardar o livro ser carregado
        await bookInstance.ready;

        // Criar rendition
        if (viewerRef.current) {
          const renditionInstance = bookInstance.renderTo(viewerRef.current, {
            width: '100%',
            height: '100%',
            spread: 'none'
          });

          setRendition(renditionInstance);

          // Exibir primeira página
          await renditionInstance.display();

          // Obter sumário
          const navigation = await bookInstance.loaded.navigation;
          if (navigation && navigation.toc) {
            setTableOfContents(navigation.toc);
          }

          // Configurar eventos
          renditionInstance.on('relocated', (location: any) => {
            setCurrentLocation(location);
            if (location.start) {
              const pageNumber = location.start.displayed.page || 1;
              setCurrentPage(pageNumber);
            }
          });

          // Aplicar zoom inicial
          renditionInstance.themes.fontSize(`${zoom}%`);

          // Simular número de páginas (EPUB não tem páginas fixas)
          const spine = bookInstance.spine;
          const estimatedPages = spine ? spine.length : 1;
          onDocumentLoaded(estimatedPages, navigation?.toc || []);
          
          setIsLoading(false);
        }
      } catch (error) {
        console.log('Erro ao carregar EPUB:', error);
        onError(`Erro ao carregar EPUB: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [fileUrl, onDocumentLoaded, onError, setCurrentPage, setTableOfContents, zoom]);

  // Aplicar zoom quando mudado
  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${zoom}%`);
    }
  }, [rendition, zoom]);

  // Navegar para página específica
  useEffect(() => {
    if (rendition && book && currentPage > 0) {
      const spine = book.spine;
      if (spine && spine.items && spine.items[currentPage - 1]) {
        rendition.display(spine.items[currentPage - 1].href);
      }
    }
  }, [rendition, book, currentPage]);

  // Limpeza
  useEffect(() => {
    return () => {
      if (rendition) {
        rendition.destroy();
      }
      if (book) {
        book.destroy();
      }
    };
  }, [book, rendition]);

  // Navegar para item do sumário
  const navigateToTocItem = (href: string) => {
    if (rendition) {
      rendition.display(href);
      setShowToc(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando EPUB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex">
      {/* Sumário lateral */}
      {showToc && tableOfContents.length > 0 && (
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sumário
              </h3>
              <button
                onClick={() => setShowToc(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-2">
            {tableOfContents.map((item, index) => (
              <button
                key={index}
                onClick={() => navigateToTocItem(item.href)}
                className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Área do visualizador */}
      <div className="flex-1 relative">
        <div
          ref={viewerRef}
          className="w-full h-full bg-white dark:bg-gray-900"
          style={{ minHeight: '400px' }}
        />
        
        {!book && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-90">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Erro ao carregar EPUB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EPUBViewer; 