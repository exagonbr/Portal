import { BaseFilter } from './common';

export interface NotificationTemplateDto {
  id: string;
  name: string;
  subject: string;
  message: string;
  html: boolean;
  category: string;
  isPublic: boolean;
  userId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationTemplateDto {
  name: string;
  subject: string;
  message: string;
  html?: boolean;
  category?: string;
  isPublic?: boolean;
  userId: string;
  createdBy: string;
}

export interface UpdateNotificationTemplateDto {
  name?: string;
  subject?: string;
  message?: string;
  html?: boolean;
  category?: string;
  isPublic?: boolean;
}

export interface NotificationTemplateFilter extends BaseFilter {
  name?: string;
  category?: string;
  isPublic?: boolean;
  userId?: string;
  createdBy?: string;
}

export interface NotificationTemplateResponseDto {
  success: boolean;
  data: NotificationTemplateDto[] | NotificationTemplateDto;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
} 