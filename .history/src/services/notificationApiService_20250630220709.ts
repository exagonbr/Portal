import { apiClient } from '@/lib/api-client';
import {
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto
} from '@/types/notification';

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  status?: string;
  priority?: string;
  unread_only?: boolean;
  from_date?: string;
  to_date?: string;
}

export interface PaginatedNotificationResponse {
  items: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  unreadCount?: number;
}

export interface NotificationStats {
  id: number;
  recipients: {
    total: number;
    delivered: number;
    read: number;
    unread: number;
    failed: number;
  };
  engagement: {
    openRate: number;
    clickRate: number;
  };
  deliveryMethods: {
    email: number;
    push: number;
    inApp: number;
  };
}

class NotificationApiService {
  private readonly baseUrl = '/api/notifications';

  /**
   * Busca notificações do usuário atual
   */
  async getNotifications(params: NotificationQueryParams = {}): Promise<PaginatedNotificationResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = queryParams.toString() ? `${this.baseUrl}?${queryParams}` : this.baseUrl;
    const response = await apiClient.get<{ data: PaginatedNotificationResponse }>(url);
    
    if (!response.success || !response.data) {
      throw new Error('Falha ao buscar notificações');
    }

    return response.data.data;
  }

  /**
   * Busca notificações enviadas pelo usuário atual
   */
  async getSentNotifications(params: NotificationQueryParams = {}): Promise<PaginatedNotificationResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = queryParams.toString() ? `${this.baseUrl}/sent?${queryParams}` : `${this.baseUrl}/sent`;
    const response = await apiClient.get<{ data: PaginatedNotificationResponse }>(url);
    
    if (!response.success || !response.data) {
      throw new Error('Falha ao buscar notificações enviadas');
    }

    return response.data.data;
  }

  /**
   * Busca uma notificação específica por ID
   */
  async getNotificationById(id: number): Promise<Notification> {
    const response = await apiClient.get<{ data: Notification }>(`${this.baseUrl}/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(`Falha ao buscar notificação com ID ${id}`);
    }

    return response.data.data;
  }

  /**
   * Cria uma nova notificação
   */
  async createNotification(notification: CreateNotificationDto): Promise<Notification> {
    const response = await apiClient.post<{ data: Notification }>(this.baseUrl, notification);
    
    if (!response.success || !response.data) {
      throw new Error('Falha ao criar notificação');
    }

    return response.data.data;
  }

  /**
   * Atualiza uma notificação existente
   */
  async updateNotification(id: number, updates: UpdateNotificationDto): Promise<Notification> {
    const response = await apiClient.patch<{ data: Notification }>(`${this.baseUrl}/${id}`, updates);
    
    if (!response.success || !response.data) {
      throw new Error(`Falha ao atualizar notificação com ID ${id}`);
    }

    return response.data.data;
  }

  /**
   * Deleta uma notificação
   */
  async deleteNotification(id: number): Promise<void> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    
    if (!response.success) {
      throw new Error(`Falha ao deletar notificação com ID ${id}`);
    }
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: number): Promise<void> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/read`);
    
    if (!response.success) {
      throw new Error(`Falha ao marcar notificação ${id} como lida`);
    }
  }

  /**
   * Marca múltiplas notificações como lidas
   */
  async markMultipleAsRead(ids: number[]): Promise<void> {
    const response = await apiClient.patch(`${this.baseUrl}/bulk/read`, { ids });
    
    if (!response.success) {
      throw new Error('Falha ao marcar notificações como lidas');
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    const response = await apiClient.patch(`${this.baseUrl}/all/read`);
    
    if (!response.success) {
      throw new Error('Falha ao marcar todas as notificações como lidas');
    }
  }

  /**
   * Deleta múltiplas notificações
   */
  async deleteBulkNotifications(ids: number[]): Promise<void> {
    const response = await apiClient.post(`${this.baseUrl}/bulk/delete`, { ids });
    
    if (!response.success) {
      throw new Error('Falha ao deletar notificações');
    }
  }

  /**
   * Busca estatísticas de uma notificação
   */
  async getNotificationStats(id: number): Promise<NotificationStats> {
    const response = await apiClient.get<{ data: NotificationStats }>(`${this.baseUrl}/${id}/stats`);
    
    if (!response.success || !response.data) {
      throw new Error(`Falha ao buscar estatísticas da notificação ${id}`);
    }

    return response.data.data;
  }

  /**
   * Cancela uma notificação agendada
   */
  async cancelScheduledNotification(id: number): Promise<void> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/cancel`);
    
    if (!response.success) {
      throw new Error(`Falha ao cancelar notificação agendada ${id}`);
    }
  }

  /**
   * Reagenda uma notificação
   */
  async rescheduleNotification(id: number, scheduledFor: string): Promise<Notification> {
    const response = await apiClient.patch<{ data: Notification }>(`${this.baseUrl}/${id}/reschedule`, {
      scheduledFor
    });
    
    if (!response.success || !response.data) {
      throw new Error(`Falha ao reagendar notificação ${id}`);
    }

    return response.data.data;
  }

  /**
   * Envia um rascunho de notificação imediatamente
   */
  async sendDraftNotification(id: number): Promise<Notification> {
    const response = await apiClient.post<{ data: Notification }>(`${this.baseUrl}/${id}/send-now`);
    
    if (!response.success || !response.data) {
      throw new Error(`Falha ao enviar notificação ${id}`);
    }

    return response.data.data;
  }

  /**
   * Remove notificações antigas
   */
  async cleanupOldNotifications(olderThanDays: number = 30): Promise<{ deletedCount: number }> {
    const response = await apiClient.post<{ data: { deletedCount: number } }>(`${this.baseUrl}/cleanup`, {
      olderThan: olderThanDays
    });
    
    if (!response.success || !response.data) {
      throw new Error('Falha ao limpar notificações antigas');
    }

    return response.data.data;
  }

  /**
   * Envia uma notificação (endpoint /send)
   */
  async sendNotification(data: {
    title: string;
    message: string;
    type: string;
    category: string;
    priority: string;
    sendPush?: boolean;
    sendEmail?: boolean;
    recipients?: {
      userIds?: string[];
      emails?: string[];
      roles?: string[];
    };
  }): Promise<{
    notificationId: string;
    recipientCount: number;
    sentAt: string;
    methods: {
      push: boolean;
      email: boolean;
    };
  }> {
    console.log('📧 [NotificationApiService] Enviando dados:', data);
    
    const response = await apiClient.post<{
      data: {
        notificationId: string;
        recipientCount: number;
        sentAt: string;
        methods: {
          push: boolean;
          email: boolean;
        };
      };
    }>(`${this.baseUrl}/send`, data);
    
    console.log('📧 [NotificationApiService] Resposta recebida:', response);
    
    if (!response.success) {
      const errorMessage = response.message || 'Falha ao enviar notificação';
      console.error('📧 [NotificationApiService] Erro na resposta:', errorMessage);
      throw new Error(errorMessage);
    }

    // A resposta pode vir diretamente em response.data ou em response.data.data
    let responseData;
    
    if (response.data?.data) {
      // Se tem data.data, usar isso
      responseData = response.data.data;
    } else if (response.data?.notificationId) {
      // Se response.data já tem a estrutura correta
      responseData = response.data;
    } else {
      console.error('📧 [NotificationApiService] Dados não encontrados na resposta:', response);
      throw new Error('Dados de resposta não encontrados');
    }

    console.log('📧 [NotificationApiService] Dados processados:', responseData);
    return responseData;
  }

  /**
   * Verifica configuração de email
   */
  async verifyEmailConfiguration(): Promise<{
    connected: boolean;
    enabled: boolean;
    provider: string;
    host: string;
    port: number;
    message: string;
  }> {
    const response = await apiClient.get<{
      data: {
        connected: boolean;
        enabled: boolean;
        provider: string;
        host: string;
        port: number;
        message: string;
      };
    }>(`${this.baseUrl}/email/verify`);
    
    if (!response.success || !response.data) {
      throw new Error('Falha ao verificar configuração de email');
    }

    return response.data.data;
  }

  /**
   * Envia email de verificação
   */
  async sendVerificationEmail(): Promise<{
    recipient: string;
    status: string;
    logId: string;
  }> {
    const response = await apiClient.post<{
      data: {
        recipient: string;
        status: string;
        logId: string;
      };
    }>(`${this.baseUrl}/email/verify`);
    
    if (!response.success || !response.data) {
      throw new Error('Falha ao enviar email de verificação');
    }

    return response.data.data;
  }
}

// Export singleton instance
export const notificationApiService = new NotificationApiService();
export default notificationApiService;