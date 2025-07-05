import { BaseRepository } from './BaseRepository';
import { ForumThread } from '../entities/ForumThread';
import { ForumReply } from '../entities/ForumReply';

export interface CreateForumThreadData extends Omit<ForumThread, 'id' | 'created_at' | 'updated_at' | 'author' | 'replies'> {}
export interface UpdateForumThreadData extends Partial<Omit<CreateForumThreadData, 'class_id' | 'author_id'>> {}

export interface CreateForumReplyData extends Omit<ForumReply, 'id' | 'created_at' | 'updated_at' | 'author' | 'thread'> {}
export interface UpdateForumReplyData extends Partial<Omit<CreateForumReplyData, 'thread_id' | 'author_id' | 'parent_reply_id'>> {}

export class ForumThreadRepository extends BaseRepository<ForumThread> {
  constructor() {
    super('forum_threads');
  }

  async createThread(data: CreateForumThreadData): Promise<ForumThread> {
    return this.create(data);
  }

  async updateThread(id: string, data: UpdateForumThreadData): Promise<ForumThread | null> {
    return this.update(id, data);
  }

  async deleteThread(id: string): Promise<boolean> {
    // Deletar respostas associadas primeiro
    await this.db('forum_replies').where('thread_id', id).del();
    return this.delete(id);
  }

  async findByClass(classId: string): Promise<ForumThread[]> {
    return this.db(this.tableName)
      .where('class_id', classId)
      .orderBy('pinned', 'desc')
      .orderBy('created_at', 'desc');
  }

  async findByAuthor(authorId: string): Promise<ForumThread[]> {
    return this.findAll({ author_id: parseInt(authorId) } as Partial<ForumThread>);
  }

  async findByTag(tag: string): Promise<ForumThread[]> {
    // Query para array JSONB
    return this.db(this.tableName).whereRaw('tags @> ?', `"${tag}"`);
  }

  async search(term: string): Promise<ForumThread[]> {
    return this.db(this.tableName)
      .where('title', 'ilike', `%${term}%`)
      .orWhere('content', 'ilike', `%${term}%`);
  }

  async getReplies(threadId: string): Promise<ForumReply[]> {
    return this.db('forum_replies').where('thread_id', parseInt(threadId)).orderBy('created_at', 'asc');
  }
}

export class ForumReplyRepository extends BaseRepository<ForumReply> {
  constructor() {
    super('forum_replies');
  }

  async createReply(data: CreateForumReplyData): Promise<ForumReply> {
    return this.create(data);
  }

  async updateReply(id: string, data: UpdateForumReplyData): Promise<ForumReply | null> {
    return this.update(id, data);
  }

  async deleteReply(id: string): Promise<boolean> {
    // Se houver respostas aninhadas, a lógica de exclusão pode ser mais complexa
    return this.delete(id);
  }

  async findByThread(threadId: string): Promise<ForumReply[]> {
    return this.findAll({ thread_id: parseInt(threadId) } as Partial<ForumReply>);
  }

  async findByAuthor(authorId: string): Promise<ForumReply[]> {
    return this.findAll({ author_id: parseInt(authorId) } as Partial<ForumReply>);
  }
}