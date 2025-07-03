import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clonar a resposta para adicionar headers
  const response = NextResponse.next();

  // Headers agressivos de no-cache para TODAS as requisições
  response.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate, proxy-revalidate, s-maxage=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  response.headers.set('X-Accel-Expires', '0');
  response.headers.set('CDN-Cache-Control', 'no-cache');
  response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store, no-cache, private');
  response.headers.set('X-Vercel-Cache', 'no-cache');
  response.headers.set('X-Nextjs-Cache', 'no-cache');
  response.headers.set('Clear-Site-Data', '"cache"');
  
  // Headers de segurança
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Adicionar timestamp único para evitar cache
  response.headers.set('X-Request-Time', Date.now().toString());
  response.headers.set('X-Cache-Version', `no-cache-${Date.now()}`);
  
  // Vary header para forçar revalidação
  response.headers.set('Vary', '*');
  
  // Para requisições de API, adicionar headers extras
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    response.headers.set('X-API-No-Cache', 'true');
  }
  
  // Para páginas HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    response.headers.set('X-Robots-Tag', 'noarchive, nosnippet');
    response.headers.set('X-UA-Compatible', 'IE=edge');
  }
  
  // Log para debug
  if (process.env.NODE_ENV === 'development') {
    console.log(`[NO-CACHE] ${request.method} ${request.nextUrl.pathname}`);
  }

  return response;
}

// Configurar para quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files) 
     * - favicon.ico (favicon file)
     * But we want to include these too for aggressive no-cache
     */
    '/(.*)', // Aplicar para TODAS as rotas
  ],
};