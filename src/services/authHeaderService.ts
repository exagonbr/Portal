import { UnifiedAuthService } from './unifiedAuthService';

/**
 * Serviço centralizado para gerenciar headers de autorização
 * Garante que todas as requisições incluam o header Authorization: Bearer {token}
 */
export class AuthHeaderService {
  /**
   * Retorna os headers padrões para as requisições à API.
   * Sempre inclui o header Authorization: Bearer {token} quando disponível.
   * 
   * @param includeContentType - Se deve incluir o header Content-Type: application/json
   * @returns Headers para uso em requisições fetch
   */
  static async getHeaders(includeContentType: boolean = true): Promise<Headers> {
    const headers = new Headers();
    
    if (includeContentType) {
      headers.set('Content-Type', 'application/json');
    }

    // Tentar obter token do localStorage se estivermos no cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken') || 
                    localStorage.getItem('auth_token') || 
                    localStorage.getItem('token') ||
                    localStorage.getItem('authToken');
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        console.log('✅ [AUTH] Token encontrado no localStorage');
      } else {
        console.log('⚠️ [AUTH] Nenhum token encontrado no localStorage');
      }
    } else {
      console.log('⚠️ [AUTH] Executando no servidor - sem acesso ao localStorage');
    }
    
    return headers;
  }

  /**
   * Retorna os headers como um objeto para uso com Axios ou outras bibliotecas
   * 
   * @param includeContentType - Se deve incluir o header Content-Type: application/json
   * @returns Objeto de headers para uso em requisições
   */
  static async getHeadersObject(includeContentType: boolean = true): Promise<Record<string, string>> {
    const headers = await this.getHeaders(includeContentType);
    const headerObject: Record<string, string> = {};
    
    headers.forEach((value, key) => {
      headerObject[key] = value;
    });
    
    return headerObject;
  }
} 