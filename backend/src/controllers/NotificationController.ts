import { Request, Response } from 'express';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { Notification, NotificationCategory, NotificationStatus, NotificationType } from '../entities/Notification';

class NotificationController {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  public async getNotifications(req: Request, res: Response): Promise<Response> {
    try {
      // Supondo que o ID do usuário venha do middleware de autenticação
      const userId = (req as any).user.id; 
      const { category, type, status, unread_only } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const notifications = await this.notificationRepository.findByRecipient(
        userId,
        {
          category: category as NotificationCategory,
          type: type as NotificationType,
          status: status as 'read' | 'unread' | NotificationStatus,
          unread_only: unread_only === 'true',
        },
        limit,
        offset
      );
      
      const total = await this.notificationRepository.count({ recipient_id: userId } as Partial<Notification>);

      return res.status(200).json({ 
          success: true, 
          data: notifications,
          pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit)
          }
      });
    } catch (error) {
      console.error(`Error in getNotifications: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async markAsRead(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const success = await this.notificationRepository.markAsRead(id, userId);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Notification not found for this user' });
      }
      return res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      console.error(`Error in markAsRead: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async markAllAsRead(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const count = await this.notificationRepository.markAllAsRead(userId);
      return res.status(200).json({ success: true, message: `${count} notifications marked as read` });
    } catch (error) {
      console.error(`Error in markAllAsRead: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async getNotificationById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    // Lógica para buscar notificação por ID
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.status(200).json({ success: true, data: notification });
  }

  public async createNotification(req: Request, res: Response): Promise<Response> {
    // O envio de notificações geralmente é feito por um serviço, não diretamente pelo controller.
    // O controller apenas receberia a requisição e chamaria o serviço.
    console.log('Creating notification with body:', req.body);
    return res.status(201).json({ success: true, message: 'Notification created (mock)', data: req.body });
  }
}

export default new NotificationController();