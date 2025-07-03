// Configuração para desabilitar cache completamente
export const cacheConfig = {
  // Desabilitar cache de dados
  revalidate: 0,
  cache: 'no-store' as const,
  next: {
    revalidate: 0,
    tags: []
  }
};

// Headers para requisições sem cache
export const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate, private',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store',
  'X-Accel-Expires': '0',
};

// Função para adicionar timestamp único a URLs
export function addCacheBuster(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_cb=${Date.now()}`;
}

// Hook para forçar revalidação
export function useNoCache() {
  if (typeof window !== 'undefined') {
    // Desabilitar cache do navegador
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    });
    
    // Adicionar meta tags para no-cache
    const metaTags = [
      { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { 'http-equiv': 'Pragma', content: 'no-cache' },
      { 'http-equiv': 'Expires', content: '0' }
    ];
    
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      Object.entries(tag).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      document.head.appendChild(meta);
    });
  }
}

// Configuração para fetch sem cache
export const fetchConfig: RequestInit = {
  cache: 'no-store',
  headers: noCacheHeaders,
  next: {
    revalidate: 0
  } as any
};