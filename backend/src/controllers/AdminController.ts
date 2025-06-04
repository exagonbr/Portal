import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { db } from '../database';
import { getQueueStats, cleanQueues } from '../config/queue';
import { emailQueue, notificationQueue, fileProcessingQueue, analyticsQueue, backupQueue } from '../config/queue';

const execPromise = util.promisify(exec);

// Configuração do Redis para as filas

export class AdminController {
  /**
   * Cria um backup do banco de dados
   */
  async createBackup(req: Request, res: Response): Promise<Response> {
    try {
      // Obter configurações do banco de dados
      const dbConfig = db.client.config;
      
      // Criar pasta de backups se não existir
      const backupDir = path.join(__dirname, '../../backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Nome do arquivo de backup com data e hora
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${timestamp}.sql`;
      const backupPath = path.join(backupDir, backupFileName);
      
      // Comando para PostgreSQL
      const command = `pg_dump -h ${dbConfig.connection.host} -U ${dbConfig.connection.user} -d ${dbConfig.connection.database} -f "${backupPath}"`;
      
      await execPromise(command);
      
      // Registrar ação nos logs de auditoria
      await this.logAction(Number(req.user?.userId) || 0, 'backup.create', { file: backupFileName });
      
      return res.status(200).json({
        success: true,
        message: 'Backup criado com sucesso',
        file: backupFileName
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
   * Lista todos os backups disponíveis
   */
  async listBackups(req: Request, res: Response): Promise<Response> {
    try {
      const backupDir = path.join(__dirname, '../../backups');
      
      // Verifica se o diretório existe
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        return res.status(200).json({
          success: true,
          backups: []
        });
      }
      
      // Lista arquivos no diretório
      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime()); // Ordenar mais recente primeiro
      
      return res.status(200).json({
        success: true,
        backups: files
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
   * Baixa um backup específico
   */
  async downloadBackup(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      const backupDir = path.join(__dirname, '../../backups');
      const filePath = path.join(backupDir, filename);
      
      // Verifica se o arquivo existe
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Arquivo de backup não encontrado'
        });
        return;
      }
      
      // Registrar ação nos logs de auditoria
      await this.logAction(Number(req.user?.userId) || 0, 'backup.download', { file: filename });
      
      // Envia o arquivo para download
      res.download(filePath);
    } catch (error: any) {
      console.error('Erro ao baixar backup:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao baixar backup',
        error: error.message
      });
    }
  }
  
  /**
   * Restaura um backup específico
   */
  async restoreBackup(req: Request, res: Response): Promise<Response> {
    try {
      const { filename } = req.params;
      const backupDir = path.join(__dirname, '../../backups');
      const filePath = path.join(backupDir, filename);
      
      // Verifica se o arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Arquivo de backup não encontrado'
        });
      }
      
      // Obter configurações do banco de dados
      const dbConfig = db.client.config;
      
      // Comando para restaurar (PostgreSQL)
      const command = `psql -h ${dbConfig.connection.host} -U ${dbConfig.connection.user} -d ${dbConfig.connection.database} -f "${filePath}"`;
      
      await execPromise(command);
      
      // Registrar ação nos logs de auditoria
      await this.logAction(Number(req.user?.userId) || 0, 'backup.restore', { file: filename });
      
      return res.status(200).json({
        success: true,
        message: 'Backup restaurado com sucesso'
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
  
  /**
   * Exclui um backup específico
   */
  async deleteBackup(req: Request, res: Response): Promise<Response> {
    try {
      const { filename } = req.params;
      const backupDir = path.join(__dirname, '../../backups');
      const filePath = path.join(backupDir, filename);
      
      // Verifica se o arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Arquivo de backup não encontrado'
        });
      }
      
      // Exclui o arquivo
      fs.unlinkSync(filePath);
      
      // Registrar ação nos logs de auditoria
      await this.logAction(Number(req.user?.userId) || 0, 'backup.delete', { file: filename });
      
      return res.status(200).json({
        success: true,
        message: 'Backup excluído com sucesso'
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
   * Retorna estatísticas de todas as filas
   */
  async getQueueStats(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await getQueueStats();
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Erro ao obter estatísticas das filas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas das filas',
        error: error.message
      });
    }
  }
  
  /**
   * Limpa jobs completados e falhos das filas
   */
  async cleanQueues(req: Request, res: Response): Promise<Response> {
    try {
      await cleanQueues();
      
      return res.status(200).json({
        success: true,
        message: 'Filas limpas com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao limpar filas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao limpar filas',
        error: error.message
      });
    }
  }
  
  /**
   * Retorna os próximos jobs a serem processados
   */
  async getNextJobs(req: Request, res: Response): Promise<Response> {
    try {
      const queues = [
        emailQueue, 
        notificationQueue, 
        fileProcessingQueue, 
        analyticsQueue, 
        backupQueue
      ];
      
      const result = [];
      
      for (const queue of queues) {
        const jobs = await queue.getWaiting(0, 10);
        
        if (jobs.length > 0) {
          result.push({
            queue: queue.name,
            jobs: jobs.map(job => ({
              id: job.id,
              name: job.name,
              data: job.data,
              timestamp: job.timestamp,
              opts: job.opts
            }))
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao obter próximos jobs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter próximos jobs',
        error: error.message
      });
    }
  }
  
  /**
   * Retorna jobs que falharam
   */
  async getFailedJobs(req: Request, res: Response): Promise<Response> {
    try {
      const queues = [
        emailQueue, 
        notificationQueue, 
        fileProcessingQueue, 
        analyticsQueue, 
        backupQueue
      ];
      
      const result = [];
      
      for (const queue of queues) {
        const jobs = await queue.getFailed(0, 10);
        
        if (jobs.length > 0) {
          result.push({
            queue: queue.name,
            jobs: jobs.map(job => ({
              id: job.id,
              name: job.name,
              data: job.data,
              timestamp: job.timestamp,
              opts: job.opts,
              failedReason: job.failedReason,
              stacktrace: job.stacktrace,
              attemptsMade: job.attemptsMade
            }))
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao obter jobs falhos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter jobs falhos',
        error: error.message
      });
    }
  }
  
  /**
   * Tenta processar novamente um job que falhou
   */
  async retryJob(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { queue } = req.body;
      
      if (!queue) {
        return res.status(400).json({
          success: false,
          message: 'O nome da fila deve ser informado'
        });
      }
      
      const queueMap: { [key: string]: any } = {
        [emailQueue.name]: emailQueue,
        [notificationQueue.name]: notificationQueue,
        [fileProcessingQueue.name]: fileProcessingQueue,
        [analyticsQueue.name]: analyticsQueue,
        [backupQueue.name]: backupQueue
      };
      
      const selectedQueue = queueMap[queue];
      
      if (!selectedQueue) {
        return res.status(400).json({
          success: false,
          message: 'Fila não encontrada'
        });
      }
      
      // Verificar se o job existe
      const job = await selectedQueue.getJob(id);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job não encontrado'
        });
      }
      
      // Reprocessar o job
      await job.retry();
      
      return res.status(200).json({
        success: true,
        message: 'Job enviado para reprocessamento'
      });
    } catch (error: any) {
      console.error('Erro ao reprocessar job:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao reprocessar job',
        error: error.message
      });
    }
  }
  
  /**
   * Registra ações do usuário para auditoria
   */
  private async logAction(userId: number, action: string, data: any = {}): Promise<void> {
    try {
      await db('audit_logs').insert({
        user_id: userId,
        action,
        data: JSON.stringify(data),
        created_at: new Date()
      });
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }
  
  /**
   * Lista logs de auditoria com paginação e filtros
   */
  async getAuditLogs(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 20, action, userId, startDate, endDate } = req.query;
      
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const offset = (pageNumber - 1) * limitNumber;
      
      // Construir a query com filtros opcionais
      let query = db('audit_logs')
        .select(
          'audit_logs.*',
          'users.name as user_name',
          'users.email as user_email'
        )
        .leftJoin('users', 'audit_logs.user_id', 'users.id')
        .orderBy('audit_logs.created_at', 'desc');
      
      // Aplicar filtros se fornecidos
      if (action) {
        query = query.where('action', 'like', `%${action}%`);
      }
      
      if (userId) {
        query = query.where('user_id', userId);
      }
      
      if (startDate) {
        query = query.where('created_at', '>=', startDate);
      }
      
      if (endDate) {
        query = query.where('created_at', '<=', endDate);
      }
      
      // Obter contagem total para paginação
      const [{ count }] = await db('audit_logs')
        .count('* as count')
        .modify(builder => {
          if (action) {
            builder.where('action', 'like', `%${action}%`);
          }
          if (userId) {
            builder.where('user_id', userId);
          }
          if (startDate) {
            builder.where('created_at', '>=', startDate);
          }
          if (endDate) {
            builder.where('created_at', '<=', endDate);
          }
        });
        
      // Executar a consulta com paginação
      const logs = await query.limit(limitNumber).offset(offset);
      
      return res.status(200).json({
        success: true,
        logs: logs.map(log => ({
          ...log,
          data: JSON.parse(log.data || '{}')
        })),
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: parseInt(count as string, 10),
          pages: Math.ceil(parseInt(count as string, 10) / limitNumber)
        }
      });
    } catch (error: any) {
      console.error('Erro ao obter logs de auditoria:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter logs de auditoria',
        error: error.message
      });
    }
  }
} 