'use client';

import { useEffect } from 'react';

// Declarações de tipos para bibliotecas globais
declare global {
  interface Window {
    Chart?: any;
    pdfjsLib?: any;
  }
}

export default function GlobalSetup() {
  useEffect(() => {
    // Configurar globalmente para evitar erros do ResizeObserver
    
    // Otimizar Chart.js se estiver disponível
    if (typeof window !== 'undefined' && window.Chart) {
      window.Chart.defaults.responsive = true;
      window.Chart.defaults.maintainAspectRatio = false;
      window.Chart.defaults.resizeDelay = 250;
    }

    // Sobrescrever ResizeObserver para ser mais robusto
    if (typeof window !== 'undefined' && window.ResizeObserver) {
      const OriginalResizeObserver = window.ResizeObserver;
      
      window.ResizeObserver = class extends OriginalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
            try {
              // Throttle para evitar loops excessivos
              requestAnimationFrame(() => {
                try {
                  callback(entries, observer);
                } catch (error) {
                  // Ignorar erros do ResizeObserver silenciosamente
                }
              });
            } catch (error) {
              // Ignorar erros do ResizeObserver silenciosamente
            }
          };
          
          super(wrappedCallback);
        }
      };
    }

    // Configurar PDF.js worker se estiver disponível
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      // Configurações para otimizar o PDF.js
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }

  }, []);

  return null;
} 