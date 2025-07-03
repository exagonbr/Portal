/**
 * Script para remover atributos injetados por extensões do navegador
 * que podem causar problemas de hidratação no Next.js
 */
(function () {
    'use strict';
    // Lista de atributos comuns injetados por extensões
    var extensionAttributes = [
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
    var extensionClasses = [
        'grammarly-desktop-integration',
        'lastpass-vault',
        'adblock-overlay',
        'translate-extension',
        'darkreader',
        'readability-extension'
    ];
    function cleanupExtensionAttributes() {
        var html = document.documentElement;
        var body = document.body;
        // Remover atributos do elemento html
        extensionAttributes.forEach(function (attr) {
            if (html && html.hasAttribute(attr)) {
                html.removeAttribute(attr);
            }
            if (body && body.hasAttribute(attr)) {
                body.removeAttribute(attr);
            }
        });
        // Remover classes de extensões
        extensionClasses.forEach(function (className) {
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
        var observer_1 = new MutationObserver(function (mutations) {
            var needsCleanup = false;
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes') {
                    var attributeName = mutation.attributeName;
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
            observer_1.observe(document.documentElement, {
                attributes: true,
                attributeFilter: extensionAttributes
            });
        }
        if (document.body) {
            observer_1.observe(document.body, {
                attributes: true,
                attributeFilter: extensionAttributes
            });
        }
        // Parar observação após 10 segundos para não impactar performance
        setTimeout(function () {
            observer_1.disconnect();
        }, 10000);
    }
    // Executar limpeza adicional após DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanupExtensionAttributes);
    }
    else {
        cleanupExtensionAttributes();
    }
    // Executar limpeza final após carregamento completo
    window.addEventListener('load', cleanupExtensionAttributes);
})();
