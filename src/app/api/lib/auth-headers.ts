import { NextRequest } from 'next/server';
import { getAuthentication } from '@/lib/auth-utils';

/**
 * Prepara os headers de autenticação para requisições proxy ao backend
 */
export async function prepareAuthHeaders(request: NextRequest): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // Copiar header de autorização se existir (case insensitive)
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Adicionar header X-Auth-Token se existir
    const xAuthToken = request.headers.get('X-Auth-Token') || request.headers.get('x-auth-token');
    if (xAuthToken) {
      headers['X-Auth-Token'] = xAuthToken;
    }

    // Tentar extrair token dos cookies se não houver Authorization header
    if (!authHeader && !xAuthToken) {
      const cookieHeader = request.headers.get('Cookie');
      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
        
        try {
          // Tentar extrair token específico dos cookies
          const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
              acc[name] = decodeURIComponent(value);
            }
            return acc;
          }, {});
          
          // Usar getAuthentication para obter o token de forma segura no servidor
          const session = await getAuthentication(request);
          
          if (session) {
            // Se não temos Authorization header mas temos sessão válida, usar o token da requisição
            const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
              const token = authHeader.substring(7);
              headers['Authorization'] = `Bearer ${token}`;
            }
          }
        } catch (cookieError) {
          // Erro ao processar cookies
        }
      }
    }

    // Adicionar User-Agent se existir
    const userAgent = request.headers.get('User-Agent');
    if (userAgent) {
      headers['User-Agent'] = userAgent;
    }

    return headers;
  } catch (error) {
    // Retornar headers básicos em caso de erro
    return {
      'Content-Type': 'application/json',
      'User-Agent': request.headers.get('User-Agent') || 'Next.js API'
    };
  }
} 
