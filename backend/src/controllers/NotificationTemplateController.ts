import { Request, Response } from 'express';
import NotificationTemplateService from '../services/NotificationTemplateService';
import { CreateNotificationTemplateData, UpdateNotificationTemplateData, NotificationTemplateFilter } from '../repositories/NotificationTemplateRepository';

export class NotificationTemplateController {
  
  // GET /api/notifications/templates
  async getAllTemplates(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await NotificationTemplateService.getAllTemplates({
        page,
        limit,
        search
      });

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar templates de notificação',
        error: error.message
      });
    }
  }

  // GET /api/notifications/templates/paginated
  async getTemplatesPaginated(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters: NotificationTemplateFilter = {};
      
      if (req.query.name) filters.name = req.query.name as string;
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.isPublic !== undefined) filters.isPublic = req.query.isPublic === 'true';
      if (req.query.userId) filters.userId = req.query.userId as string;
      if (req.query.createdBy) filters.createdBy = req.query.createdBy as string;

      const result = await NotificationTemplateService.getTemplatesPaginated(page, limit, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar templates de notificação',
        error: error.message
      });
    }
  }

  // GET /api/notifications/templates/:id
  async getTemplateById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const template = await NotificationTemplateService.getTemplateById(id);

      if (!template) {
        res.status(404).json({
          success: false,
          message: 'Template de notificação não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar template de notificação',
        error: error.message
      });
    }
  }

  // GET /api/notifications/templates/category/:category
  async getTemplatesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const templates = await NotificationTemplateService.getTemplatesByCategory(category);

      res.json({
        success: true,
        data: templates
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar templates por categoria',
        error: error.message
      });
    }
  }

  // GET /api/notifications/templates/public
  async getPublicTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await NotificationTemplateService.getPublicTemplates();

      res.json({
        success: true,
        data: templates
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar templates públicos',
        error: error.message
      });
    }
  }

  // GET /api/notifications/templates/user/:userId
  async getTemplatesByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const templates = await NotificationTemplateService.getTemplatesByUserId(userId);

      res.json({
        success: true,
        data: templates
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar templates do usuário',
        error: error.message
      });
    }
  }

  // GET /api/notifications/templates/categories
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await NotificationTemplateService.getCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar categorias',
        error: error.message
      });
    }
  }

  // POST /api/notifications/templates
  async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const templateData: CreateNotificationTemplateData = req.body;

      // Validar dados
      const validationErrors = await NotificationTemplateService.validateTemplate(templateData);
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationErrors
        });
        return;
      }

      const template = await NotificationTemplateService.createTemplate(templateData);

      res.status(201).json({
        success: true,
        data: template,
        message: 'Template de notificação criado com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar template de notificação',
        error: error.message
      });
    }
  }

  // PUT /api/notifications/templates/:id
  async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateNotificationTemplateData = req.body;

      // Validar dados
      const validationErrors = await NotificationTemplateService.validateTemplate(updateData);
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationErrors
        });
        return;
      }

      const template = await NotificationTemplateService.updateTemplate(id, updateData);

      if (!template) {
        res.status(404).json({
          success: false,
          message: 'Template de notificação não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: template,
        message: 'Template de notificação atualizado com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar template de notificação',
        error: error.message
      });
    }
  }

  // DELETE /api/notifications/templates/:id
  async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await NotificationTemplateService.deleteTemplate(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Template de notificação não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Template de notificação excluído com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir template de notificação',
        error: error.message
      });
    }
  }
}

export default new NotificationTemplateController(); 