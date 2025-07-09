import { apiGet, apiPost, apiPut, apiDelete } from './apiService';
import { 
  NotificationTemplateDto, 
  CreateNotificationTemplateDto, 
  UpdateNotificationTemplateDto, 
  NotificationTemplateFilter,
  NotificationTemplateResponseDto 
} from '../types/notificationTemplate';

export class NotificationTemplateService {
  private readonly baseUrl = '/api/notifications/templates';

  async getAllTemplates(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<NotificationTemplateResponseDto> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.search) params.append('search', options.search);

    const url = `${this.baseUrl}?${params.toString()}`;
    return apiGet<NotificationTemplateResponseDto>(url);
  }

  async getTemplatesPaginated(
    page: number = 1,
    limit: number = 10,
    filters: NotificationTemplateFilter = {}
  ): Promise<NotificationTemplateResponseDto> {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters.name) params.append('name', filters.name);
    if (filters.category) params.append('category', filters.category);
    if (filters.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.createdBy) params.append('createdBy', filters.createdBy);

    const url = `${this.baseUrl}/paginated?${params.toString()}`;
    return apiGet<NotificationTemplateResponseDto>(url);
  }

  async getTemplateById(id: string): Promise<NotificationTemplateDto> {
    const response = await apiGet<{ success: boolean; data: NotificationTemplateDto }>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getTemplatesByCategory(category: string): Promise<NotificationTemplateDto[]> {
    const response = await apiGet<{ success: boolean; data: NotificationTemplateDto[] }>(`${this.baseUrl}/category/${category}`);
    return response.data;
  }

  async getPublicTemplates(): Promise<NotificationTemplateDto[]> {
    const response = await apiGet<{ success: boolean; data: NotificationTemplateDto[] }>(`${this.baseUrl}/public`);
    return response.data;
  }

  async getTemplatesByUserId(userId: string): Promise<NotificationTemplateDto[]> {
    const response = await apiGet<{ success: boolean; data: NotificationTemplateDto[] }>(`${this.baseUrl}/user/${userId}`);
    return response.data;
  }

  async getCategories(): Promise<string[]> {
    const response = await apiGet<{ success: boolean; data: string[] }>(`${this.baseUrl}/categories`);
    return response.data;
  }

  async createTemplate(data: CreateNotificationTemplateDto): Promise<NotificationTemplateDto> {
    const response = await apiPost<{ success: boolean; data: NotificationTemplateDto; message: string }>(this.baseUrl, data);
    return response.data;
  }

  async updateTemplate(id: string, data: UpdateNotificationTemplateDto): Promise<NotificationTemplateDto> {
    const response = await apiPut<{ success: boolean; data: NotificationTemplateDto; message: string }>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await apiDelete(`${this.baseUrl}/${id}`);
  }

  async validateTemplate(data: CreateNotificationTemplateDto | UpdateNotificationTemplateDto): Promise<string[]> {
    const errors: string[] = [];

    if ('name' in data && (!data.name || data.name.trim().length === 0)) {
      errors.push('Nome é obrigatório');
    }

    if ('subject' in data && (!data.subject || data.subject.trim().length === 0)) {
      errors.push('Assunto é obrigatório');
    }

    if ('message' in data && (!data.message || data.message.trim().length === 0)) {
      errors.push('Mensagem é obrigatória');
    }

    if ('name' in data && data.name && data.name.length > 255) {
      errors.push('Nome deve ter no máximo 255 caracteres');
    }

    if ('subject' in data && data.subject && data.subject.length > 500) {
      errors.push('Assunto deve ter no máximo 500 caracteres');
    }

    if ('category' in data && data.category && data.category.length > 100) {
      errors.push('Categoria deve ter no máximo 100 caracteres');
    }

    return errors;
  }
}

export const notificationTemplateService = new NotificationTemplateService(); 