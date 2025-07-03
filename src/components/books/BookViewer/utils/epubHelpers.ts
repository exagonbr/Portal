import { Rendition, Book as EpubBook } from 'epubjs';

/**
 * Utilitários para trabalhar com EPUB.js de forma mais segura
 */

/**
 * Aguarda até que um elemento esteja pronto para acessar estilos computados
 */
export const waitForElementReady = (element: Element | null, timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!element) {
      reject(new Error('Elemento não encontrado'));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout aguardando elemento estar pronto'));
    }, timeout);

    const checkElement = () => {
      try {
        // Tenta acessar getComputedStyle para verificar se está pronto
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle && computedStyle.display !== undefined) {
          clearTimeout(timeoutId);
          resolve();
          return;
        }
      } catch (error) {
        // Se ainda não está pronto, aguarda um pouco mais
      }

      // Retentar após um pequeno delay
      setTimeout(checkElement, 100);
    };

    checkElement();
  });
};

/**
 * Aguarda a renderização completa do EPUB
 */
export const waitForRenditionReady = (rendition: Rendition, timeout = 15000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout aguardando renderização do EPUB'));
    }, timeout);

    // Listener para o evento de renderização
    const onRendered = () => {
      clearTimeout(timeoutId);
      rendition.off('rendered', onRendered);
      resolve();
    };

    rendition.on('rendered', onRendered);

    // Fallback - tentar exibir se ainda não foi exibido
    rendition.display().then(() => {
      // Se display() funcionar, assumir que está pronto
      clearTimeout(timeoutId);
      rendition.off('rendered', onRendered);
      resolve();
    }).catch(() => {
      // Se display() falhar, aguardar pelo evento rendered
    });
  });
};

/**
 * Carrega metadados do EPUB com timeout
 */
export const loadEpubMetadata = async (book: EpubBook, timeout = 10000) => {
  try {
    return await Promise.race([
      book.loaded.metadata,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar metadados')), timeout)
      )
    ]);
  } catch (error) {
    console.warn('Erro ao carregar metadados EPUB:', error);
    return null;
  }
};

/**
 * Gera localizações do EPUB com timeout
 */
export const generateEpubLocations = async (book: EpubBook, charsPerLocation = 1024, timeout = 15000) => {
  try {
    await Promise.race([
      book.locations.generate(charsPerLocation),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao gerar localizações')), timeout)
      )
    ]);
    return book.locations.length();
  } catch (error) {
    console.warn('Erro ao gerar localizações EPUB:', error);
    return 100; // Retorna um número estimado padrão
  }
};

/**
 * Configura listeners seguros para o rendition
 */
export const setupSafeRenditionListeners = (
  rendition: Rendition,
  book: EpubBook,
  callbacks: {
    onPageChange?: (pageNumber: number) => void;
    onTextSelection?: (cfiRange: string, text: string) => void;
    onError?: (error: any) => void;
  }
) => {
  // Listener para mudança de localização
  if (callbacks.onPageChange) {
    rendition.on('relocated', (location: any) => {
      try {
        if (location && location.start && location.start.cfi && book.locations) {
          const currentLocation = book.locations.locationFromCfi(location.start.cfi);
          if (typeof currentLocation === 'number') {
            callbacks.onPageChange!(currentLocation + 1);
          }
        }
      } catch (error) {
        console.warn('Erro ao processar mudança de localização:', error);
        callbacks.onError?.(error);
      }
    });
  }

  // Listener para seleção de texto
  if (callbacks.onTextSelection) {
    rendition.on('selected', (cfiRange: string, contents: any) => {
      try {
        if (contents && contents.window && contents.window.getSelection) {
          const selection = contents.window.getSelection();
          const text = selection ? selection.toString() : null;
          if (text && text.trim().length > 0) {
            callbacks.onTextSelection!(cfiRange, text.trim());
          }
        }
      } catch (error) {
        console.warn('Erro ao processar seleção de texto:', error);
        callbacks.onError?.(error);
      }
    });
  }

  // Listener para erros de renderização
  rendition.on('error', (error: any) => {
    console.warn('Erro de renderização EPUB:', error);
    callbacks.onError?.(error);
  });
};

/**
 * Opções seguras padrão para renderização EPUB
 */
export const getSafeEpubRenderOptions = (container: HTMLElement, isDualPage = false) => {
  return {
    width: container.clientWidth || '100%',
    height: container.clientHeight || '100%',
    spread: isDualPage ? 'auto' : 'none',
    flow: 'paginated',
    allowScriptedContent: false, // Desabilitar scripts para evitar problemas
    manager: 'default',
    view: 'iframe' // Usar iframe para isolamento melhor
  };
};

/**
 * Verifica se um objeto window é válido e tem getComputedStyle disponível
 */
export const isWindowReady = (windowObj: Window | null): boolean => {
  try {
    return !!(windowObj && 
             windowObj.getComputedStyle && 
             typeof windowObj.getComputedStyle === 'function' &&
             windowObj.document &&
             windowObj.document.readyState === 'complete');
  } catch (error) {
    return false;
  }
};

/**
 * Aguarda até que um window object esteja pronto
 */
export const waitForWindowReady = (windowObj: Window | null, timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!windowObj) {
      reject(new Error('Window object não fornecido'));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout aguardando window estar pronto'));
    }, timeout);

    const checkWindow = () => {
      if (isWindowReady(windowObj)) {
        clearTimeout(timeoutId);
        resolve();
        return;
      }

      // Retentar após um pequeno delay
      setTimeout(checkWindow, 100);
    };

    checkWindow();
  });
}; 