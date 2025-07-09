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

// Interface para os dados de envio de email
export interface SendEmailDto {
  title: string;
  subject: string;
  message: string;
  html?: boolean;
  recipients: {
    emails?: string[];
    users?: string[];
    roles?: string[];
  };
  sent_by_id: string;
  template?: string;
}

// Função aprimorada para envio de email
async function sendEmail(data: SendEmailDto): Promise<any> {
  // Validação dos dados antes de enviar
  if (!data.subject || !data.subject.trim()) {
    throw new Error('O assunto do email é obrigatório');
  }

  if (!data.message || !data.message.trim()) {
    throw new Error('O conteúdo do email é obrigatório');
  }

  if (!data.recipients || 
      (!data.recipients.emails?.length && 
       !data.recipients.users?.length && 
       !data.recipients.roles?.length)) {
    throw new Error('Pelo menos um destinatário deve ser especificado');
  }

  try {
    // Garantir que os arrays de destinatários existam para evitar erros no backend
    const preparedData = {
      ...data,
      recipients: {
        emails: data.recipients.emails || [],
        users: data.recipients.users || [],
        roles: data.recipients.roles || []
      }
    };

    // Adicionar retry com exponential backoff
    let attempts = 0;
    const maxAttempts = 3;
    let lastError;

    while (attempts < maxAttempts) {
      try {
        const response = await apiPost('/notifications/send', preparedData);
        return response;
      } catch (error) {
        lastError = error;
        attempts++;
        
        if (attempts >= maxAttempts) break;
        
        // Esperar antes de tentar novamente (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    console.error(`Falha após ${maxAttempts} tentativas de envio de email:`, lastError);
    throw lastError;
  } catch (error) {
    console.error('Erro no serviço de envio de email:', error);
    throw error;
  }
}

export const notificationService = {
  getNotifications,
  getNotificationById,
  createNotification,
  sendEmail
};