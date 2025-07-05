import { BaseEntityDto, BaseFilter, UUID } from './common';

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum NotificationCategory {
  ACADEMIC = 'academic',
  SYSTEM = 'system',
  SOCIAL = 'social',
  ADMINISTRATIVE = 'administrative'
}

export enum NotificationStatus {
  SENT = 'sent',
  SCHEDULED = 'scheduled',
  DRAFT = 'draft',
  FAILED = 'failed'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// DTO para a entidade Notification, usado no frontend
export interface NotificationDto extends BaseEntityDto {
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  sent_at?: string;
  sent_by_id: UUID;
  recipients: {
    total?: number;
    read?: number;
    unread?: number;
    roles?: string[];
    specific?: UUID[];
  };
  status: NotificationStatus;
  scheduled_for?: string;
  priority: NotificationPriority;
}

// DTO para criação de Notification
export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  sent_by_id: UUID;
  recipients: {
    roles?: string[];
    specific?: UUID[];
  };
  status?: NotificationStatus;
  scheduled_for?: string;
  priority?: NotificationPriority;
}

// Interface para filtros de Notification
export interface NotificationFilter extends BaseFilter {
  category?: NotificationCategory;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  sent_by_id?: UUID;
}
