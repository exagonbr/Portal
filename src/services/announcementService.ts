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
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

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
  const response = await apiGet<PaginatedResponse<ApiAnnouncementResponseDto>>('/announcements', params);
  return {
    ...response,
    items: response.items.map(mapToAnnouncementDto),
  };
};

export const getAnnouncementById = async (id: string): Promise<AnnouncementDto> => {
  const response = await apiGet<ApiAnnouncementResponseDto>(`/announcements/${id}`);
  return mapToAnnouncementDto(response);
};

export const createAnnouncement = async (data: CreateAnnouncementDto): Promise<AnnouncementDto> => {
  const response = await apiPost<ApiAnnouncementResponseDto>('/announcements', data);
  return mapToAnnouncementDto(response);
};

export const updateAnnouncement = async (id: string, data: UpdateAnnouncementDto): Promise<AnnouncementDto> => {
  const response = await apiPut<ApiAnnouncementResponseDto>(`/announcements/${id}`, data);
  return mapToAnnouncementDto(response);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  return apiDelete(`/announcements/${id}`);
};

export const toggleAnnouncementStatus = async (id: string): Promise<AnnouncementDto> => {
    const announcement = await getAnnouncementById(id);
    const response = await apiPatch<ApiAnnouncementResponseDto>(`/announcements/${id}/status`, { active: !announcement.is_active });
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