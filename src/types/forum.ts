import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade ForumThread, usado no frontend
export interface ForumThreadDto extends BaseEntityDto {
  class_id: UUID;
  title: string;
  content: string;
  author_id: UUID;
  author_name?: string;
  tags: string[];
  pinned: boolean;
  locked: boolean;
  views: number;
  replies_count?: number;
}

// DTO para criação de ForumThread
export interface CreateForumThreadDto {
  class_id: UUID;
  title: string;
  content: string;
  author_id: UUID;
  tags?: string[];
  pinned?: boolean;
  locked?: boolean;
}

// DTO para atualização de ForumThread
export interface UpdateForumThreadDto {
  title?: string;
  content?: string;
  tags?: string[];
  pinned?: boolean;
  locked?: boolean;
}

// DTO para a entidade ForumReply, usado no frontend
export interface ForumReplyDto extends BaseEntityDto {
    thread_id: UUID;
    parent_reply_id?: UUID;
    content: string;
    author_id: UUID;
    author_name?: string;
    likes: number;
}

// DTO para criação de ForumReply
export interface CreateForumReplyDto {
    thread_id: UUID;
    parent_reply_id?: UUID;
    content: string;
    author_id: UUID;
}

// Interface para filtros de ForumThread
export interface ForumThreadFilter extends BaseFilter {
  class_id?: UUID;
  author_id?: UUID;
  tags?: string;
  pinned?: boolean;
  locked?: boolean;
}