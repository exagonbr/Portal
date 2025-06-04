import { useState, useCallback, useEffect, useRef } from 'react';
import { Book as EpubBook, Rendition } from 'epubjs';

interface UseEpubViewerProps {
  fileUrl: string;
  onError?: (error: string) => void;
}

export const useEpubViewer = ({ fileUrl, onError }: UseEpubViewerProps) => {
  const [book, setBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const initLockRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  // Cleanup robusto
  const cleanup = useCallback(() => {
    if (!mountedRef.current) return;
    
    console.log('🧹 Limpando recursos EPUB...');
    
    try {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      if (rendition) {
        rendition.destroy();
        setRendition(null);
      }

      if (book) {
        book.destroy();
        setBook(null);
      }

      setIsReady(false);
      setError(null);
      initLockRef.current = false;
      
    } catch (err) {
      console.warn('⚠️ Erro no cleanup:', err);
    }
  }, [book, rendition]);

  // Inicialização robusta
  const initialize = useCallback(async (containerId: string) => {
    if (initLockRef.current || !mountedRef.current) return;
    
    initLockRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Cleanup anterior
      cleanup();

      // Verificar se está no cliente
      if (typeof window === 'undefined') {
        throw new Error('EPUB.js só funciona no cliente');
      }

      // Aguardar container estar disponível
      await new Promise<void>((resolve, reject) => {
        const checkContainer = () => {
          const container = document.getElementById(containerId);
          if (container) {
            resolve();
          } else {
            setTimeout(checkContainer, 100);
          }
        };
        
        checkContainer();
        
        // Timeout após 10 segundos
        setTimeout(() => reject(new Error('Container não encontrado')), 10000);
      });

      console.log('📚 Inicializando EPUB:', fileUrl);

      // Criar book com configurações seguras
      const newBook = new EpubBook(fileUrl, {
        openAs: 'epub',
        requestHeaders: {
          'Accept': 'application/epub+zip',
          'Cache-Control': 'no-cache'
        }
      });

      // Aguardar book estar pronto
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout: EPUB não carregou'));
        }, 30000);

        newBook.ready.then(() => {
          clearTimeout(timeout);
          
          if (!mountedRef.current) {
            reject(new Error('Componente desmontado'));
            return;
          }

          console.log('✅ EPUB ready');
          resolve();
        }).catch((err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      setBook(newBook);

      // Criar rendition
      const newRendition = newBook.renderTo(containerId, {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'paginated'
      });

      // Aguardar renderização
      await newRendition.display();
      
      if (!mountedRef.current) return;

      setRendition(newRendition);
      setIsReady(true);

      // Configurar cleanup específico
      cleanupRef.current = () => {
        try {
          newRendition.destroy();
          newBook.destroy();
        } catch (err) {
          console.warn('Erro no cleanup específico:', err);
        }
      };

      console.log('✅ EPUB inicializado com sucesso');

    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro EPUB:', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      cleanup();
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        initLockRef.current = false;
      }
    }
  }, [fileUrl, cleanup, onError]);

  // Effect de limpeza na desmontagem
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    book,
    rendition,
    loading,
    error,
    isReady,
    initialize,
    cleanup
  };
}; 