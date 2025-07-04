import { AppDataSource } from '../config/typeorm.config';
import { Notification, NotificationCategory, NotificationType, NotificationStatus, NotificationPriority } from '../entities/Notification';
import { NotificationLog, NotificationType as LogNotificationType } from '../entities/NotificationLog';
import { User } from '../entities/User';
import { Repository } from 'typeorm';
import EmailService from './emailService';
import NotificationLogService from './NotificationLogService';

export class NotificationManagementService {
  private notificationRepository: Repository<Notification>;
  private userRepository: Repository<User>;
  private emailService: typeof EmailService;
  private notificationLogService: typeof NotificationLogService;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
    this.userRepository = AppDataSource.getRepository(User);
    this.emailService = EmailService;
    this.notificationLogService = NotificationLogService;
  }

  async createNotification(data: {
    title: string;
    message: string;
    type: NotificationType;
    category: NotificationCategory;
    priority: NotificationPriority;
    senderId: string;
    recipientIds?: string[];
    recipientRoles?: string[];
    sendByEmail?: boolean;
  }): Promise<Notification> {
    const sender = await this.userRepository.findOneBy({ id: parseInt(data.senderId) });
    if (!sender) {
      throw new Error('Remetente não encontrado');
    }

    const notification = this.notificationRepository.create({
      title: data.title,
      message: data.message,
      type: data.type,
      category: data.category,
      priority: data.priority,
      sentBy: sender,
      recipients: {
        roles: data.recipientRoles,
        specific: data.recipientIds,
      },
      status: NotificationStatus.SENT,
      sent_at: new Date(),
    });

    const savedNotification = await this.notificationRepository.save(notification);

    if (data.sendByEmail) {
      // Lógica para encontrar emails e enviar
      // Esta parte pode ser complexa e será simplificada aqui
      const recipients = await this.userRepository.find({
        where: data.recipientIds?.map(id => ({ id: parseInt(id) })) || [],
      });
      
      for (const recipient of recipients) {
        this.emailService.sendEmail({
          to: recipient.email,
          subject: data.title,
          html: data.message,
        });
        const logData = new NotificationLog();
        logData.type = LogNotificationType.EMAIL;
        logData.recipient = recipient.email;
        logData.subject = data.title;
        logData.message = data.message;
        logData.userId = recipient.id.toString();
        this.notificationLogService.createLog(logData);
      }
    }

    return savedNotification;
  }
}

export default new NotificationManagementService();