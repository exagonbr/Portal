import { queueService, JobTypes } from './queueService';
import { apiClient } from './apiClient';
import { CreateNotificationDto, Notification } from '@/types/notification';

interface NotificationAPI {
  createNotification(notification: CreateNotificationDto): Promise<Notification>;
  updateNotification(id: number, updates: any): Promise<Notification>;
}

// Simple API implementation that doesn't depend on notificationService
const notificationAPI: NotificationAPI = {
  async createNotification(notification: CreateNotificationDto): Promise<Notification> {
    const response = await apiClient.post<{ data: Notification }>('/api/notifications', notification);
    if (!response.success || !response.data) {
      throw new Error('Failed to create notification');
    }
    return response.data.data;
  },
  
  async updateNotification(id: number, updates: any): Promise<Notification> {
    const response = await apiClient.patch<{ data: Notification }>(`/api/notifications/${id}`, updates);
    if (!response.success || !response.data) {
      throw new Error(`Failed to update notification with id ${id}`);
    }
    return response.data.data;
  }
};

// Register notification handlers
export const initializeNotificationQueue = () => {
  // Handler for creating notifications
  queueService.registerHandler(JobTypes.NOTIFICATION_CREATE, async (data: {
    notification: CreateNotificationDto;
    pushData?: any;
  }) => {
    try {
      // 1. Create notification in database
      const notification = await notificationAPI.createNotification(data.notification);
      
      // 2. Send push notification immediately
      const { title, message } = data.notification;
      const userIds = data.notification.recipients.specific || [];
      
      // Send push notification through API
      await apiClient.post('/api/push-notifications/send', {
        title,
        message,
        userIds,
        data: { 
          notificationId: notification.id,
          url: `/notifications/${notification.id}`
        }
      });

      // Update notification status to sent
      await notificationAPI.updateNotification(notification.id, {
        status: 'sent',
        sentAt: new Date().toISOString()
      });

      // Successfully processed
      return;
    } catch (error) {
      console.error('Error processing notification:', error);
      throw error;
    }
  });
};

// Helper function to queue a notification with optional push
export const queueNotification = async (
  notificationData: CreateNotificationDto,
  sendPush: boolean = false
): Promise<string> => {
  const jobData: any = {
    notification: notificationData
  };

  // Add push notification data if requested
  if (sendPush) {
    jobData.pushData = {
      title: notificationData.title,
      message: notificationData.message,
      userIds: notificationData.recipients.specific || []
    };
  }

  return queueService.addJob(JobTypes.NOTIFICATION_CREATE, jobData, {
    priority: 8,
    maxAttempts: 3,
    timeout: 60000 // 1 minute
  });
};

// Initialize handlers if in browser environment
if (typeof window !== 'undefined') {
  initializeNotificationQueue();

  // Register cleanup handler
  queueService.registerHandler(JobTypes.NOTIFICATION_CLEANUP, async (data: { olderThan?: string }) => {
    try {
      const params = data.olderThan ? { olderThan: data.olderThan } : {};
      await apiClient.post('/api/notifications/cleanup', params);
      console.log('Notification cleanup completed');
    } catch (error) {
      console.error('Error during notification cleanup:', error);
      throw error;
    }
  });
}

export const notificationQueue = {
  queueNotification
};
