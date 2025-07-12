// Serviço para gerenciar sessões no Redis
import { getApiUrl } from '@/config/urls';
import { AuthHeaderService } from './authHeaderService';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  loginTime: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
}

export interface SessionResponse {
  success: boolean;
  data?: {
    sessionId: string;
    expiresIn: number;
  };
  message: string;
}

export class SessionService {
  private static async getHeaders(token?: string): Promise<HeadersInit> {
    if (token) {
      // Se um token específico for fornecido, usar ele ao invés do token do AuthHeaderService
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.set('Authorization', `Bearer ${token}`);
      return headers;
    } else {
      // Caso contrário, usar o AuthHeaderService
      return AuthHeaderService.getHeaders();
    }
  }

  /**
   * Cria uma nova sessão no Redis
   */
  static async createSession(
    sessionData: SessionData,
    token: string,
    expirationTime: number = 60 * 60 * 24 // 24 horas
  ): Promise<SessionResponse> {
    try {
      console.log('🔄 Criando sessão no Redis...');

      const response = await fetch(`${getApiUrl()}/sessions/create`, {
        method: 'POST',
        headers: await this.getHeaders(token),
        body: JSON.stringify({
          userId: sessionData.userId,
          email: sessionData.email
        }),
      });

      const result: SessionResponse = await response.json();

      if (result.success) {
        console.log('✅ Sessão criada no Redis:', result.data?.sessionId);
      } else {
        console.error('❌ Erro ao criar sessão:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ Erro na comunicação com Redis:', error);
      return {
        success: false,
        message: 'Erro na comunicação com o servidor de sessões'
      };
    }
  }

  /**
   * Obtém dados de uma sessão do Redis
   */
  static async getSession(sessionId: string, token: string): Promise<{
    success: boolean;
    data?: SessionData;
    message: string;
  }> {
    try {
      console.log('🔍 Buscando sessão no Redis:', sessionId);

      const response = await fetch(`${getApiUrl()}/sessions/${sessionId}`, {
        method: 'GET',
        headers: await this.getHeaders(token),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Sessão encontrada no Redis');
      } else {
        console.warn('⚠️ Sessão não encontrada:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar sessão:', error);
      return {
        success: false,
        message: 'Erro na comunicação com o servidor de sessões'
      };
    }
  }

  /**
   * Atualiza dados de uma sessão no Redis
   */
  static async updateSession(
    sessionId: string,
    updateData: Partial<SessionData>,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Atualizando sessão no Redis:', sessionId);

      const response = await fetch(`${getApiUrl()}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: await this.getHeaders(token),
        body: JSON.stringify({
          ...updateData,
          lastActivity: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Sessão atualizada no Redis');
      } else {
        console.error('❌ Erro ao atualizar sessão:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao atualizar sessão:', error);
      return {
        success: false,
        message: 'Erro na comunicação com o servidor de sessões'
      };
    }
  }

  /**
   * Remove uma sessão do Redis
   */
  static async deleteSession(sessionId: string, token?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🗑️ Removendo sessão do Redis:', sessionId);

      const response = await fetch(`${getApiUrl()}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: await this.getHeaders(token),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Sessão removida do Redis');
      } else {
        console.warn('⚠️ Erro ao remover sessão:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao remover sessão:', error);
      return {
        success: false,
        message: 'Erro na comunicação com o servidor de sessões'
      };
    }
  }

  /**
   * Estende o tempo de vida de uma sessão
   */
  static async extendSession(
    sessionId: string,
    additionalTime: number,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('⏰ Estendendo sessão no Redis:', sessionId);

      const response = await fetch(`${getApiUrl()}/sessions/${sessionId}/extend`, {
        method: 'POST',
        headers: await this.getHeaders(token),
        body: JSON.stringify({ additionalTime }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Sessão estendida no Redis');
      } else {
        console.error('❌ Erro ao estender sessão:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao estender sessão:', error);
      return {
        success: false,
        message: 'Erro na comunicação com o servidor de sessões'
      };
    }
  }

  /**
   * Lista todas as sessões ativas de um usuário
   */
  static async getUserSessions(userId: string, token: string): Promise<{
    success: boolean;
    data?: Array<{ sessionId: string; sessionData: SessionData; expiresAt: string }>;
    message: string;
  }> {
    try {
      console.log('📋 Listando sessões do usuário:', userId);

      const response = await fetch(`${getApiUrl()}/sessions/user/${userId}`, {
        method: 'GET',
        headers: await this.getHeaders(token),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Encontradas ${result.data?.length || 0} sessões ativas`);
      } else {
        console.warn('⚠️ Erro ao listar sessões:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao listar sessões:', error);
      return {
        success: false,
        message: 'Erro na comunicação com o servidor de sessões'
      };
    }
  }

  /**
   * Remove todas as sessões de um usuário (logout de todos os dispositivos)
   */
  static async deleteAllUserSessions(userId: string, token: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🗑️ Removendo todas as sessões do usuário:', userId);

      const response = await fetch(`${getApiUrl()}/sessions/user/${userId}/all`, {
        method: 'DELETE',
        headers: await this.getHeaders(token),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Todas as sessões do usuário foram removidas');
      } else {
        console.error('❌ Erro ao remover sessões:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao remover sessões:', error);
      return {
        success: false,
        message: 'Erro na comunicação com o servidor de sessões'
      };
    }
  }

  /**
   * Atualiza a atividade da sessão (heartbeat)
   */
  static async updateActivity(sessionId: string, token: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${getApiUrl()}/sessions/${sessionId}/activity`, {
        method: 'POST',
        headers: await this.getHeaders(token),
        body: JSON.stringify({
          lastActivity: new Date().toISOString()
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade:', error);
      return {
        success: false,
        message: 'Erro na comunicação com o servidor de sessões'
      };
    }
  }
}

// Export para compatibilidade com imports existentes
export const sessionService = SessionService; 