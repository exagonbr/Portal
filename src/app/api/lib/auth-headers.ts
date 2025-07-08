import { NextRequest } from 'next/server';
import { getAuthentication } from '@/lib/auth-utils';

/**
 * Prepara os headers de autenticação para requisições proxy ao backend
 */
export function prepareAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    console.log('🔧 [AUTH-HEADERS] Preparando headers de autenticação...');

    // Copiar header de autorização se existir (case insensitive)
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader) {
      console.log('✅ [AUTH-HEADERS] Authorization header encontrado');
      headers['Authorization'] = authHeader;
    } else {
      console.log('⚠️ [AUTH-HEADERS] Nenhum Authorization header encontrado');
    }

    // Adicionar header X-Auth-Token se existir
    const xAuthToken = request.headers.get('X-Auth-Token') || request.headers.get('x-auth-token');
    if (xAuthToken) {
      console.log('✅ [AUTH-HEADERS] X-Auth-Token header encontrado');
      headers['X-Auth-Token'] = xAuthToken;
    }

    // Tentar extrair token dos cookies se não houver Authorization header
    if (!authHeader && !xAuthToken) {
      console.log('🔍 [AUTH-HEADERS] Tentando extrair token dos cookies...');
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
          
          // Procurar por tokens conhecidos nos cookies
          const tokenKeys = ['accessToken', 'auth_token', 'token', 'authToken'];
          for (const key of tokenKeys) {
            if (cookies[key]) {
              console.log(`✅ [AUTH-HEADERS] Token encontrado no cookie: ${key}`);
              headers['Authorization'] = `Bearer ${cookies[key]}`;
              break;
            }
          }
        } catch (cookieError) {
          console.error('❌ [AUTH-HEADERS] Erro ao processar cookies:', cookieError);
        }
      } else {
        console.log('❌ [AUTH-HEADERS] Nenhum cookie encontrado');
      }
    }

    // Adicionar User-Agent se existir
    const userAgent = request.headers.get('User-Agent');
    if (userAgent) {
      headers['User-Agent'] = userAgent;
    }

    console.log('📦 [AUTH-HEADERS] Headers preparados:', Object.keys(headers));
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
