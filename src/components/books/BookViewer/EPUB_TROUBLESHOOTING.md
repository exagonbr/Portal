# Soluções para Problemas com EPUB.js

## Problema: `this.window.getComputedStyle(...) is null`

### Descrição do Erro
Este erro ocorre quando o EPUB.js tenta acessar estilos computados de elementos antes que eles estejam completamente carregados no DOM ou antes que o iframe usado pelo EPUB.js esteja totalmente inicializado.

### Stack Trace Típica
```
width@webpack-internal:///(app-pages-browser)/./node_modules/epubjs/src/contents.js:81:31
fit@webpack-internal:///(app-pages-browser)/./node_modules/epubjs/src/contents.js:1155:8
format@webpack-internal:///(app-pages-browser)/./node_modules/epubjs/src/layout.js:201:25
```

### Causas Comuns
1. **Timing de Inicialização**: O código tenta acessar estilos antes do iframe estar pronto
2. **Elementos Não Carregados**: DOM elements ainda não existem quando `getComputedStyle` é chamado
3. **Context de Iframe**: O window context do iframe não está totalmente inicializado
4. **Race Conditions**: Múltiplas operações assíncronas competindo por recursos

## Soluções Implementadas

### 1. Aguardar Renderização Completa
```typescript
// Aguardar que o rendition esteja completamente carregado
await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => {
    reject(new Error('Timeout ao renderizar EPUB'));
  }, 15000);

  newRendition.on('rendered', () => {
    clearTimeout(timeout);
    resolve(true);
  });

  // Fallback - se não houver evento rendered, usar display
  newRendition.display().then(() => {
    clearTimeout(timeout);
    resolve(true);
  }).catch(reject);
});
```

### 2. Verificações de Segurança nos Listeners
```typescript
// Manipular seleção de texto com verificações de segurança
newRendition.on('selected', (cfiRange: string, contents: any) => {
  try {
    if (contents && contents.window && contents.window.getSelection) {
      const selection = contents.window.getSelection();
      const text = selection ? selection.toString() : null;
      if (text) {
        handleTextSelection(cfiRange, text);
      }
    }
  } catch (selectionError) {
    console.warn('Erro ao processar seleção de texto:', selectionError);
  }
});
```

### 3. Timeouts para Operações Críticas
```typescript
// Carregar metadados com timeout de segurança
try {
  const meta = await Promise.race([
    newBook.loaded.metadata,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao carregar metadados')), 10000)
    )
  ]);
  setBookMetadata(meta);
} catch (metaError) {
  console.warn('Erro ao carregar metadados:', metaError);
  // Continuar sem os metadados
}
```

### 4. Opções de Renderização Seguras
```typescript
const newRendition = newBook.renderTo(viewerRef.current, {
  width: dimensions.width,
  height: dimensions.height,
  spread: viewerState.isDualPage ? 'auto' : 'none',
  flow: 'paginated',
  allowScriptedContent: false // Desabilitar scripts para evitar problemas
});
```

## Utilitários Auxiliares

### Arquivo: `utils/epubHelpers.ts`

#### Funções Principais:
- `waitForElementReady()`: Aguarda elemento estar pronto para acessar estilos
- `waitForRenditionReady()`: Aguarda renderização completa do EPUB
- `loadEpubMetadata()`: Carrega metadados com timeout
- `generateEpubLocations()`: Gera localizações com timeout
- `setupSafeRenditionListeners()`: Configura listeners com verificações de segurança
- `isWindowReady()`: Verifica se window object está pronto
- `waitForWindowReady()`: Aguarda window object estar pronto

### Exemplo de Uso:
```typescript
import { 
  waitForRenditionReady,
  loadEpubMetadata,
  generateEpubLocations,
  setupSafeRenditionListeners 
} from './utils/epubHelpers';

// Usar os utilitários na inicialização
const meta = await loadEpubMetadata(newBook);
await waitForRenditionReady(newRendition);
const totalPages = await generateEpubLocations(newBook);

setupSafeRenditionListeners(newRendition, newBook, {
  onPageChange: (page) => setCurrentPage(page),
  onTextSelection: (cfi, text) => handleTextSelection(cfi, text),
  onError: (error) => console.warn('Erro EPUB:', error)
});
```

## Verificações Adicionais

### 1. Verificar Estado do Document
```typescript
const isDocumentReady = (doc: Document): boolean => {
  return doc && doc.readyState === 'complete';
};
```

### 2. Verificar Window Context
```typescript
const isWindowValid = (win: Window): boolean => {
  return !!(win && 
           win.getComputedStyle && 
           typeof win.getComputedStyle === 'function');
};
```

### 3. Fallbacks Graceful
```typescript
try {
  const style = window.getComputedStyle(element);
  // Usar style...
} catch (error) {
  console.warn('getComputedStyle falhou:', error);
  // Usar valores padrão ou pular operação
}
```

## Prevenção de Problemas Futuros

### 1. Sempre Aguardar Eventos de Carregamento
- Use `book.ready` antes de qualquer operação
- Aguarde `rendition.display()` completar
- Escute por eventos `rendered` e `relocated`

### 2. Implementar Timeouts
- Todas as operações assíncronas devem ter timeouts
- Providenciar fallbacks quando timeouts ocorrerem
- Não bloquear a UI indefinidamente

### 3. Verificações de Null/Undefined
- Sempre verificar se objetos existem antes de usá-los
- Usar optional chaining (`?.`) quando disponível
- Implementar verificações de tipo

### 4. Logging Adequado
- Registrar erros para debugging
- Usar diferentes níveis de log (warn, error, info)
- Não expor erros técnicos para usuários finais

## Configurações Recomendadas

### package.json (dependências)
```json
{
  "epubjs": "^0.3.93",
  "screenfull": "^6.0.2"
}
```

### Configuração TypeScript
```typescript
// Tipos para EPUB.js
declare module 'epubjs' {
  export interface RenditionOptions {
    allowScriptedContent?: boolean;
    manager?: string;
    view?: string;
  }
}
```

Essas soluções foram implementadas nos componentes `EPUBViewer.tsx` e `OptimizedViewer.tsx` para resolver o problema do `getComputedStyle` retornando `null`. 