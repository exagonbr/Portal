import { Queue, Worker, QueueOptions, WorkerOptions } from 'bullmq';
import { getQueueRedisClient } from './redis';

// Configurações das filas
const queueConfig: QueueOptions = {
  connection: getQueueRedisClient(),
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

// Configurações dos workers
const workerConfig: Omit<WorkerOptions, 'connection'> = {
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
};

// Definição dos tipos de filas
export enum QueueNames {
  EMAIL = 'email-queue',
  NOTIFICATION = 'notification-queue',
  FILE_PROCESSING = 'file-processing-queue',
  ANALYTICS = 'analytics-queue',
  BACKUP = 'backup-queue',
}

// Tipos de jobs para cada fila
export enum JobTypes {
  // Email jobs
  SEND_WELCOME_EMAIL = 'send-welcome-email',
  SEND_PASSWORD_RESET = 'send-password-reset',
  SEND_COURSE_NOTIFICATION = 'send-course-notification',
  SEND_ASSIGNMENT_REMINDER = 'send-assignment-reminder',
  
  // Notification jobs
  PUSH_NOTIFICATION = 'push-notification',
  IN_APP_NOTIFICATION = 'in-app-notification',
  SMS_NOTIFICATION = 'sms-notification',
  
  // File processing jobs
  PROCESS_BOOK_UPLOAD = 'process-book-upload',
  PROCESS_VIDEO_UPLOAD = 'process-video-upload',
  GENERATE_THUMBNAIL = 'generate-thumbnail',
  CONVERT_DOCUMENT = 'convert-document',
  
  // Analytics jobs
  TRACK_USER_ACTIVITY = 'track-user-activity',
  GENERATE_REPORT = 'generate-report',
  UPDATE_STATISTICS = 'update-statistics',
  
  // Backup jobs
  BACKUP_DATABASE = 'backup-database',
  BACKUP_FILES = 'backup-files',
}

// Instâncias das filas
export const emailQueue = new Queue(QueueNames.EMAIL, queueConfig);
export const notificationQueue = new Queue(QueueNames.NOTIFICATION, queueConfig);
export const fileProcessingQueue = new Queue(QueueNames.FILE_PROCESSING, queueConfig);
export const analyticsQueue = new Queue(QueueNames.ANALYTICS, queueConfig);
export const backupQueue = new Queue(QueueNames.BACKUP, queueConfig);

// Função para adicionar job à fila de email
export const addEmailJob = async (type: JobTypes, data: any, options?: any) => {
  return await emailQueue.add(type, data, {
    priority: type === JobTypes.SEND_PASSWORD_RESET ? 10 : 5,
    delay: options?.delay || 0,
    ...options,
  });
};

// Função para adicionar job à fila de notificação
export const addNotificationJob = async (type: JobTypes, data: any, options?: any) => {
  return await notificationQueue.add(type, data, {
    priority: type === JobTypes.PUSH_NOTIFICATION ? 8 : 5,
    delay: options?.delay || 0,
    ...options,
  });
};

// Função para adicionar job à fila de processamento de arquivos
export const addFileProcessingJob = async (type: JobTypes, data: any, options?: any) => {
  return await fileProcessingQueue.add(type, data, {
    priority: 5,
    delay: options?.delay || 0,
    ...options,
  });
};

// Função para adicionar job à fila de analytics
export const addAnalyticsJob = async (type: JobTypes, data: any, options?: any) => {
  return await analyticsQueue.add(type, data, {
    priority: 3,
    delay: options?.delay || 0,
    ...options,
  });
};

// Função para adicionar job à fila de backup
export const addBackupJob = async (type: JobTypes, data: any, options?: any) => {
  return await backupQueue.add(type, data, {
    priority: 1,
    delay: options?.delay || 0,
    ...options,
  });
};

// Função para obter estatísticas das filas
export const getQueueStats = async () => {
  const queues = [emailQueue, notificationQueue, fileProcessingQueue, analyticsQueue, backupQueue];
  const stats = [];

  for (const queue of queues) {
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();

    stats.push({
      name: queue.name,
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    });
  }

  return stats;
};

// Função para limpar filas
export const cleanQueues = async () => {
  const queues = [emailQueue, notificationQueue, fileProcessingQueue, analyticsQueue, backupQueue];
  
  for (const queue of queues) {
    await queue.clean(24 * 60 * 60 * 1000, 100, 'completed'); // Remove jobs completados há mais de 24h
    await queue.clean(7 * 24 * 60 * 60 * 1000, 50, 'failed'); // Remove jobs falhados há mais de 7 dias
  }
  
  console.log('✅ Filas limpas com sucesso');
};

// Função para fechar todas as filas
export const closeQueues = async () => {
  const queues = [emailQueue, notificationQueue, fileProcessingQueue, analyticsQueue, backupQueue];
  
  await Promise.all(queues.map(queue => queue.close()));
  console.log('🔌 Todas as filas fechadas');
};

// Configuração de workers (será usado em arquivo separado)
export const getWorkerConfig = (queueName: QueueNames): WorkerOptions => ({
  ...workerConfig,
  connection: getQueueRedisClient(),
  concurrency: getConcurrency(queueName),
});

// Função para obter concorrência baseada no tipo de fila
function getConcurrency(queueName: QueueNames): number {
  switch (queueName) {
    case QueueNames.EMAIL:
      return parseInt(process.env.EMAIL_QUEUE_CONCURRENCY || '3');
    case QueueNames.NOTIFICATION:
      return parseInt(process.env.NOTIFICATION_QUEUE_CONCURRENCY || '5');
    case QueueNames.FILE_PROCESSING:
      return parseInt(process.env.FILE_PROCESSING_QUEUE_CONCURRENCY || '2');
    case QueueNames.ANALYTICS:
      return 1;
    case QueueNames.BACKUP:
      return 1;
    default:
      return 1;
  }
}

export default {
  emailQueue,
  notificationQueue,
  fileProcessingQueue,
  analyticsQueue,
  backupQueue,
  addEmailJob,
  addNotificationJob,
  addFileProcessingJob,
  addAnalyticsJob,
  addBackupJob,
  getQueueStats,
  cleanQueues,
  closeQueues,
};