// src/services/analyticsSessionService.ts

import {
  ActiveSession,
  SystemUsageData,
  ResourceDistribution,
} from '@/types/analytics';

/**
 * Uma função helper para fazer requisições fetch e tratar erros.
 * Idealmente, isso seria compartilhado em toda a aplicação.
 */
const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = new Error('Ocorreu um erro ao buscar os dados de análise.');
    try {
        const errorData = await res.json();
        (error as any).info = errorData;
    } catch (e) {
        (error as any).info = { message: 'Não foi possível analisar a resposta de erro.' };
    }
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

/**
 * O objeto de serviço para buscar dados de análise de sessão e sistema.
 */
const analyticsSessionService = {
  /**
   * Busca a lista de sessões de usuário ativas.
   * Assumindo um endpoint de API em /api/admin/sessions/active.
   */
  getActiveSessions: async (): Promise<ActiveSession[]> => {
    return fetcher<ActiveSession[]>('/api/admin/sessions/active');
  },


  /**
   * Força o término de uma sessão de usuário.
   * @param sessionId - O ID da sessão a ser encerrada.
   */
  terminateSession: async (sessionId: string): Promise<{ success: boolean }> => {
    return fetcher<{ success: boolean }>(`/api/admin/sessions/${sessionId}/terminate`, {
      method: 'POST',
    });
  },
};

export { analyticsSessionService };