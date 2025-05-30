import { Request, Response } from 'express';
import { Knex } from 'knex';
import { AwsSettingsService } from '../services/AwsSettingsService';
import { AwsConnectionLogRepository } from '../repositories/AwsConnectionLogRepository';

export class AwsSettingsController {
  private awsSettingsService: AwsSettingsService;
  private connectionLogRepo: AwsConnectionLogRepository;

  constructor(db: Knex) {
    this.awsSettingsService = new AwsSettingsService(db);
    this.connectionLogRepo = new AwsConnectionLogRepository(db);
  }

  // GET /api/aws/settings
  async getActiveSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.awsSettingsService.getActiveSettings();
      
      if (!settings) {
        res.status(404).json({
          success: false,
          message: 'Nenhuma configuração AWS ativa encontrada'
        });
        return;
      }

      // Não retornar a secret key por segurança
      const { secret_access_key, ...safeSettings } = settings;

      res.json({
        success: true,
        data: {
          ...safeSettings,
          secret_access_key: '***HIDDEN***'
        }
      });
    } catch (error) {
      console.error('Erro ao buscar configurações AWS:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // GET /api/aws/settings/all
  async getAllSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.awsSettingsService.getAllSettings();
      
      // Ocultar secret keys por segurança
      const safeSettings = settings.map(setting => ({
        ...setting,
        secret_access_key: '***HIDDEN***'
      }));

      res.json({
        success: true,
        data: safeSettings
      });
    } catch (error) {
      console.error('Erro ao buscar todas as configurações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // GET /api/aws/settings/:id
  async getSettingsById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const settings = await this.awsSettingsService.getSettingsById(id);
      
      if (!settings) {
        res.status(404).json({
          success: false,
          message: 'Configurações AWS não encontradas'
        });
        return;
      }

      // Não retornar a secret key por segurança
      const { secret_access_key, ...safeSettings } = settings;

      res.json({
        success: true,
        data: {
          ...safeSettings,
          secret_access_key: '***HIDDEN***'
        }
      });
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // POST /api/aws/settings
  async createSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      const settingsData = req.body;

      const settings = await this.awsSettingsService.createSettings(settingsData, userId);
      
      // Não retornar a secret key por segurança
      const { secret_access_key, ...safeSettings } = settings;

      res.status(201).json({
        success: true,
        message: 'Configurações AWS criadas com sucesso',
        data: {
          ...safeSettings,
          secret_access_key: '***HIDDEN***'
        }
      });
    } catch (error) {
      console.error('Erro ao criar configurações:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // PUT /api/aws/settings/:id
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req.user as any)?.id;
      const updateData = req.body;

      const settings = await this.awsSettingsService.updateSettings(id, updateData, userId);
      
      if (!settings) {
        res.status(404).json({
          success: false,
          message: 'Configurações AWS não encontradas'
        });
        return;
      }

      // Não retornar a secret key por segurança
      const { secret_access_key, ...safeSettings } = settings;

      res.json({
        success: true,
        message: 'Configurações AWS atualizadas com sucesso',
        data: {
          ...safeSettings,
          secret_access_key: '***HIDDEN***'
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // POST /api/aws/settings/:id/activate
  async setActiveSettings(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req.user as any)?.id;

      const settings = await this.awsSettingsService.setActiveSettings(id, userId);
      
      if (!settings) {
        res.status(404).json({
          success: false,
          message: 'Configurações AWS não encontradas'
        });
        return;
      }

      // Não retornar a secret key por segurança
      const { secret_access_key, ...safeSettings } = settings;

      res.json({
        success: true,
        message: 'Configurações AWS ativadas com sucesso',
        data: {
          ...safeSettings,
          secret_access_key: '***HIDDEN***'
        }
      });
    } catch (error) {
      console.error('Erro ao ativar configurações:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // DELETE /api/aws/settings/:id
  async deleteSettings(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await this.awsSettingsService.deleteSettings(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Configurações AWS não encontradas'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Configurações AWS deletadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar configurações:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // POST /api/aws/settings/:id/test-connection
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req.user as any)?.id;
      const userAgent = req.get('User-Agent');
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await this.awsSettingsService.testConnection(
        id, 
        userId, 
        userAgent, 
        ipAddress
      );

      const statusCode = result.success ? 200 : 400;

      res.status(statusCode).json({
        success: result.success,
        message: result.message,
        data: {
          response_time_ms: result.response_time_ms,
          error_details: result.error_details
        }
      });
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // GET /api/aws/settings/history
  async getSettingsHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const settings = await this.awsSettingsService.getSettingsHistory(limit);
      
      // Ocultar secret keys por segurança
      const safeSettings = settings.map(setting => ({
        ...setting,
        secret_access_key: '***HIDDEN***'
      }));

      res.json({
        success: true,
        data: safeSettings
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // GET /api/aws/connection-logs
  async getConnectionLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const awsSettingsId = req.query.settings_id as string;
      const service = req.query.service as string;

      let logs;

      if (awsSettingsId) {
        logs = await this.connectionLogRepo.findBySettings(awsSettingsId, limit, offset);
      } else if (service) {
        logs = await this.connectionLogRepo.findByService(service, limit, offset);
      } else {
        logs = await this.connectionLogRepo.findRecent(limit);
      }

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Erro ao buscar logs de conexão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // GET /api/aws/connection-logs/stats
  async getConnectionStats(req: Request, res: Response): Promise<void> {
    try {
      const awsSettingsId = req.query.settings_id as string;
      const days = parseInt(req.query.days as string) || 30;

      const stats = await this.connectionLogRepo.getStats(awsSettingsId, days);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // GET /api/aws/connection-logs/trends
  async getConnectionTrends(req: Request, res: Response): Promise<void> {
    try {
      const awsSettingsId = req.query.settings_id as string;
      const days = parseInt(req.query.days as string) || 7;

      const trends = await this.connectionLogRepo.getConnectionTrends(awsSettingsId, days);

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Erro ao buscar tendências:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
} 