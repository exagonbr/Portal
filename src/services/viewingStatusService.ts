import { apiGet, apiPost, apiPatch, apiDelete } from '@/services/apiService';

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

// Cache para armazenar dados offline
let viewingStatusCache: Record<string, any> = {};

// Função auxiliar para verificar conectividade
const checkApiConnectivity = async (): Promise<boolean> => {
  try {
    // Tentar um endpoint simples primeiro
    await apiGet('/health', { timeout: 3000 });
    return true;
  } catch (error) {
    console.warn('API não disponível, usando modo offline:', error);
    return false;
  }
};

// Função auxiliar para salvar no cache
const saveToCache = (key: string, data: any) => {
  try {
    viewingStatusCache[key] = {
      data,
      timestamp: Date.now()
    };
    // Também salvar no localStorage se disponível
    if (typeof window !== 'undefined') {
      localStorage.setItem(`viewing_status_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    }
  } catch (error) {
    console.warn('Erro ao salvar no cache:', error);
  }
};

// Função auxiliar para carregar do cache
const loadFromCache = (key: string, maxAge: number = 300000): any | null => {
  try {
    // Primeiro tentar cache em memória
    let cached = viewingStatusCache[key];
    
    // Se não houver, tentar localStorage
    if (!cached && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`viewing_status_${key}`);
      if (stored) {
        cached = JSON.parse(stored);
      }
    }
    
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.data;
    }
    return null;
  } catch (error) {
    console.warn('Erro ao carregar do cache:', error);
    return null;
  }
};

/**
 * Registra o progresso de visualização de um vídeo
 */
export async function trackVideoProgress(params: TrackVideoProgressParams): Promise<any> {
  try {
    const response = await apiPost('/activity/viewing-status', params);
    return response;
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
    const response = await apiPost('/viewing-status/interaction', params);
    return response;
  } catch (error) {
    console.error('Erro ao registrar interação com vídeo:', error);
    throw error;
  }
}

/**
 * Inicia uma nova sessão de visualização
 */
export async function startVideoSession(videoId: number, tvShowId?: number): Promise<any> {
  const cacheKey = `session_${videoId}`;
  
  try {
    // Verificar conectividade
    const isOnline = await checkApiConnectivity();
    if (!isOnline) {
      console.log('📱 Modo offline: criando sessão local para vídeo:', videoId);
      const localSession = {
        id: `local_${videoId}_${Date.now()}`,
        videoId,
        tvShowId,
        startTime: new Date().toISOString(),
        source: 'offline'
      };
      saveToCache(cacheKey, localSession);
      return localSession;
    }

    const response = await apiPost('/viewing-status/start', { 
      videoId, 
      tvShowId 
    });
    
    // Salvar no cache
    saveToCache(cacheKey, response);
    
    return response;
  } catch (error) {
    console.warn('⚠️ Erro ao iniciar sessão de vídeo, criando sessão local:', error);
    
    // Criar sessão local como fallback
    const localSession = {
      id: `fallback_${videoId}_${Date.now()}`,
      videoId,
      tvShowId,
      startTime: new Date().toISOString(),
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    saveToCache(cacheKey, localSession);
    return localSession;
  }
}

/**
 * Obtém o status de visualização de um vídeo
 */
export async function getVideoStatus(videoId: number, tvShowId?: number): Promise<any> {
  try {
    const params: Record<string, any> = {};
    if (tvShowId) {
      params.tvShowId = tvShowId.toString();
    }
    
    const response = await apiGet(`/viewing-status/status/${videoId}`, params);
    return response;
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
    const params: Record<string, any> = {
      limit,
      offset
    };
    
    if (completed !== undefined) {
      params.completed = completed.toString();
    }
    
    if (contentType) {
      params.contentType = contentType;
    }
    
    try {
      const response = await apiGet('/viewing-status/history', params);
      return response;
    } catch (error) {
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
    const response = await apiGet('/viewing-status/stats');
    return response;
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
    const params: Record<string, any> = {};
    if (tvShowId) {
      params.tvShowId = tvShowId.toString();
    }
    
    const response = await apiDelete(`/viewing-status/status/${videoId}?${new URLSearchParams(params).toString()}`);
    return response;
  } catch (error) {
    console.error('Erro ao remover status do vídeo:', error);
    throw error;
  }
}

export async function getViewingStatus(videoId: number): Promise<any> {
  const cacheKey = `status_${videoId}`;
  
  try {
    // Tentar carregar do cache primeiro
    const cached = loadFromCache(cacheKey);
    if (cached) {
      console.log('📱 Carregando status do cache para vídeo:', videoId);
      return cached;
    }

    // Verificar conectividade
    const isOnline = await checkApiConnectivity();
    if (!isOnline) {
      return { progress: 0, completed: false, source: 'offline' };
    }

    const response = await apiGet(`/viewing-status/${videoId}`);
    
    // Salvar no cache
    saveToCache(cacheKey, response);
    
    return response;
  } catch (error) {
    console.warn('⚠️ Erro ao buscar status de visualização:', error);
    
    // Retornar dados padrão em caso de erro
    return { 
      progress: 0, 
      completed: false, 
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function updateVideoProgress(videoId: number, progress: number): Promise<any> {
  const cacheKey = `progress_${videoId}`;
  
  try {
    // Sempre salvar progresso localmente primeiro
    const progressData = {
      videoId,
      progress,
      timestamp: new Date().toISOString(),
      updated: Date.now()
    };
    
    saveToCache(cacheKey, progressData);
    
    // Verificar conectividade
    const isOnline = await checkApiConnectivity();
    if (!isOnline) {
      console.log('📱 Modo offline: salvando progresso localmente para vídeo:', videoId);
      return progressData;
    }

    // Tentar enviar para API
    const response = await apiPatch(`/viewing-status/${videoId}`, { progress });
    
    return response;
  } catch (error) {
    console.warn('⚠️ Erro ao atualizar progresso, mantendo dados locais:', error);
    
    // Retornar dados locais em caso de erro
    const cachedProgress = loadFromCache(cacheKey);
    return cachedProgress || { 
      videoId, 
      progress, 
      source: 'local',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function completeVideo(videoId: number): Promise<any> {
  const cacheKey = `completed_${videoId}`;
  
  try {
    // Marcar como completo localmente primeiro
    const completionData = {
      videoId,
      completed: true,
      completedAt: new Date().toISOString(),
      progress: 100
    };
    
    saveToCache(cacheKey, completionData);
    
    // Verificar conectividade
    const isOnline = await checkApiConnectivity();
    if (!isOnline) {
      console.log('📱 Modo offline: marcando vídeo como completo localmente:', videoId);
      return completionData;
    }

    const response = await apiPatch(`/viewing-status/${videoId}/complete`, {});
    
    return response;
  } catch (error) {
    console.warn('⚠️ Erro ao marcar vídeo como completo, mantendo dados locais:', error);
    
    // Retornar dados locais
    const cachedCompletion = loadFromCache(cacheKey);
    return cachedCompletion || { 
      videoId, 
      completed: true, 
      source: 'local',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Função para sincronizar dados em cache quando a conectividade for restaurada
export async function syncPendingData(): Promise<void> {
  try {
    const isOnline = await checkApiConnectivity();
    if (!isOnline) {
      console.log('📡 Ainda offline, adiando sincronização');
      return;
    }

    console.log('📡 Conectividade restaurada, sincronizando dados pendentes...');
    
    // Aqui poderia implementar lógica para sincronizar dados em cache
    // Por enquanto, apenas limpar dados muito antigos
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('viewing_status_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            // Remover dados com mais de 24 horas
            if (Date.now() - data.timestamp > 86400000) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            console.warn('Erro ao processar item do cache:', key, error);
          }
        }
      });
    }
    
  } catch (error) {
    console.warn('Erro durante sincronização:', error);
  }
} 