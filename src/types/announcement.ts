import { BaseEntityDto, BaseFilter, UUID } from './common';

export enum AnnouncementPriority {
  LOW = 'baixa',
  MEDIUM = 'média',
  HIGH = 'alta',
  URGENT = 'urgente'
}

export enum AnnouncementScopeType {
    GLOBAL = 'global',
    CLASS = 'turma',
    COURSE = 'curso',
    INSTITUTION = 'institution'
}

// DTO para a entidade Announcement, usado no frontend
export interface AnnouncementDto extends BaseEntityDto {
  title: string;
  content: string;
  author_id: UUID;
  author_name?: string;
  expires_at?: string;
  priority: AnnouncementPriority;
  scope: {
    type: AnnouncementScopeType;
    targetId?: UUID;
  };
  is_active: boolean;
}

// DTO para criação de Announcement
export interface CreateAnnouncementDto {
  title: string;
  content: string;
  author_id: UUID;
  expires_at?: string;
  priority: AnnouncementPriority;
  scope: {
    type: AnnouncementScopeType;
    targetId?: UUID;
  };
  is_active?: boolean;
}

// DTO para atualização de Announcement
export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  expires_at?: string;
  priority?: AnnouncementPriority;
  scope?: {
    type: AnnouncementScopeType;
    targetId?: UUID;
  };
  is_active?: boolean;
}

// Interface para filtros de Announcement
export interface AnnouncementFilter extends BaseFilter {
  author_id?: UUID;
  priority?: AnnouncementPriority;
  scope_type?: AnnouncementScopeType;
  is_active?: boolean;
}