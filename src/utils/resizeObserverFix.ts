/**
 * Utilitário para resolver problemas do ResizeObserver
 * 
 * Este módulo fornece ferramentas para lidar com o erro comum:
 * "ResizeObserver loop completed with undelivered notifications"
 */

type ResizeCallback = (entries: ResizeObserverEntry[]) => void;

interface SafeResizeObserverOptions {
  /** Delay em ms para throttle do callback (padrão: 150ms) */
  throttleDelay?: number;
  /** Se deve filtrar entries com dimensões zero (padrão: true) */
  filterZeroDimensions?: boolean;
  /** Se deve usar requestAnimationFrame (padrão: true) */
  useRequestAnimationFrame?: boolean;
}

/**
 * Cria um ResizeObserver seguro com throttling e tratamento de erros
 */
export function createSafeResizeObserver(
  callback: ResizeCallback,
  options: SafeResizeObserverOptions = {}
): ResizeObserver {
  const {
    throttleDelay = 150,
    filterZeroDimensions = true,
    useRequestAnimationFrame = true
  } = options;

  let timeoutId: number | null = null;
  let isProcessing = false;

  const throttledCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
    // Prevenir loops aninhados
    if (isProcessing) return;

    // Cancelar timeout anterior
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      isProcessing = true;

      const executeCallback = () => {
        try {
          // Filtrar entries válidas
          let validEntries = entries;
          
          if (filterZeroDimensions) {
            validEntries = entries.filter(entry => {
              const { width, height } = entry.contentRect;
              return width > 0 && height > 0;
            });
          }

          if (validEntries.length > 0) {
            callback(validEntries);
          }
        } catch (error) {
          console.debug('ResizeObserver callback error suppressed:', error);
        } finally {
          isProcessing = false;
          timeoutId = null;
        }
      };

      if (useRequestAnimationFrame) {
        requestAnimationFrame(executeCallback);
      } else {
        executeCallback();
      }
    }, throttleDelay);
  };

  return new ResizeObserver(throttledCallback);
}

/**
 * Hook para usar ResizeObserver de forma segura em componentes React
 */
export function useSafeResizeObserver(
  elementRef: React.RefObject<Element>,
  callback: ResizeCallback,
  options: SafeResizeObserverOptions = {}
): void {
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = createSafeResizeObserver(callback, options);
    
    try {
      observer.observe(element);
    } catch (error) {
      console.debug('ResizeObserver observe error suppressed:', error);
    }

    return () => {
      try {
        observer.disconnect();
      } catch (error) {
        console.debug('ResizeObserver disconnect error suppressed:', error);
      }
    };
  }, [elementRef, callback, options]);
}

/**
 * Função para aplicar o fix global do ResizeObserver
 * Deve ser chamada uma vez no início da aplicação
 */
export function applyGlobalResizeObserverFix(): void {
  if (typeof window === 'undefined') return;
  
  // Verificar se já foi aplicado
  if ((window as any).__resizeObserverFixed) return;

  const OriginalResizeObserver = window.ResizeObserver;
  
  if (!OriginalResizeObserver) return;

  // Sobrescrever o ResizeObserver global
  window.ResizeObserver = class extends OriginalResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      const safeCallback: ResizeObserverCallback = (entries, observer) => {
        try {
          requestAnimationFrame(() => {
            try {
              callback(entries, observer);
            } catch (error) {
              console.debug('ResizeObserver callback error suppressed:', error);
            }
          });
        } catch (error) {
          console.debug('ResizeObserver error suppressed:', error);
        }
      };

      super(safeCallback);
    }

    observe(target: Element, options?: ResizeObserverOptions): void {
      try {
        if (target && target.nodeType === Node.ELEMENT_NODE) {
          super.observe(target, options);
        }
      } catch (error) {
        console.debug('ResizeObserver observe error suppressed:', error);
      }
    }

    unobserve(target: Element): void {
      try {
        super.unobserve(target);
      } catch (error) {
        console.debug('ResizeObserver unobserve error suppressed:', error);
      }
    }

    disconnect(): void {
      try {
        super.disconnect();
      } catch (error) {
        console.debug('ResizeObserver disconnect error suppressed:', error);
      }
    }
  };

  // Marcar como aplicado
  (window as any).__resizeObserverFixed = true;
}

/**
 * Suprime erros específicos do ResizeObserver no console
 */
export function suppressResizeObserverErrors(): (() => void) | void {
  if (typeof window === 'undefined') return;

  const resizeObserverErrorPatterns = [
    'ResizeObserver loop completed with undelivered notifications',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop',
    'ResizeObserver callback timeout',
  ];

  const shouldSuppressError = (message: string): boolean => {
    return resizeObserverErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  // Interceptar console.error
  const originalError = console.error;
  console.error = (...args) => {
    const firstArg = String(args[0] || '');
    if (shouldSuppressError(firstArg)) {
      return; // Suprimir erro
    }
    originalError.apply(console, args);
  };

  // Interceptar erros globais
  const handleError = (event: ErrorEvent) => {
    if (event.message && shouldSuppressError(event.message)) {
      event.preventDefault();
      return false;
    }
  };

  window.addEventListener('error', handleError, true);

  // Retornar função de cleanup
  return () => {
    console.error = originalError;
    window.removeEventListener('error', handleError, true);
  };
}

// Para compatibilidade com React
let React: any;
try {
  React = require('react');
} catch {
  // React não disponível - ignorar hook
} 