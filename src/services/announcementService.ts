import {
  AnnouncementDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementFilter,
  AnnouncementPriority,
  AnnouncementScopeType,
} from '@/types/announcement';
import {
  PaginatedResponse,
  AnnouncementResponseDto as ApiAnnouncementResponseDto,
} from '@/types/api';
import { apiService } from './api';

// Função para mapear a resposta da API para o DTO do frontend
const mapToAnnouncementDto = (data: ApiAnnouncementResponseDto): AnnouncementDto => ({
  id: data.id,
  title: data.title,
  content: data.content,
  author_id: data.author_id,
  expires_at: data.expires_at,
  priority: data.priority as AnnouncementPriority,
  scope: {
    type: data.scope.type as AnnouncementScopeType,
    targetId: data.scope.targetId,
  },
  is_active: true, // A API não parece fornecer, assumir como ativo
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getAnnouncements = async (params: AnnouncementFilter): Promise<PaginatedResponse<AnnouncementDto>> => {
<<<<<<< HEAD
  const response = await apiService.get<PaginatedResponse<ApiAnnouncementResponseDto>>('/announcements', { params });
  return {
    ...response,
    items: response.items.map(mapToAnnouncementDto),
  };
=======
  try {
    const response = await apiGet<any>('/announcements', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de announcements:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiAnnouncementResponseDto[] = [];
    let total = 0;
    let page = params.page || 1;
    let limit = params.limit || 10;
    let totalPages = 0;

    // Verificar se a resposta tem o formato padrão PaginatedResponse
    if (response && response.items && Array.isArray(response.items)) {
      items = response.items;
      total = response.total || 0;
      page = response.page || page;
      limit = response.limit || limit;
      totalPages = response.totalPages || Math.ceil(total / limit);
    }
    // Verificar se a resposta tem formato ApiResponse com data
    else if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
      items = response.data.items;
      total = response.data.total || 0;
      page = response.data.page || page;
      limit = response.data.limit || limit;
      totalPages = response.data.totalPages || Math.ceil(total / limit);
    }
    // Verificar se a resposta é diretamente um array
    else if (response && Array.isArray(response)) {
      items = response;
      total = response.length;
      totalPages = Math.ceil(total / limit);
    }
    // Se não conseguiu identificar o formato, usar valores padrão
    else {
      console.warn('⚠️ [API] Formato de resposta não reconhecido para announcements:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToAnnouncementDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar announcements:', error);
    
    // Retornar uma resposta vazia em caso de erro
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 0,
    };
  }
>>>>>>> 2b9a658619be4be8442857987504eeff79e3f6b9
};

export const getAnnouncementById = async (id: string): Promise<AnnouncementDto> => {
  const response = await apiService.get<ApiAnnouncementResponseDto>(`/announcements/${id}`);
  return mapToAnnouncementDto(response);
};

export const createAnnouncement = async (data: CreateAnnouncementDto): Promise<AnnouncementDto> => {
  const response = await apiService.post<ApiAnnouncementResponseDto>('/announcements', data);
  return mapToAnnouncementDto(response);
};

export const updateAnnouncement = async (id: string, data: UpdateAnnouncementDto): Promise<AnnouncementDto> => {
  const response = await apiService.put<ApiAnnouncementResponseDto>(`/announcements/${id}`, data);
  return mapToAnnouncementDto(response);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await apiService.delete(`/announcements/${id}`);
};

export const toggleAnnouncementStatus = async (id: string, isActive: boolean): Promise<AnnouncementDto> => {
  const response = await apiService.patch<ApiAnnouncementResponseDto>(`/announcements/${id}/status`, { isActive });
  return mapToAnnouncementDto(response);
};

export const announcementService = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
};