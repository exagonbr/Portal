import { NextRequest } from 'next/server';
import { getAuthentication } from '@/lib/auth-utils';

/**
 * Prepara os headers de autenticação para requisições proxy ao backend
 */
export async function prepareAuthHeaders(request: NextRequest): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  console.log('🔍 [AUTH-HEADERS] Preparando headers de autenticação...');

  try {
    // Copiar header de autorização se existir (case insensitive)
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('🔐 [AUTH-HEADERS] Authorization header encontrado e copiado:', {
        length: authHeader.length,
        preview: authHeader.substring(0, 20) + '...',
        hasBearer: authHeader.startsWith('Bearer ')
      });
    }

    // Adicionar header X-Auth-Token se existir
    const xAuthToken = request.headers.get('X-Auth-Token') || request.headers.get('x-auth-token');
    if (xAuthToken) {
      headers['X-Auth-Token'] = xAuthToken;
      console.log('🔐 [AUTH-HEADERS] X-Auth-Token header encontrado e copiado');
    }

    // Tentar extrair token dos cookies se não houver Authorization header
    if (!authHeader && !xAuthToken) {
      console.log('🔍 [AUTH-HEADERS] Nenhum header de auth encontrado, verificando cookies...');
      
      const cookieHeader = request.headers.get('Cookie');
      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
        console.log('🍪 [AUTH-HEADERS] Cookie header encontrado:', cookieHeader.length, 'caracteres');
        
        try {
          // Tentar extrair token específico dos cookies
          const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
              acc[name] = decodeURIComponent(value);
            }
            return acc;
          }, {});
          
          console.log('🍪 [AUTH-HEADERS] Cookies encontrados:', Object.keys(cookies));
          
          // Usar getAuthentication para obter o token de forma segura no servidor
          const session = await getAuthentication(request);
          
          if (session) {
            // Se não temos Authorization header mas temos sessão válida, usar o token da requisição
            const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
              const token = authHeader.substring(7);
              headers['Authorization'] = `Bearer ${token}`;
              console.log('🔐 [AUTH-HEADERS] Token extraído da sessão e adicionado ao Authorization header');
            }
          } else {
            console.warn('⚠️ [AUTH-HEADERS] Sessão não encontrada ou inválida');
          }
        } catch (cookieError) {
          console.error('❌ [AUTH-HEADERS] Erro ao processar cookies:', cookieError);
        }
      } else {
        console.warn('⚠️ [AUTH-HEADERS] Nenhum cookie encontrado');
      }
    }

    // Adicionar User-Agent se existir
    const userAgent = request.headers.get('User-Agent');
    if (userAgent) {
      headers['User-Agent'] = userAgent;
    }

    // Log para debug
    console.log('📤 [AUTH-HEADERS] Headers preparados:', {
      keys: Object.keys(headers),
      hasAuth: !!headers['Authorization'],
      hasXAuth: !!headers['X-Auth-Token'],
      hasCookie: !!headers['Cookie']
    });

    // Verificação final - garantir que há algum método de autenticação
    if (!headers['Authorization'] && !headers['X-Auth-Token'] && !headers['Cookie']) {
      console.log('❌ [AUTH-HEADERS] ERRO: Nenhum método de autenticação encontrado!');
      console.log('🔍 [AUTH-HEADERS] Headers da requisição original:', {
        authorization: request.headers.get('Authorization'),
        xAuthToken: request.headers.get('X-Auth-Token'),
        cookie: request.headers.get('Cookie'),
        allHeaders: Array.from(request.headers.entries()).slice(0, 10) // Limitar para evitar logs enormes
      });
    }

    return headers;
  } catch (error) {
    console.error('❌ [AUTH-HEADERS] Erro ao preparar headers:', error);
    
    // Retornar headers básicos em caso de erro
    return {
      'Content-Type': 'application/json',
      'User-Agent': request.headers.get('User-Agent') || 'Next.js API'
    };
  }
} 
