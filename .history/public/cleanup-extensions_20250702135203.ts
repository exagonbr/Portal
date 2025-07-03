/**
 * Script para remover atributos injetados por extensões do navegador
 * que podem causar problemas de hidratação no Next.js
 */
(function(): void {
  'use strict';

  // Lista de atributos comuns injetados por extensões
  const extensionAttributes: string[] = [
    'bbai-tooltip-injected',
    'data-grammarly',
    'data-grammarly-shadow-root',
    'data-lastpass',
    'data-lastpass-icon-root',
    'data-extension',
    'data-1password',
    'data-adblock',
    'data-translate',
    'data-google-translate',
    'cz-shortcut-listen',
    'data-darkreader',
    'data-readability',
    'data-mercury',
    'data-outline',
    'data-clarity',
    'spellcheck-extension',
    'data-ms-editor'
  ];

  // Lista de classes comuns injetadas por extensões
  const extensionClasses: string[] = [
    'grammarly-desktop-integration',
    'lastpass-vault',
    'adblock-overlay',
    'translate-extension',
    'darkreader',
    'readability-extension'
  ];

  function cleanupExtensionAttributes(): void {
    const html: HTMLElement | null = document.documentElement;
    const body: HTMLElement | null = document.body;

    // Remover atributos do elemento html
    extensionAttributes.forEach((attr: string) => {
      if (html && html.hasAttribute(attr)) {
        html.removeAttribute(attr);
      }
      if (body && body.hasAttribute(attr)) {
        body.removeAttribute(attr);
      }
    });

    // Remover classes de extensões
    extensionClasses.forEach((className: string) => {
      if (html && html.classList.contains(className)) {
        html.classList.remove(className);
      }
      if (body && body.classList.contains(className)) {
        body.classList.remove(className);
      }
    });
  }

  // Executar limpeza imediatamente
  cleanupExtensionAttributes();

  // Observar mudanças e limpar novamente se necessário
  if (typeof MutationObserver !== 'undefined') {
    const observer: MutationObserver = new MutationObserver(function(mutations: MutationRecord[]): void {
      let needsCleanup: boolean = false;

      mutations.forEach(function(mutation: MutationRecord): void {
        if (mutation.type === 'attributes') {
          const attributeName: string | null = mutation.attributeName;
          if (attributeName && extensionAttributes.includes(attributeName)) {
            needsCleanup = true;
          }
        }
      });

      if (needsCleanup) {
        cleanupExtensionAttributes();
      }
    });

    // Observar mudanças nos atributos do html e body
    if (document.documentElement) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: extensionAttributes
      });
    }

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: extensionAttributes
      });
    }

    // Parar observação após 10 segundos para não impactar performance
    setTimeout(function(): void {
      observer.disconnect();
    }, 10000);
  }

  // Executar limpeza adicional após DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupExtensionAttributes);
  } else {
    cleanupExtensionAttributes();
  }

  // Executar limpeza final após carregamento completo
  window.addEventListener('load', cleanupExtensionAttributes);
})(); 