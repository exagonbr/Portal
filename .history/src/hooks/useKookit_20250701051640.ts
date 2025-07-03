'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseKookitProps {
  fileUrl: string;
  fileType: 'epub' | 'pdf' | 'mobi';
  containerId?: string;
}

interface KookitState {
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  currentPage: number;
  totalPages: number;
  renderer: any;
}

export const useKookit = ({ fileUrl, fileType, containerId = 'page-area' }: UseKookitProps) => {
  const [state, setState] = useState<KookitState>({
    isLoading: true,
    error: null,
    isReady: false,
    currentPage: 1,
    totalPages: 1,
    renderer: null
  });

  const rendererRef = useRef<any>(null);
  const mountedRef = useRef(true);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (rendererRef.current) {
      try {
        // Remover listeners
        rendererRef.current.off?.('relocated');
        rendererRef.current.off?.('rendered');
        rendererRef.current.off?.('error');
        
        // Destruir se suportar
        if (typeof rendererRef.current.destroy === 'function') {
          rendererRef.current.destroy();
        }
        
        rendererRef.current = null;
      } catch (err) {
        console.warn('Erro ao limpar renderer:', err);
      }
    }
  }, []);

  // Inicializar Kookit
  const initialize = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Verificar se Kookit está disponível
      if (!window.Kookit) {
        throw new Error('Biblioteca Kookit não está carregada');
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

      console.log(`📚 Inicializando Kookit para ${fileType}:`, fileUrl);

      // Cleanup anterior
      cleanup();

      // Criar renderer baseado no tipo de arquivo
      let renderer;
      const renderOptions = {
        spread: 'auto',
        flow: 'paginated',
        width: '100%',
        height: '100%'
      };

      switch (fileType.toLowerCase()) {
        case 'epub':
          if (!window.Kookit.EpubRender) {
            throw new Error('EpubRender não disponível');
          }
          renderer = new window.Kookit.EpubRender(
            { load: () => fileUrl },
            renderOptions
          );
          break;
          
        case 'pdf':
          if (!window.Kookit.PdfRender && !window.Kookit.CacheRender) {
            throw new Error('PdfRender não disponível');
          }
          renderer = new (window.Kookit.PdfRender || window.Kookit.CacheRender)(
            { load: () => fileUrl },
            renderOptions
          );
          break;
          
        case 'mobi':
          if (!window.Kookit.MobiRender) {
            throw new Error('MobiRender não disponível');
          }
          renderer = new window.Kookit.MobiRender(
            { load: () => fileUrl },
            renderOptions
          );
          break;
          
        default:
          throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
      }

      rendererRef.current = renderer;

      // Configurar listeners
      renderer.on('relocated', (location: any) => {
        if (!mountedRef.current) return;
        
        try {
          const currentPage = location?.start?.index ? location.start.index + 1 : 1;
          const totalPages = location?.total || 1;
          
          setState(prev => ({
            ...prev,
            currentPage,
            totalPages
          }));
        } catch (err) {
          console.warn('Erro ao processar relocated:', err);
        }
      });

      renderer.on('rendered', () => {
        if (!mountedRef.current) return;
        
        console.log('✅ Kookit renderizado com sucesso');
        setState(prev => ({
          ...prev,
          isLoading: false,
          isReady: true,
          renderer
        }));
      });

      renderer.on('error', (error: any) => {
        if (!mountedRef.current) return;
        
        console.log('❌ Erro no Kookit:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error?.message || 'Erro desconhecido no renderizador'
        }));
      });

      // Renderizar no container
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} não encontrado`);
      }

      await renderer.renderTo(container);

    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.log('❌ Erro ao inicializar Kookit:', errorMsg);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMsg
      }));
    }
  }, [fileUrl, fileType, containerId, cleanup]);

  // Navegação
  const goToPage = useCallback((page: number) => {
    if (rendererRef.current && page >= 1 && page <= state.totalPages) {
      try {
        rendererRef.current.goToPosition({ index: page - 1 });
      } catch (err) {
        console.log('Erro ao navegar para página:', err);
      }
    }
  }, [state.totalPages]);

  const nextPage = useCallback(() => {
    if (rendererRef.current) {
      try {
        rendererRef.current.next();
      } catch (err) {
        console.log('Erro ao avançar página:', err);
      }
    }
  }, []);

  const prevPage = useCallback(() => {
    if (rendererRef.current) {
      try {
        rendererRef.current.prev();
      } catch (err) {
        console.log('Erro ao retroceder página:', err);
      }
    }
  }, []);

  // Zoom (se suportado)
  const setZoom = useCallback((zoomLevel: number) => {
    if (rendererRef.current && typeof rendererRef.current.setZoom === 'function') {
      try {
        rendererRef.current.setZoom(zoomLevel / 100);
      } catch (err) {
        console.log('Erro ao aplicar zoom:', err);
      }
    }
  }, []);

  // Inicializar quando o hook for montado
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    ...state,
    initialize,
    goToPage,
    nextPage,
    prevPage,
    setZoom,
    cleanup
  };
}; 