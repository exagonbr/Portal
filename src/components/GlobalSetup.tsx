'use client';

import { useEffect } from 'react';
import { initializeLoopPrevention } from '@/utils/loop-prevention';

// Declarações de tipos para bibliotecas globais
declare global {
  interface Window {
    Chart?: any;
    pdfjsLib?: any;
  }
}

export default function GlobalSetup() {
  useEffect(() => {
    // Configurações globais do sistema
    
    // Inicializar sistema de prevenção de loops
    try {
      const loopPrevention = initializeLoopPrevention();
      console.log('✅ Sistema de prevenção de loops inicializado');
      
      // Adicionar ao window para debug em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        (window as any).loopPrevention = loopPrevention;
        (window as any).loopStats = () => loopPrevention.getStats();
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar prevenção de loops:', error);
    }

    // Desabilitar logs desnecessários em produção
    if (process.env.NODE_ENV === 'production') {
      const noop = () => {};
      console.debug = noop;
      console.info = noop;
    }

    // Configurar tratamento global de erros
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });

    // Configurar detecção de conexão
    window.addEventListener('online', () => {
      console.log('🌐 Conexão restaurada');
    });

    window.addEventListener('offline', () => {
      console.log('📵 Sem conexão');
    });

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

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', () => {});
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
    };
  }, []);

  return null;
} 