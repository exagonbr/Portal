import { api } from '@/lib/api';

interface TrackVideoProgressParams {
  videoId: number;
  currentPlayTime: number;
  totalDuration?: number;
  tvShowId?: number;
  contentType?: string;
  contentId?: number;
  quality?: string;
  playbackSpeed?: number;
  subtitleLanguage?: string;
  audioLanguage?: string;
}

interface VideoInteractionParams {
  videoId: number;
  action: 'play' | 'pause' | 'seek' | 'replay' | 'quality_change' | 'speed_change';
  timestamp: number;
  value?: any;
}

/**
 * Registra o progresso de visualização de um vídeo
 */
export async function trackVideoProgress(params: TrackVideoProgressParams): Promise<any> {
  try {
    const response = await api.post('/api/activity/viewing-status', params);
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar progresso de vídeo:', error);
    throw error;
  }
}

/**
 * Registra uma interação do usuário com o vídeo
 */
export async function trackVideoInteraction(params: VideoInteractionParams): Promise<any> {
  try {
    const response = await api.post('/viewing-status/interaction', params);
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar interação com vídeo:', error);
    throw error;
  }
}

/**
 * Inicia uma nova sessão de visualização
 */
export async function startVideoSession(videoId: number, tvShowId?: number): Promise<any> {
  try {
    const response = await api.post('/viewing-status/start', { videoId, tvShowId });
    return response.data;
  } catch (error) {
    console.error('Erro ao iniciar sessão de vídeo:', error);
    throw error;
  }
}

/**
 * Obtém o status de visualização de um vídeo
 */
export async function getVideoStatus(videoId: number, tvShowId?: number): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (tvShowId) {
      params.append('tvShowId', tvShowId.toString());
    }
    
    const response = await api.get(`/viewing-status/status/${videoId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter status do vídeo:', error);
    throw error;
  }
}

/**
 * Obtém o histórico de visualização do usuário
 */
export async function getWatchHistory(
  limit = 10, 
  offset = 0, 
  completed?: boolean, 
  contentType?: string
): Promise<any> {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    if (completed !== undefined) {
      params.append('completed', completed.toString());
    }
    
    if (contentType) {
      params.append('contentType', contentType);
    }
    
    // Adicionar timeout para evitar que a requisição fique pendente por muito tempo
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos
    
    try {
      const response = await api.get(`/viewing-status/history?${params.toString()}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response.data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Verificar se é um erro de timeout
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Timeout ao buscar histórico de visualização');
      }
      
      // Verificar se é um erro relacionado a tabela não existente
      if (error instanceof Error && 
          (error.message.includes('does not exist') || 
           error.message.includes('relation') || 
           error.message.includes('42P01'))) {
        console.error('Erro de tabela não existente no banco de dados');
      }
      
      // Retornar um objeto vazio como fallback
      return { 
        success: false, 
        items: [],
        message: 'Erro ao carregar histórico - funcionalidade temporariamente indisponível'
      };
    }
  } catch (error) {
    console.error('Erro ao obter histórico de visualização:', error);
    
    // Retornar um objeto vazio como fallback
    return { 
      success: false, 
      items: [],
      message: 'Erro ao carregar histórico - funcionalidade temporariamente indisponível'
    };
  }
}

/**
 * Obtém estatísticas de visualização do usuário
 */
export async function getViewingStats(): Promise<any> {
  try {
    const response = await api.get('/viewing-status/stats');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter estatísticas de visualização:', error);
    throw error;
  }
}

/**
 * Remove um status de visualização
 */
export async function removeVideoStatus(videoId: number, tvShowId?: number): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (tvShowId) {
      params.append('tvShowId', tvShowId.toString());
    }
    
    const response = await api.delete(`/viewing-status/status/${videoId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao remover status do vídeo:', error);
    throw error;
  }
} 