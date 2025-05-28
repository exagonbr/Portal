import { BaseRepository } from './BaseRepository';
import { Chat, CreateChatData, UpdateChatData, ChatMessage, CreateChatMessageData, UpdateChatMessageData } from '../models/Chat';

export class ChatRepository extends BaseRepository<Chat> {
  constructor() {
    super('chats');
  }

  async findByCourse(courseId: string): Promise<Chat[]> {
    return this.findAll({ course_id: courseId } as Partial<Chat>);
  }

  async findByParticipant(userId: string): Promise<Chat[]> {
    return this.db(this.tableName)
      .whereRaw('? = ANY(participants)', [userId])
      .select('*');
  }

  async createChat(data: CreateChatData): Promise<Chat> {
    return this.create(data);
  }

  async updateChat(id: string, data: UpdateChatData): Promise<Chat | null> {
    return this.update(id, data);
  }

  async deleteChat(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async addParticipant(chatId: string, userId: string): Promise<void> {
    await this.db.raw(`
      UPDATE chats 
      SET participants = array_append(participants, ?), updated_at = NOW()
      WHERE id = ? AND NOT (? = ANY(participants))
    `, [userId, chatId, userId]);
  }

  async removeParticipant(chatId: string, userId: string): Promise<void> {
    await this.db.raw(`
      UPDATE chats 
      SET participants = array_remove(participants, ?), updated_at = NOW()
      WHERE id = ?
    `, [userId, chatId]);
  }

  async getChatMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    return this.db('chat_messages')
      .where('chat_id', chatId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .select('*');
  }

  async getChatMessagesWithSender(chatId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    return this.db('chat_messages')
      .select(
        'chat_messages.*',
        'users.name as sender_name',
        'users.usuario as sender_username'
      )
      .leftJoin('users', 'chat_messages.sender_id', 'users.id')
      .where('chat_messages.chat_id', chatId)
      .orderBy('chat_messages.created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async updateLastMessage(chatId: string, message: string): Promise<void> {
    await this.update(chatId, {
      last_message: message,
      last_message_time: new Date()
    } as Partial<Chat>);
  }

  async getChatsWithLastMessage(userId: string): Promise<any[]> {
    return this.db(this.tableName)
      .select(
        'chats.*',
        'courses.name as course_name'
      )
      .leftJoin('courses', 'chats.course_id', 'courses.id')
      .whereRaw('? = ANY(participants)', [userId])
      .orderBy('last_message_time', 'desc');
  }
}

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

  async markAsRead(messageId: string, userId: string): Promise<void> {
    await this.db.raw(`
      UPDATE chat_messages 
      SET read_by = array_append(read_by, ?), updated_at = NOW()
      WHERE id = ? AND NOT (? = ANY(read_by))
    `, [userId, messageId, userId]);
  }

  async markChatAsRead(chatId: string, userId: string): Promise<void> {
    await this.db.raw(`
      UPDATE chat_messages 
      SET read_by = array_append(read_by, ?), updated_at = NOW()
      WHERE chat_id = ? AND NOT (? = ANY(read_by))
    `, [userId, chatId, userId]);
  }

  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    const result = await this.db('chat_messages')
      .where('chat_id', chatId)
      .whereRaw('NOT (? = ANY(read_by))', [userId])
      .andWhereNot('sender_id', userId)
      .count('* as count')
      .first();

    return parseInt(result?.count as string) || 0;
  }

  async getUserUnreadChats(userId: string): Promise<any[]> {
    return this.db.raw(`
      SELECT 
        c.id,
        c.name,
        COUNT(cm.id) as unread_count
      FROM chats c
      INNER JOIN chat_messages cm ON c.id = cm.chat_id
      WHERE ? = ANY(c.participants)
        AND NOT (? = ANY(cm.read_by))
        AND cm.sender_id != ?
      GROUP BY c.id, c.name
      HAVING COUNT(cm.id) > 0
    `, [userId, userId, userId]).then(result => result.rows);
  }

  async searchMessages(chatId: string, searchTerm: string): Promise<ChatMessage[]> {
    return this.db(this.tableName)
      .where('chat_id', chatId)
      .andWhere('content', 'ilike', `%${searchTerm}%`)
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getMessagesBySender(chatId: string, senderId: string): Promise<ChatMessage[]> {
    return this.db(this.tableName)
      .where({ chat_id: chatId, sender_id: senderId })
      .orderBy('created_at', 'desc')
      .select('*');
  }
}
