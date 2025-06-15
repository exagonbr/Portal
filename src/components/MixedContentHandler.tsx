'use client';

import { useEffect } from 'react';
import { fetchInterceptorManager, type FetchTransformer } from '@/utils/fetch-interceptor';

export default function MixedContentHandler() {
  useEffect(() => {
    // Detectar e corrigir URLs HTTP em um contexto HTTPS
    const handleMixedContent = () => {
      // Se estamos em HTTPS, mas temos URLs HTTP configuradas
      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        // Criar interceptador para converter HTTP para HTTPS
        const mixedContentTransformer: FetchTransformer = (input, init) => {
          let url: string;
          
          if (typeof input === 'string') {
            url = input;
          } else if (input instanceof URL) {
            url = input.toString();
          } else if (input instanceof Request) {
            url = input.url;
          } else {
            // This should never happen, but TypeScript needs this case
            url = String(input);
          }
          
          // Se a URL é HTTP e estamos em HTTPS, tentar converter
          if (url.startsWith('http://') && !url.includes('localhost')) {
            console.log('🔄 Mixed Content Handler: Convertendo HTTP para HTTPS:', url);
            url = url.replace('http://', 'https://');
          }
          
          // Recriar o input com a URL corrigida
          let correctedInput: RequestInfo | URL;
          if (typeof input === 'string') {
            correctedInput = url;
          } else if (input instanceof URL) {
            correctedInput = new URL(url);
          } else if (input instanceof Request) {
            correctedInput = new Request(url, input);
          } else {
            correctedInput = url;
          }
          
          return { input: correctedInput, init };
        };

        // Adicionar interceptador ao sistema coordenado
        fetchInterceptorManager.addInterceptor('mixed-content-handler', {
          transformer: mixedContentTransformer
        });
        
        // Interceptar XMLHttpRequest também
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
          let urlString = url.toString();
          
          if (urlString.startsWith('http://') && !urlString.includes('localhost')) {
            console.log('🔄 Mixed Content Handler: Convertendo XHR HTTP para HTTPS:', urlString);
            urlString = urlString.replace('http://', 'https://');
          }
          
          return originalXHROpen.call(this, method, urlString, async ?? true, user, password);
        };
        
        console.log('✅ Mixed Content Handler: Interceptadores instalados');
      }
      
      // Configurar CSP via JavaScript se necessário
      if (typeof document !== 'undefined') {
        // Verificar se já existe uma meta tag CSP
        const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        
        if (!existingCSP) {
          const meta = document.createElement('meta');
          meta.httpEquiv = 'Content-Security-Policy';
          meta.content = 'upgrade-insecure-requests';
          document.head.appendChild(meta);
          console.log('✅ Mixed Content Handler: CSP meta tag adicionada');
        }
      }
    };
    
    // Executar imediatamente e também quando o DOM estiver pronto
    handleMixedContent();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleMixedContent);
    }
    
    // Cleanup
    return () => {
      // Remover interceptador do sistema coordenado
      fetchInterceptorManager.removeInterceptor('mixed-content-handler');
      
      if (document.readyState === 'loading') {
        document.removeEventListener('DOMContentLoaded', handleMixedContent);
      }
    };
  }, []);
  
  return null; // Este componente não renderiza nada
} 