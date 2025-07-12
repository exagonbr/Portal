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
import { UnifiedAuthService } from './unifiedAuthService';

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
  try {
    const response = await apiGet<any>('/notifications', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de notifications:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiNotificationResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para notifications:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToNotificationDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar notifications:', error);
    
    // Retornar uma resposta vazia em caso de erro
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 0,
    };
  }
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
    // Obter token explicitamente
    const token = await UnifiedAuthService.getAccessToken();
    if (!token) {
      throw new Error('Não autorizado - Token de autenticação não encontrado');
    }

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
        // Usar apiPost com token explícito
        const response = await apiPost('/notifications/send', preparedData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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