import { apiClient, handleApiError } from '@/lib/api-client';

export interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  priority: number;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'delayed';
}

export interface QueueOptions {
  priority?: number;
  delay?: number;
  maxAttempts?: number;
  timeout?: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

export type JobHandler<T = any> = (data: T, job: QueueJob<T>) => Promise<void>;

export class QueueService {
  private handlers = new Map<string, JobHandler>();
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly pollInterval = 30000; // 30 segundos (reduzido para evitar loops)

  constructor() {
    // TEMPORARIAMENTE DESABILITADO para evitar loops
    // if (typeof window !== 'undefined') {
    //   this.startProcessing();
    // }
    console.log('🔄 QueueService: Inicializado sem auto-start (evitando loops)');
  }

  /**
   * Adiciona um job à fila
   */
  async addJob<T>(
    type: string,
    data: T,
    options: QueueOptions = {}
  ): Promise<string> {
    try {
      const jobData = {
        type,
        data,
        priority: options.priority || 0,
        delay: options.delay || 0,
        maxAttempts: options.maxAttempts || 3,
        timeout: options.timeout || 30000
      };

      const response = await apiClient.post<{ jobId: string }>('queue/add', jobData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao adicionar job à fila');
      }

      console.log(`Job ${type} adicionado à fila:`, response.data.jobId);
      return response.data.jobId;
    } catch (error) {
      console.error('Erro ao adicionar job à fila:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Registra um handler para um tipo de job
   */
  registerHandler<T>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler);
    console.log(`Handler registrado para tipo: ${type}`);
  }

  /**
   * Remove um handler
   */
  unregisterHandler(type: string): void {
    this.handlers.delete(type);
    console.log(`Handler removido para tipo: ${type}`);
  }

  /**
   * Processa jobs pendentes
   */
  async processJobs(): Promise<void> {
    if (this.isProcessing) {
      console.log('🔄 QueueService: Processamento já em andamento, ignorando');
      return;
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      console.log('🔄 QueueService: Iniciando processamento de jobs');
      
      // Endpoint /api/queue/next removido - não há jobs para processar
      console.log('📋 QueueService: Endpoint /api/queue/next removido - sistema de filas desabilitado');
      return;
      
      const duration = Date.now() - startTime;
      console.log(`✅ QueueService: Processamento concluído em ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ QueueService: Erro ao processar jobs (${duration}ms):`, error);
      
      // Se for erro de rate limit, aumentar intervalo temporariamente
      if (error instanceof Error && error.message.includes('429')) {
        console.warn('🚨 QueueService: Rate limit detectado, pausando processamento por 60s');
        this.stopProcessing();
        setTimeout(() => {
          console.log('🔄 QueueService: Retomando processamento após rate limit');
          this.startProcessing();
        }, 60000);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Processa um job específico
   */
  private async processJob(job: QueueJob): Promise<void> {
    const handler = this.handlers.get(job.type);
    
    if (!handler) {
      console.warn(`Nenhum handler encontrado para tipo: ${job.type}`);
      await this.markJobFailed(job.id, 'Handler não encontrado');
      return;
    }

    try {
      console.log(`Processando job ${job.id} do tipo ${job.type}`);
      
      // Marca como processando
      await this.markJobProcessing(job.id);
      
      // Executa o handler
      await handler(job.data, job);
      
      // Marca como completado
      await this.markJobCompleted(job.id);
      
      console.log(`Job ${job.id} completado com sucesso`);
    } catch (error) {
      console.error(`Erro ao processar job ${job.id}:`, error);
      await this.markJobFailed(job.id, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }

  /**
   * Marca job como processando
   */
  private async markJobProcessing(jobId: string): Promise<void> {
    try {
      await apiClient.patch(`queue/${jobId}/processing`);
    } catch (error) {
      console.error('Erro ao marcar job como processando:', error);
    }
  }

  /**
   * Marca job como completado
   */
  private async markJobCompleted(jobId: string): Promise<void> {
    try {
      await apiClient.patch(`queue/${jobId}/completed`);
    } catch (error) {
      console.error('Erro ao marcar job como completado:', error);
    }
  }

  /**
   * Marca job como falhado
   */
  private async markJobFailed(jobId: string, error: string): Promise<void> {
    try {
      await apiClient.patch(`queue/${jobId}/failed`, { error });
    } catch (err) {
      console.error('Erro ao marcar job como falhado:', err);
    }
  }

  /**
   * Obtém estatísticas da fila (mock local)
   */
  async getStats(): Promise<QueueStats> {
    try {
      // Retornar estatísticas mock para evitar chamadas desnecessárias
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        total: 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas da fila:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Lista jobs por status
   */
  async getJobs(
    status?: QueueJob['status'],
    limit = 50,
    offset = 0
  ): Promise<QueueJob[]> {
    try {
      const params: any = { limit, offset };
      if (status) params.status = status;

      const response = await apiClient.get<QueueJob[]>('queue/jobs', params);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao listar jobs');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao listar jobs:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Obtém detalhes de um job específico
   */
  async getJob(jobId: string): Promise<QueueJob | null> {
    try {
      const response = await apiClient.get<QueueJob>(`queue/jobs/${jobId}`);

      if (!response.success) {
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error(`Erro ao obter job ${jobId}:`, error);
      return null;
    }
  }

  /**
   * Cancela um job pendente
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`queue/jobs/${jobId}`);
      return response.success;
    } catch (error) {
      console.error(`Erro ao cancelar job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Reprocessa um job falhado
   */
  async retryJob(jobId: string): Promise<boolean> {
    try {
      const response = await apiClient.post(`queue/jobs/${jobId}/retry`);
      return response.success;
    } catch (error) {
      console.error(`Erro ao reprocessar job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Limpa jobs completados ou falhados
   */
  async cleanJobs(status: 'completed' | 'failed', olderThan?: Date): Promise<number> {
    try {
      const params: any = { status };
      if (olderThan) {
        params.olderThan = olderThan.toISOString();
      }

      const response = await apiClient.post<{ cleaned: number }>('queue/clean', params);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao limpar jobs');
      }

      return response.data.cleaned;
    } catch (error) {
      console.error('Erro ao limpar jobs:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Inicia o processamento automático
   */
  startProcessing(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(() => {
      this.processJobs().catch(error => {
        console.error('Erro no processamento automático:', error);
      });
    }, this.pollInterval);

    console.log('Processamento automático de filas iniciado');
  }

  /**
   * Para o processamento automático
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Processamento automático de filas parado');
    }
  }

  /**
   * Pausa a fila
   */
  async pauseQueue(): Promise<void> {
    try {
      await apiClient.post('/api/queue/pause');
      this.stopProcessing();
    } catch (error) {
      console.error('Erro ao pausar fila:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Resume a fila
   */
  async resumeQueue(): Promise<void> {
    try {
      await apiClient.post('/api/queue/resume');
      this.startProcessing();
    } catch (error) {
      console.error('Erro ao resumir fila:', error);
      throw new Error(handleApiError(error));
    }
  }
}

// Instância singleton do serviço de filas
export const queueService = new QueueService();

// Tipos de jobs predefinidos
export const JobTypes = {
  // Usuários
  USER_IMPORT: 'user:import',
  USER_EXPORT: 'user:export',
  USER_BULK_UPDATE: 'user:bulk_update',
  USER_NOTIFICATION: 'user:notification',

  // Emails
  EMAIL_SEND: 'email:send',
  EMAIL_BULK_SEND: 'email:bulk_send',
  EMAIL_TEMPLATE_RENDER: 'email:template_render',

  // Relatórios
  REPORT_GENERATE: 'report:generate',
  REPORT_EXPORT: 'report:export',
  REPORT_SCHEDULE: 'report:schedule',

  // Backup
  BACKUP_CREATE: 'backup:create',
  BACKUP_RESTORE: 'backup:restore',
  BACKUP_CLEANUP: 'backup:cleanup',

  // Sincronização
  SYNC_EXTERNAL_DATA: 'sync:external_data',
  SYNC_CACHE_REFRESH: 'sync:cache_refresh',

  // Processamento de arquivos
  FILE_PROCESS: 'file:process',
  FILE_CONVERT: 'file:convert',
  FILE_CLEANUP: 'file:cleanup',

  // Notificações
  NOTIFICATION_CREATE: 'notification:create',
  NOTIFICATION_PUSH: 'notification:push',
  NOTIFICATION_EMAIL: 'notification:email',
  NOTIFICATION_SMS: 'notification:sms',
  NOTIFICATION_CLEANUP: 'notification:cleanup'
} as const;

// Funções de conveniência para jobs comuns

/**
 * Adiciona job de importação de usuários
 */
export const addUserImportJob = async (
  file: File,
  options?: QueueOptions
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  return queueService.addJob(JobTypes.USER_IMPORT, { file: formData }, {
    priority: 5,
    maxAttempts: 1,
    timeout: 300000, // 5 minutos
    ...options
  });
};

/**
 * Adiciona job de exportação de usuários
 */
export const addUserExportJob = async (
  filters: any,
  format: 'csv' | 'xlsx' = 'csv',
  options?: QueueOptions
): Promise<string> => {
  return queueService.addJob(JobTypes.USER_EXPORT, { filters, format }, {
    priority: 3,
    maxAttempts: 2,
    timeout: 180000, // 3 minutos
    ...options
  });
};

/**
 * Adiciona job de envio de email
 */
export const addEmailJob = async (
  to: string | string[],
  subject: string,
  content: string,
  template?: string,
  options?: QueueOptions
): Promise<string> => {
  return queueService.addJob(JobTypes.EMAIL_SEND, {
    to: Array.isArray(to) ? to : [to],
    subject,
    content,
    template
  }, {
    priority: 7,
    maxAttempts: 3,
    timeout: 60000, // 1 minuto
    ...options
  });
};

/**
 * Adiciona job de geração de relatório
 */
export const addReportJob = async (
  type: string,
  parameters: any,
  format: 'pdf' | 'xlsx' | 'csv' = 'pdf',
  options?: QueueOptions
): Promise<string> => {
  return queueService.addJob(JobTypes.REPORT_GENERATE, {
    type,
    parameters,
    format
  }, {
    priority: 4,
    maxAttempts: 2,
    timeout: 600000, // 10 minutos
    ...options
  });
};

/**
 * Adiciona job de criação de notificação
 */
export const addNotificationCreateJob = async (
  notification: any,
  options?: QueueOptions
): Promise<string> => {
  return queueService.addJob(JobTypes.NOTIFICATION_CREATE, { notification }, {
    priority: 8,
    maxAttempts: 3,
    timeout: 30000, // 30 segundos
    ...options
  });
};

/**
 * Adiciona job de notificação push
 */
export const addNotificationJob = async (
  userIds: string[],
  title: string,
  message: string,
  data?: any,
  options?: QueueOptions
): Promise<string> => {
  return queueService.addJob(JobTypes.NOTIFICATION_PUSH, {
    userIds,
    title,
    message,
    data
  }, {
    priority: 8,
    maxAttempts: 3,
    timeout: 30000, // 30 segundos
    ...options
  });
};

/**
 * Adiciona job de sincronização de cache
 */
export const addCacheRefreshJob = async (
  keys: string[],
  options?: QueueOptions
): Promise<string> => {
  return queueService.addJob(JobTypes.SYNC_CACHE_REFRESH, { keys }, {
    priority: 2,
    maxAttempts: 2,
    timeout: 120000, // 2 minutos
    ...options
  });
};

// Registra handlers padrão
if (typeof window !== 'undefined') {
  // Handler para refresh de cache
  queueService.registerHandler(JobTypes.SYNC_CACHE_REFRESH, async (data: { keys: string[] }) => {
    const { cacheService } = await import('./cacheService');
    
    for (const key of data.keys) {
      await cacheService.delete(key);
    }
    
    console.log(`Cache invalidado para ${data.keys.length} chaves`);
  });

  // Handler para limpeza de arquivos
  queueService.registerHandler(JobTypes.FILE_CLEANUP, async (data: { paths: string[] }) => {
    console.log(`Limpeza de ${data.paths.length} arquivos solicitada`);
    // Implementar lógica de limpeza conforme necessário
  });
}