import { apiClient } from './apiClient';
import { notificationQueue } from './notificationQueue';
import {
    Notification,
    CreateNotificationDto,
    UpdateNotificationDto,
} from '@/types/notification';
import {
    ApiResponse,
    NotificationFilterDto,
    NotificationStatsDto,
    PaginatedResponseDto
} from '@/types/api';

class NotificationService {
    private readonly baseUrl = '/api/notifications';

    private prepareFilters(filters?: NotificationFilterDto): Record<string, string | number | boolean> {
        if (!filters) return {};
        
        const prepared: Record<string, string | number | boolean> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
                prepared[key] = value;
            }
        });
        return prepared;
    }

    /**
     * Get all notifications with optional filters
     */
    async getNotifications(filters?: NotificationFilterDto): Promise<PaginatedResponseDto<Notification>> {
        const response = await apiClient.get<PaginatedResponseDto<Notification>>(
            this.baseUrl,
            this.prepareFilters(filters)
        );
        if (!response.data) {
            throw new Error('Failed to fetch notifications');
        }
        return response.data;
    }

    /**
     * Get notifications sent by the current user
     */
    async getSentNotifications(filters?: NotificationFilterDto): Promise<PaginatedResponseDto<Notification>> {
        const response = await apiClient.get<PaginatedResponseDto<Notification>>(
            `${this.baseUrl}/sent`,
            this.prepareFilters(filters)
        );
        if (!response.data) {
            throw new Error('Failed to fetch sent notifications');
        }
        return response.data;
    }

    /**
     * Get a single notification by ID
     */
    async getNotificationById(id: number): Promise<Notification> {
        const response = await apiClient.get<Notification>(`${this.baseUrl}/${id}`);
        if (!response.data) {
            throw new Error(`Failed to fetch notification with id ${id}`);
        }
        return response.data;
    }

    /**
     * Create a new notification
     */
    async createNotification(notification: CreateNotificationDto): Promise<Notification> {
        // First create the notification in draft status
        const draftNotification = await apiClient.post<Notification>(this.baseUrl, {
            ...notification,
            status: 'draft'
        });

        if (!draftNotification.data) {
            throw new Error('Failed to create notification');
        }

        // Queue the notification for processing
        try {
            await notificationQueue.queueNotification(
                notification,
                !!notification.recipients.specific?.length // Send push if specific recipients
            );

            // Update status to scheduled/sent based on scheduledFor
            const status = notification.scheduledFor ? 'scheduled' : 'sent';
            const updatedNotification = await this.updateNotification(
                draftNotification.data.id,
                { status }
            );

            return updatedNotification;
        } catch (error) {
            // If queueing fails, mark notification as failed
            await this.updateNotification(draftNotification.data.id, { status: 'failed' });
            throw error;
        }
    }

    /**
     * Update an existing notification
     */
    async updateNotification(id: number, updates: UpdateNotificationDto): Promise<Notification> {
        const response = await apiClient.patch<Notification>(`${this.baseUrl}/${id}`, updates);
        if (!response.data) {
            throw new Error(`Failed to update notification with id ${id}`);
        }
        return response.data;
    }

    /**
     * Delete a notification
     */
    async deleteNotification(id: number): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * Mark a notification as read for the current user
     */
    async markAsRead(id: number): Promise<void> {
        await apiClient.post(`${this.baseUrl}/${id}/read`);
    }

    /**
     * Get notification statistics
     */
    async getNotificationStats(id: number): Promise<NotificationStatsDto> {
        const response = await apiClient.get<NotificationStatsDto>(`${this.baseUrl}/${id}/stats`);
        if (!response.data) {
            throw new Error(`Failed to fetch stats for notification with id ${id}`);
        }
        return response.data;
    }

    /**
     * Cancel a scheduled notification
     */
    async cancelScheduledNotification(id: number): Promise<void> {
        await apiClient.post(`${this.baseUrl}/${id}/cancel`);
    }

    /**
     * Reschedule a notification
     */
    async rescheduleNotification(id: number, scheduledFor: string): Promise<Notification> {
        const response = await apiClient.post<Notification>(
            `${this.baseUrl}/${id}/reschedule`,
            { scheduledFor }
        );
        if (!response.data) {
            throw new Error(`Failed to reschedule notification with id ${id}`);
        }
        return response.data;
    }

    /**
     * Send a draft notification immediately
     */
    async sendDraftNotification(id: number): Promise<Notification> {
        const response = await apiClient.post<Notification>(`${this.baseUrl}/${id}/send`);
        if (!response.data) {
            throw new Error(`Failed to send notification with id ${id}`);
        }
        return response.data;
    }
}

// Export singleton instance
export const notificationService = new NotificationService();
