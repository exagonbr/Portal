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
    let accessToken = await UnifiedAuthService.getAccessToken();
    
    // Se não encontrou pelo método principal, tentar métodos alternativos
    if (!accessToken) {
      console.warn("⚠️ [API] Token principal não encontrado, tentando fontes alternativas...");
      
      // Tentar recuperar token de outras fontes como fallback
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const alternativeTokens = [
            localStorage.getItem('accessToken'),
            localStorage.getItem('token'),
            localStorage.getItem('authToken'),
            localStorage.getItem('auth_token')
          ].filter(Boolean);
          
          if (alternativeTokens.length > 0) {
            accessToken = alternativeTokens[0] || null;
            console.log("✅ [API] Token alternativo encontrado");
          }
        } catch (error) {
          console.error("❌ [API] Erro ao tentar acessar tokens alternativos:", error);
        }
      }
      
      // Tentar obter dos cookies
      if (!accessToken) {
        try {
          const cookieToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('access_token=') || row.startsWith('auth_token='))
            ?.split('=')[1];
            
          if (cookieToken) {
            accessToken = cookieToken;
            console.log("✅ [API] Token encontrado nos cookies");
          }
        } catch (error) {
          console.error("❌ [API] Erro ao tentar acessar tokens nos cookies:", error);
        }
      }
    }
    
    // Sempre adicionar o header Authorization: Bearer {token}
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      console.warn("⚠️ [API] Token de autenticação não encontrado. As requisições à API podem falhar.");
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