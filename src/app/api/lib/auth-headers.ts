import { NextRequest } from 'next/server';

/**
 * Prepara os headers de autenticação para requisições proxy ao backend
 */
export function prepareAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Copiar header de autorização se existir (case insensitive)
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
    console.log('🔐 Authorization header encontrado e copiado');
  }

  // Adicionar header X-Auth-Token se existir
  const xAuthToken = request.headers.get('X-Auth-Token') || request.headers.get('x-auth-token');
  if (xAuthToken) {
    headers['X-Auth-Token'] = xAuthToken;
    console.log('🔐 X-Auth-Token header encontrado e copiado');
  }

  // Tentar extrair token dos cookies se não houver Authorization header
  if (!authHeader && !xAuthToken) {
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      
      // Tentar extrair token específico dos cookies
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          acc[name] = value;
        }
        return acc;
      }, {});
      
      const token = cookies.auth_token || cookies.token || cookies.authToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Token extraído dos cookies e adicionado ao Authorization header');
      }
    }
  }

  // Adicionar User-Agent se existir
  const userAgent = request.headers.get('User-Agent');
  if (userAgent) {
    headers['User-Agent'] = userAgent;
  }

  // Log para debug em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('📤 Headers preparados:', Object.keys(headers));
  }

  return headers;
} 