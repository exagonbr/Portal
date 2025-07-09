import { 
  NotificationTemplateRepository, 
  CreateNotificationTemplateData, 
  UpdateNotificationTemplateData, 
  NotificationTemplateFilter 
} from '../repositories/NotificationTemplateRepository';
import { NotificationTemplate } from '../entities/NotificationTemplate';
import { PaginatedResult } from '../repositories/ExtendedRepository';

export class NotificationTemplateService {
  private notificationTemplateRepository: NotificationTemplateRepository;

  constructor() {
    this.notificationTemplateRepository = new NotificationTemplateRepository();
  }

  async getAllTemplates(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<NotificationTemplate>> {
    return this.notificationTemplateRepository.findAllPaginated(options);
  }

  async getTemplateById(id: string): Promise<NotificationTemplate | null> {
    return this.notificationTemplateRepository.findById(id);
  }

  async getTemplateByName(name: string): Promise<NotificationTemplate | null> {
    return this.notificationTemplateRepository.findByName(name);
  }

  async getTemplatesByCategory(category: string): Promise<NotificationTemplate[]> {
    return this.notificationTemplateRepository.findByCategory(category);
  }

  async getPublicTemplates(): Promise<NotificationTemplate[]> {
    return this.notificationTemplateRepository.findPublicTemplates();
  }

  async getTemplatesByUserId(userId: string): Promise<NotificationTemplate[]> {
    return this.notificationTemplateRepository.findByUserId(userId);
  }

  async getTemplatesPaginated(
    page: number = 1,
    limit: number = 10,
    filters: NotificationTemplateFilter = {}
  ): Promise<PaginatedResult<NotificationTemplate>> {
    return this.notificationTemplateRepository.findPaginated(page, limit, filters);
  }

  async createTemplate(data: CreateNotificationTemplateData): Promise<NotificationTemplate> {
    // Validar se o nome não está em uso
    const existingTemplate = await this.notificationTemplateRepository.findByName(data.name);
    if (existingTemplate) {
      throw new Error('Template com este nome já existe');
    }

    return this.notificationTemplateRepository.createTemplate(data);
  }

  async updateTemplate(id: string, data: UpdateNotificationTemplateData): Promise<NotificationTemplate | null> {
    // Verificar se o template existe
    const existingTemplate = await this.notificationTemplateRepository.findById(id);
    if (!existingTemplate) {
      throw new Error('Template não encontrado');
    }

    // Se o nome está sendo alterado, verificar se não está em uso
    if (data.name && data.name !== existingTemplate.name) {
      const templateWithSameName = await this.notificationTemplateRepository.findByName(data.name);
      if (templateWithSameName) {
        throw new Error('Template com este nome já existe');
      }
    }

    return this.notificationTemplateRepository.updateTemplate(id, data);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const existingTemplate = await this.notificationTemplateRepository.findById(id);
    if (!existingTemplate) {
      throw new Error('Template não encontrado');
    }

    return this.notificationTemplateRepository.deleteTemplate(id);
  }

  async getCategories(): Promise<string[]> {
    return this.notificationTemplateRepository.getCategories();
  }

  async validateTemplate(data: CreateNotificationTemplateData | UpdateNotificationTemplateData): Promise<string[]> {
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

export default new NotificationTemplateService(); 