import { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { CookieManager } from '@/utils/cookieManager';

/**
 * Interface para o resultado da autenticação
 */
interface AuthResult {
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
  accessToken?: string;
  isAuthenticated: boolean;
}

/**
 * Extrai informações de autenticação da requisição
 * Verifica token no header Authorization e em cookies
 */
export async function authenticate(request: NextRequest): Promise<AuthResult | null> {
  try {
    // Tentar obter token do header Authorization
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    // Se não encontrou no header, tentar obter dos cookies
    if (!token) {
      const cookies = request.cookies;
      token = cookies.get('auth_token')?.value || cookies.get('accessToken')?.value || null;
    }
    
    if (!token) {
      return null;
    }
    
    // Decodificar o token
    try {
      const decoded = jwtDecode<any>(token);
      
      // Verificar se o token tem as informações necessárias
      if (!decoded || !decoded.id) {
        return null;
      }
      
      return {
        user: {
          id: decoded.id.toString(),
          email: decoded.email || '',
          name: decoded.name,
          role: decoded.role
        },
        accessToken: token,
        isAuthenticated: true
      };
    } catch (error) {
      console.error('❌ Erro ao decodificar token JWT:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao autenticar requisição:', error);
    return null;
  }
} 