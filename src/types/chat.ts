import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade ChatMessage, usado no frontend
export interface ChatMessageDto extends BaseEntityDto {
  sender_id: UUID;
  sender_name?: string;
  content: string;
  class_id: UUID;
  attachments?: any[];
  read_by: UUID[];
  timestamp: string;
}

// DTO para criação de ChatMessage
export interface CreateChatMessageDto {
  sender_id: UUID;
  content: string;
  class_id: UUID;
  attachments?: any[];
}

// Interface para filtros de ChatMessage
export interface ChatMessageFilter extends BaseFilter {
  class_id?: UUID;
  sender_id?: UUID;
  since?: string; // timestamp
}