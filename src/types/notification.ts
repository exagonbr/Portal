export interface NotificationRecipients {
    total: number;
    read: number;
    unread: number;
    roles?: string[];
    specific?: string[];
}

export type NotificationType = 'info' | 'warning' | 'success' | 'error';
export type NotificationCategory = 'academic' | 'system' | 'social' | 'administrative';
export type NotificationStatus = 'sent' | 'scheduled' | 'draft' | 'failed';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    category: NotificationCategory;
    sentAt: string | null;
    sentBy: number; // User ID
    recipients: NotificationRecipients;
    status: NotificationStatus;
    scheduledFor?: string;
    priority: NotificationPriority;
    createdAt: string;
    updatedAt: string;
}

export interface CreateNotificationDto {
    title: string;
    message: string;
    type: NotificationType;
    category: NotificationCategory;
    recipients: {
        roles?: string[];
        specific?: string[];
    };
    scheduledFor?: string;
    priority: NotificationPriority;
}

export interface UpdateNotificationDto {
    title?: string;
    message?: string;
    type?: NotificationType;
    category?: NotificationCategory;
    recipients?: {
        roles?: string[];
        specific?: string[];
    };
    scheduledFor?: string;
    priority?: NotificationPriority;
    status?: NotificationStatus;
}
