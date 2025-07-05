import { AppDataSource } from '../config/typeorm.config';
import { NotificationLog, NotificationType, NotificationStatus } from '../entities/NotificationLog';
import { Repository } from 'typeorm';

export class NotificationLogService {
  private notificationLogRepository: Repository<NotificationLog>;

  constructor() {
    this.notificationLogRepository = AppDataSource.getRepository(NotificationLog);
  }

  async createLog(data: Partial<NotificationLog>): Promise<NotificationLog> {
    const log = this.notificationLogRepository.create({
      ...data,
      status: NotificationStatus.PENDING,
    });
    return this.notificationLogRepository.save(log);
  }

  async updateLogStatus(id: string, status: NotificationStatus, providerResponse?: any): Promise<NotificationLog | null> {
    const log = await this.notificationLogRepository.findOneBy({ id });
    if (!log) {
      return null;
    }
    log.status = status;
    log.providerResponse = providerResponse;
    if (status === NotificationStatus.SENT) {
        log.sentAt = new Date();
    }
    if (status === NotificationStatus.DELIVERED) {
        log.deliveredAt = new Date();
    }
    return this.notificationLogRepository.save(log);
  }

  async findLogsByRecipient(recipient: string): Promise<NotificationLog[]> {
    return this.notificationLogRepository.find({ where: { recipient } });
  }
}

export default new NotificationLogService();