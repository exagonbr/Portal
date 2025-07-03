// cleanup-extensions.js - Script para prevenir interferências de extensões
(function() {
  'use strict';

  // Detectar e limpar modificações de extensões
  const cleanupExtensions = () => {
    // Remover elementos injetados por extensões comuns
    const extensionSelectors = [
      '[id*="extension"]',
      '[class*="extension"]',
      '[data-extension]',
      'grammarly-desktop-integration',
      '[class*="grammarly"]',
      '[id*="grammarly"]',
      '[class*="lastpass"]',
      '[id*="lastpass"]',
      '[class*="honey"]',
      '[id*="honey"]',
      '[class*="adblock"]',
      '[id*="adblock"]',
      'div[style*="position: fixed"][style*="z-index: 2147483647"]',
      'iframe[src*="extension://"]',
      'script[src*="extension://"]'
    ];

    extensionSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el && el.parentNode) {
            console.log('Removendo elemento de extensão:', el);
            el.remove();
          }
        });
      } catch (e) {
        // Ignorar erros de seletores inválidos
      }
    });

    // Limpar estilos injetados
    const styleSheets = document.styleSheets;
    for (let i = styleSheets.length - 1; i >= 0; i--) {
      try {
        const sheet = styleSheets[i];
        if (sheet.href && sheet.href.includes('extension://')) {
          sheet.disabled = true;
          sheet.ownerNode?.remove();
        }
      } catch (e) {
        // Ignorar erros de CORS
      }
    }
  };

  // Prevenir cache do navegador
  const preventBrowserCache = () => {
    // Desabilitar BFCache (Back-Forward Cache)
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        console.log('Página carregada do BFCache, recarregando...');
        window.location.reload(true);
      }
    });

    // Forçar revalidação ao navegar
    window.addEventListener('popstate', () => {
      // Adicionar timestamp para forçar revalidação
      const url = new URL(window.location.href);
      if (!url.searchParams.has('_t')) {
        url.searchParams.set('_t', Date.now().toString());
        window.history.replaceState({}, '', url.toString());
      }
    });

    // Interceptar cliques em links para adicionar timestamp
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link && link.href && !link.href.includes('#') && !link.href.includes('javascript:')) {
        try {
          const url = new URL(link.href);
          // Apenas para links internos
          if (url.origin === window.location.origin) {
            url.searchParams.set('_t', Date.now().toString());
            link.href = url.toString();
          }
        } catch (e) {
          // Ignorar URLs inválidas
        }
      }
    });
  };

  // Otimizar performance do menu
  const optimizeMenuPerformance = () => {
    // Adicionar will-change para elementos do menu
    const menuElements = document.querySelectorAll('[role="navigation"], nav, aside');
    menuElements.forEach(el => {
      el.style.willChange = 'transform';
    });

    // Otimizar transições
    const style = document.createElement('style');
    style.textContent = `
      /* Otimizações de performance para o menu */
      [role="navigation"] * {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000px;
        perspective: 1000px;
      }
      
      /* Usar GPU para animações */
      .transition-all {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }
      
      /* Reduzir paint areas */
      nav button, nav a {
        contain: layout style paint;
      }
      
      /* Otimizar scrolling */
      nav {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
      
      /* Desabilitar animações desnecessárias em dispositivos lentos */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Adicionar Intersection Observer para lazy loading de ícones
    if ('IntersectionObserver' in window) {
      const iconObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('icon-loaded');
            iconObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px'
      });

      // Observar ícones do menu
      document.querySelectorAll('.material-symbols-outlined').forEach(icon => {
        iconObserver.observe(icon);
      });
    }
  };

  // Executar limpeza ao carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      cleanupExtensions();
      preventBrowserCache();
      optimizeMenuPerformance();
    });
  } else {
    cleanupExtensions();
    preventBrowserCache();
    optimizeMenuPerformance();
  }

  // Executar limpeza periodicamente
  setInterval(cleanupExtensions, 5000);

  // Monitorar mudanças no DOM
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      let shouldCleanup = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const tagName = node.tagName?.toLowerCase();
            if (tagName === 'script' || tagName === 'style' || tagName === 'iframe') {
              shouldCleanup = true;
            }
          }
        });
      });

      if (shouldCleanup) {
        setTimeout(cleanupExtensions, 100);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Adicionar meta tags via JavaScript para garantir no-cache
  const addNoCacheMetaTags = () => {
    const metaTags = [
      { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { 'http-equiv': 'Pragma', content: 'no-cache' },
      { 'http-equiv': 'Expires', content: '0' },
      { name: 'robots', content: 'noarchive' }
    ];

    metaTags.forEach(attrs => {
      const meta = document.createElement('meta');
      Object.entries(attrs).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      document.head.appendChild(meta);
    });
  };

  addNoCacheMetaTags();

  // Log para debug
  console.log('Sistema de limpeza de cache e otimização ativado');

})();