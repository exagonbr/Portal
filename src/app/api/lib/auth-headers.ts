import { NextRequest } from 'next/server';

/**
 * Prepara os headers de autenticação para requisições proxy ao backend
 */
export function prepareAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Copiar header de autorização se existir
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  // Copiar cookies se existirem
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  // Adicionar header X-Auth-Token se existir
  const xAuthToken = request.headers.get('X-Auth-Token');
  if (xAuthToken) {
    headers['X-Auth-Token'] = xAuthToken;
  }

  // Adicionar User-Agent se existir
  const userAgent = request.headers.get('User-Agent');
  if (userAgent) {
    headers['User-Agent'] = userAgent;
  }

  return headers;
} 