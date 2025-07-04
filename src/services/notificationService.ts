import {
  NotificationDto,
  CreateNotificationDto,
  NotificationFilter,
  NotificationType,
  NotificationCategory,
  NotificationStatus,
  NotificationPriority,
} from '@/types/notification';
import {
  PaginatedResponse,
  NotificationResponseDto as ApiNotificationResponseDto,
} from '@/types/api';
import { apiGet, apiPost } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToNotificationDto = (data: ApiNotificationResponseDto): NotificationDto => ({
  id: data.id,
  title: data.title,
  message: data.message,
  type: data.type as NotificationType,
  category: data.category as NotificationCategory,
  sent_at: data.sent_at,
  sent_by_id: data.sent_by_id,
  recipients: data.recipients,
  status: data.status as NotificationStatus,
  scheduled_for: data.scheduled_for,
  priority: data.priority as NotificationPriority,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getNotifications = async (params: NotificationFilter): Promise<PaginatedResponse<NotificationDto>> => {
  const response = await apiGet<PaginatedResponse<ApiNotificationResponseDto>>('/notifications', params);
  return {
    ...response,
    items: response.items.map(mapToNotificationDto),
  };
};

export const getNotificationById = async (id: string): Promise<NotificationDto> => {
  const response = await apiGet<ApiNotificationResponseDto>(`/notifications/${id}`);
  return mapToNotificationDto(response);
};

export const createNotification = async (data: CreateNotificationDto): Promise<NotificationDto> => {
  const response = await apiPost<ApiNotificationResponseDto>('/notifications', data);
  return mapToNotificationDto(response);
};

export const notificationService = {
  getNotifications,
  getNotificationById,
  createNotification,
};