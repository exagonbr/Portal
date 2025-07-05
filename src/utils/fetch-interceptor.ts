/**
 * Interceptor de fetch para lidar com problemas de CORS e network errors
 */

// URLs que devem ser ignoradas pelo interceptor
const IGNORED_DOMAINS = [
  'plugin.handtalk.me',
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.com',
  'twitter.com'
];

// Verificar se uma URL deve ser ignorada
function shouldIgnoreUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return IGNORED_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

// Interceptor original de fetch
let originalFetch: typeof fetch;

/**
 * Instala o interceptor de fetch
 */
export function installFetchInterceptor(): void {
  if (typeof window === 'undefined') return;
  
  // Salvar o fetch original se ainda não foi salvo
  if (!originalFetch) {
    originalFetch = window.fetch;
  }

  // Substituir fetch global
  window.fetch = async function interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // Ignorar URLs específicas para evitar problemas de CORS
    if (shouldIgnoreUrl(url)) {
      try {
        return await originalFetch(input, init);
      } catch (error) {
        // Para URLs ignoradas, falhar silenciosamente
        console.warn(`⚠️ Fetch ignorado para ${url}:`, error);
        
        // Retornar uma resposta de erro que não quebra a aplicação
        return new Response(JSON.stringify({ error: 'CORS blocked' }), {
          status: 0,
          statusText: 'CORS Error',
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    try {
      // Para outras URLs, usar fetch normal com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await originalFetch(input, {
        ...init,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error: any) {
      // Tratar diferentes tipos de erro
      if (error.name === 'AbortError') {
        console.warn(`⚠️ Timeout em fetch para ${url}`);
        throw new Error('Request timeout');
      }

      if (error.message?.includes('CORS') || error.message?.includes('NetworkError')) {
        console.warn(`⚠️ Erro de CORS/Network para ${url}:`, error);
        
        // Para erros de CORS, retornar resposta de erro controlada
        return new Response(JSON.stringify({ error: 'Network error' }), {
          status: 0,
          statusText: 'Network Error',
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Para outros erros, re-throw
      throw error;
    }
  };

  console.log('🔧 Interceptor de fetch instalado');
}

/**
 * Remove o interceptor de fetch
 */
export function uninstallFetchInterceptor(): void {
  if (typeof window === 'undefined' || !originalFetch) return;
  
  window.fetch = originalFetch;
  console.log('🗑️ Interceptor de fetch removido');
}

/**
 * Fetch seguro que não quebra a aplicação
 */
export async function safeFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response | null> {
  try {
    const response = await fetch(input, init);
    return response;
  } catch (error) {
    console.warn('⚠️ Safe fetch falhou:', error);
    return null;
  }
}

/**
 * Fetch com retry automático
 */
export async function retryFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input, init);
      
      if (response.ok || attempt === maxRetries) {
        return response;
      }
      
      // Se não é ok e ainda há tentativas, continuar
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        console.warn(`⚠️ Tentativa ${attempt} falhou, tentando novamente em ${delay}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError!;
} 