import { BaseRepository } from './BaseRepository';
import { ForumThread, CreateForumThreadData, UpdateForumThreadData, ForumReply, CreateForumReplyData, UpdateForumReplyData } from '../models/Forum';

export class ForumRepository extends BaseRepository<ForumThread> {
  constructor() {
    super('forum_threads');
  }

  async findByCourse(courseId: string): Promise<ForumThread[]> {
    return this.db(this.tableName)
      .where('course_id', courseId)
      .orderBy('pinned', 'desc')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findByAuthor(authorId: string): Promise<ForumThread[]> {
    return this.findAll({ author_id: authorId } as Partial<ForumThread>);
  }

  async createThread(data: CreateForumThreadData): Promise<ForumThread> {
    return this.create(data);
  }

  async updateThread(id: string, data: UpdateForumThreadData): Promise<ForumThread | null> {
    return this.update(id, data);
  }

  async deleteThread(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async incrementViews(id: string): Promise<void> {
    await this.db(this.tableName)
      .where('id', id)
      .increment('views', 1);
  }

  async pinThread(id: string): Promise<ForumThread | null> {
    return this.update(id, { pinned: true } as Partial<ForumThread>);
  }

  async unpinThread(id: string): Promise<ForumThread | null> {
    return this.update(id, { pinned: false } as Partial<ForumThread>);
  }

  async lockThread(id: string): Promise<ForumThread | null> {
    return this.update(id, { locked: true } as Partial<ForumThread>);
  }

  async unlockThread(id: string): Promise<ForumThread | null> {
    return this.update(id, { locked: false } as Partial<ForumThread>);
  }

  async getThreadReplies(threadId: string): Promise<ForumReply[]> {
    return this.db('forum_replies')
      .where('thread_id', threadId)
      .orderBy('created_at', 'asc')
      .select('*');
  }

  async getThreadRepliesWithAuthor(threadId: string): Promise<any[]> {
    return this.db('forum_replies')
      .select(
        'forum_replies.*',
        'User.name as author_name',
        'User.usuario as author_username'
      )
      .leftJoin('User', 'forum_replies.author_id', 'User.id')
      .where('forum_replies.thread_id', threadId)
      .orderBy('forum_replies.created_at', 'asc');
  }

  async getThreadsWithAuthor(courseId?: string): Promise<any[]> {
    let query = this.db(this.tableName)
      .select(
        'forum_threads.*',
        'User.name as author_name',
        'User.usuario as author_username',
        'courses.name as course_name'
      )
      .leftJoin('User', 'forum_threads.author_id', 'User.id')
      .leftJoin('courses', 'forum_threads.course_id', 'courses.id');

    if (courseId) {
      query = query.where('forum_threads.course_id', courseId);
    }

    return query
      .orderBy('forum_threads.pinned', 'desc')
      .orderBy('forum_threads.created_at', 'desc');
  }

  async getThreadWithDetails(id: string): Promise<any | null> {
    const thread = await this.db(this.tableName)
      .select(
        'forum_threads.*',
        'User.name as author_name',
        'User.usuario as author_username',
        'courses.name as course_name'
      )
      .leftJoin('User', 'forum_threads.author_id', 'User.id')
      .leftJoin('courses', 'forum_threads.course_id', 'courses.id')
      .where('forum_threads.id', id)
      .first();

    if (!thread) return null;

    const replies = await this.getThreadRepliesWithAuthor(id);

    return {
      ...thread,
      replies
    };
  }

  async searchThreads(searchTerm: string, courseId?: string): Promise<ForumThread[]> {
    let query = this.db(this.tableName)
      .where('title', 'ilike', `%${searchTerm}%`)
      .orWhere('content', 'ilike', `%${searchTerm}%`);

    if (courseId) {
      query = query.andWhere('course_id', courseId);
    }

    return query
      .orderBy('pinned', 'desc')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getThreadsByTag(tag: string, courseId?: string): Promise<ForumThread[]> {
    let query = this.db(this.tableName)
      .whereRaw('? = ANY(tags)', [tag]);

    if (courseId) {
      query = query.andWhere('course_id', courseId);
    }

    return query
      .orderBy('pinned', 'desc')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getPopularThreads(courseId?: string, limit: number = 10): Promise<ForumThread[]> {
    let query = this.db(this.tableName);

    if (courseId) {
      query = query.where('course_id', courseId);
    }

    return query
      .orderBy('views', 'desc')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .select('*');
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
    return this.delete(id);
  }

  async getRepliesByAuthor(authorId: string): Promise<ForumReply[]> {
    return this.findAll({ author_id: authorId } as Partial<ForumReply>);
  }

  async getReplyWithAuthor(id: string): Promise<any | null> {
    const result = await this.db(this.tableName)
      .select(
        'forum_replies.*',
        'User.name as author_name',
        'User.usuario as author_username'
      )
      .leftJoin('User', 'forum_replies.author_id', 'User.id')
      .where('forum_replies.id', id)
      .first();

    return result || null;
  }

  async getNestedReplies(parentReplyId: string): Promise<ForumReply[]> {
    return this.findAll({ parent_reply_id: parentReplyId } as Partial<ForumReply>);
  }

  async getNestedRepliesWithAuthor(parentReplyId: string): Promise<any[]> {
    return this.db(this.tableName)
      .select(
        'forum_replies.*',
        'User.name as author_name',
        'User.usuario as author_username'
      )
      .leftJoin('User', 'forum_replies.author_id', 'User.id')
      .where('forum_replies.parent_reply_id', parentReplyId)
      .orderBy('forum_replies.created_at', 'asc');
  }

  async searchReplies(threadId: string, searchTerm: string): Promise<ForumReply[]> {
    return this.db(this.tableName)
      .where('thread_id', threadId)
      .andWhere('content', 'ilike', `%${searchTerm}%`)
      .orderBy('created_at', 'asc')
      .select('*');
  }

  async getReplyCount(threadId: string): Promise<number> {
    const result = await this.db(this.tableName)
      .where('thread_id', threadId)
      .count('* as count')
      .first();

    return parseInt(result?.count as string) || 0;
  }
}
