import { BaseRepository } from './BaseRepository';
import { ChatMessage } from '../entities/ChatMessage';

export interface CreateChatMessageData extends Omit<ChatMessage, 'id' | 'timestamp' | 'sender'> {}
export interface UpdateChatMessageData extends Partial<Omit<CreateChatMessageData, 'class_id' | 'sender_id'>> {}

export class ChatMessageRepository extends BaseRepository<ChatMessage> {
  constructor() {
    super('chat_messages');
  }

  async createMessage(data: CreateChatMessageData): Promise<ChatMessage> {
    return this.create(data);
  }

  async updateMessage(id: string, data: UpdateChatMessageData): Promise<ChatMessage | null> {
    return this.update(id, data);
  }

  async deleteMessage(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async findByClass(classId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    return this.db(this.tableName)
      .where('class_id', classId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async findBySender(senderId: string): Promise<ChatMessage[]> {
    return this.findAll({ sender_id: senderId } as Partial<ChatMessage>);
  }

  async searchInClass(classId: string, term: string): Promise<ChatMessage[]> {
    return this.db(this.tableName)
      .where('class_id', classId)
      .andWhere('content', 'ilike', `%${term}%`);
  }
  
  async markAsRead(messageId: string, userId: string): Promise<void> {
    // Appends a user ID to the read_by JSONB array, ensuring no duplicates.
    // This is a PostgreSQL-specific query.
    await this.db.raw(
      `UPDATE ?? SET "read_by" = "read_by" || ?::jsonb WHERE "id" = ? AND NOT ("read_by" @> ?::jsonb)`,
      [this.tableName, JSON.stringify([userId]), messageId, JSON.stringify([userId])]
    );
  }

  async getUnreadCount(classId: string, userId: string): Promise<number> {
    // Counts unread messages for a user in a specific class.
    // This is a PostgreSQL-specific query for the JSONB `read_by` field.
    const result = await this.db(this.tableName)
      .where('class_id', classId)
      .andWhereNot('sender_id', userId)
      .andWhereRaw(`NOT ("read_by" @> ?::jsonb)`, [JSON.stringify([userId])])
      .count('* as count')
      .first();
      
    return parseInt(result?.count as string, 10) || 0;
  }
}