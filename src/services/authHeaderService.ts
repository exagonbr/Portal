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

    // Busca o accessToken usando o serviço unificado
    const accessToken = await UnifiedAuthService.getAccessToken();
    
    // Sempre adicionar o header Authorization: Bearer {token}
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      console.warn("⚠️ [API] Token de autenticação não encontrado. As requisições à API podem falhar.");
      
      // Tentar recuperar token de outras fontes como fallback
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const alternativeTokens = [
            localStorage.getItem('accessToken'),
            localStorage.getItem('token'),
            localStorage.getItem('authToken')
          ].filter(Boolean);
          
          if (alternativeTokens.length > 0) {
            const token = alternativeTokens[0];
            if (token) {
              headers.set('Authorization', `Bearer ${token}`);
            }
          }
        } catch (error) {
          console.error("❌ [API] Erro ao tentar acessar tokens alternativos:", error);
        }
      }
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