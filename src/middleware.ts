import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware Desacoplado
 * Permite todas as requisições, pois a lógica de autenticação
 * agora é totalmente gerenciada no lado do cliente de forma mockada.
 */
export function middleware(request: NextRequest) {
  // Em modo desacoplado, o middleware não precisa de nenhuma lógica.
  // Apenas permite que a requisição continue.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplica a todas as rotas
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};