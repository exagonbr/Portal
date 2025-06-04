import { Request, Response } from 'express';
import { BackupService } from '../services/BackupService';

export class BackupController {
  private backupService: BackupService;

  constructor() {
    this.backupService = new BackupService();
  }

  /**
   * Lista todos os backups disponíveis
   */
  public async listBackups(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.backupService.listBackups();
      
      return res.json({
        success: true,
        data: {
          items: result.backups,
          summary: result.summary
        },
      });
    } catch (error: any) {
      console.error('Erro ao listar backups:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar backups',
        error: error.message
      });
    }
  }

  /**
   * Cria um novo backup
   */
  public async createBackup(req: Request, res: Response): Promise<Response> {
    try {
      const { type, description } = req.body;
      
      if (!type || !['Completo', 'Incremental', 'Diferencial'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de backup inválido. Use: Completo, Incremental ou Diferencial'
        });
      }

      const result = await this.backupService.createBackup(type, description);
      
      return res.json({
        success: true,
        message: 'Backup iniciado com sucesso',
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao criar backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar backup',
        error: error.message
      });
    }
  }

  /**
   * Exclui um backup pelo ID
   */
  public async deleteBackup(req: Request, res: Response): Promise<Response> {
    try {
      const backupId = req.params.id;
      
      if (!backupId) {
        return res.status(400).json({
          success: false,
          message: 'ID do backup não informado'
        });
      }

      const result = await this.backupService.deleteBackup(backupId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message || 'Backup não encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Backup removido com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao excluir backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao excluir backup',
        error: error.message
      });
    }
  }

  /**
   * Faz o download de um arquivo de backup
   */
  public async downloadBackup(req: Request, res: Response): Promise<Response | void> {
    try {
      const backupId = req.params.id;
      
      if (!backupId) {
        return res.status(400).json({
          success: false,
          message: 'ID do backup não informado'
        });
      }

      const result = await this.backupService.getBackupDownloadInfo(backupId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message || 'Backup não encontrado'
        });
      }

      // Se estiver no S3 ou outro serviço de armazenamento, redirecionar
      if (result.downloadUrl) {
        return res.redirect(result.downloadUrl);
      }

      // Se for um arquivo local
      if (result.filePath) {
        return res.download(result.filePath, result.fileName || `backup-${backupId}.zip`);
      }

      return res.status(404).json({
        success: false,
        message: 'Arquivo de backup não encontrado'
      });
    } catch (error: any) {
      console.error('Erro ao fazer download do backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer download do backup',
        error: error.message
      });
    }
  }

  /**
   * Restaura um backup
   */
  public async restoreBackup(req: Request, res: Response): Promise<Response> {
    try {
      const backupId = req.params.id;
      
      if (!backupId) {
        return res.status(400).json({
          success: false,
          message: 'ID do backup não informado'
        });
      }

      const result = await this.backupService.restoreBackup(backupId);
      
      if (!result.success) {
        return res.status(result.notFound ? 404 : 400).json({
          success: false,
          message: result.message || 'Falha ao restaurar backup'
        });
      }

      return res.json({
        success: true,
        message: 'Processo de restauração iniciado com sucesso',
        data: {
          jobId: result.jobId
        }
      });
    } catch (error: any) {
      console.error('Erro ao restaurar backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao restaurar backup',
        error: error.message
      });
    }
  }
} 