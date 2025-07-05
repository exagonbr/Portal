import { BaseRepository } from './BaseRepository';

// Interface para desacoplar
export interface ChatMessage {
    id: string;
    sender_id: string;
    content: string;
    class_id: string;
    attachments?: any[];
    read_by?: any[];
    timestamp: Date;
}

export class ChatRepository extends BaseRepository<ChatMessage> {
  constructor() {
    super('chat_messages');
  }
}