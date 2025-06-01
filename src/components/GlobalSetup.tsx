'use client';

import { useEffect } from 'react';

// Declarações de tipos para bibliotecas globais
declare global {
  interface Window {
    Chart?: any;
    pdfjsLib?: any;
    __resizeObserverPatched?: boolean;
  }
}

export default function GlobalSetup() {
  useEffect(() => {
    // Evitar aplicar o patch múltiplas vezes
    if (typeof window !== 'undefined' && window.__resizeObserverPatched) {
      return;
    }

    // Configurar Chart.js de forma mais agressiva
    if (typeof window !== 'undefined' && window.Chart) {
      window.Chart.defaults.responsive = true;
      window.Chart.defaults.maintainAspectRatio = false;
      window.Chart.defaults.resizeDelay = 300; // Aumentar delay para 300ms
      window.Chart.defaults.animation = {
        duration: 0, // Desabilitar animações para evitar loops
      };
      // Configurações adicionais para estabilidade
      window.Chart.defaults.interaction = {
        intersect: false,
        mode: 'index',
      };
    }

    // Implementação mais robusta do ResizeObserver
    if (typeof window !== 'undefined' && window.ResizeObserver) {
      const OriginalResizeObserver = window.ResizeObserver;
      
      window.ResizeObserver = class RobustResizeObserver extends OriginalResizeObserver {
        private callbacks = new Set<ResizeObserverCallback>();
        private timeouts = new Map<ResizeObserverCallback, number>();
        private isProcessing = false;
        
        constructor(callback: ResizeObserverCallback) {
          // Wrapper do callback com throttling e error handling
          const throttledCallback: ResizeObserverCallback = (entries, observer) => {
            // Prevenir loops aninhados
            if (this.isProcessing) {
              return;
            }

            // Clear timeout anterior se existir
            const existingTimeout = this.timeouts.get(callback);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
            }

            // Agendar execução com delay
            const timeoutId = window.setTimeout(() => {
              this.isProcessing = true;
              
              try {
                // Usar requestAnimationFrame para garantir que a DOM está estável
                requestAnimationFrame(() => {
                  try {
                    // Verificar se ainda temos entries válidas
                    if (entries && entries.length > 0) {
                      // Filtrar apenas entries com mudanças significativas
                      const significantEntries = entries.filter(entry => {
                        const { width, height } = entry.contentRect;
                        return width > 0 && height > 0;
                      });

                      if (significantEntries.length > 0) {
                        callback(significantEntries, observer);
                      }
                    }
                  } catch (error) {
                    // Silenciosamente ignorar erros do callback
                    console.debug('ResizeObserver callback error suppressed:', error);
                  } finally {
                    this.isProcessing = false;
                    this.timeouts.delete(callback);
                  }
                });
              } catch (error) {
                this.isProcessing = false;
                this.timeouts.delete(callback);
                console.debug('ResizeObserver error suppressed:', error);
              }
            }, 150); // Delay de 150ms para estabilização

            this.timeouts.set(callback, timeoutId);
          };
          
          super(throttledCallback);
          this.callbacks.add(callback);
        }

        observe(target: Element, options?: ResizeObserverOptions): void {
          try {
            // Verificar se o elemento é válido antes de observar
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
            // Limpar todos os timeouts pendentes
            this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
            this.timeouts.clear();
            this.callbacks.clear();
            this.isProcessing = false;
            
            super.disconnect();
          } catch (error) {
            console.debug('ResizeObserver disconnect error suppressed:', error);
          }
        }
      };

      // Marcar como patcheado
      window.__resizeObserverPatched = true;
    }

    // Configurar PDF.js worker se estiver disponível
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      } catch (error) {
        console.debug('PDF.js configuration error suppressed:', error);
      }
    }

    // Adicionar listener global para interceptar erros de resize
    const handleGlobalError = (event: Event) => {
      const errorEvent = event as ErrorEvent;
      if (errorEvent.message && 
          errorEvent.message.toLowerCase().includes('resizeobserver')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError, true);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError, true);
    };
  }, []);

  return null;
} 