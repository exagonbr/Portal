import { QueueService, JobTypes } from './queueService';
import { pushSubscriptionController } from '../controllers/pushSubscriptionController';
import { WebPushPayload } from '../types/pushSubscription';
import { db } from '../database';

interface CreateNotificationData {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    category: 'academic' | 'system' | 'social' | 'administrative';
    recipients: {
        roles?: string[];
        specific?: number[];
    };
    priority: 'low' | 'medium' | 'high';
    scheduledFor?: Date;
}

interface NotificationQueueData extends CreateNotificationData {
    notificationId: number;
}

export class NotificationService {
    constructor(private queueService: QueueService) {
        // Register handler for push notifications
        this.queueService.registerHandler<NotificationQueueData>(
            JobTypes.NOTIFICATION_PUSH, 
            this.handlePushNotification.bind(this)
        );
    }

    async createNotification(data: CreateNotificationData): Promise<number> {
        // Create notification record
        const [notificationId] = await db('notifications').insert({
            title: data.title,
            message: data.message,
            type: data.type,
            category: data.category,
            recipients: JSON.stringify({
                total: 0,
                read: 0,
                unread: 0,
                roles: data.recipients.roles || [],
                specific: data.recipients.specific || []
            }),
            status: data.scheduledFor ? 'scheduled' : 'sent',
            scheduled_for: data.scheduledFor,
            priority: data.priority
        }).returning('id');

        if (!notificationId) {
            throw new Error('Failed to create notification');
        }

        // If scheduled for later, add to queue with delay
        if (data.scheduledFor) {
            const delay = data.scheduledFor.getTime() - Date.now();
            await this.queueService.addJob<NotificationQueueData>(
                JobTypes.NOTIFICATION_PUSH,
                { notificationId, ...data },
                { delay }
            );
        } else {
            // Send immediately
            await this.sendPushNotification(notificationId, data);
        }

        return notificationId;
    }

    private async handlePushNotification(data: NotificationQueueData): Promise<void> {
        await this.sendPushNotification(data.notificationId, data);
    }

    private async sendPushNotification(notificationId: number, data: CreateNotificationData): Promise<void> {
        try {
            // Get target user IDs
            const userIds = await this.getTargetUserIds(data.recipients);

            // Prepare push notification payload
            const payload: WebPushPayload = {
                title: data.title,
                body: data.message,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon.svg',
                tag: `notification-${notificationId}`,
                data: {
                    notificationId,
                    type: data.type,
                    category: data.category
                }
            };

            // Send to all target users
            const sentCount = await pushSubscriptionController.sendNotificationToUsers(userIds, payload);

            // Update notification status
            await db('notifications')
                .where('id', notificationId)
                .update({
                    sent_at: new Date(),
                    status: 'sent',
                    recipients: JSON.stringify({
                        total: userIds.length,
                        read: 0,
                        unread: sentCount,
                        roles: data.recipients.roles || [],
                        specific: data.recipients.specific || []
                    })
                });

        } catch (error) {
            console.error('Error sending push notification:', error);
            
            // Mark notification as failed
            await db('notifications')
                .where('id', notificationId)
                .update({
                    status: 'failed'
                });

            throw error;
        }
    }

    private async getTargetUserIds(recipients: { roles?: string[], specific?: number[] }): Promise<number[]> {
        const userIds = new Set<number>();

        // Add specific users
        if (recipients.specific?.length) {
            recipients.specific.forEach(id => userIds.add(id));
        }

        // Add users with specified roles
        if (recipients.roles?.length) {
            const users = await db('users')
                .whereIn('role', recipients.roles)
                .select('id');
            users.forEach(user => userIds.add(user.id));
        }

        return Array.from(userIds);
    }
}

// Export singleton instance
export const notificationService = new NotificationService(QueueService.getInstance());
